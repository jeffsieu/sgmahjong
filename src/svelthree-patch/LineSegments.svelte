<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { LineSegments, Object3D } from "svelthree";
  import type {
    Scene,
    Geometry,
    Material,
    BufferGeometry,
  } from "svelthree-three";

  export let scene: Scene;
  export let parent: Object3D;
  export let geometry: Geometry | BufferGeometry;
  export let material: Material;

  const lineSegments = new LineSegments(geometry, material);

  onMount(() => {
    if (parent !== undefined) {
      parent.add(lineSegments);
    } else {
      scene.add(lineSegments);
    }
  });

  onDestroy(() => {
    if (parent !== undefined) {
      parent.remove(lineSegments);
    } else {
      scene.remove(lineSegments);
    }
  });
</script>
