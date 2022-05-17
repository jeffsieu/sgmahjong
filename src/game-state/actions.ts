import type { ReadonlyPlayer, Hand } from "./game-state";
import type { BonusTile, Tile, TileInstance } from "../tiles";
import { Chow, Kong, Meld, MeldInstance, Pong } from "../melds";
import type { Combination } from "../combi-utils";
import type { WinningHand } from "../scoring/scoring";

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

export abstract class ToDiscardAction implements HandAction {
  player: ReadonlyPlayer;
  abstract execute(hand: Hand): any;
}

export class RevealBonusTileThenDrawAction implements ToDiscardAction {
  constructor(
    readonly player: ReadonlyPlayer,
    readonly bonusTile: TileInstance<BonusTile>
  ) {}

  execute(hand: Hand): void {
    const player = hand.getPlayerWithWind(this.player.wind);
    player.revealBonusTileAndDrawReplacement(this.bonusTile);
  }
}

export class DiscardTileAction implements ToDiscardAction {
  constructor(readonly player: ReadonlyPlayer, readonly position: number) {}

  execute(hand: Hand): TileInstance<Tile> {
    const player = hand.getPlayerWithWind(this.player.wind);
    return player.discardToPile(this.position);
  }
}

export class SelfDrawMahjongAction implements ToDiscardAction {
  constructor(
    readonly player: ReadonlyPlayer,
    readonly winningHand: WinningHand
  ) {}

  execute(hand: Hand): void {
    this.player.hand.splice(0, this.player.hand.length);
    for (const meld of this.winningHand.melds) {
      if (!this.player.melds.includes(meld)) {
        this.player.melds.push(meld);
      }
    }
    hand.setWinningHand(this.winningHand);
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

  constructor(
    readonly player: ReadonlyPlayer,
    readonly meld: MeldInstance<Meld>,
    readonly discardedTile: TileInstance<Tile>
  ) {
    super(player);
    this.priority = meld.value instanceof Pong ? 2 : 1;
  }

  execute(hand: Hand): void {
    for (const tile of this.meld.tiles) {
      const position = this.player.hand.indexOf(tile);
      this.player.hand.splice(position, 1);
    }

    this.player.melds.push(this.meld);
    hand.discardPile.pop();
  }
}

export const isChowAction = (action: HandAction): action is FormMeldAction =>
  action instanceof FormMeldAction && action.meld.value instanceof Chow;

export const isPongAction = (action: HandAction): action is FormMeldAction =>
  action instanceof FormMeldAction && action.meld.value instanceof Pong;

export const isKongAction = (action: HandAction): action is FormMeldAction =>
  action instanceof FormMeldAction && action.meld.value instanceof Kong;

export const isMahjongAction = (action: HandAction): action is MahjongAction =>
  action instanceof MahjongAction;

export const isSkipAction = (
  action: HandAction
): action is SkipWindowOfOpportunityAction =>
  action instanceof SkipWindowOfOpportunityAction;

export class MahjongAction extends PlayerWindowOfOpportunityAction {
  readonly priority: number;

  constructor(
    readonly player: ReadonlyPlayer,
    readonly discardedTile: TileInstance<Tile>,
    readonly winningHand: WinningHand
  ) {
    super(player);
    this.priority = 3;
  }

  execute(hand: Hand): void {
    this.player.hand.splice(0, this.player.hand.length);
    for (const meld of this.winningHand.melds) {
      if (!this.player.melds.includes(meld)) {
        this.player.melds.push(meld);
      }
    }
    hand.discardPile.pop();
    hand.setWinningHand(this.winningHand);
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
