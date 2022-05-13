<script lang="ts">
  import {
    DISCARD_PILE_ROW_LENGTH,
    TILE_HEIGHT,
    TILE_THICKNESS,
  } from "./constants";
  import type { Scene } from "svelthree-three";
  import { Empty } from "svelthree";
  import TileRow from "./TileRow.svelte";
  import type { Tile } from "../tiles";

  export let scene: Scene;
  export let tiles: Tile[];

  $: tileRows = Array.from(
    { length: Math.ceil(tiles.length / DISCARD_PILE_ROW_LENGTH) },
    (_, rowIndex) => {
      const row: Tile[] = tiles.slice(
        rowIndex * DISCARD_PILE_ROW_LENGTH,
        (rowIndex + 1) * DISCARD_PILE_ROW_LENGTH
      );
      return row;
    }
  );
</script>

<Empty {scene} {...$$restProps} let:parent>
  {#each tileRows as tileRow, index}
    <TileRow
      {scene}
      {parent}
      tiles={tileRow}
      faceUp={true}
      pos={[0, (2 - index) * TILE_HEIGHT, TILE_THICKNESS / 2]}
    />
  {/each}
</Empty>
