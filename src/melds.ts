import type {
  DoubleProvider,
  WindDependentDoubleProvider,
} from "./scoring/scoring";
import { HonorTile, Suit, Tile, TileInstance } from "./tiles";

export class MeldInstance<M extends Meld> {
  constructor(readonly value: M, readonly tiles: TileInstance<Tile>[]) {}
}

export abstract class Meld {
  constructor(readonly tiles: Tile[]) {}

  abstract meldEquals(other: Meld): boolean;

  toString(): string {
    return this.tiles.map((tile) => tile.toString()).join("");
  }
}

export abstract class ThreeTileMeld extends Meld {}

export class Chow extends ThreeTileMeld {
  constructor(tiles: Tile[]) {
    super(tiles);
  }

  meldEquals(other: Meld): boolean {
    if (!(other instanceof Chow)) {
      return false;
    }
    return this.tiles.every((tile) => other.tiles.includes(tile));
  }
}

export class Pong extends ThreeTileMeld implements WindDependentDoubleProvider {
  constructor(readonly tile: Tile) {
    super([tile, tile, tile]);
  }

  meldEquals(other: Meld): boolean {
    if (!(other instanceof Pong)) {
      return false;
    }
    return this.tiles.every((tile) => other.tiles.includes(tile));
  }

  resolveWithWind(mainWind: Suit, playerWind: Suit): DoubleProvider {
    if (this.tile instanceof HonorTile) {
      return this.tile.getPongValue(mainWind, playerWind);
    } else {
      return () => 0;
    }
  }
}

export class Kong extends Meld {
  constructor(tile: Tile) {
    super([tile, tile, tile, tile]);
  }

  toPong(): Pong {
    return new Pong(this.tiles[0]);
  }

  meldEquals(other: Meld): boolean {
    if (!(other instanceof Kong)) {
      return false;
    }
    return this.tiles.every((tile) => other.tiles.includes(tile));
  }
}

export class EyePair extends Meld {
  constructor(tile: Tile) {
    super([tile, tile]);
  }

  meldEquals(other: Meld): boolean {
    if (!(other instanceof EyePair)) {
      return false;
    }
    return this.tiles.every((tile) => other.tiles.includes(tile));
  }
}
