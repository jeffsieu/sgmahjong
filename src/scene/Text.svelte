<script lang="ts">
  import { DoubleSide, Mesh, MeshStandardMaterial } from "svelthree";
  import {
    Color,
    Font,
    FontLoader,
    Scene,
    ShapeBufferGeometry,
  } from "svelthree-three";

  export let text: string;
  export let color: string | Color | number;
  export let size: number;
  export let scene: Scene;
  export let onGeometry: (
    loadedGeometry: ShapeBufferGeometry
  ) => void = () => {};

  let font: Font;

  new FontLoader().load("Poppins_Regular.json", (loadedFont) => {
    font = loadedFont;
  });

  $: geometry = font
    ? new ShapeBufferGeometry(font.generateShapes(text, size))
    : undefined;
  $: geometry && onGeometry(geometry);

  const material = new MeshStandardMaterial({
    color: color,
    roughness: 1,
    metalness: 0,
    side: DoubleSide,
  });
</script>

<Mesh {scene} {geometry} {material} {...font ? $$restProps : []} />
