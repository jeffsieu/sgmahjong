export class PreGameDiceRoll {
  readonly results: [number, number, number];
  readonly resultSum: number;

  constructor() {
    this.results = [
      PreGameDiceRoll.rollDie(),
      PreGameDiceRoll.rollDie(),
      PreGameDiceRoll.rollDie(),
    ];

    this.resultSum = this.results.reduce((sum, result) => sum + result, 0);
  }

  static rollDie(): number {
    return Math.floor(Math.random() * 6) + 1;
  }
}

export class PhysicalWall {
  readonly wallStacks: WallStack[];
  private startWallStackIndex: number;
  private endWallStackIndex: number;
  private startingWallStackPopAmount: number;

  static readonly TO_DRAW = 13 * 4 + 1;

  constructor(readonly diceRoll: PreGameDiceRoll) {
    this.wallStacks = [
      new WallStack(19 * 2),
      new WallStack(18 * 2),
      new WallStack(19 * 2),
      new WallStack(18 * 2),
    ];

    this.endWallStackIndex = (diceRoll.resultSum + 4 - 1) % 4;
    this.startWallStackIndex = (this.endWallStackIndex + 4 - 1) % 4;
    // Leave x many pairs, where x is the starting dice roll
    this.startingWallStackPopAmount =
      this.wallStacks[this.startWallStackIndex].initialLength -
      this.diceRoll.resultSum * 2;
  }

  drawStartingHands(): void {
    this.popBack(this.startingWallStackPopAmount);
    this.popFront(PhysicalWall.TO_DRAW - this.startingWallStackPopAmount);
  }

  popFront(count: number = 1): void {
    while (count > 0) {
      const frontWall = this.wallStacks[this.startWallStackIndex];
      const poppedCount = Math.min(count, frontWall.getTileCount());
      frontWall.popFront(poppedCount);
      count -= poppedCount;
      if (frontWall.getTileCount() === 0) {
        this.startWallStackIndex = (this.startWallStackIndex + 4 - 1) % 4;
      }
    }
  }

  popBack(count: number = 1): void {
    while (count > 0) {
      const backWall = this.wallStacks[this.endWallStackIndex];
      const poppedCount = Math.min(count, backWall.getTileCount());
      backWall.popBack(poppedCount);
      count -= poppedCount;
      if (backWall.getTileCount() === 0) {
        this.endWallStackIndex = (this.endWallStackIndex + 1) % 4;
      }
    }
  }
}

export class WallStack {
  private start: number = 0;
  private end: number = this.initialLength - 1;

  constructor(readonly initialLength: number) {}

  popFront(count: number = 1): void {
    this.start += count;
  }

  popBack(count: number = 1): void {
    this.end -= count;
  }

  getStart(): number {
    return this.start;
  }

  getEnd(): number {
    return this.end;
  }

  getTileCount(): number {
    return this.end - this.start + 1;
  }

  getLengthInTiles(): number {
    return Math.ceil(this.getTileCount() / 2);
  }
}
