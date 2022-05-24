import type {
  NamedDoubleProvider,
  WindDependentNamedDoubleProvider,
} from './scoring/scoring';
import { HonorTile, Suit, Tile, TileInstance } from './tiles';

export class MeldInstance<M extends Meld> {
  constructor(readonly value: M, readonly tiles: TileInstance<Tile>[]) {}

  get revealedTileWidth(): number {
    return this.tiles.length;
  }
}

export class ConcealedKong extends MeldInstance<Kong> {
  get revealedTileWidth(): number {
    return 3;
  }
}

export class ExposedKong extends MeldInstance<Kong> {}

export abstract class Meld {
  constructor(readonly tiles: Tile[]) {}

  abstract meldEquals(other: Meld): boolean;

  toString(): string {
    return this.tiles.map((tile) => tile.toString()).join('');
  }
}

export abstract class ThreeTileMeld extends Meld {}

export class Chow extends ThreeTileMeld {
  meldEquals(other: Meld): boolean {
    if (!(other instanceof Chow)) {
      return false;
    }
    return this.tiles.every((tile) => other.tiles.includes(tile));
  }
}

export class Pong
  extends ThreeTileMeld
  implements WindDependentNamedDoubleProvider
{
  constructor(readonly tile: Tile) {
    super([tile, tile, tile]);
  }

  meldEquals(other: Meld): boolean {
    if (!(other instanceof Pong)) {
      return false;
    }
    return this.tiles.every((tile) => other.tiles.includes(tile));
  }

  resolveWithWind(mainWind: Suit, playerWind: Suit): NamedDoubleProvider {
    if (this.tile instanceof HonorTile) {
      return this.tile.getPongValue(mainWind, playerWind);
    } else {
      return () => ({
        name: 'Pong',
        score: 0,
      });
    }
  }
}

export class Kong extends Meld {
  constructor(readonly tile: Tile) {
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
  constructor(readonly tile: Tile) {
    super([tile, tile]);
  }

  meldEquals(other: Meld): boolean {
    if (!(other instanceof EyePair)) {
      return false;
    }
    return this.tiles.every((tile) => other.tiles.includes(tile));
  }
}
