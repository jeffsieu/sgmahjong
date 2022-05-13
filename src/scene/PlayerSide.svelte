<script lang="ts">
  import { Vector3 } from "svelthree";
  import type { ReadonlyPlayer } from "../game-state/game-state";
  import type { PlayerUI } from "../controls/hand-control";
  import type { Scene } from "svelthree-three";
  import {
    TILE_HEIGHT,
    TILE_THICKNESS,
    TILE_WIDTH,
    TABLE_WIDTH,
    HAND_TO_TABLE_EDGE,
    TURN_INDICATOR_HEIGHT,
    TURN_INDICATOR_WIDTH,
    REVEALED_TILE_DISTANCE,
    CENTER_SQUARE_LENGTH,
    WALL_TILT,
    WALL_GAP,
  } from "./constants";

  import PlayerHand from "./PlayerHand.svelte";
  import TileRow from "./TileRow.svelte";
  import Text from "./Text.svelte";
  import Group from "../svelthree-patch/Group.svelte";
  import TurnIndicator from "./turn-indicator/PlayerTurnIndicator.svelte";
  import TextButton from "./TextButton.svelte";
  import PlayerSideButtons from "./PlayerSideButtons.svelte";

  export let player: ReadonlyPlayer;
  export let playerUi: PlayerUI;
  export let scene: Scene;
  export let onUpdate: () => void;
  export let hasTurnControl: boolean;
  export let showControls: boolean;

  $: revealedTiles = [
    ...player.bonusTiles,
    ...player.melds.flatMap((meld) => meld.tiles),
  ];
</script>

<Group {...$$restProps} {scene} let:parent>
  {#if showControls}
    <PlayerSideButtons
      {scene}
      {parent}
      size={2}
      actions={[
        {
          name: "Chow",
          onClick: () => {},
        },
        {
          name: "Pong",
          onClick: () => {},
        },
      ]}
      pos={new Vector3(0, -HAND_TO_TABLE_EDGE + TABLE_WIDTH / 2, 0.01)
        .add(
          new Vector3(
            CENTER_SQUARE_LENGTH / 2,
            -CENTER_SQUARE_LENGTH / 2 - TILE_HEIGHT,
            0
          ).applyAxisAngle(new Vector3(0, 0, 1), WALL_TILT)
        )
        .toArray()}
      rot={[0, 0, WALL_TILT]}
    />
  {/if}
  {#if hasTurnControl}
    <TurnIndicator
      {parent}
      {scene}
      pos={[
        -(TABLE_WIDTH - TURN_INDICATOR_WIDTH) / 2,
        TURN_INDICATOR_HEIGHT / 2 - HAND_TO_TABLE_EDGE,
        0.01,
      ]}
    />
  {/if}
  <Text
    {parent}
    {scene}
    text={player.wind.name}
    size={3}
    color={0xffffff}
    pos={[-TABLE_WIDTH / 2 + HAND_TO_TABLE_EDGE, 0, 0.02]}
  />
  <PlayerHand
    {parent}
    {scene}
    {player}
    {playerUi}
    pos={[0, 0, TILE_HEIGHT / 2]}
    onUpdate={() => {
      player = player;
      onUpdate();
    }}
  />
  <TileRow
    {parent}
    {scene}
    tiles={revealedTiles}
    faceUp={true}
    pos={[-5 * TILE_WIDTH, REVEALED_TILE_DISTANCE, TILE_THICKNESS / 2]}
  />
</Group>
