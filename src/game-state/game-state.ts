import type { PlayerUI } from "../controls/hand-control";
import type { HandAction } from "./actions";
import { HandPhase, PostDrawPhase } from "./phases";
import type { Meld, MeldInstance } from "../melds";
import {
  BonusTile,
  SingaporeMahjong,
  StandardMahjong,
  Tile,
  TileInstance,
  Wind,
} from "../tiles";
import { PhysicalWall, PreGameDiceRoll } from "./pre-hand";
import type { WinningHand } from "../scoring/scoring";

export class Wall {
  readonly tiles: TileInstance<Tile>[];

  constructor() {
    this.tiles = [...SingaporeMahjong.TILE_SET];

    // Shuffle tiles
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  canDraw(): boolean {
    return this.tiles.length > 14;
  }

  draw(): TileInstance<Tile> {
    if (!this.canDraw()) {
      throw new Error("Cannot draw from wall");
    }
    return this.tiles.pop()!;
  }

  drawReplacement(): TileInstance<Tile> {
    return this.tiles.splice(0, 1)[0];
  }
}

export interface ReadonlyPlayer {
  readonly gameHand: Hand;
  readonly wind: Wind;
  readonly bonusTiles: TileInstance<BonusTile>[];
  readonly melds: MeldInstance<Meld>[];
  readonly hand: TileInstance<Tile>[];

  hasBonusTileInHand(): boolean;
}

export class SeatedPlayer implements ReadonlyPlayer {
  readonly bonusTiles: TileInstance<BonusTile>[] = [];
  readonly melds: MeldInstance<Meld>[] = [];

  constructor(
    readonly gameHand: Hand,
    readonly wind: Wind,
    readonly hand: TileInstance<Tile>[]
  ) {
    this.sortHand();
  }

  hasBonusTileInHand(): boolean {
    return this.hand.some((tile) => tile.value instanceof BonusTile);
  }

  removeFromHand(position: number): void {
    const tile = this.hand[position];

    if (tile.value instanceof BonusTile) {
      this.revealBonusTileAndDrawReplacement(tile as TileInstance<BonusTile>);
    } else {
      this.discardToPile(position);
    }
  }

  discardToPile(position: number): TileInstance<Tile> {
    const discarded = this.hand.splice(position, 1)[0];
    if (this.hasBonusTileInHand()) {
      throw new Error(
        "Bonus tile must be shown before other tiles can be discarded."
      );
    } else {
      this.gameHand.discardPile.push(discarded);
      return discarded;
    }
  }

  drawFromWall(): TileInstance<Tile> {
    const tile = this.gameHand.draw();
    this.hand.push(tile);
    this.sortHand();
    return tile;
  }

  private sortHand(): void {
    this.hand.sort((a, b) =>
      a.value.toString().localeCompare(b.value.toString())
    );
  }

  revealBonusTileAndDrawReplacement(bonusTile: TileInstance<BonusTile>): void {
    this.hand.splice(this.hand.indexOf(bonusTile), 1);
    this.bonusTiles.push(bonusTile);

    const replacementTile = this.gameHand.drawReplacement();
    this.hand.push(replacementTile);
    this.sortHand();
  }
}

export class Round {
  private hand: Hand;

  constructor(readonly prevailingWind: Wind) {
    this.hand = new Hand(prevailingWind, this.startNextHand);
  }

  startNextHand(): void {
    this.hand = new Hand(this.prevailingWind, this.startNextHand);
  }

  getCurrentHand(): Hand {
    return this.hand;
  }
}

export interface ReadonlyHand {
  readonly wall: Wall;
  readonly diceRoll: PreGameDiceRoll;
  readonly physicalWall: PhysicalWall;
  readonly players: SeatedPlayer[];
  readonly discardPile: TileInstance<Tile>[];
  getWinningHand(): WinningHand | null;
}

export class Hand implements PlayerUI, ReadonlyHand {
  readonly wall: Wall = new Wall();
  readonly diceRoll = new PreGameDiceRoll();
  readonly physicalWall = new PhysicalWall(this.diceRoll);
  readonly players: SeatedPlayer[];
  readonly discardPile: TileInstance<Tile>[] = [];
  protected isOver: boolean = false;
  protected currentPhase: HandPhase;
  protected winningHand: WinningHand | null;

  constructor(
    readonly prevailingWind: Wind,
    protected readonly onFinish: () => void
  ) {
    this.players = [
      new SeatedPlayer(
        this,
        StandardMahjong.SUIT_EAST,
        Array.from({ length: 14 }, () => this.wall.draw())
      ),
      new SeatedPlayer(
        this,
        StandardMahjong.SUIT_SOUTH,
        Array.from({ length: 13 }, () => this.wall.draw())
      ),
      new SeatedPlayer(
        this,
        StandardMahjong.SUIT_WEST,
        Array.from({ length: 13 }, () => this.wall.draw())
      ),
      new SeatedPlayer(
        this,
        StandardMahjong.SUIT_NORTH,
        Array.from({ length: 13 }, () => this.wall.draw())
      ),
    ];

    this.currentPhase = new PostDrawPhase(
      this,
      this.getPlayerWithWind(StandardMahjong.SUIT_EAST),
      0
    );
    while (this.currentPhase.isCompleted()) {
      const nextPhase = this.currentPhase.getNextPhase();
      if (nextPhase === null) {
        break;
      }
      this.currentPhase = nextPhase;
    }
  }

  tryExecuteAction(action: HandAction): void {
    this.currentPhase.tryExecuteAction(action);
    while (this.currentPhase.isCompleted()) {
      const nextPhase = this.currentPhase.getNextPhase();
      if (nextPhase === null) {
        break;
      }
      this.currentPhase = nextPhase;
    }
    if (this.isFinished()) {
      this.onFinish();
    }
  }

  canExecuteAction(action: HandAction): boolean {
    return this.currentPhase.canExecuteAction(action);
  }

  getCurrentPhase(): HandPhase {
    return this.currentPhase;
  }

  getOrderedPlayersFrom(wind: Wind): SeatedPlayer[] {
    const index = this.players.findIndex((player) => player.wind === wind);
    return this.players.slice(index).concat(this.players.slice(0, index));
  }

  getPlayerWithWind(wind: Wind): SeatedPlayer {
    return this.players.find((player) => player.wind === wind)!;
  }

  getPlayerAfter(player: ReadonlyPlayer): SeatedPlayer {
    const index = this.players.findIndex((p) => p === player);
    return this.players[(index + 1) % 4];
  }

  getRevealedTiles(): TileInstance<Tile>[] {
    const meldTiles = this.players.flatMap((player) =>
      player.melds.flatMap((meld) => meld.tiles)
    );
    const bonusTiles = this.players.flatMap((player) => player.bonusTiles);
    return [...meldTiles, ...bonusTiles, ...this.discardPile];
  }

  draw(): TileInstance<Tile> {
    this.physicalWall.popFront();
    return this.wall.draw();
  }

  drawReplacement(): TileInstance<Tile> {
    this.physicalWall.popBack();
    return this.wall.drawReplacement();
  }

  canDraw(): boolean {
    return this.wall.tiles.length > 14;
  }

  finish(): void {
    this.isOver = true;
  }

  isFinished(): boolean {
    return this.isOver;
  }

  setWinningHand(winningHand: WinningHand): void {
    this.winningHand = winningHand;
  }

  getWinningHand(): WinningHand | null {
    return this.winningHand;
  }
}
