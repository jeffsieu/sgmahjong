import { getCombinations } from "./game-state/action-generator";
import { Chow, EyePair, Kong, Meld, MeldInstance, Pong } from "./melds";
import { NumberedTile, StandardMahjong, Tile, TileInstance } from "./tiles";

export class Combination {
  constructor(
    readonly name: string,
    readonly melds: MeldInstance<Meld>[],
    readonly isWinning: boolean
  ) {}
}

export interface CombinationMatcher {
  getFirstMatch(
    tiles: TileInstance<Tile>[],
    existingMelds: MeldInstance<Meld>[]
  ): Combination | null;
  readonly combinationName: string;
  readonly isWinning: boolean;
}

export abstract class MeldMatcher<M extends Meld> {
  readonly tileFilter?: (tile: Tile) => boolean;
  abstract matches(meld: M): boolean;

  abstract getTileMatches(tiles: Tile[]): Set<M>;

  getTileInstanceMatches(
    tileInstances: TileInstance<Tile>[]
  ): Set<MeldInstance<M>> {
    const matches = this.getTileMatches(
      tileInstances.map((tile) => tile.value)
    );

    // Generate all combinations for each match
    const combinations = new Set<MeldInstance<M>>();
    for (const match of matches) {
      const possibleTileInstances = match.tiles.map((tile) =>
        tileInstances.filter((instance) => instance.value === tile)
      );
      const matchCombinations = getCombinations(possibleTileInstances);
      for (const combination of matchCombinations) {
        combinations.add(new MeldInstance(match, [...combination]));
      }
    }

    return combinations;
  }
}

export class ChowOrPongMatcher extends MeldMatcher<Chow | Pong> {
  private readonly chowMatcher: ChowMatcher;
  private readonly pongMatcher: PongMatcher;

  constructor(readonly tileFilter?: (tile: Tile) => boolean) {
    super();
    this.chowMatcher = new ChowMatcher(this.tileFilter);
    this.pongMatcher = new PongMatcher(this.tileFilter);
  }

  getTileMatches(tiles: Tile[]): Set<Chow | Pong> {
    console.log("Chow or Pong Matcher");
    const result = new Set([
      ...this.chowMatcher.getTileMatches(tiles),
      ...this.pongMatcher.getTileMatches(tiles),
    ]);

    return result;
  }

  matches(meld: Meld): boolean {
    return this.chowMatcher.matches(meld) || this.pongMatcher.matches(meld);
  }
}

export class ChowMatcher extends MeldMatcher<Chow> {
  constructor(readonly tileFilter?: (tile: Tile) => boolean) {
    super();
  }

  getTileMatches(tiles: Tile[]): Set<Chow> {
    const filteredTiles = this.tileFilter
      ? tiles.filter(this.tileFilter)
      : tiles;
    const numberedTiles = filteredTiles.filter(
      (tile): tile is NumberedTile => tile instanceof NumberedTile
    );

    const matches = new Set<Chow>();
    for (const suit of StandardMahjong.SUIT_NUMBERED) {
      const suitTiles = numberedTiles.filter((tile) => tile.suit === suit);
      if (suitTiles.length < 3) {
        continue;
      }

      const uniqueTiles = [...new Set(suitTiles)];
      uniqueTiles.sort((a, b) => a.value - b.value);

      for (let i = 0; i < uniqueTiles.length - 2; i++) {
        const first = uniqueTiles[i];
        const second = uniqueTiles[i + 1];
        const third = uniqueTiles[i + 2];
        if (
          first.value + 1 === second.value &&
          second.value + 1 === third.value
        ) {
          const tiles = [first, second, third];
          matches.add(new Chow(tiles));
        }
      }
    }

    return matches;
  }

  matches(meld: Meld): boolean {
    return (
      meld instanceof Chow &&
      (!this.tileFilter || meld.tiles.every(this.tileFilter))
    );
  }
}

export class PongMatcher extends MeldMatcher<Pong> {
  constructor(readonly tileFilter?: (tile: Tile) => boolean) {
    super();
  }

