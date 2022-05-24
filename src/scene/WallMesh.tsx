import TileRow from './TileRow';
import { TILE_THICKNESS, TILE_WIDTH } from './constants';
import type { WallStack } from '../game-state/pre-hand';
import { WithoutGeoMat } from './object-props';
import { GroupProps } from 'react-three-fiber';

export type WallMeshProps = {
  wallStack: WallStack;
  highlight: boolean;
};

const WallMesh = ({
  wallStack,
  highlight,
  ...rest
}: WithoutGeoMat<GroupProps> & WallMeshProps) => {
  // export let onPointerOut: (event: CustomEvent) => void = () => {};
  // export let onPointerOver: (event: CustomEvent) => void = () => {};
  // export let onClick: (event: CustomEvent) => void = () => {};

  const initialStackLength = wallStack.initialLength / 2;
  const topRowStartIndex = Math.ceil(wallStack.getStart() / 2);
  const bottomRowStartIndex = Math.floor(wallStack.getStart() / 2);
  const drawnFromBack = wallStack.initialLength - 1 - wallStack.getEnd();
  const topRowEndIndex =
    wallStack.initialLength / 2 - Math.ceil(drawnFromBack / 2);
  const bottomRowEndIndex =
    wallStack.initialLength / 2 - Math.floor(drawnFromBack / 2);
  const topRowLength = topRowEndIndex - topRowStartIndex;
  const bottomRowLength = bottomRowEndIndex - bottomRowStartIndex;

  return (
    <group {...rest}>
      {[
        [bottomRowStartIndex, bottomRowLength],
        [topRowStartIndex, topRowLength],
      ].map(([rowOffset, rowLength], index) => (
        <TileRow
          key={index}
          highlight={highlight}
          position={[
            (initialStackLength / 2 - (rowOffset + rowLength / 2)) * TILE_WIDTH,
            0,
            (index + 0.5) * TILE_THICKNESS,
          ]}
          tiles={Array.from({ length: rowLength }, (v, index) => null)}
          faceUp={false}
        />
      ))}
    </group>
  );
};

export default WallMesh;
