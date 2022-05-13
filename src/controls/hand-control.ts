import type { HandAction } from "../game-state/actions";

export interface PlayerUI {
  tryExecuteAction(action: HandAction): void;
}