  getTileMatches(tiles: Tile[]): Set<Pong> {
    const filteredTiles = this.tileFilter
      ? tiles.filter(this.tileFilter)
      : tiles;
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

  matches(meld: Meld): boolean {
    return (
      (meld instanceof Pong || meld instanceof Kong) &&
      (!this.tileFilter || meld.tiles.every(this.tileFilter))
    );
  }
}

export class EyePairMatcher extends MeldMatcher<EyePair> {
  constructor(readonly tileFilter?: (tile: Tile) => boolean) {
    super();
  }

  getTileMatches(tiles: Tile[]): Set<EyePair> {
    const filteredTiles = this.tileFilter
      ? tiles.filter(this.tileFilter)
      : tiles;
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

  matches(meld: Meld): boolean {
    return (
      meld instanceof EyePair &&
      (!this.tileFilter || meld.tiles.every(this.tileFilter))
    );
  }
}

export class MeldCombinationBuilder {
  readonly melds: MeldMatcher<Meld>[] = [];

  constructor(readonly combinationName: string) {}

  withMeld(matcher: MeldMatcher<Meld>): MeldCombinationBuilder {
    this.melds.push(matcher);
    return this;
  }

  build(isWinning: boolean): CombinationMatcher {
    if (this.melds.length !== 5) {
      throw new Error("MeldCombinationBuilder must have 5 meld matchers");
    }
    return new MeldCombinationMatcher(
      this.combinationName,
      this.melds,
      isWinning
    );
  }
}

export class MeldCombinationMatcher implements CombinationMatcher {
  constructor(
    readonly combinationName: string,
    readonly melds: MeldMatcher<Meld>[],
    readonly isWinning: boolean
  ) {}

  getFirstMatch(
    tiles: TileInstance<Tile>[],
    existingMelds: MeldInstance<Meld>[]
  ): Combination | null {
    // Recursively try all possible combinations of melds
    const melds = MeldCombinationMatcher.tryMatch(
      this.melds,
      tiles,
      existingMelds
    );
    if (melds) {
      return new Combination(this.combinationName, melds, this.isWinning);
    } else {
      return null;
    }
  }

  private static tryMatch(
    meldMatchers: MeldMatcher<Meld>[],
    tiles: TileInstance<Tile>[],
    existingMelds: MeldInstance<Meld>[]
  ): MeldInstance<Meld>[] | null {
    if (
      meldMatchers.length === 0 &&
      tiles.length === 0 &&
      existingMelds.length === 0
    ) {
      return [];
    } else if (meldMatchers.length === 0) {
      return [];
    } else if (tiles.length === 0 && existingMelds.length === 0) {
      return null;
    } else if (existingMelds.length > 0) {
      // Try to match the first existing meld first
      const meld = existingMelds[0];

      const remainingExistingMelds = existingMelds.slice(1);

      for (const meldMatcher of meldMatchers) {
        const meldMatches = meldMatcher.matches(meld.value);
        if (!meldMatches) {
          continue;
        }

        const remainingMatchers = [...meldMatchers];
        remainingMatchers.splice(remainingMatchers.indexOf(meldMatcher), 1);

        const remainingMatches = MeldCombinationMatcher.tryMatch(
          remainingMatchers,
          tiles,
          remainingExistingMelds
        );

        if (remainingMatches) {
          return [meld, ...remainingMatches];
        }
      }
      return null;
    } else {
      // Try to match the first meld
      const meldMatcher = meldMatchers[0];
      const matches = meldMatcher.getTileInstanceMatches(tiles);

      if (tiles.length === 0) {
        return null;
      }

      for (const meld of matches) {
        const remainingTiles = [...tiles];
        for (const tile of meld.tiles) {
          remainingTiles.splice(remainingTiles.indexOf(tile), 1);
        }
        const remainingMatchers = meldMatchers.slice(1);
        const remainingMatches = MeldCombinationMatcher.tryMatch(
          remainingMatchers,
          remainingTiles,
          existingMelds
        );
        if (remainingMatches) {
          return [meld, ...remainingMatches];
        }
      }
      return null;
    }
  }
}
