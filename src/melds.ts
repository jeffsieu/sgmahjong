import type { Tile } from './tiles';

export abstract class Meld {
  constructor(readonly tiles: Tile[]) {
  }

  toString(): string {
    return this.tiles.map(tile => tile.toString()).join('');
  }
}

export class Chow extends Meld {
  constructor(tiles: Tile[]) {
    super(tiles);
  }
}

export class Pong extends Meld {
  constructor(tile: Tile) {
    super([tile, tile, tile]);
  }
}

export class EyePair extends Meld {
  constructor(tile: Tile) {
    super([tile, tile]);
  }
}