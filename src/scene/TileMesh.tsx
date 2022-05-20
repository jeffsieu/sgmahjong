import { useMemo } from "react";
import { GroupProps, ThreeEvent } from "react-three-fiber";
import { FrontSide } from "three";
import {
  BoxGeometry,
  MeshStandardMaterial,
  Color,
  Vector3,
  Plane,
} from "three";

import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import type { Tile, TileInstance } from "../tiles";
import {
  TILE_COLOR_FACE,
  TILE_FRONT_EXTRA_SIZE,
  TILE_HEIGHT,
  TILE_RADIUS,
  TILE_THICKNESS,
  TILE_WIDTH,
} from "./constants";
import { WithoutGeoMat } from "./object-props";

import { getTexture } from "./texture-utils";

export type TileMeshProps = {
  tile: TileInstance<Tile> | null;
  highlight?: boolean;
  hidden?: boolean;
  onTilePointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onTilePointerOut?: (event: ThreeEvent<PointerEvent>) => void;
  onTileClick?: (event: ThreeEvent<MouseEvent>) => void;
};

const whiteTileFace = new MeshStandardMaterial({
  color: TILE_COLOR_FACE,
  roughness: 0.1,
  metalness: 0.5,
});

const baseTileMaterial = whiteTileFace;

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

const highlightedTileMaterial = baseTileMaterial.clone();
highlightedTileMaterial.color = new Color(TILE_COLOR_FACE).offsetHSL(0, 0, 0.1);

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

const TileMesh = ({
  tile,
  highlight = false,
  hidden = false,
  onTilePointerOut,
  onTilePointerOver,
  onTileClick,
  ...rest
}: WithoutGeoMat<GroupProps> & TileMeshProps) => {
  const faceTexture = useMemo(() => {
    return tile ? getTexture(hidden ? null : tile.value) : null;
  }, [tile, hidden]);

  // Define a material with the image only on the front face
  // const face = useMemo(() => {
  //   console.log("yikes");
  //   const material = tile
  //     ? new MeshStandardMaterial({
  //         map: faceTexture,
  //         roughness: 0.1,
  //         metalness: 0.5,
  //         color: TILE_COLOR_FACE,
  //         opacity: 1,
  //       })
  //     : whiteTileFace;

  //   // Make the color of the face show underneath the transparent tile face
  //   material.onBeforeCompile = function (shader: Shader) {
  //     const custom_map_fragment = ShaderChunk.map_fragment.replace(
  //       `diffuseColor *= texelColor;`,

  //       `diffuseColor = vec4( mix( diffuse, texelColor.rgb, texelColor.a ), opacity );`
  //     );

  //     shader.fragmentShader = shader.fragmentShader.replace(
  //       "#include <map_fragment>",
  //       custom_map_fragment
  //     );
  //   };

  //   return material;
  // }, [tile, faceTexture, whiteTileFace]);

  const backMaterial = highlight ? highlightedBackMaterial : baseBackMaterial;
  const tileMaterial = highlight ? highlightedTileMaterial : baseTileMaterial;

  return (
    <group {...rest}>
      <mesh
        position={[0, 0, -TILE_THICKNESS / 2 - 0.01]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
      >
        <planeGeometry attach="geometry" args={[TILE_WIDTH, TILE_HEIGHT]} />
        <meshStandardMaterial
          attach="material"
          map={faceTexture}
          transparent={true}
          side={FrontSide}
        />
      </mesh>
      <mesh
        onPointerOut={onTilePointerOut}
        onPointerOver={onTilePointerOver}
        onClick={onTileClick}
        castShadow
        receiveShadow
        position={[0, 0, TILE_THICKNESS / 4 - TILE_RADIUS / 2]}
        geometry={tileBackGeometry}
        material={backMaterial}
      />
      <mesh
        onPointerOut={onTilePointerOut}
        onPointerOver={onTilePointerOver}
        onClick={onTileClick}
        castShadow
        receiveShadow
        position={[0, 0, -TILE_THICKNESS / 4 + TILE_RADIUS / 2]}
        geometry={tileFrontGeometry}
        material={tileMaterial}
      />
    </group>
  );
};

export default TileMesh;
