import React from "react";

export type GameContextValue = {
  update: () => void;
};

export const GameContext = React.createContext<GameContextValue>({
  update: () => {},
});
