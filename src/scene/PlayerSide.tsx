import { Vector3 } from 'three';
import type { ReadonlyPlayer } from '../game-state/game-state';
import type { PlayerUI } from '../controls/hand-control';
import {
  TILE_HEIGHT,
  TILE_THICKNESS,
  TILE_WIDTH,
  TABLE_WIDTH,
  HAND_TO_TABLE_EDGE,
  TURN_INDICATOR_HEIGHT,
  TURN_INDICATOR_WIDTH,
  REVEALED_TILE_DISTANCE,
  CENTER_SQUARE_LENGTH,
  WALL_TILT,
} from './constants';

import PlayerHand from './PlayerHand';
import TileRow from './TileRow';
import Text from './Text';
import PlayerTurnIndicator from './turn-indicator/PlayerTurnIndicator';
import TextButton from './TextButton';
import PlayerSideButtons from './PlayerSideButtons';
import PlayerRevealedTiles from './PlayerRevealedTiles';
import {
  HandPhase,
  ToDiscardPhase,
  WindowOfOpportunityPhase,
} from '../game-state/phases';
import { getValidWindowOfOpportunityActions } from '../game-state/action-generator';
import {
  isChowAction,
  isKongAction,
  isMahjongAction,
  isPongAction,
  isSkipAction,
  SelfDrawMahjongAction,
  SkipWindowOfOpportunityAction,
} from '../game-state/actions';
import {} from '../tiles';
import { getWinningHand } from '../combis';
import { WinningHandType } from '../scoring/scoring';
import { WithoutGeoMat } from './object-props';
import { GroupProps } from 'react-three-fiber';
import { useContext, useEffect, useState } from 'react';
import { GameContext } from '../GameContext';

export type PlayerSideProps = {
  phase: HandPhase;
  player: ReadonlyPlayer;
  playerUi: PlayerUI;
  hasTurnControl: boolean;
  showControls: boolean;
};

