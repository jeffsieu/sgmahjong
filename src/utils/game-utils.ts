import { Hand } from "../game-state/game-state";
import type { HandPhase } from "../game-state/phases";

export class DebugHand extends Hand {
  setCurrentPhase(phase: HandPhase): void {
    this.currentPhase = phase;
  }
}
