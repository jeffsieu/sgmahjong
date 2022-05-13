<script lang="ts">
  import { PlaneBufferGeometry, MeshStandardMaterial } from "svelthree";
  import type { Scene } from "svelthree-three";
  import Mesh from "svelthree/src/components/Mesh.svelte";
  import {
    CENTER_SQUARE_LENGTH,
    TURN_INDICATOR_HEIGHT,
    TURN_INDICATOR_WIDTH,
  } from "../constants";
  import gsap from "gsap";
  import { animateMaterial } from "./anim";

  export let scene: Scene;

  const geometry = new PlaneBufferGeometry(
    CENTER_SQUARE_LENGTH,
    CENTER_SQUARE_LENGTH
  );
  const material = new MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
  });
  animateMaterial(material);
</script>

<Mesh {scene} {geometry} {material} {...$$restProps} />
