<script lang="ts">
  import { Mesh } from "svelthree";
  import {
    DoubleSide,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PlaneBufferGeometry,
    Scene,
  } from "svelthree-three";

  export let scene: Scene;
  const geometry = new PlaneBufferGeometry(0.01, 0.01);
  const material = new MeshBasicMaterial({
    opacity: 0,
    transparent: true,
    color: 0x00ff00,
    side: DoubleSide,
  });
</script>

<Mesh {scene} {geometry} {material} {...$$restProps} let:parent>
  <slot {parent} />
</Mesh>
