import React, { Ref, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { Helmet } from 'react-helmet';

import { TILE_HEIGHT } from './scene/constants';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { useThree } from 'react-three-fiber';
import { Object3D, PointLight, Vector3 } from 'three';
import { getBestAction } from './ai/game-ai';
import { STANDARD_GAME_RULES } from './config/rules';
import { WindowOfOpportunityPhase, EndOfHandPhase } from './game-state/phases';
import { MessageLogger } from './message-logger';
import Table from './scene/Table';
import { TileDebug } from './tile-utils';
import { StandardMahjong } from './tiles';
import TooltipContextWrapper from './scene/TooltipContext';
import ContextBridgedCanvas from './scene/ContextBridgedCanvas';
import { GameContext } from './GameContext';
import { getWinningHandDoubleProviders } from './scoring/scoring';
import { ExposedKong, Kong } from './melds';
import { DebugHand } from './utils/game-utils';

const CameraController = () => {
  const { camera, gl } = useThree();
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);

    controls.zoomSpeed = 3;

    controls.minDistance = 3;
    controls.maxDistance = 20;

    camera.lookAt(new Vector3(0, TILE_HEIGHT / 2, 0));
    camera.position.set(0, -100, 75);

    controls.target.set(0, -50, 25);

    controls.update();

    gl.shadowMap.enabled = true;

    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  return null;
};

// const currentRound = new Round(StandardMahjong.SUIT_EAST);
// const currentHand = currentRound.getCurrentHand();
Object3D.DefaultUp.set(0, 0, 1);
// currentHand.physicalWall.drawStartingHands();
const currentHand = new DebugHand(StandardMahjong.SUIT_EAST, () => {});
const player = currentHand.players[0];
const logMessages = MessageLogger.getLogs();

const cheat = () => {
  console.log('cheating');
  player.hand.splice(0, player.hand.length);
  [
    TileDebug.characters(1),
    TileDebug.characters(1),
    TileDebug.characters(1),
    TileDebug.honor(StandardMahjong.SUIT_DRAGON_WHITE),
    TileDebug.honor(StandardMahjong.SUIT_DRAGON_WHITE),
    TileDebug.characters(5),
    TileDebug.characters(6),
    TileDebug.characters(7),
    TileDebug.characters(8),
    TileDebug.characters(8),
  ].forEach((tile) => player.hand.push(tile));
  const kongTiles = Array.from({ length: 4 }, () => TileDebug.characters(9));
  player.melds.push(new ExposedKong(new Kong(kongTiles[0].value), kongTiles));
  player.bonusTiles.push(TileDebug.flower(StandardMahjong.SUIT_FLOWER_1, 0));
  player.bonusTiles.push(TileDebug.flower(StandardMahjong.SUIT_FLOWER_2, 0));
};

cheat();
currentHand.setCurrentPhase(
  new WindowOfOpportunityPhase(
    currentHand,
    currentHand.getPlayerWithWind(StandardMahjong.SUIT_NORTH),
    TileDebug.honor(StandardMahjong.SUIT_DRAGON_WHITE)
  )
);

function App() {
  const light: Ref<PointLight> = useRef(null);

  useEffect(() => {
    // To ensure the camera shadows work
    // light.getLight().shadow.radius = 8;
    if (light.current) {
      const l = light.current;
      l.shadow.mapSize.width = 2048;
      l.shadow.mapSize.height = 2048;
      l.shadow.camera.near = 0.5;
      l.shadow.camera.far = 500;
    }
  }, [light]);

  const currentPhase = currentHand.getCurrentPhase();

  // const onWindowResize = () => {
  //   windowWidth = window.innerWidth;
  //   windowHeight = window.innerHeight;
  //   cameraAspect = windowWidth / windowHeight;

  //   canvas.doResize(windowWidth, windowHeight);
  // };

  useEffect(() => {}, []);

  const [state, setState] = useState(new Date());

  const gameContext = useMemo(
    () => ({
      update: () => {
        setState(new Date());
      },
      hand: currentHand,
    }),
    []
  );

  useEffect(() => {
    console.log('yikes');
    const invokeAI = (): boolean => {
      const currentPhase = currentHand.getCurrentPhase();
      console.log(currentPhase);
      let executed = false;
      for (const player of currentHand.players.filter(
        (player) => player.wind !== StandardMahjong.SUIT_EAST
      )) {
        const action = getBestAction(currentHand.getCurrentPhase(), player);
        if (currentHand.getCurrentPhase() instanceof WindowOfOpportunityPhase) {
          console.log('Trying to execute', action);
        }
        if (action !== null) {
          try {
            currentHand.tryExecuteAction(action);
            gameContext.update();
            executed = true;
            if (currentHand.getCurrentPhase() !== currentPhase) {
              return true;
            }
          } catch (e) {}
        }
      }

      return executed;
    };

    const aiInterval = setInterval(() => {
      console.log('Trying to invoke AI');
      invokeAI();
      if (currentHand.isFinished()) {
        if (aiInterval !== null) {
          clearInterval(aiInterval);
        }
      }
    }, 1000);

    return () => clearInterval(aiInterval);
  }, [gameContext]);

  return (
    <main>
      <div id="canvas-container">
        <GameContext.Provider value={gameContext}>
          <TooltipContextWrapper>
            <ContextBridgedCanvas>
              <perspectiveCamera zoom={1.75} />
              <ambientLight intensity={1.75} />
              <pointLight
                position={[0, 0, TILE_HEIGHT * 3]}
                intensity={0.25}
                castShadow
                ref={light}
              />
              <Table hand={currentHand} phase={currentPhase} />
              <CameraController />
            </ContextBridgedCanvas>
          </TooltipContextWrapper>
        </GameContext.Provider>
      </div>
      <div id="ui">
        <div id="top">
          <h2>{currentPhase.name}</h2>
          <h4>Dice roll results: {currentHand.diceRoll.resultSum}</h4>
          <h4>Tiles left: {currentHand.wall.tiles.length}</h4>
          {currentPhase instanceof EndOfHandPhase && (
            <div>
              Winning hand score:{' '}
              {(() => {
                const winningHand = currentHand.getWinningHand();
                return (
                  winningHand && (
                    <ul>
                      {getWinningHandDoubleProviders(winningHand)
                        .map((doubleProvider) => {
                          return doubleProvider(STANDARD_GAME_RULES);
                        })
                        .filter((double) => double.score > 0)
                        .map((double) => (
                          <li>
                            {double.name}: {double.score}
                          </li>
                        ))}
                    </ul>
                  )
                );
              })()}
            </div>
          )}
        </div>
        <div id="center">
          <div id="left">
            <h3>Messages ({logMessages.length})</h3>
            <ul>
              {logMessages.map((logEntry, index) => (
                <li key={index}>{logEntry.message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
    </main>
  );
}

export default App;
