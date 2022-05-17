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
  } from "./constants";

  import PlayerHand from "./PlayerHand.svelte";
  import TileRow from "./TileRow.svelte";
  import Text from "./Text.svelte";
  import Group from "../svelthree-patch/Group.svelte";
  import TurnIndicator from "./turn-indicator/PlayerTurnIndicator.svelte";
  import TextButton from "./TextButton.svelte";
  import PlayerSideButtons from "./PlayerSideButtons.svelte";
  import {
    HandPhase,
    ToDiscardPhase,
    WindowOfOpportunityPhase,
  } from "../game-state/phases";
  import { getValidWindowOfOpportunityActions } from "../game-state/action-generator";
  import {
    isChowAction,
    isKongAction,
    isMahjongAction,
    isPongAction,
    isSkipAction,
    SelfDrawMahjongAction,
    SkipWindowOfOpportunityAction,
  } from "../game-state/actions";
  import { StandardMahjong } from "../tiles";
  import { getWinningHand } from "../combis";
  import { WinningHandType } from "../scoring/scoring";

  export let phase: HandPhase;
  export let player: ReadonlyPlayer;
  export let playerUi: PlayerUI;
  export let scene: Scene;
  export let onUpdate: () => void;
  export let hasTurnControl: boolean;
  export let showControls: boolean;

  const buttonSize = 1.1;

  $: revealedTiles = [
    ...player.bonusTiles,
    ...player.melds.flatMap((meld) => meld.tiles),
  ];
  $: validWOPActions =
    phase instanceof WindowOfOpportunityPhase
      ? getValidWindowOfOpportunityActions(player, phase)
      : [];
  $: phase instanceof WindowOfOpportunityPhase &&
    console.debug(phase.discardedTile.value.toString());
  $: player.wind === StandardMahjong.SUIT_EAST &&
    console.debug(validWOPActions);
  $: canChow = validWOPActions.some(isChowAction);
  $: canPong = validWOPActions.some(isPongAction);
  $: canKong = validWOPActions.some(isKongAction);
  $: canMahjong = validWOPActions.some(isMahjongAction);
  $: canSkip = validWOPActions.some(isSkipAction);
  $: chowActions = validWOPActions.filter(isChowAction).map((action) => ({
    name: action.meld.value.toString(),
    meld: action.meld,
    onClick: () => {
      phase.hand.tryExecuteAction(action);
      onUpdate();
    },
  }));

  let showChowActions = false;

  $: chowActionRows = [
    [],
    [
      {
        name: "Back",
        show: true,
        onClick: () => {
          showChowActions = false;
        },
      },
    ],
  ];

  $: regularActionRows = [
    [
      {
        name: "Win",
        show: canMahjong,
        onClick: () => {
          phase.hand.tryExecuteAction(validWOPActions.find(isMahjongAction)!);
          onUpdate();
        },
      },
      {
        name: "Skip",
        show: canSkip,
        onClick: () => {
          phase.hand.tryExecuteAction(
            new SkipWindowOfOpportunityAction(player)
          );
          onUpdate();
        },
      },
    ],
    [
      {
        name: "Chow",
        show: canChow,
        onClick: () => {
          showChowActions = true;
        },
      },
    ],
    [
      {
        name: "Kong",
        show: canKong,
        onClick: () => {
          phase.hand.tryExecuteAction(validWOPActions.find(isKongAction)!);
          onUpdate();
        },
      },
      {
        name: "Pong",
        show: canPong,
        onClick: () => {
          phase.hand.tryExecuteAction(validWOPActions.find(isPongAction)!);
          onUpdate();
        },
      },
    ],
  ];
  $: actionRows = showChowActions ? chowActionRows : regularActionRows;
  $: latestDrawnTile =
    phase instanceof ToDiscardPhase ? phase.getLatestDrawnTile() : undefined;

  $: selfDrawWinningHand =
    phase instanceof ToDiscardPhase && phase.player === player
      ? getWinningHand(
          player,
          [...player.hand].filter((tile) => tile !== latestDrawnTile),
          latestDrawnTile ?? null,
          WinningHandType.SelfDraw
        )
      : null;

  $: canSelfDrawMahjong = selfDrawWinningHand !== null;

  $: {
    if (!(phase instanceof WindowOfOpportunityPhase)) {
      showChowActions = false;
    }
  }
</script>

<Group {...$$restProps} {scene} let:parent>
  {#if showControls}
    {#if showChowActions}
      {#each chowActions as action, index}
        <TileRow
          {scene}
          {parent}
          highlightOnHover
          tooltip={"Chow"}
          onClick={action.onClick}
          tiles={action.meld.tiles}
          faceUp
          pos={new Vector3(
            0,
            -HAND_TO_TABLE_EDGE + TABLE_WIDTH / 2,
            TILE_THICKNESS / 2
          )
            .add(
              new Vector3(
                -TILE_WIDTH * 3 -
                  (chowActions.length - index) * 3 * TILE_WIDTH -
                  ((chowActions.length - index - 1) * TILE_WIDTH) / 2 +
                  CENTER_SQUARE_LENGTH / 2,
                -CENTER_SQUARE_LENGTH / 2 - 2 * TILE_HEIGHT,
                0
              ).applyAxisAngle(new Vector3(0, 0, 1), WALL_TILT)
            )
            .toArray()}
          rot={[0, 0, WALL_TILT]}
        />
      {/each}
    {/if}
    {#if phase instanceof WindowOfOpportunityPhase}
      {#each actionRows as actions, index}
        <PlayerSideButtons
          {scene}
          {parent}
          size={buttonSize}
          {actions}
          pos={new Vector3(0, -HAND_TO_TABLE_EDGE + TABLE_WIDTH / 2, 0.01)
            .add(
              new Vector3(
                CENTER_SQUARE_LENGTH / 2,
                -CENTER_SQUARE_LENGTH / 2 -
                  TILE_HEIGHT -
                  index * buttonSize * 3.5,
                0
              ).applyAxisAngle(new Vector3(0, 0, 1), WALL_TILT)
            )
            .toArray()}
          rot={[0, 0, WALL_TILT]}
        />
      {/each}
    {/if}
    {#if canSelfDrawMahjong}
      <TextButton
        {scene}
        {parent}
        text="Win"
        onClick={() => {
          if (selfDrawWinningHand === null) {
            return;
          }
          phase.hand.tryExecuteAction(
            new SelfDrawMahjongAction(player, selfDrawWinningHand)
          );
          onUpdate();
        }}
        size={1.5}
        pos={[0, -TILE_THICKNESS / 4 - HAND_TO_TABLE_EDGE / 2, 0.02]}
      />
    {/if}
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
      phase = phase;
      onUpdate();
    }}
    canControl={showControls}
  />
  <TileRow
    {parent}
    {scene}
    tiles={revealedTiles}
    faceUp={true}
    pos={[-5 * TILE_WIDTH, REVEALED_TILE_DISTANCE, TILE_THICKNESS / 2]}
  />
</Group>
