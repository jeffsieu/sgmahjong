import {
  ChowMatcher,
  ChowOrPongMatcher,
  Combination,
  CombinationMatcher,
  EyePairMatcher,
  MeldCombinationBuilder,
  PongMatcher,
} from './combi-utils';
import type { GameRules } from './config/rules';
import type { ReadonlyPlayer } from './game-state/game-state';
import { EyePair, Meld, MeldInstance } from './melds';
import {
  CandidateWinningHand,
  WinningHand,
  WinningHandType,
} from './scoring/scoring';
import {
  HonorTile,
  NumberedTile,
  SingaporeMahjong,
  StandardMahjong,
  Tile,
  TileInstance,
} from './tiles';

export namespace StandardCombiMatchers {
  export const TRIPLETS_HAND = new MeldCombinationBuilder('Triplets Hand')
    .withMeld(new PongMatcher())
    .withMeld(new PongMatcher())
    .withMeld(new PongMatcher())
    .withMeld(new PongMatcher())
    .withMeld(new EyePairMatcher())
    .build(true, () => 2);

  export const SEQUENCE_HAND = new MeldCombinationBuilder('Sequence Hand')
    .withMeld(new ChowMatcher())
    .withMeld(new ChowMatcher())
    .withMeld(new ChowMatcher())
    .withMeld(new ChowMatcher())
    .withMeld(new EyePairMatcher())
    .build(true, () => 1);

  const FILTER_TERMINAL = (tile: Tile) =>
    tile instanceof NumberedTile && (tile.value === 1 || tile.value === 9);
  const FILTER_HONOR = (tile: Tile) => tile instanceof HonorTile;
  const FILTER_MIXED_TERMINAL = (tile: Tile) =>
    FILTER_TERMINAL(tile) || FILTER_HONOR(tile);

  export const MIXED_TERMINALS = new MeldCombinationBuilder('Mixed Terminals')
    .withMeld(new PongMatcher(FILTER_MIXED_TERMINAL))
    .withMeld(new PongMatcher(FILTER_MIXED_TERMINAL))
    .withMeld(new PongMatcher(FILTER_MIXED_TERMINAL))
    .withMeld(new PongMatcher(FILTER_MIXED_TERMINAL))
    .withMeld(new EyePairMatcher(FILTER_MIXED_TERMINAL))
    .build(true, () => 2);

  export const PURE_TERMINALS = new MeldCombinationBuilder('Pure Terminals')
    .withMeld(new PongMatcher(FILTER_TERMINAL))
    .withMeld(new PongMatcher(FILTER_TERMINAL))
    .withMeld(new PongMatcher(FILTER_TERMINAL))
    .withMeld(new PongMatcher(FILTER_TERMINAL))
    .withMeld(new EyePairMatcher(FILTER_TERMINAL))
    .build(true, (rules: GameRules) => rules.maxDoubles);

  export const ALL_HONORS = new MeldCombinationBuilder('All Honors')
    .withMeld(new PongMatcher(FILTER_HONOR))
    .withMeld(new PongMatcher(FILTER_HONOR))
    .withMeld(new PongMatcher(FILTER_HONOR))
    .withMeld(new PongMatcher(FILTER_HONOR))
    .withMeld(new EyePairMatcher(FILTER_HONOR))
    .build(true, (rules: GameRules) => rules.maxDoubles);

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

