<script lang="ts">
  import type { Tile } from "../tiles";
  import TileMesh from "./TileMesh.svelte";
  import { TILE_HEIGHT, TILE_THICKNESS, TILE_WIDTH } from "./constants";
  import { Empty } from "svelthree";
  import type { Scene } from "svelthree-three";
  import Group from "../svelthree-patch/Group.svelte";

  export let scene: Scene;
  export let tiles: Tile[];
  export let faceUp: boolean;
  export let highlight: boolean = false;

  export let onPointerOut: (event: CustomEvent) => void = null;
  export let onPointerOver: (event: CustomEvent) => void = null;
  export let onClick: (event: CustomEvent) => void = null;
</script>

<Group {scene} {...$$restProps} let:parent>
  {#each tiles as tile, index ((tile ? tile.toString() : "") + index)}
    <TileMesh
      {scene}
      {parent}
      {highlight}
      {onPointerOut}
      {onPointerOver}
      {onClick}
      tile={faceUp ? tile : null}
      rot={[faceUp ? 0 : Math.PI, -Math.PI, 0]}
      pos={[(index - tiles.length / 2 + 0.5) * TILE_WIDTH, 0, 0]}
    />
  {/each}
</Group>
