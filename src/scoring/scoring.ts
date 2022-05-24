import type { Combination } from '../combi-utils';
import type { GameRules } from '../config/rules';
import { Meld, MeldInstance, Pong } from '../melds';
import type { BonusTile, StandardTile, TileInstance, Wind } from '../tiles';

export type DoubleProvider = (rules: GameRules) => number;

export type NamedDoubleProvider = (rules: GameRules) => {
  name: string;
  score: number;
};

export type WindDependentNamedDoubleProvider = {
  resolveWithWind: (mainWind: Wind, playerWind: Wind) => NamedDoubleProvider;
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

export const getWinningHandDoubleProviders = (
  winningHand: WinningHand
): NamedDoubleProvider[] => {
  const combinationDoubleProviders = winningHand.combinations.map(
    (combi) => combi.getDoubles
  );
  const bonusTileDoubleProviders = winningHand.bonusTiles.map((bonusTile) =>
    bonusTile.value.resolveWithWind(
      winningHand.prevailingWind,
      winningHand.playerWind
    )
  );
  const meldDoubleProviders = winningHand.melds
    .filter((meld): meld is MeldInstance<Pong> => meld.value instanceof Pong)
    .map((pong) =>
      pong.value.resolveWithWind(
        winningHand.prevailingWind,
        winningHand.playerWind
      )
    );
  // const sequenceHandExtraDoubles =
  return [
    ...combinationDoubleProviders,
    ...bonusTileDoubleProviders,
    ...meldDoubleProviders,
  ];
};
