import type { PlayerHandInterface } from "./controls/hand-control";
import type { Meld } from "./melds";
import {
  BonusTile,
  SingaporeMahjong,
  StandardMahjong,
  Tile,
  Wind,
} from "./tiles";

export class Wall {
  readonly tiles: Tile[];

  constructor() {
    this.tiles = [...SingaporeMahjong.TILE_SET];

    // Shuffle tiles
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  draw(): Tile {
    return this.tiles.pop();
  }

  drawReplacement(): Tile {
    return this.tiles.splice(0, 1)[0];
  }
}

export interface ReadonlyPlayer {
  readonly bonusTiles: BonusTile[];
  readonly melds: Meld[];
  readonly hand: Tile[];

  hasBonusTileInHand(): boolean;
  removeFromHand(position: number): void;
}

export class SeatedPlayer implements ReadonlyPlayer, PlayerHandInterface {
  readonly bonusTiles: BonusTile[] = [];
  readonly melds: Meld[] = [];
  readonly hand: Tile[] = [];

  constructor(readonly gameHand: Hand, readonly wind: Wind) {}

  hasBonusTileInHand(): boolean {
    return this.hand.some((tile) => tile instanceof BonusTile);
  }

  removeFromHand(position: number): void {
    const tile = this.hand[position];
    if (tile instanceof BonusTile) {
      console.log("Drawing bonus itle!");
      this.revealBonusTileAndDrawReplacement();
    } else {
      this.discardToPile(position);
    }
  }

  discardToPile(position: number): Tile {
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

  drawFromWall(): void {
    const tile = this.gameHand.wall.draw();
    this.hand.push(tile);
    this.hand.sort((a, b) => a.toString().localeCompare(b.toString()));
  }

  revealBonusTileAndDrawReplacement(): void {
    const bonusTile = this.hand.find(
      (tile): tile is BonusTile => tile instanceof BonusTile
    );
    this.hand.splice(this.hand.indexOf(bonusTile), 1);
    this.bonusTiles.push(bonusTile);

    const replacementTile = this.gameHand.wall.drawReplacement();
    this.hand.push(replacementTile);
  }
}

class Round {
  prevailingWind: Wind;
}

export class Hand {
  readonly wall: Wall = new Wall();
  readonly players: SeatedPlayer[];
  readonly discardPile: Tile[] = [];
  readonly phases: HandPhase[];

  constructor(readonly prevailingWind: Wind) {
    this.players = [
      new SeatedPlayer(this, StandardMahjong.SUIT_EAST),
      new SeatedPlayer(this, StandardMahjong.SUIT_SOUTH),
      new SeatedPlayer(this, StandardMahjong.SUIT_WEST),
      new SeatedPlayer(this, StandardMahjong.SUIT_NORTH),
    ];

    this.phases = [new PostDrawPhase(this), new SecondPostDrawPhase(this)];

    for (const player of this.players) {
      for (let i = 0; i < 13; i++) {
        player.drawFromWall();
      }
    }
    this.players[0].drawFromWall();
  }

  getOrderedPlayersFrom(wind: Wind): SeatedPlayer[] {
    const index = this.players.findIndex((player) => player.wind === wind);
    return this.players.slice(index).concat(this.players.slice(0, index));
  }

  execute(): void {
    for (const phase of this.phases) {
      phase.execute();
    }
  }
}

export abstract class HandPhase {
  constructor(readonly hand: Hand) {}

  abstract execute(): void;
}

export class PostDrawPhase extends HandPhase {
  execute(): void {
    for (const player of this.hand.getOrderedPlayersFrom(
      StandardMahjong.SUIT_EAST
    )) {
      const bonusTileCount = player.hand.filter(
        (tile) => tile instanceof BonusTile
      ).length;
      for (let i = 0; i < bonusTileCount; i++) {
        player.revealBonusTileAndDrawReplacement();
      }
    }
  }
}

export class SecondPostDrawPhase extends PostDrawPhase {
  execute(): void {
    super.execute();
  }
}
