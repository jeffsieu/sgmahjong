import {
  DISCARD_PILE_ROW_LENGTH,
  TILE_HEIGHT,
  TILE_THICKNESS,
} from "./constants";
import type { Tile, TileInstance } from "../tiles";
import { WithoutGeoMat } from "./object-props";
import { GroupProps } from "react-three-fiber";
import TileRow from "./TileRow";

export type DiscardPileProps = {
  tiles: TileInstance<Tile>[];
};

const DiscardPile = ({
  tiles,
  ...rest
}: WithoutGeoMat<GroupProps> & DiscardPileProps) => {
  const tileRows = Array.from(
    { length: Math.ceil(tiles.length / DISCARD_PILE_ROW_LENGTH) },
    (_, rowIndex) => {
      const row: TileInstance<Tile>[] = tiles.slice(
        rowIndex * DISCARD_PILE_ROW_LENGTH,
        (rowIndex + 1) * DISCARD_PILE_ROW_LENGTH
      );
      return row;
    }
  );

  return (
    <group {...rest}>
      {tileRows.map((tileRow, index) => (
        <TileRow
          key={index}
          tiles={tileRow}
          faceUp={true}
          position={[0, (2 - index) * TILE_HEIGHT, TILE_THICKNESS / 2]}
        />
      ))}
    </group>
  );
};

export default DiscardPile;
