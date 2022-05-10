<script lang="ts">
  import type { Tile } from "../tiles";
  import TileMesh from "./TileMesh.svelte";
  import { TILE_HEIGHT, TILE_THICKNESS, TILE_WIDTH } from "./constants";
  import { Empty } from "svelthree";
  import type { Scene } from "svelthree-three";

  export let scene: Scene;
  export let tiles: Tile[];
  export let faceUp: boolean;

  console.log("SHEEH" + tiles);
</script>

<Empty {scene} {...$$restProps} let:parent>
  {#each tiles as tile, index (tile.toString() + index)}
    <TileMesh
      {scene}
      {parent}
      {tile}
      rot={[faceUp ? 0 : Math.PI, -Math.PI, 0]}
      pos={[(index - tiles.length / 2 + 0.5) * TILE_WIDTH, 0, 0]}
    />
  {/each}
</Empty>
