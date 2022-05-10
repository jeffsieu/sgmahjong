<script lang="ts">
  import {
    SingaporeMahjong,
    StandardMahjong,
    StandardTile,
    Tile,
    WindTile,
  } from "./tiles";
  import { Hand } from "./game-state";
  import { getMatchingCombinations } from "./combis";
  import PlayerHand from "./PlayerHand.svelte";

  import {
    AxesHelper,
    Canvas,
    Scene,
    PerspectiveCamera,
    DirectionalLight,
    AmbientLight,
    Group,
    ExtrudeBufferGeometry,
    Mesh,
    MeshStandardMaterial,
    BoxGeometry,
    WebGLRenderer,
    Shape,
    TextureLoader,
    Vector2,
    Object3D,
    OrbitControls,
  } from "svelthree";

  import TileMesh from "./scene/TileMesh.svelte";
  import TileRow from "./scene/TileRow.svelte";
  import {
    TABLE_WIDTH,
    TILE_HEIGHT,
    TILE_THICKNESS,
    TILE_WIDTH,
  } from "./scene/constants";
  import MyHand from "./scene/MyHand.svelte";

  const tileSet = [...SingaporeMahjong.TILE_SET];

  const currentHand = new Hand(StandardMahjong.SUIT_EAST);
  const player = currentHand.players[0];
  export let otherPlayers = currentHand.players.slice(1);

  $: bonusTiles = [...player.bonusTiles];
  export let hand = player.hand;
  export let hasFlowers = player.hasBonusTileInHand();
  export let combinations = getMatchingCombinations(player.hand);

  Object3D.DefaultUp.set(0, 0, 1);

  const updateState = () => {
    hand = player.hand;
    hasFlowers = player.hasBonusTileInHand();
    combinations = getMatchingCombinations(player.hand);
    otherPlayers = currentHand.players.slice(1);
    bonusTiles = [...player.bonusTiles];
  };

  export const onTileClicked = (tile: Tile, index: number) => {
    // player.removeFromHand(index);
    // updateState();
  };

  const executePhases = () => {
    currentHand.execute();
    updateState();
  };
</script>

<main>
  <button on:click={executePhases}>Execute</button>
  <PlayerHand {player} />
  <h3>Main hand</h3>
  <div id="hand">
    {#each hand as tile, i}
      <button
        disabled={tile instanceof StandardTile && hasFlowers}
        on:click={() => onTileClicked(tile, i)}
      >
        {tile.toString()}
      </button>
    {/each}
  </div>
  <div id="actions">
    {#if hand.length < 14}
      <button
        on:click={() => {
          player.drawFromWall();
          hand = player.hand;
        }}
      >
        Draw
      </button>
    {/if}
  </div>
  <h3>Other's hands</h3>
  {#each otherPlayers as player}
    <PlayerHand {player} />
    <div id="hand" style="display: flex; gap = 16px">
      {#each player.hand as tile, i}
        <div>
          {tile.toString()}
        </div>
      {/each}
    </div>
  {/each}
  <div id="actions">
    {#if hand.length < 14}
      <button
        on:click={() => {
          player.drawFromWall();
          hand = player.hand;
        }}
      >
        Draw
      </button>
    {/if}
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
    <Canvas let:sti w={window.innerWidth} h={500} interactive>
      <Scene {sti} let:scene id="scene1" props={{ background: 0xedf2f7 }}>
        <PerspectiveCamera
          {scene}
          id="cam1"
          pos={[0, -TABLE_WIDTH / 2, 10]}
          lookAt={[0, TILE_HEIGHT / 2, 0]}
          props={{
            zoom: 1,
            fov: 60,
          }}
        />
        <AmbientLight {scene} intensity={1.25} />
        <DirectionalLight
          {scene}
          pos={[0, -TABLE_WIDTH, TILE_HEIGHT]}
          intensity={0.3}
        />

        <MyHand
          {scene}
          player={currentHand.players[0]}
          playerHandInterface={currentHand.players[0]}
          onUpdate={updateState}
        />

        <TileRow
          {scene}
          tiles={bonusTiles}
          faceUp={true}
          pos={[0, 2 * TILE_THICKNESS, 0]}
        />
        <OrbitControls {scene} enableDamping />
      </Scene>

      <WebGLRenderer
        {sti}
        sceneId="scene1"
        camId="cam1"
        config={{
          antialias: true,
          alpha: true,
          devicePixelRatio: window.devicePixelRatio,
        }}
      />
    </Canvas>
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  #hand,
  #flowers {
    font-size: 2em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
