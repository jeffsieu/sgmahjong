import type { Tile, TileInstance } from '../tiles';
import { TILE_WIDTH } from './constants';

import { WithoutGeoMat } from './object-props';
import { GroupProps, ThreeEvent } from 'react-three-fiber';
import TileMesh from './TileMesh';
import { useState } from 'react';

export type TileRowProps = {
  tiles: (TileInstance<Tile> | null)[];
  faceUp: boolean;
  highlight?: boolean;
  highlightOnHover?: boolean;
  tooltip?: string;
};

const TileRow = ({
  tiles,
  faceUp,
  highlight = false,
  highlightOnHover = false,
  tooltip = undefined,
  onPointerOver,
  onPointerOut,
  ...rest
}: WithoutGeoMat<GroupProps> & TileRowProps) => {
  const [isHovered, setHovered] = useState(false);
  const shouldHighlight = highlight || (highlightOnHover && isHovered);

  const onTileRowPointerOver = (event: ThreeEvent<PointerEvent>) => {
    onPointerOver?.(event);
    setHovered(true);
  };

  const onTileRowPointerOut = (event: ThreeEvent<PointerEvent>) => {
    onPointerOut?.(event);
    setHovered(false);
  };

  return (
    <group
      onPointerOver={onTileRowPointerOver}
      onPointerOut={onTileRowPointerOut}
      {...rest}
    >
      {/* {tooltip !== null && isHovered && <TooltipContent text={tooltip} />} */}
      {tiles.map((tile, index) => (
        <TileMesh
          key={(tile ? tile.value.toString() : '') + index}
          highlight={shouldHighlight}
            // {onClick}
          tile={faceUp ? tile : null}
          rotation={[faceUp ? 0 : Math.PI, -Math.PI, 0]}
          position={[(index - tiles.length / 2 + 0.5) * TILE_WIDTH, 0, 0]}
        />
      ))}
    </group>
  );
};

export default TileRow;
