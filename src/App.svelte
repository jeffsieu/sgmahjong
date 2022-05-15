<script lang="ts">
  import { StandardMahjong } from "./tiles";
  import { Round, SeatedPlayer } from "./game-state/game-state";
  import { getMatchingCombinations, StandardCombiMatchers } from "./combis";

  import {
    Canvas,
    Scene,
    PerspectiveCamera,
    DirectionalLight,
    AmbientLight,
    WebGLRenderer,
    Object3D,
    OrbitControls,
    PCFSoftShadowMap,
    PointLight,
  } from "svelthree";

  import TileMesh from "./scene/TileMesh.svelte";
  import TileRow from "./scene/TileRow.svelte";
  import {
    KEY_CANVAS_CONTEXT,
    TABLE_WIDTH,
    TILE_HEIGHT,
    TILE_THICKNESS,
    TILE_WIDTH,
  } from "./scene/constants";
  import MyHand from "./scene/PlayerHand.svelte";
  import Table from "./scene/Table.svelte";
  import Light from "svelthree/src/components/Light.svelte";
  import { onMount, setContext } from "svelte";
  import { MessageLogger } from "./message-logger";
  import {
    PostDrawPhase,
    ToDiscardPhase,
    ToDrawPhase,
    WindowOfOpportunityPhase,
  } from "./game-state/phases";
  import {
    CloseWindowOfOpportunityAction,
    DrawTileAction,
    FormMeldAction,
    MahjongAction,
    RevealBonusTileThenDrawAction,
  } from "./game-state/actions";
  import { PhysicalWall, PreGameDiceRoll } from "./game-state/pre-hand";
  import {
    getValidWindowOfOpportunityActions,
    getValidMahjongActions,
    getCombinations,
  } from "./game-state/action-generator";
  import { Chow, MeldInstance, Pong } from "./melds";
  import { getBestAction } from "./ai/game-ai";
  import { TileDebug } from "./tile-utils";
  import Text from "./scene/Text.svelte";
  import Tooltip from "./scene/TooltipContext.svelte";
  import TooltipContext from "./scene/TooltipContext.svelte";
  import type { CanvasContext } from "./app";

  const currentRound = new Round(StandardMahjong.SUIT_EAST);

  let currentHand = currentRound.getCurrentHand();
  currentHand.physicalWall.drawStartingHands();
  const player = currentHand.players[0];
  let combinations = getMatchingCombinations(player.hand, player.melds);
  let logMessages = MessageLogger.getLogs();

  Object3D.DefaultUp.set(0, 0, 1);

  const updateState = () => {
    combinations = getMatchingCombinations(player.hand, player.melds);
    logMessages = MessageLogger.getLogs();
    currentHand = currentHand;
  };

  const cheat = () => {
    player.hand.splice(0, player.hand.length);
    [
      TileDebug.characters(1),
      TileDebug.characters(1),
      TileDebug.characters(1),
      TileDebug.characters(2),
      TileDebug.characters(3),
      TileDebug.characters(4),
      TileDebug.characters(5),
      TileDebug.characters(6),
      TileDebug.characters(7),
      TileDebug.characters(8),
      TileDebug.characters(9),
      TileDebug.characters(9),
      TileDebug.characters(9),
    ].forEach((tile) => player.hand.push(tile));
  };

  const executePhases = () => {
    updateState();
  };

  let drawnCount = 0;

  const drawFront = () => {
    currentHand.physicalWall.popFront(1);
    updateState();
  };

  const drawBack = () => {
    currentHand.physicalWall.popBack(1);
    updateState();
  };

  $: currentPhase = currentHand.getCurrentPhase();

  const useAI = (): boolean => {
    let executed = false;
    for (const player of currentHand.players.filter(
      (player) => player.wind !== StandardMahjong.SUIT_EAST
    )) {
      const action = getBestAction(currentPhase, player);

      console.debug("Trying to execute action", action);
      try {
        currentHand.tryExecuteAction(action);
        updateState();
        executed = true;
        console.debug("Successfully executed one action");
      } catch (e) {
        console.debug("Got error: ", e);
      }
    }
    // if (currentHand.getCurrentPhase() instanceof WindowOfOpportunityPhase) {
    //   currentHand.tryExecuteAction(new CloseWindowOfOpportunityAction());
    //   updateState();
    //   executed = true;
    // }
    return executed;
  };

  const skipToMyTurn = () => {
    while (true) {
      const executed = useAI();
      currentPhase = currentHand.getCurrentPhase();
      updateState();
      if (!executed) {
        console.debug("No actions executed");
        break;
      } else {
        console.debug("Executed one action");
      }
      if (
        currentPhase instanceof WindowOfOpportunityPhase &&
        getValidWindowOfOpportunityActions(player, currentPhase.discardedTile)
          .length > 0
      ) {
        break;
      }

      if (
        currentPhase instanceof ToDrawPhase &&
        currentPhase.player === player
      ) {
        break;
      }

      if (
        currentPhase instanceof ToDiscardPhase &&
        currentPhase.player === player
      ) {
        break;
      }

      if (currentPhase instanceof PostDrawPhase) {
        break;
      }
    }
    updateState();
  };

  let light: PointLight;
  let renderer: WebGLRenderer;
  let cameraAspect: number = window.innerWidth / window.innerHeight;
  let windowWidth: number = window.innerWidth;
  let windowHeight: number = window.innerHeight;

  let canvas: Canvas;
  let camera: PerspectiveCamera;

  onMount(() => {
    // To ensure the camera shadows work
    // light.getLight().shadow.radius = 8;
    light.getLight().shadow.mapSize.width = 2048;
    light.getLight().shadow.mapSize.height = 2048;
    light.getLight().shadow.camera.near = 0.5;
    light.getLight().shadow.camera.far = 500;

    const webGlRenderer = renderer.getRenderer();

    // if (renderer.getRenderer())
    // renderer.getRenderer().physicallyCorrectLights = true;
  });

  const onWindowResize = () => {
    cameraAspect = window.innerWidth / window.innerHeight;
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    canvas.doResize(windowWidth, 0.75 * windowHeight);
  };

  let orbitControls: OrbitControls;

  const canvasContext: CanvasContext = {
    getOrbitControls: () => orbitControls,
    getCanvas: () => canvas,
  };

  setContext(KEY_CANVAS_CONTEXT, canvasContext);

  const fakePlayer = new SeatedPlayer(currentHand, StandardMahjong.SUIT_EAST, [
    TileDebug.bamboos(1),
    TileDebug.bamboos(1),
    TileDebug.bamboos(1),
    TileDebug.bamboos(2),
    TileDebug.bamboos(3),
    TileDebug.bamboos(4),
    TileDebug.bamboos(5),
    TileDebug.bamboos(6),
    TileDebug.bamboos(7),
    TileDebug.bamboos(8),
    TileDebug.bamboos(9),
    TileDebug.bamboos(9),
    TileDebug.bamboos(9),
  ]);
  const oneBamboo = TileDebug.bamboos(1);
  const threes = [
    TileDebug.bamboos(3),
    TileDebug.bamboos(3),
    TileDebug.bamboos(3),
  ];
