import {
  ChowMatcher,
  ChowOrPongMatcher,
  Combination,
  CombinationMatcher,
  EyePairMatcher,
  MeldCombinationBuilder,
  MeldCombinationMatcher,
  PongMatcher,
} from "./combi-utils";
import type { Meld, MeldInstance } from "./melds";
import {
  HonorTile,
  NumberedTile,
  StandardMahjong,
  Tile,
  TileInstance,
} from "./tiles";

export namespace StandardCombiMatchers {
  export const TRIPLETS_HAND = new MeldCombinationBuilder("Triplets Hand")
    .withMeld(new PongMatcher())
    .withMeld(new PongMatcher())
    .withMeld(new PongMatcher())
    .withMeld(new PongMatcher())
    .withMeld(new EyePairMatcher())
    .build(true);

  export const SEQUENCE_HAND = new MeldCombinationBuilder("Sequence Hand")
    .withMeld(new ChowMatcher())
    .withMeld(new ChowMatcher())
    .withMeld(new ChowMatcher())
    .withMeld(new ChowMatcher())
    .withMeld(new EyePairMatcher())
    .build(true);

  const FILTER_TERMINAL = (tile: Tile) =>
    tile instanceof NumberedTile && (tile.value === 1 || tile.value === 9);
  const FILTER_HONOR = (tile: Tile) => tile instanceof HonorTile;
  const FILTER_MIXED_TERMINAL = (tile: Tile) =>
    FILTER_TERMINAL(tile) || FILTER_HONOR(tile);

  export const MIXED_TERMINALS = new MeldCombinationBuilder("Mixed Terminals")
    .withMeld(new PongMatcher(FILTER_MIXED_TERMINAL))
    .withMeld(new PongMatcher(FILTER_MIXED_TERMINAL))
    .withMeld(new PongMatcher(FILTER_MIXED_TERMINAL))
    .withMeld(new PongMatcher(FILTER_MIXED_TERMINAL))
    .withMeld(new EyePairMatcher(FILTER_MIXED_TERMINAL))
    .build(true);

  export const PURE_TERMINALS = new MeldCombinationBuilder("Pure Terminals")
    .withMeld(new PongMatcher(FILTER_TERMINAL))
    .withMeld(new PongMatcher(FILTER_TERMINAL))
    .withMeld(new PongMatcher(FILTER_TERMINAL))
    .withMeld(new PongMatcher(FILTER_TERMINAL))
    .withMeld(new EyePairMatcher(FILTER_TERMINAL))
    .build(true);

  export const ALL_HONORS = new MeldCombinationBuilder("All Honors")
    .withMeld(new PongMatcher(FILTER_HONOR))
    .withMeld(new PongMatcher(FILTER_HONOR))
    .withMeld(new PongMatcher(FILTER_HONOR))
    .withMeld(new PongMatcher(FILTER_HONOR))
    .withMeld(new EyePairMatcher(FILTER_HONOR))
    .build(true);

  const FILTER_CHARACTERS = (tile: Tile) =>
    tile.suit === StandardMahjong.SUIT_CHARACTERS;
  const FILTER_BAMBOOS = (tile: Tile) =>
    tile.suit === StandardMahjong.SUIT_BAMBOOS;
  const FILTER_DOTS = (tile: Tile) => tile.suit === StandardMahjong.SUIT_DOTS;

  const FILTER_MIXED_CHARACTERS = (tile: Tile) =>
    FILTER_CHARACTERS(tile) || FILTER_HONOR(tile);
  const FILTER_MIXED_BAMBOOS = (tile: Tile) =>
    FILTER_BAMBOOS(tile) || FILTER_HONOR(tile);
  const FILTER_MIXED_DOTS = (tile: Tile) =>
    FILTER_DOTS(tile) || FILTER_HONOR(tile);

