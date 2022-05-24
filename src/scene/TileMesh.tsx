import { useMemo } from 'react';
import { GroupProps, ThreeEvent } from 'react-three-fiber';
import { FrontSide } from 'three';
import {
  BoxGeometry,
  MeshStandardMaterial,
  Color,
  Vector3,
  Plane,
} from 'three';

import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import type { Tile, TileInstance } from '../tiles';
import {
  TILE_BACK_RATIO,
  TILE_COLOR_FACE,
  TILE_FRONT_EXTRA_SIZE,
  TILE_HEIGHT,
  TILE_RADIUS,
  TILE_THICKNESS,
  TILE_WIDTH,
} from './constants';
import { WithoutGeoMat } from './object-props';

import { getTexture } from './texture-utils';

export type TileMeshProps = {
  tile: TileInstance<Tile> | null;
  highlight?: boolean;
  hidden?: boolean;
  onTilePointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onTilePointerOut?: (event: ThreeEvent<PointerEvent>) => void;
  onTileClick?: (event: ThreeEvent<MouseEvent>) => void;
};

const tileBackGeometry = new RoundedBoxGeometry(
  TILE_WIDTH,
  TILE_HEIGHT,
  TILE_BACK_RATIO * TILE_THICKNESS + TILE_RADIUS,
  8,
  TILE_RADIUS
);

const tileFrontGeometry = new RoundedBoxGeometry(
  TILE_WIDTH + TILE_FRONT_EXTRA_SIZE,
  TILE_HEIGHT + TILE_FRONT_EXTRA_SIZE,
  (1 - TILE_BACK_RATIO) * TILE_THICKNESS,
  8,
  TILE_RADIUS
);

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

  const baseTileMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: TILE_COLOR_FACE,
        roughness: 0.1,
        metalness: 0.5,
      }),
    []
  );

  const highlightedBackMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(0x2b71d9).offsetHSL(0, 0, 0.1),
        roughness: 0.1,
        metalness: 0.5,
      }),
    []
  );

  const highlightedTileMaterial = useMemo(() => {
    const highlightedTileMaterial = baseTileMaterial.clone();
    highlightedTileMaterial.color = new Color(TILE_COLOR_FACE).offsetHSL(
      0,
      0,
      0.1
    );
    return highlightedTileMaterial;
  }, [baseTileMaterial]);

  const baseBackMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(0x2b71d9),
        roughness: 0.1,
        metalness: 0.5,
      }),
    []
  );

  const backMaterial = useMemo(
    () => (highlight ? highlightedBackMaterial : baseBackMaterial),
    [highlight, highlightedBackMaterial, baseBackMaterial]
  );
  const tileMaterial = useMemo(
    () => (highlight ? highlightedTileMaterial : baseTileMaterial),
    [baseTileMaterial, highlight, highlightedTileMaterial]
  );

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
        position={[
          0,
          0,
          TILE_THICKNESS * (0.5 - TILE_BACK_RATIO / 2) - TILE_RADIUS,
        ]}
        geometry={tileBackGeometry}
        material={backMaterial}
      ></mesh>
      <mesh
        onPointerOut={onTilePointerOut}
        onPointerOver={onTilePointerOver}
        onClick={(event) => {
          onTileClick?.(event);
          event.stopPropagation();
        }}
        castShadow
        receiveShadow
        position={[0, 0, -TILE_THICKNESS * (0.5 - (1 - TILE_BACK_RATIO) / 2)]}
        geometry={tileFrontGeometry}
        material={tileMaterial}
      />
    </group>
  );
};

export default TileMesh;
