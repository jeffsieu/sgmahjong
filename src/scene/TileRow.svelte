<script lang="ts">
  import type { Tile, TileInstance } from "../tiles";
  import TileMesh from "./TileMesh.svelte";
  import { TILE_WIDTH } from "./constants";

  import type { Scene } from "svelthree-three";
  import Group from "../svelthree-patch/Group.svelte";
  import TooltipContent from "./TooltipContent.svelte";

  export let scene: Scene;
  export let tiles: (TileInstance<Tile> | null)[];
  export let faceUp: boolean;
  export let highlight: boolean = false;
  export let highlightOnHover: boolean = false;
  export let tooltip: string | null = null;

  export let onPointerOut: (event: CustomEvent) => void = () => {};
  export let onPointerOver: (event: CustomEvent) => void = () => {};
  export let onClick: (event: CustomEvent) => void = () => {};

  let hoveredTiles: Set<number> = new Set();
  $: isHovered = hoveredTiles.size > 0;

  const onTilePointerOver = (index: number) => (event: CustomEvent) => {
    onPointerOver(event);
    hoveredTiles.add(index);
    hoveredTiles = hoveredTiles;
  };

  const onTilePointerOut = (index: number) => (event: CustomEvent) => {
    onPointerOut(event);
    hoveredTiles.delete(index);
    hoveredTiles = hoveredTiles;
  };
</script>

{#if tooltip !== null && isHovered}
  <TooltipContent text={tooltip} />
{/if}
<Group {scene} {...$$restProps} let:parent>
  {#each tiles as tile, index ((tile ? tile.value.toString() : "") + index)}
    <TileMesh
      {scene}
      {parent}
      highlight={highlight || (highlightOnHover && isHovered)}
      onPointerOut={onTilePointerOut(index)}
      onPointerOver={onTilePointerOver(index)}
      {onClick}
      tile={faceUp ? tile : null}
      rot={[faceUp ? 0 : Math.PI, -Math.PI, 0]}
      pos={[(index - tiles.length / 2 + 0.5) * TILE_WIDTH, 0, 0]}
    />
  {/each}
</Group>
