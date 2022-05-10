import { Chow, EyePair, Meld, Pong } from "./melds";
import { NumberedTile, StandardMahjong, Tile } from "./tiles";

export class Combination {
  constructor(readonly name: string, readonly melds: Meld[]) {
  }
}

export interface CombinationMatcher {
  getFirstMatch(tiles: Tile[]): Combination | null;
  readonly combinationName: string;
  readonly isWinning: boolean;
}

export interface MeldMatcher {
  readonly tileFilter?: (tile: Tile) => boolean;
  getAllUniqueMatches(tiles: Tile[]): Set<Meld>;
}

export class ChowOrPongMatcher implements MeldMatcher {
  private readonly chowMatcher: ChowMatcher;
  private readonly pongMatcher: PongMatcher;

  constructor(readonly tileFilter?: (tile: Tile) => boolean) {
    this.chowMatcher = new ChowMatcher(this.tileFilter);
    this.pongMatcher = new PongMatcher(this.tileFilter);
  }

  getAllUniqueMatches(tiles: Tile[]): Set<Meld> {
    return new Set([...this.chowMatcher.getAllUniqueMatches(tiles), ...this.pongMatcher.getAllUniqueMatches(tiles)]);
  }
}

export class ChowMatcher implements MeldMatcher {
  constructor(readonly tileFilter?: (tile: Tile) => boolean) {
  }

  getAllUniqueMatches(tiles: Tile[]): Set<Chow> {
    const filteredTiles = this.tileFilter ? tiles.filter(this.tileFilter) : tiles;
    const numberedTiles = filteredTiles.filter((tile): tile is NumberedTile => tile instanceof NumberedTile);

    const matches = new Set<Chow>();
    for (const suit of StandardMahjong.SUIT_NUMBERED) {
      const suitTiles = numberedTiles.filter(tile => tile.suit === suit);
      if (suitTiles.length < 3) {
        continue;
      }

      const uniqueTiles = [...new Set(suitTiles)];
      uniqueTiles.sort((a, b) => a.value - b.value);

      for (let i = 0; i < uniqueTiles.length - 2; i++) {
        const first = uniqueTiles[i];
        const second = uniqueTiles[i + 1];
        const third = uniqueTiles[i + 2];
        if (first.value + 1 === second.value && second.value + 1 === third.value) {
          matches.add(new Chow([first, second, third]));
        }
      }
    }

    return matches;
  }
}

export class PongMatcher implements MeldMatcher {
  constructor(readonly tileFilter?: (tile: Tile) => boolean) {
  }

  getAllUniqueMatches(tiles: Tile[]): Set<Pong> {
    const filteredTiles = this.tileFilter ? tiles.filter(this.tileFilter) : tiles;
    const appearCounts = new Map<Tile, number>();

    const matches = new Set<Pong>();

    for (const tile of filteredTiles) {
      const count = appearCounts.get(tile) || 0;
      appearCounts.set(tile, count + 1);
    }

    for (const [tile, count] of appearCounts) {
      if (count >= 3) {
        matches.add(new Pong(tile));
      }
    }

    return matches;
  }
}

export class EyePairMatcher implements MeldMatcher {
  constructor(readonly tileFilter?: (tile: Tile) => boolean) {
  }

  getAllUniqueMatches(tiles: Tile[]): Set<EyePair> {
    const filteredTiles = this.tileFilter ? tiles.filter(this.tileFilter) : tiles;
    const appearCounts = new Map<Tile, number>();

    const matches = new Set<EyePair>();

    for (const tile of filteredTiles) {
      const count = appearCounts.get(tile) || 0;
      appearCounts.set(tile, count + 1);
    }

    for (const [tile, count] of appearCounts) {
      if (count >= 2) {
        matches.add(new EyePair(tile));
      }
    }

    return matches;
  }
}

export class MeldCombinationBuilder {
  readonly melds: MeldMatcher[] = [];
  
  constructor(readonly combinationName: string) {
  }

  withMeld(matcher: MeldMatcher): MeldCombinationBuilder {
    this.melds.push(matcher);
    return this;
  }

  build(isWinning: boolean): CombinationMatcher {
    if (this.melds.length !== 5) {
      throw new Error('MeldCombinationBuilder must have 5 meld matchers');
    }
    return new MeldCombinationMatcher(this.combinationName, this.melds, isWinning);
  }
}

export class MeldCombinationMatcher implements CombinationMatcher {
  constructor(readonly combinationName: string, readonly melds: MeldMatcher[], readonly isWinning: boolean) {
  }
  
  getFirstMatch(tiles: Tile[]): Combination | null {
    // Recursively try all possible combinations of melds
    const melds =  MeldCombinationMatcher.tryMatch(this.melds, tiles);
    if (melds) {
      return new Combination(this.combinationName, melds);
    } else {
      return null;
    }
  }

  private static tryMatch(meldMatchers: MeldMatcher[], tiles: Tile[]) : Meld[] | null {
    if (meldMatchers.length === 0 && tiles.length === 0) {
      return [];
    } else if (meldMatchers.length === 0) {
      return [];
    } else if (tiles.length === 0) {
      return null;
    } else {
      // Try to match the first meld
      const meldMatcher = meldMatchers[0];
      const matches = meldMatcher.getAllUniqueMatches(tiles);

      if (tiles.length === 0) {
        return null;
      }

      for (const meld of matches) {
        const remainingTiles = [...tiles];
        for (const tile of meld.tiles) {
          remainingTiles.splice(remainingTiles.indexOf(tile), 1);
        }
        const remainingMatchers = meldMatchers.slice(1);
        const remainingMatches = MeldCombinationMatcher.tryMatch(remainingMatchers, remainingTiles);
        if (remainingMatches) {
          return [meld, ...remainingMatches];
        }
      }
      return null;
    }
  }
}

