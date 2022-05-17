import type { Hand, ReadonlyHand, ReadonlyPlayer } from "./game-state";
import { BonusTile, StandardMahjong, Tile, TileInstance } from "../tiles";
import {
  CloseWindowOfOpportunityAction,
  DiscardTileAction,
  DrawTileAction,
  FormMeldAction,
  HandAction,
  MahjongAction,
  NextHandAction,
  NonTrivialPlayerWindowOfOpportunityAction,
  PlayerWindowOfOpportunityAction,
  RevealBonusTileThenDrawAction,
  SelfDrawMahjongAction,
  SkipWindowOfOpportunityAction,
  ToDiscardAction,
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
  abstract getNextPhase(): HandPhase | null;

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
  tilesToShow: TileInstance<BonusTile>[] = this.player.hand.filter(
    (tile): tile is TileInstance<BonusTile> => tile.value instanceof BonusTile
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
        .map((player) =>
          player.hand.some((tile) => tile.value instanceof BonusTile)
        )
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
        this.hand.getPlayerWithWind(StandardMahjong.SUIT_EAST),
        null
      );
    }
  }
}

export class ToDiscardPhase extends PlayerControlledPhase {
  name = `To Discard (${this.player.wind.name})`;
  discardedTile: TileInstance<Tile> | undefined;
  isOver = false;
  isSelfDrawDeclared = false;

  constructor(
    readonly hand: Hand,
    readonly player: ReadonlyPlayer,
    private latestDrawnTile: TileInstance<Tile> | null
  ) {
    super(hand, player);
  }

  getErrorForAction(action: HandAction): Error | null {
    const superError = super.getErrorForAction(action);
    if (superError) {
      return superError;
    }

    if (!(action instanceof ToDiscardAction)) {
      return new Error("Invalid action.");
    }

    return null;
  }

  getLatestDrawnTile(): TileInstance<Tile> | null {
    return this.latestDrawnTile;
  }

  tryExecuteAction(action: HandAction): void {
    const error = this.getErrorForAction(action);
    if (error) {
      throw error;
    }

    if (action instanceof ToDiscardAction) {
      const tile = action.execute(this.hand);
      this.isOver = true;

      if (action instanceof SelfDrawMahjongAction) {
        this.isSelfDrawDeclared = true;
      }

      if (action instanceof RevealBonusTileThenDrawAction) {
        this.isOver = false;
      }

      if (action instanceof DiscardTileAction) {
        this.discardedTile = tile as TileInstance<Tile>;
      }
    }
  }

  isCompleted(): boolean {
    return this.isOver;
  }

  getNextPhase(): HandPhase {
    if (!this.isSelfDrawDeclared) {
      return new WindowOfOpportunityPhase(
        this.hand,
        this.player,
        this.discardedTile!
      );
    } else {
      return new EndOfHandPhase(this.hand, this.player);
    }
  }
}

export class ToDrawPhase extends PlayerControlledPhase {
  name = `To Draw (${this.player.wind.name})`;
  private drawnTile: TileInstance<Tile> | undefined;

  tryExecuteAction(action: HandAction): void {
    const error = this.getErrorForAction(action);
    if (error) {
      throw error;
    }

    if (action instanceof DrawTileAction) {
      this.drawnTile = action.execute(this.hand);
    }
  }

  getErrorForAction(action: HandAction): Error | null {
    const superError = super.getErrorForAction(action);
    if (superError) {
      return superError;
    }

    if (!(action instanceof DrawTileAction)) {
      return new Error("Invalid action.");
    }

    return null;
  }

  isCompleted(): boolean {
    return (
      !this.hand.canDraw() ||
      this.player.hand.length + this.player.melds.length * 3 === 14
    );
  }

  getNextPhase(): HandPhase {
    if (this.drawnTile !== undefined) {
      return new ToDiscardPhase(this.hand, this.player, this.drawnTile);
    } else {
      return new EndOfHandPhase(this.hand, this.player);
    }
  }
}

export class WindowOfOpportunityPhase extends HandPhase {
  name = "Window of Opportunity";

  // Represents the actions of each of the consecutive players, in order.
  actions: Map<ReadonlyPlayer, PlayerWindowOfOpportunityAction | null> =
    new Map();

  private isClosed: boolean = false;
  private executedAction: PlayerWindowOfOpportunityAction | null = null;
  readonly startTime: number = Date.now();

  constructor(
    readonly hand: Hand,
    readonly player: ReadonlyPlayer,
    readonly discardedTile: TileInstance<Tile>
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
    } else if (action instanceof PlayerWindowOfOpportunityAction) {
      this.actions.set(action.player, action);
    }

    if ([...this.actions.values()].every((action) => action !== null)) {
      this.close();
    }
  }

  getErrorForAction(action: HandAction): Error | null {
    if (!(action instanceof WindowOfOpportunityAction)) {
      return new Error("Invalid action.");
    }

    if (action.player === this.player) {
      return new Error("You cannot reclaim your discarded tile.");
    }

    if (
      action instanceof FormMeldAction &&
      action.meld.value instanceof Chow &&
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

    console.debug("Closing window of opportunity.");

    // Get the action with the highest priority
    const actions = Array.from(this.actions.values());
    const highestPriorityAction = actions
      .filter(
        (action): action is PlayerWindowOfOpportunityAction => action !== null
      )
      .reduce(
        (
          highestPriorityAction: NonTrivialPlayerWindowOfOpportunityAction | null,
          action: NonTrivialPlayerWindowOfOpportunityAction
        ) => {
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
      if (
        this.executedAction instanceof NonTrivialPlayerWindowOfOpportunityAction
      ) {
        return this.executedAction.getNextPhase(this);
      } else {
        throw new Error("Invalid action.");
      }
    }
  }
}

export class EndOfHandPhase extends PlayerControlledPhase {
  name = "End of Hand";

  private isOver: boolean = false;

  tryExecuteAction(action: HandAction): void {
    const error = this.getErrorForAction(action);
    if (error !== null) {
      throw error;
    }

    action.execute(this.hand);
    this.isOver = true;
  }

  getErrorForAction(action: HandAction): Error | null {
    if (!(action instanceof NextHandAction)) {
      return new Error("Invalid action.");
    }

    return null;
  }

  isCompleted(): boolean {
    return this.isOver;
  }

  getNextPhase(): HandPhase | null {
    return null;
  }
}
