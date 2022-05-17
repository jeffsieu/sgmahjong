import type { Combination } from "../combi-utils";
import type { GameRules } from "../config/rules";
import { Meld, MeldInstance, Pong } from "../melds";
import type { BonusTile, StandardTile, TileInstance, Wind } from "../tiles";

export type DoubleProvider = (rules: GameRules) => number;

export type WindDependentDoubleProvider = {
  resolveWithWind: (mainWind: Wind, playerWind: Wind) => DoubleProvider;
};

export enum WinningHandType {
  SelfDraw,
  Discard,
}

export type CandidateWinningHand = {
  prevailingWind: Wind;
  playerWind: Wind;
  preWinHand: TileInstance<StandardTile>[];
  preWinMelds: MeldInstance<Meld>[];
  bonusTiles: TileInstance<BonusTile>[];
  type: WinningHandType;
};

export type WinningHand = CandidateWinningHand & {
  melds: MeldInstance<Meld>[];
  combinations: Combination[];
};

export const getWinningHandDoubles = (
  winningHand: WinningHand
): DoubleProvider => {
  return (rules: GameRules) => {
    const combinationDoubles = winningHand.combinations
      .map((combi) => combi.getDoubles(rules))
      .reduce((a, b) => a + b, 0);
    const bonusTileDoubles = winningHand.bonusTiles
      .map((bonusTile) =>
        bonusTile.value.resolveWithWind(
          winningHand.prevailingWind,
          winningHand.playerWind
        )(rules)
      )
      .reduce((a, b) => a + b, 0);
    const meldDoubles = winningHand.melds
      .filter((meld): meld is MeldInstance<Pong> => meld.value instanceof Pong)
      .map((pong) =>
        pong.value.resolveWithWind(
          winningHand.prevailingWind,
          winningHand.playerWind
        )(rules)
      )
      .reduce((a, b) => a + b, 0);
    // const sequenceHandExtraDoubles =
    return combinationDoubles + bonusTileDoubles + meldDoubles;
  };
};
