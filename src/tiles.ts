import type { DoubleProvider, WindDependentDoubleProvider } from "./global";
import { tileToChar } from "./tile-ascii";

export interface Suit {
  readonly name: string;
}

export type Wind =
  | typeof StandardMahjong.SUIT_NORTH
  | typeof StandardMahjong.SUIT_EAST
  | typeof StandardMahjong.SUIT_SOUTH
  | typeof StandardMahjong.SUIT_WEST;

export namespace TileSetHelpers {
  export const createNumberedTiles = (suit: Suit): NumberedTile[] => {
    return Array.from(
      { length: 9 },
      (_, value) => new NumberedTile(suit, value + 1)
    );
  };

  export const createFlowerTiles = (suit: Suit): FlowerTile[] => {
    return StandardMahjong.SUIT_WINDS.map((wind) => new FlowerTile(suit, wind));
  };

  export const createFourOfTile = (tile: Tile): Tile[] => {
    return [tile, tile, tile, tile];
  };
}

export class TileInstance<T extends Tile> {
  constructor(readonly value: T) {}
}

export abstract class Tile {
  constructor(readonly suit: Suit) {
    this.suit = suit;
  }

  toString(): string {
    return tileToChar(this);
  }
}

export abstract class StandardTile extends Tile {}

export class NumberedTile extends StandardTile {
  constructor(suit: Suit, readonly value: number) {
    super(suit);
  }
}

export abstract class HonorTile extends StandardTile {
  abstract getPongValue(mainWind: Wind, playerWind: Wind): DoubleProvider;
}

export class DragonTile extends HonorTile {
  getPongValue(mainWind: Wind, playerWind: Wind): DoubleProvider {
    return () => {
      return 1;
    };
  }
}

export class WindTile extends HonorTile {
  constructor(suit: Wind) {
    super(suit);
  }

  getPongValue(mainWind: Wind, playerWind: Wind): DoubleProvider {
    return () => {
      const mainWindBonus = mainWind === this.suit ? 1 : 0;
      const playerWindBonus = playerWind === this.suit ? 1 : 0;
      return mainWindBonus + playerWindBonus;
    };
  }
}

export abstract class BonusTile
  extends Tile
  implements WindDependentDoubleProvider
{
  abstract resolveWithWind(mainWind: Suit, playerWind: Suit): DoubleProvider;
}

export class FlowerTile extends BonusTile {
  readonly index: number;

  constructor(suit: Suit, readonly wind: Wind) {
    super(suit);
    this.wind = wind;
    this.index = StandardMahjong.SUIT_WINDS.indexOf(wind);
  }

  resolveWithWind(mainWind: Wind, playerWind: Wind): DoubleProvider {
    return () => {
      const playerWindBonus = playerWind === this.wind ? 1 : 0;
      return playerWindBonus;
    };
  }
}

export namespace StandardMahjong {
  export const SUIT_CHARACTERS: Suit = {
    name: "Characters",
  };

  export const SUIT_BAMBOOS: Suit = {
    name: "Bamboo",
  };

  export const SUIT_DOTS: Suit = {
    name: "Dots",
  };

  export const SUIT_NUMBERED = [SUIT_CHARACTERS, SUIT_DOTS, SUIT_BAMBOOS];

  export const SUIT_NORTH: Suit = {
    name: "North",
  };

  export const SUIT_SOUTH: Suit = {
    name: "South",
  };

  export const SUIT_EAST: Suit = {
    name: "East",
  };

  export const SUIT_WEST: Suit = {
    name: "West",
  };

  export const SUIT_WINDS = [SUIT_EAST, SUIT_SOUTH, SUIT_WEST, SUIT_NORTH];

  export const SUIT_DRAGON_RED: Suit = {
    name: "Red Dragon",
  };

  export const SUIT_DRAGON_GREEN: Suit = {
    name: "Green Dragon",
  };

  export const SUIT_DRAGON_WHITE: Suit = {
    name: "White Dragon",
  };

  export const SUIT_DRAGONS = [
    SUIT_DRAGON_RED,
    SUIT_DRAGON_WHITE,
    SUIT_DRAGON_GREEN,
  ];

  export const SUIT_HONORS = [...SUIT_WINDS, ...SUIT_DRAGONS];

  export const SUIT_FLOWER_1: Suit = {
    name: "Flower 1",
  };

  export const SUIT_FLOWER_2: Suit = {
    name: "Flower 2",
  };

  export const SUIT_FLOWERS = [SUIT_FLOWER_1, SUIT_FLOWER_2];

  export const SUIT_NON_NUMBERED = [...SUIT_HONORS, ...SUIT_FLOWERS];

  export const TILE_SET: TileInstance<Tile>[] = [
    ...[
      ...StandardMahjong.SUIT_NUMBERED.flatMap(
        TileSetHelpers.createNumberedTiles
      ),
      ...StandardMahjong.SUIT_WINDS.map((wind) => new WindTile(wind)),
      ...StandardMahjong.SUIT_DRAGONS.map((dragon) => new DragonTile(dragon)),
    ].flatMap(TileSetHelpers.createFourOfTile),
    ...StandardMahjong.SUIT_FLOWERS.flatMap(TileSetHelpers.createFlowerTiles),
  ].map((tile) => new TileInstance(tile));
}

export namespace SingaporeMahjong {
  export const SUIT_ANIMALS: Suit = {
    name: "Animals",
  };

  export const ANIMALS: Animal[] = ["Cat", "Mouse", "Chicken", "Centipede"];

  export type Animal = "Cat" | "Mouse" | "Chicken" | "Centipede";

  export class AnimalTile extends BonusTile {
    constructor(suit: Suit, readonly type: Animal) {
      super(suit);
    }

    resolveWithWind(mainWind: Suit, playerWind: Suit): DoubleProvider {
      return () => {
        return 1;
      };
    }
  }

  export const TILE_SET: TileInstance<Tile>[] = [
    ...StandardMahjong.TILE_SET,
    ...ANIMALS.map((animal) => new AnimalTile(SUIT_ANIMALS, animal)).map(
      (tile) => new TileInstance(tile)
    ),
  ];
}
