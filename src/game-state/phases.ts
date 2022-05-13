import type { Hand, ReadonlyHand, ReadonlyPlayer } from "./game-state";
import { BonusTile, StandardMahjong, Tile } from "../tiles";
import {
  CloseWindowOfOpportunityAction,
  DiscardTileAction,
  FormMeldAction,
  HandAction,
  MahjongAction,
  NextHandAction,
  PlayerWindowOfOpportunityAction,
  RevealBonusTileThenDrawAction,
  SkipWindowOfOpportunityAction,
  WindowOfOpportunityAction,
} from "./actions";
import { Chow } from "../melds";

export interface ReadonlyHandPhase {
  name: string;
  readonly hand: ReadonlyHand;

  getErrorForAction(action: HandAction): Error | null;
  isCompleted(): boolean;

  canExecuteAction(action: HandAction): boolean;
}

export abstract class HandPhase {
  name: string;

  constructor(readonly hand: Hand) {}

  abstract tryExecuteAction(action: HandAction): void;
  abstract getErrorForAction(action: HandAction): Error | null;
  abstract isCompleted(): boolean;
  abstract getNextPhase(): HandPhase;

  canExecuteAction(action: HandAction): boolean {
    return this.getErrorForAction(action) === null;
  }
}

export abstract class PlayerControlledPhase extends HandPhase {
  constructor(readonly hand: Hand, readonly player: ReadonlyPlayer) {
    super(hand);
  }

  getErrorForAction(action: HandAction): Error | null {
    if (action.player !== this.player) {
      return new Error("It is not your turn yet.");
    }
    return null;
  }
}

export class PostDrawPhase extends PlayerControlledPhase {
  name = `Post Draw (${this.index + 1})`;
  tilesToShow: BonusTile[] = this.player.hand.filter(
    (tile): tile is BonusTile => tile instanceof BonusTile
  );

  constructor(
    hand: Hand,
    readonly player: ReadonlyPlayer,
    readonly index: number
  ) {
    super(hand, player);
  }

  tryExecuteAction(action: HandAction): void {
    const error = this.getErrorForAction(action);
    if (error !== null || !(action instanceof RevealBonusTileThenDrawAction)) {
      throw error;
    }

    action.execute(this.hand);

    this.tilesToShow.splice(this.tilesToShow.indexOf(action.bonusTile), 1);
  }

  getErrorForAction(action: HandAction): Error | null {
    const superError = super.getErrorForAction(action);
    if (superError) {
      return superError;
    }

    if (!(action instanceof RevealBonusTileThenDrawAction)) {
      return new Error("Invalid action.");
    }

    if (!this.tilesToShow.includes(action.bonusTile)) {
      return new Error("Newly drawn bonus tile cannot be thrown yet.");
    }

    return null;
  }

  isCompleted(): boolean {
    return this.tilesToShow.length == 0;
  }

  getNextPhase(): HandPhase {
    if (this.player.wind !== StandardMahjong.SUIT_NORTH) {
      // Let the next person draw.
      return new PostDrawPhase(
        this.hand,
        this.hand.getPlayerAfter(this.player),
        this.index
      );
    } else if (
      this.hand
        .getOrderedPlayersFrom(StandardMahjong.SUIT_EAST)
        .map((player) => player.hand.some((tile) => tile instanceof BonusTile))
        .some((hasBonusTile) => hasBonusTile)
    ) {
      // Initiate another post draw phase if there are still bonus tiles left.
      return new PostDrawPhase(
        this.hand,
        this.hand.getPlayerAfter(this.player),
        this.index + 1
      );
    }
    {
      return new ToDiscardPhase(
        this.hand,
        this.hand.getPlayerWithWind(StandardMahjong.SUIT_EAST)
      );
    }
  }
}

export class ToDiscardPhase extends PlayerControlledPhase {
  name = `To Discard (${this.player.wind.name})`;
  discardedTile: Tile | undefined;

  getErrorForAction(action: HandAction): Error | null {
    const superError = super.getErrorForAction(action);
    if (superError) {
      return superError;
    }

    if (
      !(action instanceof DiscardTileAction) &&
      !(action instanceof RevealBonusTileThenDrawAction)
    ) {
      return new Error("Invalid action.");
    }

    return null;
  }

  tryExecuteAction(action: HandAction): void {
    const error = this.getErrorForAction(action);
    if (error !== null) {
      throw error;
    }

    if (
      action instanceof DiscardTileAction ||
      action instanceof RevealBonusTileThenDrawAction
    ) {
      const tile = action.execute(this.hand);

      if (action instanceof DiscardTileAction) {
        this.discardedTile = tile as Tile;
      }
    }
  }