</script>

<main>
  <h2>{currentPhase.name}</h2>
  <div>
    <h3>Dice roll results: {currentHand.diceRoll.resultSum}</h3>
  </div>
  <button on:click={cheat}>Cheat</button>
  <button on:click={useAI}>Use AI</button>
  <button
    on:click={() => {
      console.debug(getCombinations([threes, threes, threes]));
      const match = getValidWindowOfOpportunityActions(fakePlayer, oneBamboo);
      console.debug(match);
    }}>Test method</button
  >

  <div>
    <h3>Messages ({logMessages.length})</h3>
    <ul>
      {#each logMessages as logEntry}
        <li>{logEntry.message}</li>
      {/each}
    </ul>
  </div>
  <div id="actions">
    {#if currentPhase instanceof WindowOfOpportunityPhase}
      <button
        on:click={() => {
          currentHand.tryExecuteAction(new CloseWindowOfOpportunityAction());
          updateState();
        }}>Close window</button
      >
    {/if}
    {#each currentHand.players.slice(0, 1) as player}
      {#if currentPhase instanceof WindowOfOpportunityPhase}
        <div>
          <h3>Valid window actions ({player.wind.name})</h3>
          {#each getValidWindowOfOpportunityActions(player, currentPhase.discardedTile).filter( (action) => currentPhase.canExecuteAction(action) ) as action}
            <button
              on:click={() => {
                currentHand.tryExecuteAction(action);
                updateState();
              }}
            >
              {#if action instanceof FormMeldAction}
                {action.meld instanceof Chow ? "Chow" : "Pong"} ({action.meld.toString()}
              {/if}
              {#if action instanceof MahjongAction}
                Mahjong
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    {/each}
  </div>
  <h3>Combinations in hand</h3>
  <div id="combinations">
    {#each combinations as combi}
      <div>
        {combi.name}
        <div style="display: flex; gap: 10px">
          {#each combi.melds as meld}
            {meld.toString()}
          {/each}
        </div>
      </div>
    {/each}
  </div>
  <div>
    <TooltipContext>
      <Canvas
        bind:this={canvas}
        let:sti
        w={windowWidth}
        h={windowHeight * 0.75}
        interactive
      >
        <Scene {sti} let:scene id="scene1" props={{ background: 0x242424 }}>
          <PerspectiveCamera
            bind:this={camera}
            {scene}
            id="cam1"
            pos={[0, -TABLE_WIDTH / 2, 10]}
            lookAt={[0, TILE_HEIGHT / 2, 0]}
            props={{
              name: "camera",
              zoom: 0.5,
              fov: 20,
              aspect: cameraAspect,
            }}
          />
          <AmbientLight {scene} intensity={1.5} />
          <PointLight
            {scene}
            pos={[0, 0, TILE_HEIGHT * 3]}
            intensity={0.5}
            castShadow
            shadowBias={0.0001}
            bind:this={light}
          />
          <Table {scene} hand={currentHand} onUpdate={updateState} />
          <OrbitControls bind:this={orbitControls} {scene} enableDamping />
        </Scene>
        <WebGLRenderer
          bind:this={renderer}
          {sti}
          sceneId="scene1"
          camId="cam1"
          enableShadowMap
          shadowMapType={PCFSoftShadowMap}
          config={{
            antialias: true,
            alpha: true,
            devicePixelRatio: window.devicePixelRatio,
          }}
        />
      </Canvas>
    </TooltipContext>
  </div>
</main>
<svelte:window on:resize={onWindowResize} />

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
