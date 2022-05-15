<script lang="ts">
  import {
    Mesh,
    ExtrudeBufferGeometry,
    BoxGeometry,
    MeshStandardMaterial,
    Shape,
    Empty,
    Color,
  } from "svelthree";

  import LineSegments from "../svelthree-patch/LineSegments.svelte";

  import {
    Scene,
    Mesh as ThreeMesh,
    LineBasicMaterial,
    WireframeGeometry,
    EdgesGeometry,
  } from "svelthree-three";
  import type { Tile, TileInstance } from "../tiles";
  import {
    TILE_COLOR_FACE,
    TILE_HEIGHT,
    TILE_THICKNESS,
    TILE_WIDTH,
  } from "./constants";

  import { getTexture } from "./texture-utils";
  import { afterUpdate, onMount } from "svelte";

  export let scene: Scene;
  export let tile: TileInstance<Tile> = null;
  export let onPointerOut: (event: CustomEvent) => void = null;
  export let onPointerOver: (event: CustomEvent) => void = null;
  export let onClick: (event: CustomEvent) => void = null;
  export let highlight: boolean = false;

  function createBoxWithRoundedEdges(
    width: number,
    height: number,
    depth: number,
    radius0: number,
    smoothness: number
  ): ExtrudeBufferGeometry {
    let shape = new Shape();
    let eps = 0.00001;
    let radius = radius0 - eps;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(
      width - radius * 2,
      height - radius * 2,
      eps,
      Math.PI / 2,
      0,
      true
    );
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    let geometry = new ExtrudeBufferGeometry(shape, {
      depth: depth - radius0 * 2,
      bevelEnabled: true,
      bevelSegments: smoothness * 2,
      steps: 1,
      bevelSize: radius,
      bevelThickness: radius0,
      curveSegments: smoothness,
    });

    geometry.center();

    return geometry;
  }

  const tileGeometry = new BoxGeometry(
    TILE_WIDTH,
    TILE_HEIGHT,
    TILE_THICKNESS / 2
  );

  const fullTileGeometry = new BoxGeometry(
    TILE_WIDTH,
    TILE_HEIGHT,
    TILE_THICKNESS
  );

  const tileWireframeGeometry = new EdgesGeometry(fullTileGeometry);

  let whiteTileFace = new MeshStandardMaterial({
    color: TILE_COLOR_FACE,
    roughness: 0.5,
    metalness: 0.5,
  });

  // Define a material with the image only on the front face
  let face = tile
    ? new MeshStandardMaterial({
        map: getTexture(tile.value),
        roughness: 0.1,
        metalness: 0.5,
        color: TILE_COLOR_FACE,
      })
    : whiteTileFace;

  const baseTileMaterial = [
    whiteTileFace,
    whiteTileFace,
    whiteTileFace,
    whiteTileFace,
    whiteTileFace,
    face,
  ];

  const baseBackMaterial = new MeshStandardMaterial({
    color: 0x2b71d9,
    roughness: 0.1,
    metalness: 0.5,
  });

  const highlightedBackMaterial = new MeshStandardMaterial({
    color: new Color(0x2b71d9).lerp(new Color(0xffffff), 0.5),
    roughness: 0.1,
    metalness: 0.5,
  });
  // highlightedBackMaterial.color = baseBackMaterial.color.lerp(
  //   new Color(0xffffff),
  //   0.5
  // );

  const highlightedTileMaterial = baseTileMaterial.map((material) =>
    material.clone()
  );
  highlightedTileMaterial.forEach(
    (mat) => (mat.color = mat.color.lerp(new Color(TILE_COLOR_FACE), 0.5))
  );

  let tileMaterial = baseTileMaterial;
  let backMaterial = baseBackMaterial;

  afterUpdate(() => {
    tileMaterial = highlight ? highlightedTileMaterial : baseTileMaterial;
    backMaterial = highlight ? highlightedBackMaterial : baseBackMaterial;
  });

  const highlightMaterial = new LineBasicMaterial({
    color: 0x000000,
    linewidth: 1000,
  });
</script>

<Empty {scene} {...$$restProps} let:parent>
  <!-- <LineSegments
    {scene}
    {parent}
    geometry={tileWireframeGeometry}
    material={highlightMaterial}
  /> -->
  <Mesh
    {scene}
    {parent}
    {onPointerOver}
    {onPointerOut}
    {onClick}
    castShadow
    receiveShadow
    interact
    pos={[0, 0, TILE_THICKNESS / 4]}
    geometry={tileGeometry}
    material={backMaterial}
  />
  <Mesh
    {scene}
    {parent}
    {onPointerOver}
    {onPointerOut}
    {onClick}
    castShadow
    receiveShadow
    interact
    pos={[0, 0, -TILE_THICKNESS / 4]}
    geometry={tileGeometry}
    material={tileMaterial}
  />
</Empty>
