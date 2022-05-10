<script lang="ts">
  import {
    Mesh,
    TextureLoader,
    ExtrudeBufferGeometry,
    BoxGeometry,
    CanvasTexture,
    Geometry,
    Texture,
    MeshStandardMaterial,
    Shape,
    Object3D,
    Vector2,
    Vector3,
    RepeatWrapping,
  } from "svelthree";

  import type { Scene, Euler, Mesh as ThreeMesh } from "svelthree-three";
  import type { Tile } from "../tiles";
  import { TILE_HEIGHT, TILE_THICKNESS, TILE_WIDTH } from "./constants";
  import { RoundedBoxBufferGeometry } from "./RoundedBoxGeometry";

  import { getTexture } from "./texture-utils";

  export let scene: Scene;
  export let tile: Tile;

  type Array3 = [number, number, number];
  type Array4 = [number, number, number, string];

  type PropPos = Vector3 | Array3;
  type PropRot = Euler | Array3 | Array4;
  type PropScale = Vector3 | Array3;

  export let pos: PropPos = undefined;
  export let rot: PropRot = undefined;
  export let scale: PropScale = undefined;
  export let parent: Object3D = undefined;

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
    TILE_THICKNESS
    // 0.1,
    // 10
  );

  const texture = getTexture(tile);

  // Define a material with the image only on the front face
  let face = new MeshStandardMaterial({
    map: texture,
    roughness: 0.5,
    metalness: 0.5,
  });

  let otherFaces = new MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.5,
  });

  let tileMaterial = [
    otherFaces,
    otherFaces,
    otherFaces,
    otherFaces,
    otherFaces,
    face,
  ];

  // let tileMaterial = otherFaces;
</script>

<Mesh
  {scene}
  {parent}
  {pos}
  {rot}
  {scale}
  interact
  geometry={tileGeometry}
  material={tileMaterial}
  {...$$restProps}
/>
