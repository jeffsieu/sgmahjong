import type { Meld } from "./melds";
import { BonusTile, SingaporeMahjong, StandardMahjong, Tile, Wind } from "./tiles";


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

export class SeatedPlayer {
  readonly flowers: Tile[] = [];
  readonly melds: Meld[] = [];
  readonly hand: Tile[] = [];

  constructor(readonly gameHand: Hand, readonly wind: Wind) {
  }

  hasFlowerInHand(): boolean {
    return this.hand.some(tile => tile instanceof BonusTile);
  }

  discard(position: number): Tile {
    const discarded = this.hand.splice(position, 1)[0];
    this.gameHand.discardPile.push(discarded);
    return discarded;
  }

  drawFromWall(): void {
    const tile = this.gameHand.wall.draw();
    this.hand.push(tile);
    this.hand.sort((a, b) => a.toString().localeCompare(b.toString()));
  }

  revealFlowerAndDrawReplacement(): void {
    const flowerToReveal = this.hand.find(tile => tile instanceof BonusTile);
    this.hand.splice(this.hand.indexOf(flowerToReveal), 1);
    this.flowers.push(flowerToReveal);

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

  constructor(readonly prevailingWind: Wind) {
    this.players = [
      new SeatedPlayer(this, StandardMahjong.SUIT_EAST),
      new SeatedPlayer(this, StandardMahjong.SUIT_SOUTH),
      new SeatedPlayer(this, StandardMahjong.SUIT_WEST),
      new SeatedPlayer(this, StandardMahjong.SUIT_NORTH),
    ];
    for (const player of this.players) {
      for (let i = 0; i < 13; i++) {
        player.drawFromWall();
      }
    }
    this.players[0].drawFromWall();
  }
}