  const MIXED_CHARACTERS = new MeldCombinationBuilder('Mixed Characters')
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_CHARACTERS))
    .withMeld(new EyePairMatcher(FILTER_MIXED_CHARACTERS))
    .build(true, (rules: GameRules) => rules.mixedSuits);

  const MIXED_BAMBOOS = new MeldCombinationBuilder('Mixed Bamboos')
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_BAMBOOS))
    .withMeld(new EyePairMatcher(FILTER_MIXED_BAMBOOS))
    .build(true, (rules: GameRules) => rules.mixedSuits);

  const MIXED_DOTS = new MeldCombinationBuilder('Mixed Dots')
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_MIXED_DOTS))
    .withMeld(new EyePairMatcher(FILTER_MIXED_DOTS))
    .build(true, (rules: GameRules) => rules.mixedSuits);

  const PURE_CHARACTERS = new MeldCombinationBuilder('Pure Characters')
    .withMeld(new ChowOrPongMatcher(FILTER_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_CHARACTERS))
    .withMeld(new ChowOrPongMatcher(FILTER_CHARACTERS))
    .withMeld(new EyePairMatcher(FILTER_CHARACTERS))
    .build(true, (rules: GameRules) => rules.pureSuits);

  const PURE_BAMBOOS = new MeldCombinationBuilder('Pure Bamboos')
    .withMeld(new ChowOrPongMatcher(FILTER_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_BAMBOOS))
    .withMeld(new ChowOrPongMatcher(FILTER_BAMBOOS))
    .withMeld(new EyePairMatcher(FILTER_BAMBOOS))
    .build(true, (rules: GameRules) => rules.pureSuits);

  const PURE_DOTS = new MeldCombinationBuilder('Pure Dots')
    .withMeld(new ChowOrPongMatcher(FILTER_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_DOTS))
    .withMeld(new ChowOrPongMatcher(FILTER_DOTS))
    .withMeld(new EyePairMatcher(FILTER_DOTS))
    .build(true, (rules: GameRules) => rules.pureSuits);

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
    'Half Flush',
    true,
    MIXED_CHARACTERS,
    MIXED_BAMBOOS,
    MIXED_DOTS
  );

  export const FULL_FLUSH = new CompoundCombinationMatcher(
    'Full Flush',
    true,
    PURE_CHARACTERS,
    PURE_BAMBOOS,
    PURE_DOTS
  );

  const FILTER_GREEN_SUIT = (tile: Tile) =>
    tile.suit === StandardMahjong.SUIT_DRAGON_GREEN || FILTER_BAMBOOS(tile);

  export const PURE_GREEN_SUIT = new MeldCombinationBuilder('Pure Green Suit')
    .withMeld(new ChowOrPongMatcher(FILTER_GREEN_SUIT))
    .withMeld(new ChowOrPongMatcher(FILTER_GREEN_SUIT))
    .withMeld(new ChowOrPongMatcher(FILTER_GREEN_SUIT))
    .withMeld(new ChowOrPongMatcher(FILTER_GREEN_SUIT))
    .withMeld(new EyePairMatcher(FILTER_GREEN_SUIT))
    .build(true, (rules: GameRules) => rules.pureSuits);

  export const NORMAL_HAND = new MeldCombinationBuilder('Normal Hand')
    .withMeld(new ChowOrPongMatcher())
    .withMeld(new ChowOrPongMatcher())
    .withMeld(new ChowOrPongMatcher())
    .withMeld(new ChowOrPongMatcher())
    .withMeld(new EyePairMatcher())
    .build(true, () => 0);

  // Match whichever comes first
  export const FLUSH = new CompoundCombinationMatcher(
    'Flush',
    true,
    FULL_FLUSH,
    PURE_GREEN_SUIT,
    HALF_FLUSH
  );

  // Match whichever comes first
  export const TRIPLETS = new CompoundCombinationMatcher(
    'Triplets',
    true,
    ALL_HONORS,
    PURE_TERMINALS,
    MIXED_TERMINALS,
    TRIPLETS_HAND
  );

  export const NON_EXCLUSIVE_MATCHERS = [FLUSH, TRIPLETS, SEQUENCE_HAND];
}

export class SequenceHandCombination extends Combination {
  constructor(readonly isPure: boolean, readonly melds: MeldInstance<Meld>[]) {
    super(
      isPure ? 'Sequence Hand' : 'Lesser Sequence Hand',
      melds,
      true,
      (rules: GameRules) => ({
        name: isPure ? 'Sequence Hand' : 'Lesser Sequence Hand',
        score: isPure ? rules.sequenceHand : rules.lesserSequenceHand,
      })
    );
  }
}

