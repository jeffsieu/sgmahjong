<script lang="ts">
  import type { Scene } from "svelthree-three";
  import TileRow from "./TileRow.svelte";
  import { TILE_THICKNESS, TILE_WIDTH } from "./constants";
  import type { WallStack } from "../game-state/pre-hand";
  import Group from "../svelthree-patch/Group.svelte";

  export let wallStack: WallStack;
  export let scene: Scene;
  export let highlight: boolean = false;

  export let onPointerOut: (event: CustomEvent) => void = null;
  export let onPointerOver: (event: CustomEvent) => void = null;
  export let onClick: (event: CustomEvent) => void = null;

  $: initialStackLength = wallStack.initialLength / 2;
  $: topRowStartIndex = Math.ceil(wallStack.getStart() / 2);
  $: bottomRowStartIndex = Math.floor(wallStack.getStart() / 2);
  $: drawnFromBack = wallStack.initialLength - 1 - wallStack.getEnd();
  $: topRowEndIndex =
    wallStack.initialLength / 2 - Math.ceil(drawnFromBack / 2);
  $: bottomRowEndIndex =
    wallStack.initialLength / 2 - Math.floor(drawnFromBack / 2);
  $: topRowLength = topRowEndIndex - topRowStartIndex;
  $: bottomRowLength = bottomRowEndIndex - bottomRowStartIndex;
</script>

<Group {scene} {...$$restProps} let:parent>
  {#each [[bottomRowStartIndex, bottomRowLength], [topRowStartIndex, topRowLength]] as [rowOffset, rowLength], index}
    <p>
      {rowOffset}
    </p>
    <TileRow
      {scene}
      {parent}
      {highlight}
      {onPointerOver}
      {onPointerOut}
      {onClick}
      pos={[
        (initialStackLength / 2 - (rowOffset + rowLength / 2)) * TILE_WIDTH,
        0,
        (index + 0.5) * TILE_THICKNESS,
      ]}
      tiles={Array.from({ length: rowLength }, (v, index) => null)}
      faceUp={false}
    />
  {/each}
</Group>
