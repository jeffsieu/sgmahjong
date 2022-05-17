import { ChowMatcher, MeldMatcher, PongMatcher } from "../combi-utils";
import { getMatchingCombinations } from "../combis";
import type { Meld } from "../melds";
import type { Tile, TileInstance } from "../tiles";
import {
  FormMeldAction,
  MahjongAction,
  PlayerWindowOfOpportunityAction,
  SkipWindowOfOpportunityAction,
} from "./actions";
import type { ReadonlyPlayer } from "./game-state";
import type { WindowOfOpportunityPhase } from "./phases";

export const getValidChowActions = (
  player: ReadonlyPlayer,
  discardedTile: TileInstance<Tile>
): FormMeldAction[] => {
  return getValidMeldActions(player, discardedTile, new ChowMatcher());
};

export const getValidPongActions = (
  player: ReadonlyPlayer,
  discardedTile: TileInstance<Tile>
): FormMeldAction[] => {
  return getValidMeldActions(player, discardedTile, new PongMatcher());
};

export const getValidMahjongActions = (
  player: ReadonlyPlayer,
  discardedTile: TileInstance<Tile>
): MahjongAction[] => {
  const combinations = getMatchingCombinations(
    [discardedTile, ...player.hand],
    player.melds
  );
  return combinations.filter((combi) => combi.isWinning).length > 0
    ? [
        new MahjongAction(player, discardedTile, {
          combinations: combinations,
          prevailingWind: player.gameHand.prevailingWind,
          playerWind: player.wind,
          melds: combinations[0].melds,
          bonusTiles: player.bonusTiles,
        }),
      ]
    : [];
};

export const getValidWindowOfOpportunityActions = (
  player: ReadonlyPlayer,
  phase: WindowOfOpportunityPhase
): PlayerWindowOfOpportunityAction[] => {
  return [
    ...getValidChowActions(player, phase.discardedTile),
    ...getValidPongActions(player, phase.discardedTile),
    ...getValidMahjongActions(player, phase.discardedTile),
    new SkipWindowOfOpportunityAction(player),
  ].filter((action) => phase.canExecuteAction(action));
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

export const getCombinations = <T>(elementChoices: T[][]): Set<T>[] => {
  if (elementChoices.length === 1) {
    return elementChoices[0].map((e) => new Set([e]));
  }
  const combinations: Set<T>[] = [];
  const firstElements = elementChoices[0];
  const restElements = elementChoices.slice(1);
  for (const firstElement of firstElements) {
    const restCombinations = getCombinations(
      restElements.map((choices) => choices.filter((e) => e !== firstElement))
    );
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
  discardedTile: TileInstance<Tile>,
  meldMatcher: MeldMatcher<Meld>
): FormMeldAction[] => {
  const allTiles = [...player.hand, discardedTile];
  const melds = meldMatcher.getTileInstanceMatches(allTiles);
  const validMelds = [...melds].filter((meld) =>
    meld.tiles.includes(discardedTile)
  );

  return validMelds.flatMap(
    (meld) => new FormMeldAction(player, meld, discardedTile)
  );
};
