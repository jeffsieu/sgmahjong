<script lang="ts">
  import { StandardMahjong } from "./tiles";
  import { Round } from "./game-state/game-state";
  import { getMatchingCombinations } from "./combis";

  import {
    Canvas,
    Scene,
    PerspectiveCamera,
    AmbientLight,
    WebGLRenderer,
    Object3D,
    OrbitControls,
    PCFSoftShadowMap,
    PointLight,
  } from "svelthree";

  import {
    KEY_CANVAS_CONTEXT,
    TABLE_WIDTH,
    TILE_HEIGHT,
  } from "./scene/constants";
  import Table from "./scene/Table.svelte";
  import { onMount, setContext } from "svelte";
  import { MessageLogger } from "./message-logger";
  import {
    EndOfHandPhase,
    PostDrawPhase,
    ToDiscardPhase,
    ToDrawPhase,
    WindowOfOpportunityPhase,
  } from "./game-state/phases";
  import {
    CloseWindowOfOpportunityAction,
    FormMeldAction,
    MahjongAction,
    SkipWindowOfOpportunityAction,
  } from "./game-state/actions";
  import { getValidWindowOfOpportunityActions } from "./game-state/action-generator";
  import { Chow } from "./melds";
  import { getBestAction } from "./ai/game-ai";
  import { TileDebug } from "./tile-utils";
  import TooltipContext from "./scene/TooltipContext.svelte";
  import type { CanvasContext } from "./app";
  import { getWinningHandDoubles } from "./scoring/scoring";
  import { STANDARD_GAME_RULES } from "./config/rules";

  const currentRound = new Round(StandardMahjong.SUIT_EAST);
  let currentHand = currentRound.getCurrentHand();
  // let currentHand = new DebugHand(StandardMahjong.SUIT_EAST, () => {});

  const player = currentHand.players[0];
  let combinations = getMatchingCombinations(player.hand, player.melds);
  let logMessages = MessageLogger.getLogs();

  Object3D.DefaultUp.set(0, 0, 1);

  currentHand.physicalWall.drawStartingHands();

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
      TileDebug.honor(StandardMahjong.SUIT_DRAGON_WHITE),
      TileDebug.honor(StandardMahjong.SUIT_DRAGON_WHITE),
      TileDebug.characters(5),
      TileDebug.characters(6),
      TileDebug.characters(7),
      TileDebug.characters(8),
      TileDebug.characters(8),
      TileDebug.characters(9),
      TileDebug.characters(9),
      TileDebug.characters(9),
    ].forEach((tile) => player.hand.push(tile));
  };

  $: currentPhase = currentHand.getCurrentPhase();

  const useAI = (): boolean => {
    const currentPhase = currentHand.getCurrentPhase();
    let executed = false;
    for (const player of currentHand.players.filter(
      (player) => player.wind !== StandardMahjong.SUIT_EAST
    )) {
      const action = getBestAction(currentPhase, player);
      try {
        currentHand.tryExecuteAction(action);
        updateState();
        executed = true;
        if (currentHand.getCurrentPhase() !== currentPhase) {
          return true;
        }
      } catch (e) {}
    }
    return executed;
  };

  const skipToMyTurn = () => {
    while (true) {
      let executed = useAI();
      currentPhase = currentHand.getCurrentPhase();
      updateState();
      if (currentPhase instanceof WindowOfOpportunityPhase) {
        if (
          getValidWindowOfOpportunityActions(player, currentPhase).filter(
            (action) => !(action instanceof SkipWindowOfOpportunityAction)
          ).length > 0
        ) {
          break;
        } else {
          currentHand.tryExecuteAction(new CloseWindowOfOpportunityAction());
          executed = true;
          updateState();
        }
      }
      if (!executed) {
        console.debug("No actions executed for", currentPhase);
        break;
      } else {
        console.debug("Executed one action");
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

  onMount(() => {
    // To ensure the camera shadows work
    // light.getLight().shadow.radius = 8;
    light.getLight().shadow.mapSize.width = 2048;
    light.getLight().shadow.mapSize.height = 2048;
    light.getLight().shadow.camera.near = 0.5;
    light.getLight().shadow.camera.far = 500;

    const webGlRenderer = renderer.getRenderer();
    if (webGlRenderer) webGlRenderer.localClippingEnabled = true;
  });

  const onWindowResize = () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    cameraAspect = windowWidth / windowHeight;

    canvas.doResize(windowWidth, windowHeight);
  };

  let orbitControls: OrbitControls;

  const canvasContext: CanvasContext = {
    getOrbitControls: () => orbitControls,
    getCanvas: () => canvas,
    getRenderer: () => renderer,
  };

  setContext(KEY_CANVAS_CONTEXT, canvasContext);
</script>

<main>
  <div id="canvas-container">
    <TooltipContext>
      <Canvas
        bind:this={canvas}
        let:sti
        w={windowWidth}
        h={windowHeight}
        interactive
      >
        <Scene {sti} let:scene id="scene1" props={{ background: 0x242424 }}>
          <PerspectiveCamera
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
          <AmbientLight {scene} intensity={1.75} />
          <PointLight
            {scene}
            pos={[0, 0, TILE_HEIGHT * 3]}
            intensity={0.25}
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
            localClippingEnabled: true,
          }}
        />
      </Canvas>
    </TooltipContext>
  </div>
  <div id="ui">
    <div class="messages">
      <h3>Messages ({logMessages.length})</h3>
      <ul>
        {#each logMessages as logEntry}
          <li>{logEntry.message}</li>
        {/each}
      </ul>
    </div>
    <div>
      <h2>{currentPhase.name}</h2>
      <div>
        <h3>Dice roll results: {currentHand.diceRoll.resultSum}</h3>
      </div>
      <button on:click={cheat}>Cheat</button>
      <button on:click={useAI}>Use AI</button>
      <button on:click={skipToMyTurn}>Skip to my turn</button>
      {#if currentPhase instanceof EndOfHandPhase}
        Your score: {getWinningHandDoubles(currentHand.getWinningHand())(
          STANDARD_GAME_RULES
        )}
      {/if}
      <div id="actions">
        {#if currentPhase instanceof WindowOfOpportunityPhase}
          <button
            on:click={() => {
              currentHand.tryExecuteAction(
                new CloseWindowOfOpportunityAction()
              );
              updateState();
            }}>Close window</button
          >
        {/if}
        {#each currentHand.players.slice(0, 1) as player}
          {#if currentPhase instanceof WindowOfOpportunityPhase}
            <div>
              <h3>Valid window actions ({player.wind.name})</h3>
              {#each getValidWindowOfOpportunityActions(player, currentPhase) as action}
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
    </div>
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
    position: relative;
  }

  .messages {
    width: 100px;
  }

  #canvas-container {
    overflow: hidden;
  }

  #canvas-container,
  #ui {
    position: absolute;
  }

  #ui {
    display: flex;
    background-color: wheat;
    cursor: auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
