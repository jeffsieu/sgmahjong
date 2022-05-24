import type { ReadonlyPlayer, Hand } from './game-state';
import type { BonusTile, Tile, TileInstance } from '../tiles';
import { Chow, Kong, Meld, MeldInstance, Pong } from '../melds';
import type { WinningHand } from '../scoring/scoring';
import {
  EndOfHandPhase,
  HandPhase,
  ToDiscardPhase,
  ToDrawPhase,
  WindowOfOpportunityPhase,
} from './phases';

export interface HandAction {
  player: ReadonlyPlayer | null;
  execute(hand: Hand): void;
}

export class DrawTileAction implements HandAction {
  constructor(readonly player: ReadonlyPlayer) {}

  execute(hand: Hand): TileInstance<Tile> {
    return hand.getPlayerWithWind(this.player.wind).drawFromWall();
  }
}

export abstract class ToDiscardAction implements HandAction {
  constructor(readonly player: ReadonlyPlayer) {}

  abstract execute(hand: Hand): any;
}

export class RevealBonusTileThenDrawAction extends ToDiscardAction {
  constructor(
    player: ReadonlyPlayer,
    readonly bonusTile: TileInstance<BonusTile>
  ) {
    super(player);
  }

  execute(hand: Hand): void {
    const player = hand.getPlayerWithWind(this.player.wind);
    player.revealBonusTileAndDrawReplacement(this.bonusTile);
  }
}

export class DiscardTileAction extends ToDiscardAction {
  constructor(player: ReadonlyPlayer, readonly position: number) {
    super(player);
  }

  execute(hand: Hand): TileInstance<Tile> {
    const player = hand.getPlayerWithWind(this.player.wind);
    return player.discardToPile(this.position);
  }
}

export class SelfDrawMahjongAction extends ToDiscardAction {
  constructor(
    readonly player: ReadonlyPlayer,
    readonly winningHand: WinningHand
  ) {
    super(player);
  }

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
  constructor(readonly player: ReadonlyPlayer | null) {}

  abstract execute(hand: Hand): void;
}

export abstract class PlayerWindowOfOpportunityAction extends WindowOfOpportunityAction {
  constructor(readonly player: ReadonlyPlayer, readonly priority: number) {
    super(player);
  }
}

export abstract class NonTrivialPlayerWindowOfOpportunityAction extends PlayerWindowOfOpportunityAction {
  abstract getNextPhase(currentPhase: WindowOfOpportunityPhase): HandPhase;
}

export class FormMeldAction extends NonTrivialPlayerWindowOfOpportunityAction {
  constructor(
    readonly player: ReadonlyPlayer,
    readonly meld: MeldInstance<Meld>,
    readonly discardedTile: TileInstance<Tile>
  ) {
    super(
      player,
      meld.value instanceof Pong || meld.value instanceof Kong ? 2 : 1
    );
  }

  execute(hand: Hand): void {
    for (const tile of this.meld.tiles) {
      const position = this.player.hand.indexOf(tile);
      if (position !== -1) {
        this.player.hand.splice(position, 1);
      }
    }

    this.player.melds.push(this.meld);
    hand.discardPile.pop();
  }

  getNextPhase(currentPhase: WindowOfOpportunityPhase): HandPhase {
    return new ToDiscardPhase(currentPhase.hand, this.player, null);
  }
}

export class FormKongAction extends FormMeldAction {
  getNextPhase(currentPhase: WindowOfOpportunityPhase): HandPhase {
    return new ToDrawPhase(currentPhase.hand, this.player);
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

export class MahjongAction extends NonTrivialPlayerWindowOfOpportunityAction {
  constructor(
    readonly player: ReadonlyPlayer,
    readonly discardedTile: TileInstance<Tile>,
    readonly winningHand: WinningHand
  ) {
    super(player, 3);
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

  getNextPhase(currentPhase: WindowOfOpportunityPhase): HandPhase {
    return new EndOfHandPhase(currentPhase.hand, this.player);
  }
}

export class SkipWindowOfOpportunityAction extends PlayerWindowOfOpportunityAction {
  constructor(player: ReadonlyPlayer) {
    super(player, 0);
  }

  execute(hand: Hand): void {}
}

export class CloseWindowOfOpportunityAction extends WindowOfOpportunityAction {
  constructor() {
    super(null);
  }

  execute(hand: Hand): void {}
}

export class NextHandAction implements HandAction {
  readonly player: ReadonlyPlayer | null = null;

  execute(hand: Hand): void {
    hand.finish();
  }
}
