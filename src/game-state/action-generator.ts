import { ChowMatcher, MeldMatcher, PongMatcher } from "../combi-utils";
import { getMatchingCombinations } from "../combis";
import type { Chow, Meld } from "../melds";
import type { Tile } from "../tiles";
import {
  FormMeldAction,
  MahjongAction,
  PlayerWindowOfOpportunityAction,
  WindowOfOpportunityAction,
} from "./actions";
import type { ReadonlyPlayer } from "./game-state";

export const getValidChowActions = (
  player: ReadonlyPlayer,
  discardedTile: Tile
): FormMeldAction[] => {
  return getValidMeldActions(player, discardedTile, new ChowMatcher());
};

export const getValidPongActions = (
  player: ReadonlyPlayer,
  discardedTile: Tile
): FormMeldAction[] => {
  return getValidMeldActions(player, discardedTile, new PongMatcher());
};

export const getValidMahjongActions = (
  player: ReadonlyPlayer,
  discardedTile: Tile
): MahjongAction[] => {
  const combinations = getMatchingCombinations(
    [discardedTile, ...player.hand],
    player.melds
  );
  return combinations
    .filter((combi) => combi.isWinning)
    .map((combi) => new MahjongAction(player, discardedTile, combi));
};

export const getValidWindowOfOpportunityActions = (
  player: ReadonlyPlayer,
  discardedTile: Tile
): PlayerWindowOfOpportunityAction[] => {
  return [
    ...getValidChowActions(player, discardedTile),
    ...getValidPongActions(player, discardedTile),
    ...getValidMahjongActions(player, discardedTile),
  ];
};

const setEquals = (a: Set<any>, b: Set<any>): boolean => {
  if (a.size !== b.size) {
    return false;
  }
  for (const element of a) {
    if (!b.has(element)) {
      return false;
    }
  }
  return true;
};

const getCombinations = <T extends number>(elementChoices: T[][]): Set<T>[] => {
  if (elementChoices.length === 1) {
    return [new Set(elementChoices[0].sort((a, b) => a - b))];
  }
  const combinations: Set<T>[] = [];
  const firstElements = elementChoices[0];
  const restElements = elementChoices.slice(1);
  for (const firstElement of firstElements) {
    const restCombinations = getCombinations(restElements);
    for (const restCombination of restCombinations) {
      const newEntry = new Set([firstElement, ...restCombination]);
      if (!combinations.some((entry) => setEquals(entry, newEntry))) {
        combinations.push(newEntry);
      }
    }
  }
  return combinations;
};

export const getValidMeldActions = (
  player: ReadonlyPlayer,
  discardedTile: Tile,
  meldMatcher: MeldMatcher
): FormMeldAction[] => {
  const allTiles = [...player.hand, discardedTile];
  const melds = meldMatcher.getAllUniqueMatches(allTiles);
  const validMelds = [...melds].filter((meld) =>
    meld.tiles.includes(discardedTile)
  );

  const validPositionChoices: Map<Meld, Set<number>[]> = new Map();
  for (const meld of validMelds) {
    const requiredHandTiles = [...meld.tiles];
    requiredHandTiles.splice(meld.tiles.indexOf(discardedTile), 1);

    const tilePositions = requiredHandTiles.map((tile) =>
      Array.from({ length: player.hand.length }, (_, i) => i).filter(
        (i) => player.hand[i] === tile
      )
    );

    console.log(requiredHandTiles);
    console.log(tilePositions);

    const combinations = getCombinations(tilePositions);

    validPositionChoices.set(meld, combinations);
  }

  return validMelds.flatMap((meld) =>
    validPositionChoices
      .get(meld)
      .map(
        (positions) =>
          new FormMeldAction(player, meld, discardedTile, positions)
      )
  );
};