  isCompleted(): boolean {
    return this.player.hand.length + this.player.melds.length * 3 === 13;
  }

  getNextPhase(): HandPhase {
    return new WindowOfOpportunityPhase(
      this.hand,
      this.player,
      this.discardedTile
    );
  }
}

export class ToDrawPhase extends PlayerControlledPhase {
  name = `To Draw (${this.player.wind.name})`;

  tryExecuteAction(action: HandAction): void {
    const error = this.getErrorForAction(action);
    if (error !== null) {
      throw error;
    }
    action.execute(this.hand);
  }

  isCompleted(): boolean {
    return this.player.hand.length + this.player.melds.length * 3 === 14;
  }

  getNextPhase(): HandPhase {
    return new ToDiscardPhase(this.hand, this.player);
  }
}

export class WindowOfOpportunityPhase extends HandPhase {
  name = "Window of Opportunity";

  // Represents the actions of each of the consecutive players, in order.
  actions: Map<ReadonlyPlayer, PlayerWindowOfOpportunityAction> = new Map();

  private isClosed: boolean = false;
  private executedAction: PlayerWindowOfOpportunityAction | null = null;

  constructor(
    readonly hand: Hand,
    readonly player: ReadonlyPlayer,
    readonly discardedTile: Tile
  ) {
    super(hand);
    for (const player of this.hand
      .getOrderedPlayersFrom(this.player.wind)
      .slice(1)) {
      this.actions.set(player, null);
    }
  }

  tryExecuteAction(action: HandAction): void {
    const error = this.getErrorForAction(action);
    if (error !== null) {
      throw error;
    }

    if (action instanceof CloseWindowOfOpportunityAction) {
      this.close();
      return;
    }

    console.log("Setting action for player: ", action.player.wind.name);

    this.actions.set(action.player, action as PlayerWindowOfOpportunityAction);
  }

  getErrorForAction(action: HandAction): Error {
    if (!(action instanceof WindowOfOpportunityAction)) {
      return new Error("Invalid action.");
    }

    if (action.player === this.player) {
      return new Error("You cannot reclaim your discarded tile.");
    }

    if (
      action instanceof FormMeldAction &&
      action.meld instanceof Chow &&
      this.hand.getPlayerAfter(this.player) !== action.player
    ) {
      return new Error(
        "You only form a Chow with the preceding player's discarded tile"
      );
    }

    return null;
  }

  private close() {
    this.isClosed = true;

    console.log("Closing window of opportunity.");

    // Get the action with the highest priority
    const actions = Array.from(this.actions.values());
    const highestPriorityAction = actions.reduce(
      (highestPriorityAction, action) => {
        if (
          highestPriorityAction === null ||
          action.priority > highestPriorityAction.priority
        ) {
          return action;
        }
        return highestPriorityAction;
      },
      null
    );

    console.log("Highest priority action:");
    console.log(highestPriorityAction);

    // If all players skipped, no action was executed.
    if (
      highestPriorityAction === null ||
      highestPriorityAction instanceof SkipWindowOfOpportunityAction
    ) {
      return;
    }

    // Execute the action
    this.executedAction = highestPriorityAction;
    this.executedAction.execute(this.hand);
  }

  isCompleted(): boolean {
    return this.isClosed;
  }

  getNextPhase(): HandPhase {
    if (this.executedAction === null) {
      return new ToDrawPhase(this.hand, this.hand.getPlayerAfter(this.player));
    } else {
      if (this.executedAction instanceof FormMeldAction) {
        return new ToDiscardPhase(this.hand, this.executedAction.player);
      } else if (this.executedAction instanceof MahjongAction) {
        return new EndOfHandPhase(this.hand, this.executedAction.player);
      }
    }
  }
}

export class EndOfHandPhase extends HandPhase {
  name = "End of Hand";

  private isOver: boolean = false;

  constructor(readonly hand: Hand, readonly winner: ReadonlyPlayer | null) {
    super(hand);
  }

  tryExecuteAction(action: HandAction): void {
    const error = this.getErrorForAction(action);
    if (error !== null) {
      throw error;
    }

    action.execute(this.hand);
    this.isOver = true;
  }

  getErrorForAction(action: HandAction): Error {
    if (!(action instanceof NextHandAction)) {
      return new Error("Invalid action.");
    }

    if (action.player !== this.winner) {
      return new Error("Only the winner can start the next hand.");
    }

    return null;
  }

  isCompleted(): boolean {
    return this.isOver;
  }

  getNextPhase(): HandPhase {
    return null;
  }
}
