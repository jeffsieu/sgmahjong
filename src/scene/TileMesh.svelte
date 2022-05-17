<script lang="ts">
  import {
    Mesh,
    BoxGeometry,
    MeshStandardMaterial,
    Empty,
    Color,
    Vector3,
    ShaderChunk,
  } from "svelthree";

  import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

  import { Scene, Plane } from "svelthree-three";
  import type { Tile, TileInstance } from "../tiles";
  import {
    TILE_COLOR_FACE,
    TILE_FRONT_EXTRA_SIZE,
    TILE_HEIGHT,
    TILE_RADIUS,
    TILE_THICKNESS,
    TILE_WIDTH,
  } from "./constants";

  import { getTexture } from "./texture-utils";
  import { afterUpdate, onMount } from "svelte";

  export let scene: Scene;
  export let tile: TileInstance<Tile> | null = null;
  export let onPointerOut: (event: CustomEvent) => void = () => {};
  export let onPointerOver: (event: CustomEvent) => void = () => {};
  export let onClick: (event: CustomEvent) => void = () => {};
  export let highlight: boolean = false;
  export let hidden: boolean = false;

  const whiteTileFace = new MeshStandardMaterial({
    color: TILE_COLOR_FACE,
    roughness: 0.1,
    metalness: 0.5,
  });

  // Define a material with the image only on the front face
  const face: MeshStandardMaterial = tile
    ? new MeshStandardMaterial({
        map: getTexture(hidden ? null : tile.value),
        roughness: 0.1,
        metalness: 0.5,
        color: TILE_COLOR_FACE,
      })
    : whiteTileFace;

  // Make the color of the face show underneath the transparent tile face
  face.onBeforeCompile = function (shader) {
    var custom_map_fragment = ShaderChunk.map_fragment.replace(
      `diffuseColor *= texelColor;`,

      `diffuseColor = vec4( mix( diffuse, texelColor.rgb, texelColor.a ), opacity );`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      custom_map_fragment
    );
  };

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
    clippingPlanes: [new Plane(new Vector3(0, 0, 1), 3)],
  });

  const highlightedBackMaterial = new MeshStandardMaterial({
    color: new Color(0x2b71d9).offsetHSL(0, 0, 0.1),
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
  highlightedTileMaterial.forEach((mat) => {
    mat.color = new Color(TILE_COLOR_FACE).offsetHSL(0, 0, 0.1);

    mat.onBeforeCompile = function (shader) {
      var custom_map_fragment = ShaderChunk.map_fragment.replace(
        `diffuseColor *= texelColor;`,

        `diffuseColor = vec4( mix( diffuse, texelColor.rgb, texelColor.a ), opacity );`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        custom_map_fragment
      );
    };
  });

  let tileMaterial = baseTileMaterial;
  $: backMaterial = baseBackMaterial;

  afterUpdate(() => {
    tileMaterial = highlight ? highlightedTileMaterial : baseTileMaterial;
    backMaterial = highlight ? highlightedBackMaterial : baseBackMaterial;
  });

  const tileBackGeometry = new RoundedBoxGeometry(
    TILE_WIDTH,
    TILE_HEIGHT,
    TILE_THICKNESS / 2 + TILE_RADIUS,
    8,
    TILE_RADIUS
  ) as unknown as BoxGeometry;

  const tileFrontGeometry = new RoundedBoxGeometry(
    TILE_WIDTH + TILE_FRONT_EXTRA_SIZE,
    TILE_HEIGHT + TILE_FRONT_EXTRA_SIZE,
    TILE_THICKNESS / 2 + TILE_RADIUS,
    8,
    TILE_RADIUS
  ) as unknown as BoxGeometry;

  let mesh: Mesh;

  onMount(() => {
    if (mesh) {
      // const position = mesh.getMesh().position;
      // const plane: Plane = baseBackMaterial.clippingPlanes[0];
      backMaterial = baseBackMaterial;
      // plane.applyMatrix4(mesh.getMesh().matrixWorld);
      // console.debug(plane);
      // plane.constant = 1;
      // console.debug(plane);
    }
  });
</script>

<Empty {scene} {...$$restProps} let:parent>
  <Mesh
    bind:this={mesh}
    {scene}
    {parent}
    {onPointerOver}
    {onPointerOut}
    {onClick}
    castShadow
    receiveShadow
    interact
    pos={[0, 0, TILE_THICKNESS / 4 - TILE_RADIUS / 2]}
    geometry={tileBackGeometry}
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
    pos={[0, 0, -TILE_THICKNESS / 4 + TILE_RADIUS / 2]}
    geometry={tileFrontGeometry}
    material={tileMaterial}
  />
</Empty>
