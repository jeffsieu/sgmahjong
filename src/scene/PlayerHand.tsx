import { BonusTile, TileInstance } from '../tiles';
import {
  TILE_HEIGHT,
  TILE_THICKNESS,
  TILE_WIDTH,
  DISCARD_TILE_TILT,
} from './constants';

import gsap from 'gsap';
import type { ReadonlyPlayer } from '../game-state/game-state';
import type { PlayerUI } from '../controls/hand-control';
import { MessageLogger, PlayerLogEntry } from '../message-logger';
import {
  DiscardTileAction,
  RevealBonusTileThenDrawAction,
} from '../game-state/actions';
import { WithoutGeoMat } from './object-props';
import { GroupProps, ThreeEvent } from 'react-three-fiber';
import TileMesh from './TileMesh';
import { useContext } from 'react';
import { TooltipContext } from './TooltipContext';
import { GameContext } from '../GameContext';

export type PlayerHandProps = {
  player: ReadonlyPlayer;
  playerUi: PlayerUI;
  canControl: boolean;
};

const PlayerHand = ({
  player,
  playerUi,
  canControl,
  ...rest
}: WithoutGeoMat<GroupProps> & PlayerHandProps) => {
  const gameContext = useContext(GameContext);

  const hoveredTiles = new Set();
  const tooltipContext = useContext(TooltipContext);

  const updateTooltip = () => {
    const hoveredTile =
      hoveredTiles.size > 0 ? hoveredTiles.values().next().value : null;
    const hoveredTileTooltip = hoveredTile
      ? hoveredTile.value instanceof BonusTile
        ? 'Reveal'
        : 'Discard'
      : null;
    if (canControl) {
      if (hoveredTileTooltip) {
        tooltipContext.setContent(hoveredTileTooltip);
      } else {
        tooltipContext.setContent(null);
      }
    }
  };

  const onTilePointerOver =
    (position: number) =>
    (event: ThreeEvent<PointerEvent>): void => {
      if (!canControl) {
        return;
      }

      const tileObject = event.object;
      if (tileObject.parent) {
        gsap.to(tileObject.parent.position, {
          duration: 0.3,
          y:
            (Math.cos(DISCARD_TILE_TILT) *
              Math.sqrt(TILE_HEIGHT ** 2 + TILE_THICKNESS ** 2)) /
            2,
          z:
            (Math.sin(DISCARD_TILE_TILT) *
              Math.sqrt(TILE_HEIGHT ** 2 + TILE_THICKNESS ** 2)) /
              2 -
            TILE_HEIGHT / 2,
          ease: 'power3.out',
        });
        gsap.to(tileObject.parent.rotation, {
          duration: 0.3,
          x: DISCARD_TILE_TILT,
          ease: 'power3.out',
        });
      }
      hoveredTiles.add(player.hand[position]);
      updateTooltip();
    };

  const onTilePointerOut =
    (position: number) =>
    (event: ThreeEvent<PointerEvent>): void => {
      if (!canControl) {
        return;
      }
      const tileObject = event.object;
      if (tileObject.parent) {
        gsap.to(tileObject.parent.position, {
          duration: 0.3,
          y: 0,
          z: 0,
          ease: 'power3.out',
        });
        gsap.to(tileObject.parent.rotation, {
          duration: 0.3,
          x: Math.PI / 2,
          ease: 'power3.out',
        });
      }

      hoveredTiles.delete(player.hand[position]);
      updateTooltip();
    };

  const onTileClick =
    (position: number) =>
    (event: ThreeEvent<MouseEvent>): void => {
      if (!canControl) {
        return;
      }
      try {
        const tile = player.hand[position];
        if (tile.value instanceof BonusTile) {
          playerUi.tryExecuteAction(
            new RevealBonusTileThenDrawAction(
              player,
              tile as TileInstance<BonusTile>
            )
          );
        } else {
          playerUi.tryExecuteAction(new DiscardTileAction(player, position));
        }
      } catch (error: any) {
        MessageLogger.log(new PlayerLogEntry(player, error.message));
      } finally {
        gameContext.update();
      }
    };

  return (
    <group {...rest}>
      {player.hand.map((tile, index) => (
        <TileMesh
          key={tile.value.toString() + index}
          tile={tile}
          position={[(index - player.hand.length / 2 + 0.5) * TILE_WIDTH, 0, 0]}
          rotation={[Math.PI / 2, -Math.PI, 0]}
          onPointerOver={onTilePointerOver(index)}
          onPointerOut={onTilePointerOut(index)}
          onClick={onTileClick(index)}
          hidden={!canControl}
        />
      ))}
    </group>
  );
};

export default PlayerHand;
