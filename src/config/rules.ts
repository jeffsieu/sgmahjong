export type GameRules = {
  maxDoubles: number;
  mixedSuits: number;
  pureSuits: number;

  // getMeldCombinationMatchers(): MeldCombinationMatcher[];
  // getProhibitionRules(): ProhibitionRule[];
  // getGameStateDependentDoubleProviders(): GameStateDependentDoubleProvider[];
};

export const STANDARD_GAME_RULES: GameRules = {
  maxDoubles: 5,
  mixedSuits: 2,
  pureSuits: 4,
};
