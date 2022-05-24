import React from 'react';
import { Hand } from './game-state/game-state';

export type GameContextValue = {
  update: () => void;
  hand: Hand | null;
};

export const GameContext = React.createContext<GameContextValue>({
  update: () => {},
  hand: null,
});
