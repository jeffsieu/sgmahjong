import type { ReadonlyPlayer, Hand } from "./game-state";
import type { BonusTile, Tile, TileInstance } from "../tiles";
import { Kong, Meld, MeldInstance, Pong } from "../melds";
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
  constructor(
    readonly player: ReadonlyPlayer,
    readonly bonusTile: TileInstance<BonusTile>
  ) {}

  execute(hand: Hand): void {
    const player = hand.getPlayerWithWind(this.player.wind);
    player.revealBonusTileAndDrawReplacement(this.bonusTile);
  }
}

export class DiscardTileAction implements HandAction {
  constructor(readonly player: ReadonlyPlayer, readonly position: number) {}

  execute(hand: Hand): TileInstance<Tile> {
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
  action instanceof FormMeldAction && action.meld.value instanceof Meld;

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
    readonly winningCombination: Combination
  ) {
    super(player);
    this.priority = 3;
  }

  execute(hand: Hand): void {
    console.debug("executing mahjong action");
    this.player.hand.splice(0, this.player.hand.length);
    for (const meld of this.winningCombination.melds) {
      if (!this.player.melds.includes(meld)) {
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
