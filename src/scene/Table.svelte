<script lang="ts">
  import type { Hand } from "../game-state/game-state";
  import {
    Mesh,
    DoubleSide,
    PlaneBufferGeometry,
    Vector3,
    MeshStandardMaterial,
  } from "svelthree";
  import type { Scene, Mesh as ThreeMesh } from "svelthree-three";
  import {
    TABLE_WIDTH,
    HAND_TO_TABLE_EDGE,
    WALL_TILT,
    TILE_HEIGHT,
  } from "./constants";

  import { DrawTileAction } from "../game-state/actions";

  import gsap from "gsap";
  import PlayerSide from "./PlayerSide.svelte";
  import DiscardPile from "./DiscardPile.svelte";
  import Walls from "./Walls.svelte";
  import Group from "../svelthree-patch/Group.svelte";
  import Text from "./Text.svelte";
  import { PlayerControlledPhase } from "../game-state/phases";
  import CenterTurnIndicator from "./turn-indicator/CenterTurnIndicator.svelte";
  import TextButton from "./TextButton.svelte";

  export let hand: Hand;
  export let scene: Scene;
  export let onUpdate: () => void;

  const geometry = new PlaneBufferGeometry(TABLE_WIDTH, TABLE_WIDTH, 1);
  const material = new MeshStandardMaterial({ color: 0x005100 });
  $: currentHand = hand;
  $: currentPhase = currentHand.getCurrentPhase();
  $: discardPile = currentHand.discardPile;
  $: wallStacks = currentHand.physicalWall.wallStacks;

  const onTableOver = (event: CustomEvent): void => {
    const tileObject: ThreeMesh = event.detail.target;
    gsap.to(tileObject.position, {
      duration: 0.3,
      z: 1,
      ease: "power3.out",
    });
  };
</script>

<Group {scene} let:parent>
  <Mesh
    {scene}
    {geometry}
    {material}
    receiveShadow
    mat={{ roughness: 1, metalness: 0, side: DoubleSide }}
  />
  {#if !(currentPhase instanceof PlayerControlledPhase)}
    <CenterTurnIndicator
      {scene}
      {parent}
      pos={[0, 0, 0.01]}
      rot={[0, 0, WALL_TILT]}
    />
  {/if}
  <Walls
    {scene}
    {wallStacks}
    onClick={() => {
      currentHand.tryExecuteAction(new DrawTileAction(currentHand.players[0]));
      onUpdate();
    }}
  />
  <DiscardPile {scene} tiles={discardPile} rot={[0, 0, WALL_TILT]} />
  {#each currentHand.players as player, index}
    <PlayerSide
      {scene}
      {player}
      {parent}
      showControls={index === 0}
      hasTurnControl={currentPhase instanceof PlayerControlledPhase &&
        currentPhase.player === player}
      playerUi={currentHand}
      pos={new Vector3(0, -TABLE_WIDTH / 2 + HAND_TO_TABLE_EDGE, 0)
        .applyAxisAngle(new Vector3(0, 0, 1), (index * Math.PI) / 2)
        .toArray()}
      rot={[0, 0, (index * Math.PI) / 2]}
      onUpdate={() => {
        hand = hand;
        onUpdate();
      }}
    />
  {/each}
</Group>
