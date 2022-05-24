import { getValidWindowOfOpportunityActions } from '../game-state/action-generator';
import {
  DiscardTileAction,
  DrawTileAction,
  HandAction,
  RevealBonusTileThenDrawAction,
} from '../game-state/actions';
import type { Hand, ReadonlyPlayer } from '../game-state/game-state';
import {
  PostDrawPhase,
  ReadonlyHandPhase,
  ToDiscardPhase,
  ToDrawPhase,
  WindowOfOpportunityPhase,
} from '../game-state/phases';
import { BonusTile, HonorTile, TileInstance } from '../tiles';

export const getBestAction = (
  currentPhase: ReadonlyHandPhase,
  player: ReadonlyPlayer
): HandAction | null => {
  if (currentPhase instanceof PostDrawPhase && player.hasBonusTileInHand()) {
    const possibleActions = player.hand
      .filter(
        (tile): tile is TileInstance<BonusTile> =>
          tile.value instanceof BonusTile
      )
      .map((tile) => new RevealBonusTileThenDrawAction(player, tile))
      .filter((action) => currentPhase.canExecuteAction(action));
    if (possibleActions.length > 0) {
      return possibleActions[0];
    }
    return null;
  }

  if (currentPhase instanceof ToDrawPhase) {
    return new DrawTileAction(player);
  }

  if (currentPhase instanceof WindowOfOpportunityPhase) {
    const wopActions = getValidWindowOfOpportunityActions(player, currentPhase);
    const bestAction =
      wopActions.length > 0
        ? wopActions.reduce((bestAction, action) => {
            if (action.priority > bestAction.priority) {
              return action;
            }
            return bestAction;
          })
        : null;

    return bestAction;
  }

  if (currentPhase instanceof ToDiscardPhase) {
    if (player.hasBonusTileInHand()) {
      return new RevealBonusTileThenDrawAction(
        player,
        player.hand.find(
          (tile): tile is TileInstance<BonusTile> =>
            tile.value instanceof BonusTile
        )!
      );
    }
    return new DiscardTileAction(
      player,
      chooseBestTileToDiscard(currentPhase.hand, player)
    );
  }

  return null;
};

const chooseBestTileToDiscard = (
  currentHand: Hand,
  player: ReadonlyPlayer
): number => {
  const revealedTiles = currentHand.getRevealedTiles();

  // If hand contains honor tile with which a triple can no longer be found, discard it

  // Calculate tiles required to form a meld
  const honorTilesRequired: Map<HonorTile, number> = new Map();
  const handHonorTiles = player.hand
    .map((instance) => instance.value)
    .filter((tile): tile is HonorTile => tile instanceof HonorTile);
  for (const honorTile of handHonorTiles) {
    if (!honorTilesRequired.has(honorTile)) {
      honorTilesRequired.set(honorTile, 2);
    } else {
      honorTilesRequired.set(honorTile, honorTilesRequired.get(honorTile)! - 1);
    }
  }

  const revealedHonorTiles = revealedTiles
    .map((instance) => instance.value)
    .filter((tile): tile is HonorTile => tile instanceof HonorTile);

  const waitingHonorTiles = handHonorTiles.filter(
    (honorTile) => honorTilesRequired.get(honorTile)! > 0
  );

  for (const waitingHonorTile of waitingHonorTiles) {
    const requiredCount = honorTilesRequired.get(waitingHonorTile);
    const revealedCount = revealedHonorTiles.filter(
      (tile) => tile === waitingHonorTile
    ).length;
    if (revealedCount >= requiredCount!) {
      return player.hand.findIndex((tile) => tile.value === waitingHonorTile);
    }
  }

  return Math.floor(Math.random() * player.hand.length);
};
