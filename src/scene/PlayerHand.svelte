<script lang="ts">
  import { BonusTile, Tile, TileInstance } from "../tiles";
  import TileMesh from "./TileMesh.svelte";
  import type { Scene, Mesh as ThreeMesh } from "svelthree-three";
  import {
    TILE_HEIGHT,
    TILE_THICKNESS,
    TILE_WIDTH,
    DISCARD_TILE_TILT,
  } from "./constants";

  import gsap from "gsap";
  import type { ReadonlyPlayer } from "../game-state/game-state";
  import type { PlayerUI } from "../controls/hand-control";
  import Empty from "svelthree/src/components/Empty.svelte";
  import { MessageLogger, PlayerLogEntry } from "../message-logger";
  import {
    DiscardTileAction,
    RevealBonusTileThenDrawAction,
  } from "../game-state/actions";
  import TooltipContent from "./TooltipContent.svelte";

  export let player: ReadonlyPlayer;
  export let playerUi: PlayerUI;
  export let scene: Scene;
  export let onUpdate: () => void;
  export let canControl: boolean;

  let hoveredTiles: Set<TileInstance<Tile>> = new Set();
  $: hoveredTile =
    hoveredTiles.size > 0 ? hoveredTiles.values().next().value : null;
  $: hoveredTileTooltip = hoveredTile
    ? hoveredTile.value instanceof BonusTile
      ? "Reveal"
      : "Discard"
    : null;

  const onTilePointerOver =
    (position: number) =>
    (event: CustomEvent): void => {
      if (!canControl) {
        return;
      }

      const tileObject: ThreeMesh = event.detail.target;
      if (tileObject.parent) {
        gsap.to(tileObject.parent.position, {
          duration: 0.3,
          y:
            (Math.cos(DISCARD_TILE_TILT) *
              Math.sqrt(TILE_HEIGHT ** 2 + TILE_THICKNESS ** 2)) /
            2,
          z:
            (Math.sin(DISCARD_TILE_TILT) *
              Math.sqrt(TILE_HEIGHT ** 2 + TILE_THICKNESS ** 2)) /
              2 -
            TILE_HEIGHT / 2,
          ease: "power3.out",
        });
        gsap.to(tileObject.parent.rotation, {
          duration: 0.3,
          x: DISCARD_TILE_TILT,
          ease: "power3.out",
        });
      }

      hoveredTiles.add(player.hand[position]);
      hoveredTiles = hoveredTiles;
    };

  const onTilePointerOut =
    (position: number) =>
    (event: CustomEvent): void => {
      if (!canControl) {
        return;
      }
      const tileObject: ThreeMesh = event.detail.target;
      if (tileObject.parent) {
        gsap.to(tileObject.parent.position, {
          duration: 0.3,
          y: 0,
          z: 0,
          ease: "power3.out",
        });
        gsap.to(tileObject.parent.rotation, {
          duration: 0.3,
          x: Math.PI / 2,
          ease: "power3.out",
        });
      }

      hoveredTiles.delete(player.hand[position]);
      hoveredTiles = hoveredTiles;
    };

  const onTileClick =
    (position: number) =>
    (event: CustomEvent): void => {
      if (!canControl) {
        return;
      }
      try {
        const tile = player.hand[position];
        if (tile.value instanceof BonusTile) {
          playerUi.tryExecuteAction(
            new RevealBonusTileThenDrawAction(
              player,
              tile as TileInstance<BonusTile>
            )
          );
        } else {
          playerUi.tryExecuteAction(new DiscardTileAction(player, position));
        }
      } catch (error: any) {
        console.debug(error);
        console.debug(error.message);
        MessageLogger.log(new PlayerLogEntry(player, error.message));
      } finally {
        player = player;
        onUpdate();
      }
    };
</script>

{#if canControl && hoveredTileTooltip}
  <TooltipContent text={hoveredTileTooltip} />
{/if}

<Empty {scene} {...$$restProps} let:parent>
  {#each player.hand as tile, index (tile.value.toString() + index)}
    <TileMesh
      {scene}
      {tile}
      {parent}
      pos={[(index - player.hand.length / 2 + 0.5) * TILE_WIDTH, 0, 0]}
      rot={[Math.PI / 2, -Math.PI, 0]}
      onPointerOver={onTilePointerOver(index)}
      onPointerOut={onTilePointerOut(index)}
      onClick={onTileClick(index)}
      hidden={!canControl}
    />
  {/each}
</Empty>
