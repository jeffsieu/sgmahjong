import type { ReadonlyPlayer, Hand } from "./game-state";
import type { BonusTile, Tile } from "../tiles";
import { Meld, Pong } from "../melds";
import type { Combination } from "../combi-utils";

export interface HandAction {
  player: ReadonlyPlayer;
  execute(hand: Hand): void;
}

export class DrawTileAction implements HandAction {
  constructor(readonly player: ReadonlyPlayer) {}

  execute(hand: Hand): void {
    hand.getPlayerWithWind(this.player.wind).drawFromWall();
  }
}

export class RevealBonusTileThenDrawAction implements HandAction {
  constructor(readonly player: ReadonlyPlayer, readonly bonusTile: BonusTile) {}

  execute(hand: Hand): void {
    const player = hand.getPlayerWithWind(this.player.wind);
    player.revealBonusTileAndDrawReplacement(this.bonusTile);
  }
}

export class DiscardTileAction implements HandAction {
  constructor(readonly player: ReadonlyPlayer, readonly position: number) {}

  execute(hand: Hand): Tile {
    const player = hand.getPlayerWithWind(this.player.wind);
    return player.discardToPile(this.position);
  }
}

export abstract class WindowOfOpportunityAction implements HandAction {
  constructor(readonly player: ReadonlyPlayer) {}

  abstract execute(hand: Hand): void;
}

export abstract class PlayerWindowOfOpportunityAction extends WindowOfOpportunityAction {
  readonly priority: number;
}

export class FormMeldAction extends PlayerWindowOfOpportunityAction {
  readonly priority: number;
  readonly revealedPositions: number[];

  constructor(
    readonly player: ReadonlyPlayer,
    readonly meld: Meld,
    readonly discardedTile: Tile,
    revealedPositions: Set<number>
  ) {
    super(player);
    this.priority = meld instanceof Pong ? 2 : 1;
    this.revealedPositions = Array.from(revealedPositions);
    this.revealedPositions.sort((a, b) => a - b);
  }

  execute(hand: Hand): void {
    for (let i = this.revealedPositions.length - 1; i >= 0; i--) {
      const position = this.revealedPositions[i];
      this.player.hand.splice(position, 1);
    }

    console.log("revealedPositions", this.revealedPositions);
    console.log("New hand length: " + this.player.hand.length);

    this.player.melds.push(this.meld);
    hand.discardPile.pop();
  }
}

export class MahjongAction extends PlayerWindowOfOpportunityAction {
  readonly priority: number;

  constructor(
    readonly player: ReadonlyPlayer,
    readonly discardedTile: Tile,
    readonly winningCombination: Combination
  ) {
    super(player);
    this.priority = 3;
  }

  execute(hand: Hand): void {
    this.player.hand.splice(0, this.player.hand.length);
    for (const meld of this.winningCombination.melds) {
      if (
        this.player.melds.every(
          (existingMeld) => !existingMeld.meldEquals(meld)
        )
      ) {
        this.player.melds.push(meld);
      }
    }
    hand.discardPile.pop();
  }
}

export class SkipWindowOfOpportunityAction extends PlayerWindowOfOpportunityAction {
  priority: number = 0;

  execute(hand: Hand): void {}
}

export class CloseWindowOfOpportunityAction extends WindowOfOpportunityAction {
  constructor() {
    super(null);
  }

  execute(hand: Hand): void {}
}

export class NextHandAction implements HandAction {
  player: ReadonlyPlayer;

  execute(hand: Hand): void {
    hand.finish();
  }
}
