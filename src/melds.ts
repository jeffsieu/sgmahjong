import type { Tile } from "./tiles";

export abstract class Meld {
  constructor(readonly tiles: Tile[]) {}

  abstract meldEquals(other: Meld): boolean;

  toString(): string {
    return this.tiles.map((tile) => tile.toString()).join("");
  }
}

export class Chow extends Meld {
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

export class Pong extends Meld {
  constructor(tile: Tile) {
    super([tile, tile, tile]);
  }

  meldEquals(other: Meld): boolean {
    if (!(other instanceof Pong)) {
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
