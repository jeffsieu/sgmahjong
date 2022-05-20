import type { Tile, TileInstance } from "../tiles";
import { TILE_WIDTH } from "./constants";

import { WithoutGeoMat } from "./object-props";
import { GroupProps } from "react-three-fiber";
import TileMesh from "./TileMesh";

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
  ...rest
}: WithoutGeoMat<GroupProps> & TileRowProps) => {
  const isHovered = false;
  // $: isHovered = hoveredTiles.size > 0;

  // const onTilePointerOver = (index: number) => (event: CustomEvent) => {
  //   onPointerOver(event);
  //   hoveredTiles.add(index);
  //   hoveredTiles = hoveredTiles;
  // };

  // const onTilePointerOut = (index: number) => (event: CustomEvent) => {
  //   onPointerOut(event);
  //   hoveredTiles.delete(index);
  //   hoveredTiles = hoveredTiles;
  // };

  return (
    <group {...rest}>
      {/* {tooltip !== null && isHovered && <TooltipContent text={tooltip} />} */}
      {tiles.map((tile, index) => (
        <TileMesh
          key={(tile ? tile.value.toString() : "") + index}
          highlight={highlight || (highlightOnHover && isHovered)}
          // onPointerOut={onTilePointerOut(index)}
          // onPointerOver={onTilePointerOver(index)}
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
