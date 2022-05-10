/// <reference types="svelte" />

import { SingaporeMahjong, StandardMahjong } from './tiles';


export type GameRules = {
  getMeldCombinationMatchers(): MeldCombinationMatcher[],
  getProhibitionRules(): ProhibitionRule[],
  getGameStateDependentDoubleProviders(): GameStateDependentDoubleProvider[],
}

export type DoubleProvider = (rules: GameRules) => number;


export type WindDependentDoubleProvider = {
  resolveWithWind: (mainWind: Wind, playerWind: Wind) => DoubleProvider;
}

