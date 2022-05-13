<script lang="ts">
  import { BonusTile, Tile } from "../tiles";
  import TileMesh from "./TileMesh.svelte";
  import type { Scene, Mesh as ThreeMesh } from "svelthree-three";
  import { TILE_HEIGHT, TILE_WIDTH } from "./constants";

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

  let hoveredTiles: Set<Tile> = new Set();
  $: hoveredTile =
    hoveredTiles.size > 0 ? hoveredTiles.values().next().value : null;
  $: hoveredTileTooltip = hoveredTile
    ? hoveredTile instanceof BonusTile
      ? "Reveal"
      : "Discard"
    : null;

  const onTilePointerOver =
    (position: number) =>
    (event: CustomEvent): void => {
      const tileObject: ThreeMesh = event.detail.target;
      gsap.to(tileObject.parent.position, {
        duration: 0.3,
        z: TILE_HEIGHT / 8,
        ease: "power3.out",
      });

      hoveredTiles.add(player.hand[position]);
      hoveredTiles = hoveredTiles;
    };

  const onTilePointerOut =
    (position: number) =>
    (event: CustomEvent): void => {
      const tileObject: ThreeMesh = event.detail.target;
      gsap.to(tileObject.parent.position, {
        duration: 0.3,
        z: 0,
        ease: "power3.out",
      });

      hoveredTiles.delete(player.hand[position]);
      hoveredTiles = hoveredTiles;
    };

  const onTileClick =
    (position: number) =>
    (event: CustomEvent): void => {
      try {
        const tile = player.hand[position];
        if (tile instanceof BonusTile) {
          playerUi.tryExecuteAction(
            new RevealBonusTileThenDrawAction(player, tile)
          );
        } else {
          playerUi.tryExecuteAction(new DiscardTileAction(player, position));
        }
      } catch (error: any) {
        console.log(error);
        console.log(error.message);
        MessageLogger.log(new PlayerLogEntry(player, error.message));
      } finally {
        player = player;
        onUpdate();
      }
    };
</script>

{#if hoveredTileTooltip}
  <TooltipContent text={hoveredTileTooltip} />
{/if}

<Empty {scene} {...$$restProps} let:parent>
  {#each player.hand as tile, index (tile.toString() + index)}
    <TileMesh
      {scene}
      {tile}
      {parent}
      pos={[(index - player.hand.length / 2 + 0.5) * TILE_WIDTH, 0, 0]}
      rot={[Math.PI / 2, -Math.PI, 0]}
      onPointerOver={onTilePointerOver(index)}
      onPointerOut={onTilePointerOut(index)}
      onClick={onTileClick(index)}
    />
  {/each}
</Empty>