const PlayerSide = ({
  phase,
  player,
  playerUi,
  hasTurnControl,
  showControls,
  ...rest
}: WithoutGeoMat<GroupProps> & PlayerSideProps) => {
  const gameContext = useContext(GameContext);
  const onUpdate = gameContext.update;

  const buttonSize = 1.1;

  const validWOPActions =
    phase instanceof WindowOfOpportunityPhase
      ? getValidWindowOfOpportunityActions(player, phase)
      : [];

  const canChow = validWOPActions.some(isChowAction);
  const canPong = validWOPActions.some(isPongAction);
  const canKong = validWOPActions.some(isKongAction);
  const canMahjong = validWOPActions.some(isMahjongAction);
  const canSkip = validWOPActions.some(isSkipAction);
  const chowActions = validWOPActions.filter(isChowAction).map((action) => ({
    name: action.meld.value.toString(),
    meld: action.meld,
    onClick: () => {
      phase.hand.tryExecuteAction(action);
      onUpdate();
    },
  }));

  const [showChowActions, setShowChowActions] = useState(false);

  const chowActionRows = [
    [],
    [
      {
        name: 'Back',
        show: true,
        onClick: () => {
          setShowChowActions(false);
        },
      },
    ],
  ];

  const regularActionRows = [
    [
      {
        name: 'Win',
        show: canMahjong,
        onClick: () => {
          phase.hand.tryExecuteAction(validWOPActions.find(isMahjongAction)!);
          onUpdate();
        },
      },
      {
        name: 'Skip',
        show: canSkip,
        onClick: () => {
          phase.hand.tryExecuteAction(
            new SkipWindowOfOpportunityAction(player)
          );
          onUpdate();
        },
      },
    ],
    [
      {
        name: 'Chow',
        show: canChow,
        onClick: () => {
          setShowChowActions(true);
        },
      },
    ],
    [
      {
        name: 'Kong',
        show: canKong,
        onClick: () => {
          phase.hand.tryExecuteAction(validWOPActions.find(isKongAction)!);
          onUpdate();
        },
      },
      {
        name: 'Pong',
        show: canPong,
        onClick: () => {
          phase.hand.tryExecuteAction(validWOPActions.find(isPongAction)!);
          onUpdate();
        },
      },
    ],
  ];
  const actionRows = showChowActions ? chowActionRows : regularActionRows;
  const latestDrawnTile =
    phase instanceof ToDiscardPhase ? phase.getLatestDrawnTile() : undefined;

  const selfDrawWinningHand =
    phase instanceof ToDiscardPhase && phase.player === player
      ? getWinningHand(
          player,
          [...player.hand].filter((tile) => tile !== latestDrawnTile),
          latestDrawnTile ?? null,
          WinningHandType.SelfDraw
        )
      : null;

  const canSelfDrawMahjong = selfDrawWinningHand !== null;

  useEffect(() => {
    if (!(phase instanceof WindowOfOpportunityPhase)) {
      setShowChowActions(false);
    }
  }, [phase]);

  return (
    <group {...rest}>
      {showControls &&
        showChowActions &&
        chowActions.map((action, index) => (
          <TileRow
            highlightOnHover
            tooltip={'Chow'}
            onClick={action.onClick}
            tiles={action.meld.tiles}
            faceUp
            position={new Vector3(
              0,
              -HAND_TO_TABLE_EDGE + TABLE_WIDTH / 2,
              TILE_THICKNESS / 2
            )
              .add(
                new Vector3(
                  -TILE_WIDTH * 3 -
                    (chowActions.length - index) * 3 * TILE_WIDTH -
                    ((chowActions.length - index - 1) * TILE_WIDTH) / 2 +
                    CENTER_SQUARE_LENGTH / 2,
                  -CENTER_SQUARE_LENGTH / 2 - 2 * TILE_HEIGHT,
                  0
                ).applyAxisAngle(new Vector3(0, 0, 1), WALL_TILT)
              )
              .toArray()}
            rotation={[0, 0, WALL_TILT]}
          />
        ))}
      {showControls &&
        phase instanceof WindowOfOpportunityPhase &&
        actionRows.map((actions, index) => (
          <PlayerSideButtons
            key={index}
            size={buttonSize}
            actions={actions}
            position={new Vector3(
              0,
              -HAND_TO_TABLE_EDGE + TABLE_WIDTH / 2,
              0.01
            )
              .add(
                new Vector3(
                  CENTER_SQUARE_LENGTH / 2,
                  -CENTER_SQUARE_LENGTH / 2 -
                    TILE_HEIGHT -
                    index * buttonSize * 3.5,
                  0
                ).applyAxisAngle(new Vector3(0, 0, 1), WALL_TILT)
              )
              .toArray()}
            rotation={[0, 0, WALL_TILT]}
          />
        ))}
      {showControls && canSelfDrawMahjong && (
        <TextButton
          text="Win"
          onClick={() => {
            if (selfDrawWinningHand === null) {
              return;
            }
            phase.hand.tryExecuteAction(
              new SelfDrawMahjongAction(player, selfDrawWinningHand)
            );
            onUpdate();
          }}
          size={1.5}
          position={[0, -TILE_THICKNESS / 4 - HAND_TO_TABLE_EDGE / 2, 0.02]}
        />
      )}
      {hasTurnControl && (
        <PlayerTurnIndicator
          position={[
            -(TABLE_WIDTH - TURN_INDICATOR_WIDTH) / 2,
            TURN_INDICATOR_HEIGHT / 2 - HAND_TO_TABLE_EDGE,
            0.01,
          ]}
        />
      )}
      <Text
        text={player.wind.name}
        size={3}
        color={0xffffff}
        position={[-TABLE_WIDTH / 2 + HAND_TO_TABLE_EDGE, 0, 0.02]}
      />
      <PlayerHand
        player={player}
        playerUi={playerUi}
        position={[0, 0, TILE_HEIGHT / 2]}
        canControl={showControls}
      />
      <PlayerRevealedTiles
        position={[-5 * TILE_WIDTH, REVEALED_TILE_DISTANCE, TILE_THICKNESS / 2]}
        bonusTiles={[...player.bonusTiles]}
        melds={[...player.melds]}
        player={player}
      />
    </group>
  );
};

export default PlayerSide;
