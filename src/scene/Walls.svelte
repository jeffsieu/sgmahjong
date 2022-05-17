<script lang="ts">
  import { Vector3 } from "svelthree";
  import type { Scene } from "svelthree-three";
  import type { WallStack } from "../game-state/pre-hand";

  import {
    TILE_WIDTH,
    CENTER_SQUARE_LENGTH,
    TILE_HEIGHT,
    WALL_TILT,
    WALL_GAP,
  } from "./constants";
  import TooltipContent from "./TooltipContent.svelte";
  import WallMesh from "./WallMesh.svelte";

  export let wallStacks: WallStack[];
  export let scene: Scene;
  export let onClick: (event: CustomEvent) => void;

  let highlight = false;

  const hoveredTiles = new Set<any>();

  const onTilePointerOver = (event: CustomEvent) => {
    if (hoveredTiles.size === 0) {
      highlight = true;
    }
    hoveredTiles.add(event.detail.target);
  };

  const onTilePointerOut = (event: CustomEvent) => {
    if (hoveredTiles.size === 1) {
      highlight = false;
    }
    hoveredTiles.delete(event.detail.target);
  };
</script>

{#if highlight}
  <TooltipContent text={"Draw from wall"} />
{/if}

{#each wallStacks as wallStack, index}
  <WallMesh
    onPointerOver={onTilePointerOver}
    onPointerOut={onTilePointerOut}
    {onClick}
    {highlight}
    {scene}
    pos={new Vector3(
      -(
        ((wallStack.initialLength / 2) * TILE_WIDTH) / 2 -
        CENTER_SQUARE_LENGTH / 2 +
        WALL_GAP
      ),
      -(CENTER_SQUARE_LENGTH / 2 + TILE_HEIGHT / 2),
      0
    )
      .applyAxisAngle(new Vector3(0, 0, 1), (index * Math.PI) / 2 + WALL_TILT)
      .toArray()}
    rot={new Vector3(0, 0, (index * Math.PI) / 2 + WALL_TILT).toArray()}
    {wallStack}
  />
{/each}
