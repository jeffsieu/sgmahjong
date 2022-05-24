import type { Hand } from '../game-state/game-state';
import {
  DoubleSide,
  PlaneBufferGeometry,
  Vector3,
  MeshStandardMaterial,
} from 'three';
import { TABLE_WIDTH, HAND_TO_TABLE_EDGE, WALL_TILT } from './constants';

import { DrawTileAction } from '../game-state/actions';
import { useContext, useEffect } from 'react';
import {
  HandPhase,
  PlayerControlledPhase,
  WindowOfOpportunityPhase,
} from '../game-state/phases';
import { StandardMahjong } from '../tiles';
import CenterTurnIndicator from './turn-indicator/CenterTurnIndicator';
import Walls from './Walls';
import DiscardPile from './DiscardPile';
import PlayerSide from './PlayerSide';
import { GameContext } from '../GameContext';
import Text from './Text';

export type TableProps = {
  hand: Hand;
  phase: HandPhase;
};

const Table = ({ hand, phase }: TableProps) => {
  const gameContext = useContext(GameContext);
  const onUpdate = gameContext.update;

  const geometry = new PlaneBufferGeometry(TABLE_WIDTH, TABLE_WIDTH, 1);
  const material = new MeshStandardMaterial({
    color: 0x005100,
    roughness: 1,
    metalness: 0,
    side: DoubleSide,
  });

  const discardPile = hand.discardPile;
  const wallStacks = hand.physicalWall.wallStacks;

  useEffect(() => {
    if (phase instanceof WindowOfOpportunityPhase) {
      setTimeout(() => {
        gameContext.update();
      }, 100);
    }
  }, [phase, gameContext]);

  return (
    <group>
      <mesh
        material={material}
        geometry={geometry}
        position={[0, 0, -0.01]}
        receiveShadow
      />
      {!(phase instanceof PlayerControlledPhase) && (
        <CenterTurnIndicator
          position={[0, 0, 0.01]}
          rotation={[0, 0, WALL_TILT]}
        />
      )}
      {phase instanceof WindowOfOpportunityPhase && (
        <Text
          text={`${5 - Math.floor((Date.now() - phase.startTime) / 1000)}`}
          size={4}
          color="white"
          monospace
        ></Text>
      )}
      <Walls
        wallStacks={wallStacks}
        onClick={() => {
          hand.tryExecuteAction(new DrawTileAction(hand.players[0]));
          onUpdate();
        }}
      />
      <DiscardPile tiles={discardPile} rotation={[0, 0, WALL_TILT]} />
      {hand.players.map((player, index) => {
        return (
          <PlayerSide
            key={index}
            player={player}
            phase={phase}
            showControls={player.wind === StandardMahjong.SUIT_EAST}
            hasTurnControl={
              phase instanceof PlayerControlledPhase && phase.player === player
            }
            playerUi={hand}
            position={new Vector3(0, -TABLE_WIDTH / 2 + HAND_TO_TABLE_EDGE, 0)
              .applyAxisAngle(new Vector3(0, 0, 1), (index * Math.PI) / 2)
              .toArray()}
            rotation={[0, 0, (index * Math.PI) / 2]}
          />
        );
      })}
    </group>
  );
};

export default Table;