  const MIXED_CHARACTERS = new MeldCombinationBuilder("Mixed Characters")
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_CHARACTERS))
    .withMeld(new EyePairMatcher(FILTER_MIXED_CHARACTERS))
    .build(true);

  const MIXED_BAMBOOS = new MeldCombinationBuilder("Mixed Bamboos")
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_BAMBOOS))
    .withMeld(new EyePairMatcher(FILTER_MIXED_BAMBOOS))
    .build(true);

  const MIXED_DOTS = new MeldCombinationBuilder("Mixed Dots")
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_DOTS))
    .withMeld(new EyePairMatcher(FILTER_MIXED_DOTS))
    .build(true);

  const PURE_CHARACTERS = new MeldCombinationBuilder("Pure Characters")
    .withMeld(new ChowOrPongMatcher(FILTER_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_CHARACTERS))
    .withMeld(new EyePairMatcher(FILTER_CHARACTERS))
    .build(true);

  const PURE_BAMBOOS = new MeldCombinationBuilder("Pure Bamboos")
    .withMeld(new ChowOrPongMatcher(FILTER_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_BAMBOOS))
    .withMeld(new EyePairMatcher(FILTER_BAMBOOS))
    .build(true);

  const PURE_DOTS = new MeldCombinationBuilder("Pure Dots")
    .withMeld(new ChowOrPongMatcher(FILTER_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_DOTS))
    .withMeld(new EyePairMatcher(FILTER_DOTS))
    .build(true);

  class CompoundCombinationMatcher implements CombinationMatcher {
    readonly matchers: CombinationMatcher[];

    constructor(
      readonly combinationName: string,
      readonly isWinning: boolean,
      ...matchers: CombinationMatcher[]
    ) {
      this.matchers = matchers;
    }

    getFirstMatch(
      tiles: TileInstance<Tile>[],
      existingMelds: MeldInstance<Meld>[]
    ): Combination | null {
      for (const matcher of this.matchers) {
        const combination = matcher.getFirstMatch(tiles, existingMelds);
        if (combination) {
          return combination;
        }
      }
      return null;
    }
  }

  export const HALF_FLUSH = new CompoundCombinationMatcher(
    "Half Flush",
    true,
    MIXED_CHARACTERS,
    MIXED_BAMBOOS,
    MIXED_DOTS
  );

  export const FULL_FLUSH = new CompoundCombinationMatcher(
    "Full Flush",
    true,
    PURE_CHARACTERS,
    PURE_BAMBOOS,
    PURE_DOTS
  );

  const FILTER_GREEN_SUIT = (tile: Tile) =>
    tile.suit === StandardMahjong.SUIT_DRAGON_GREEN || FILTER_BAMBOOS(tile);

  export const PURE_GREEN_SUIT = new MeldCombinationBuilder("Pure Green Suit")
    .withMeld(new ChowOrPongMatcher(FILTER_GREEN_SUIT))
    .withMeld(new ChowOrPongMatcher(FILTER_GREEN_SUIT))
    .withMeld(new ChowOrPongMatcher(FILTER_GREEN_SUIT))
    .withMeld(new ChowOrPongMatcher(FILTER_GREEN_SUIT))
    .withMeld(new EyePairMatcher(FILTER_GREEN_SUIT))
    .build(true);

  export const NORMAL_HAND = new MeldCombinationBuilder("Normal Hand")
    .withMeld(new ChowOrPongMatcher())
    .withMeld(new ChowOrPongMatcher())
    .withMeld(new ChowOrPongMatcher())
    .withMeld(new ChowOrPongMatcher())
    .withMeld(new EyePairMatcher())
    .build(true);

  // Match whichever comes first
  export const FLUSH = new CompoundCombinationMatcher(
    "Flush",
    true,
    FULL_FLUSH,
    PURE_GREEN_SUIT,
    HALF_FLUSH
  );

  // Match whichever comes first
  export const TRIPLETS = new CompoundCombinationMatcher(
    "Triplets",
    true,
    ALL_HONORS,
    PURE_TERMINALS,
    MIXED_TERMINALS,
    TRIPLETS_HAND
  );

  export const NON_EXCLUSIVE_MATCHERS = [FLUSH, TRIPLETS, SEQUENCE_HAND];
}

export const getMatchingCombinations = (
  tiles: TileInstance<Tile>[],
  existingMelds: MeldInstance<Meld>[]
): Combination[] => {
  const combinations: Combination[] = [];

  for (const matcher of StandardCombiMatchers.NON_EXCLUSIVE_MATCHERS) {
    const combination = matcher.getFirstMatch(tiles, existingMelds);
    if (combination) {
      combinations.push(combination);
    }
  }

  if (combinations.length === 0) {
    const combination = StandardCombiMatchers.NORMAL_HAND.getFirstMatch(
      tiles,
      existingMelds
    );
    if (combination) {
      combinations.push(combination);
    }
  }
  return combinations;
};
