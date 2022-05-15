import {
  FlowerTile,
  HonorTile,
  NumberedTile,
  StandardMahjong,
  Tile,
  TileInstance,
  Wind,
} from "./tiles";

export namespace TileDebug {
  const usedTiles = new Set<TileInstance<Tile>>();

  const findAndMarkAsUsed = <T extends Tile>(
    tileFilter: (tile: Tile) => tile is T
  ): TileInstance<T> => {
    const tile = StandardMahjong.TILE_SET.filter((tile) =>
      tileFilter(tile.value)
    ).find((tile) => !usedTiles.has(tile)) as TileInstance<T>;
    if (!tile) {
      throw new Error("No tile found.");
    }
    usedTiles.add(tile);
    return tile;
  };

  export function characters(value: number): TileInstance<NumberedTile> {
    return findAndMarkAsUsed(
      (tile: Tile): tile is NumberedTile =>
        tile instanceof NumberedTile &&
        tile.suit === StandardMahjong.SUIT_CHARACTERS &&
        tile.value === value
    );
  }

  export function bamboos(value: number): TileInstance<NumberedTile> {
    return findAndMarkAsUsed(
      (tile: Tile): tile is NumberedTile =>
        tile instanceof NumberedTile &&
        tile.suit === StandardMahjong.SUIT_BAMBOOS &&
        tile.value === value
    );
  }

  export function dots(value: number): TileInstance<NumberedTile> {
    return findAndMarkAsUsed(
      (tile: Tile): tile is NumberedTile =>
        tile instanceof NumberedTile &&
        tile.suit === StandardMahjong.SUIT_DOTS &&
        tile.value === value
    );
  }

  export function honor(suit: Wind): TileInstance<HonorTile> {
    return findAndMarkAsUsed(
      (tile: Tile): tile is HonorTile =>
        tile instanceof HonorTile && tile.suit === suit
    );
  }

  export function flower(
    suit: typeof StandardMahjong.SUIT_FLOWERS[number],
    index: number
  ): TileInstance<FlowerTile> {
    return findAndMarkAsUsed(
      (tile: Tile): tile is FlowerTile =>
        tile instanceof FlowerTile && tile.suit === suit && tile.index === index
    );
  }
}