const isProperSequenceHand = (
  winningHand: CandidateWinningHand,
  melds: MeldInstance<Meld>[]
): boolean => {
  // For a sequence hand to be valid,
  // 1. The player must be either waiting for at least two tiles
  // 2. Or, the player has self-drawn the last tile.
  // 3. The above rule is not applicable when the player has 4 melds, in which
  //    case it is obvious that it was a single-sided wait.
  // 4. The pair must be a non-double-providing pair.

  // Non-double-providing pair
  const pairTile = melds.find(
    (meld): meld is MeldInstance<EyePair> => meld instanceof EyePair
  )?.value.tile;
  if (pairTile === undefined) {
    return false;
  }
  const pairHasDoubles =
    pairTile instanceof HonorTile &&
    pairTile.getPongValue(winningHand.prevailingWind, winningHand.playerWind);
  if (pairHasDoubles) {
    return false;
  }

  const waitingForPair = winningHand.preWinMelds.length === 4;
  if (waitingForPair) {
    return false;
  }

  const isSelfDrawn = winningHand.type === WinningHandType.SelfDraw;
  if (isSelfDrawn) {
    return true;
  }

  const isWaitingForTwoTiles = () => {
    const allTiles = [
      ...new Set(SingaporeMahjong.TILE_SET.map((instance) => instance.value)),
    ];
    const numberedTiles = allTiles.filter(
      (tile) => tile instanceof NumberedTile
    );

    const tileCompletesSequenceHand = (tile: Tile) => {
      const tiles = [...winningHand.preWinHand, new TileInstance(tile)];
      const melds = winningHand.preWinMelds;
      const matchesSequenceHand =
        StandardCombiMatchers.SEQUENCE_HAND.getFirstMatch(tiles, melds) !==
        null;
      return matchesSequenceHand;
    };

    let count = 0;

    for (const tile of numberedTiles) {
      if (tileCompletesSequenceHand(tile)) {
        count++;
        if (count >= 2) {
          return true;
        }
      }
    }
    return false;
  };

  return isWaitingForTwoTiles();
};

export const getWinningHand = (
  player: ReadonlyPlayer,
  hand: TileInstance<Tile>[],
  loneTile: TileInstance<Tile> | null,
  type: WinningHandType
): WinningHand | null => {
  const candidateWinningHand: CandidateWinningHand = {
    prevailingWind: player.gameHand.prevailingWind,
    playerWind: player.wind,
    preWinHand: [...hand],
    preWinMelds: [...player.melds],
    bonusTiles: [...player.bonusTiles],
    type,
  };

  const standardMatchers = [
    StandardCombiMatchers.FLUSH,
    StandardCombiMatchers.TRIPLETS,
  ];

  const tiles = [...hand];
  if (loneTile !== null) {
    tiles.push(loneTile);
  }

  // Match combinations that do not have special rules
  const combinations = standardMatchers
    .map((matcher) => matcher.getFirstMatch(tiles, player.melds))
    .filter((combi): combi is Combination => combi !== null);

  // Match combinations that do have special rules
  // 1. Sequence hand
  const sequenceHand = StandardCombiMatchers.SEQUENCE_HAND.getFirstMatch(
    tiles,
    player.melds
  );
  if (sequenceHand !== null) {
    const isProper = isProperSequenceHand(
      candidateWinningHand,
      sequenceHand.melds
    );
    if (isProper) {
      const isPure = player.bonusTiles.length === 0;
      combinations.push(
        new SequenceHandCombination(isPure, sequenceHand.melds)
      );
    }
  }

  // TODO: Implement other combinations

  // If no combination is found, try to match the NORMAL_HAND
  if (combinations.length === 0) {
    const normalHand = StandardCombiMatchers.NORMAL_HAND.getFirstMatch(
      tiles,
      player.melds
    );
    if (normalHand !== null) {
      combinations.push(normalHand);
    }
  }

  if (combinations.length === 0) {
    return null;
  } else {
    const winningHand: WinningHand = {
      ...candidateWinningHand,
      melds: combinations[0].melds,
      combinations: combinations,
    };

    return winningHand;
  }
};

// export const getMatchingCombinations = (
//   tiles: TileInstance<Tile>[],
//   existingMelds: MeldInstance<Meld>[]
// ): Combination[] => {
//   const combinations: Combination[] = [];

//   for (const matcher of StandardCombiMatchers.NON_EXCLUSIVE_MATCHERS) {
//     const combination = matcher.getFirstMatch(tiles, existingMelds);
//     if (combination) {
//       combinations.push(combination);
//     }
//   }

//   if (combinations.length === 0) {
//     const combination = StandardCombiMatchers.NORMAL_HAND.getFirstMatch(
//       tiles,
//       existingMelds
//     );
//     if (combination) {
//       combinations.push(combination);
//     }
//   }
//   return combinations;
// };
