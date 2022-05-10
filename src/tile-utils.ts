import { FlowerTile, NumberedTile, StandardMahjong, Tile, Wind } from "./tiles";

export namespace TileDebug {
  export function characters(value: number): NumberedTile {
    return StandardMahjong.TILE_SET
    .filter((tile): tile is NumberedTile => tile.suit === StandardMahjong.SUIT_CHARACTERS)
    .find(tile => tile.value === value);
  }

  export function bamboos(value: number): NumberedTile {
    return StandardMahjong.TILE_SET
    .filter((tile): tile is NumberedTile => tile.suit === StandardMahjong.SUIT_BAMBOOS)
    .find(tile => tile.value === value);
  }

  export function dots(value: number): NumberedTile {
    return StandardMahjong.TILE_SET
    .filter((tile): tile is NumberedTile => tile.suit === StandardMahjong.SUIT_DOTS)
    .find(tile => tile.value === value);
  }

  export function honor(suit: Wind): Tile {
    return StandardMahjong.TILE_SET.find(tile => tile.suit === suit);
  }

  export function flower(suit: typeof StandardMahjong.SUIT_FLOWERS[number], index: number): Tile {
    return StandardMahjong.TILE_SET
    .filter((tile): tile is FlowerTile => tile.suit === suit)
    .find(tile => tile.suit === suit && tile.index === index);
  }
}