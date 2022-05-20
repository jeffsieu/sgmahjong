import React, { Ref, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { Helmet } from "react-helmet";

import { TILE_HEIGHT } from "./scene/constants";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { useThree } from "react-three-fiber";
import { Object3D, PointLight, Vector3 } from "three";
import { getBestAction } from "./ai/game-ai";
import { STANDARD_GAME_RULES } from "./config/rules";
import { getValidWindowOfOpportunityActions } from "./game-state/action-generator";
import {
  SkipWindowOfOpportunityAction,
  CloseWindowOfOpportunityAction,
  FormMeldAction,
  MahjongAction,
} from "./game-state/actions";
import { Round } from "./game-state/game-state";
import {
  WindowOfOpportunityPhase,
  ToDrawPhase,
  ToDiscardPhase,
  PostDrawPhase,
  EndOfHandPhase,
} from "./game-state/phases";
import { MessageLogger } from "./message-logger";
import Table from "./scene/Table";
import { TileDebug } from "./tile-utils";
import { StandardMahjong } from "./tiles";
import TooltipContextWrapper from "./scene/TooltipContext";
import ContextBridgedCanvas from "./scene/ContextBridgedCanvas";
import { GameContext } from "./GameContext";
import { getWinningHandDoubles } from "./scoring/scoring";
import { Chow } from "./melds";

const CameraController = () => {
  const { camera, gl } = useThree();
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);

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

const currentRound = new Round(StandardMahjong.SUIT_EAST);
const currentHand = currentRound.getCurrentHand();
Object3D.DefaultUp.set(0, 0, 1);
currentHand.physicalWall.drawStartingHands();
// let currentHand = new DebugHand(StandardMahjong.SUIT_EAST, () => {});
const player = currentHand.players[0];
const logMessages = MessageLogger.getLogs();

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

  const cheat = () => {
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
      TileDebug.characters(9),
      TileDebug.characters(9),
      TileDebug.characters(9),
    ].forEach((tile) => player.hand.push(tile));
  };

  // cheat();
  // currentHand.setCurrentPhase(
  //   new WindowOfOpportunityPhase(
  //     currentHand,
  //     currentHand.getPlayerWithWind(StandardMahjong.SUIT_NORTH),
  //     TileDebug.characters(8)
  //   )
  // );

  // updateState();

  const invokeAI = (): boolean => {
    const currentPhase = currentHand.getCurrentPhase();
    let executed = false;
    for (const player of currentHand.players.filter(
      (player) => player.wind !== StandardMahjong.SUIT_EAST
    )) {
      const action = getBestAction(currentHand.getCurrentPhase(), player);
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

  const skipToMyTurn = () => {
    while (true) {
      let executed = invokeAI();
      const currentPhase = currentHand.getCurrentPhase();
      gameContext.update();
      if (currentPhase instanceof WindowOfOpportunityPhase) {
        if (
          getValidWindowOfOpportunityActions(player, currentPhase).filter(
            (action) => !(action instanceof SkipWindowOfOpportunityAction)
          ).length > 0
        ) {
          break;
        } else {
          currentHand.tryExecuteAction(new CloseWindowOfOpportunityAction());
          executed = true;
          gameContext.update();
        }
      }
      if (!executed) {
        console.debug("No actions executed for", currentPhase);
        break;
      } else {
        console.debug("Executed one action");
      }

      if (
        currentPhase instanceof ToDrawPhase &&
        currentPhase.player === player
      ) {
        break;
      }

      if (
        currentPhase instanceof ToDiscardPhase &&
        currentPhase.player === player
      ) {
        break;
      }

      if (currentPhase instanceof PostDrawPhase) {
        break;
      }
    }
    gameContext.update();
  };

  // const canvasContext: CanvasContext = {
  //   getOrbitControls: () => orbitControls,
  //   getCanvas: () => canvas,
  //   getRenderer: () => renderer,
  // };

  // setContext(KEY_CANVAS_CONTEXT, canvasContext);

  const interval = useRef<NodeJS.Timer | null>(null);

  const [state, setState] = useState(0);

  const gameContext = useMemo(
    () => ({
      update: () => {
        setState(state + 1);
      },
    }),
    [state]
  );

  useEffect(() => {
    const currentPhase = currentHand.getCurrentPhase();
    if (currentPhase instanceof WindowOfOpportunityPhase) {
      if (interval.current === null) {
        console.debug("MAKING A TIMER");
        interval.current = setInterval(() => {
          gameContext.update();
        }, 100);
        console.debug(interval);
        setTimeout(() => {
          if (interval.current) {
            clearInterval(interval.current);
          }
        }, STANDARD_GAME_RULES.windowOfOpportunityTime * 1000);
      } else if (
        Date.now() - currentPhase.startTime >
        STANDARD_GAME_RULES.windowOfOpportunityTime * 1000
      ) {
        console.debug("CLEARING INTERVAL");
        clearInterval(interval.current);
        interval.current = null;
        currentHand.tryExecuteAction(new CloseWindowOfOpportunityAction());
        console.debug("tried to execute!");
        gameContext.update();
      }
    } else if (interval.current !== null) {
      console.debug("CLEARING INTERVAL OUTSIDE");
      clearInterval(interval.current);
      interval.current = null;
    }
  }, [gameContext]);

  const aiInterval = setInterval(() => {
    invokeAI();
    if (currentHand.isFinished()) {
      clearInterval(aiInterval);
    }
  }, 1000);

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
              {/* <WebGLRenderer
                bind:this={renderer}
                {sti}
                sceneId="scene1"
                camId="cam1"
                enableShadowMap
                shadowMapType={PCFSoftShadowMap}
                config={{
                  antialias: true,
                  alpha: true,
                  devicePixelRatio: window.devicePixelRatio,
                  localClippingEnabled: true,
                }}
              /> */}
            </ContextBridgedCanvas>
          </TooltipContextWrapper>
        </GameContext.Provider>
      </div>
      <div id="ui">
        <div className="messages">
          <h3>Messages ({logMessages.length})</h3>
          <ul>
            {logMessages.map((logEntry) => (
              <li>{logEntry.message}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{currentPhase.name}</h2>
          <div>
            <h3>Dice roll results: {currentHand.diceRoll.resultSum}</h3>
          </div>
          Tiles left: {currentHand.wall.tiles.length}
          <button onClick={cheat}>Cheat</button>
          <button onClick={invokeAI}>Use AI</button>
          <button onClick={skipToMyTurn}>Skip to my turn</button>
          {currentPhase instanceof WindowOfOpportunityPhase && (
            <div>TIME LEFT: {Date.now() - currentPhase.startTime} ms</div>
          )}
          {currentPhase instanceof EndOfHandPhase && (
            <div>
              Winning hand score:{" "}
              {(() => {
                const winningHand = currentHand.getWinningHand();
                return winningHand
                  ? getWinningHandDoubles(winningHand)(STANDARD_GAME_RULES)
                  : 0;
              })()}
            </div>
          )}
          <div id="actions">
            {currentPhase instanceof WindowOfOpportunityPhase && (
              <button
                onClick={() => {
                  currentHand.tryExecuteAction(
                    new CloseWindowOfOpportunityAction()
                  );
                  gameContext.update();
                }}
              >
                Close window
              </button>
            )}
            {currentHand.players.slice(0, 1).map(
              (player, index) =>
                currentPhase instanceof WindowOfOpportunityPhase && (
                  <div key={index}>
                    <h3>Valid window actions ({player.wind.name})</h3>
                    {getValidWindowOfOpportunityActions(
                      player,
                      currentPhase
                    ).map((action) => (
                      <button
                        onClick={() => {
                          currentHand.tryExecuteAction(action);
                          gameContext.update();
                        }}
                      >
                        {action instanceof FormMeldAction && (
                          <div>
                            {action.meld instanceof Chow ? "Chow" : "Pong"} (
                            {action.meld.toString()}
                          </div>
                        )}
                        {action instanceof MahjongAction && <div>Mahjong</div>}
                      </button>
                    ))}
                  </div>
                )
            )}
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
      {/* <svelte:window on:resize={onWindowResize} /> */}
    </main>
  );
}

export default App;
