import { useContext, useMemo } from 'react';
import { GroupProps } from 'react-three-fiber';
import { STANDARD_GAME_RULES } from '../config/rules';
import { ReadonlyPlayer } from '../game-state/game-state';
import { GameContext } from '../GameContext';
import { MeldInstance, Meld } from '../melds';
import { TileInstance, BonusTile, StandardMahjong } from '../tiles';
import { TILE_WIDTH } from './constants';
import MeldMesh from './melds/MeldMesh';
import { WithoutGeoMat } from './object-props';
import TileRow from './TileRow';
import { TooltipContext } from './TooltipContext';

export type PlayerRevealedTilesProps = {
  player: ReadonlyPlayer;
  bonusTiles: TileInstance<BonusTile>[];
  melds: MeldInstance<Meld>[];
};

const PlayerRevealedTiles = (
  props: WithoutGeoMat<GroupProps> & PlayerRevealedTilesProps
) => {
  const gameContext = useContext(GameContext);
  const tooltipContext = useContext(TooltipContext);
  const { bonusTiles, melds, player, ...rest } = props;

  // Width of all revealed tiles put together
  const totalTileWidth = useMemo(() => {
    return (
      bonusTiles.length +
      melds.map((meld) => meld.revealedTileWidth).reduce((a, b) => a + b, 0)
    );
  }, [bonusTiles, melds]);

  const meldOffsets = useMemo(() => {
    let currOffset = bonusTiles.length;
    const offsets = [];
    for (const meld of melds) {
      offsets.push(currOffset);
      currOffset += meld.revealedTileWidth;
    }
    return offsets;
  }, [bonusTiles, melds]);

  if (player.wind === StandardMahjong.SUIT_EAST) {
    console.log(meldOffsets);
    console.log(melds.map((meld) => meld.revealedTileWidth));
  }

  const bonusTilesDoubles = useMemo(() => {
    return bonusTiles
      .map(
        (tile) =>
          tile.value.resolveWithWind(
            gameContext.hand!.prevailingWind,
            player.wind
          )(STANDARD_GAME_RULES).score
      )
      .reduce((a, b) => a + b, 0);
  }, [bonusTiles, gameContext, player]);

  const onBonusTilesPointerOver = () => {
    tooltipContext.setContent(`${bonusTilesDoubles} tai`);
  };

  const onBonusTilesPointerOut = () => {
    tooltipContext.setContent(null);
  };

  return (
    <group {...rest}>
      <TileRow
        onPointerOver={onBonusTilesPointerOver}
        onPointerOut={onBonusTilesPointerOut}
        highlightOnHover
        tiles={bonusTiles}
        faceUp={true}
        position={[
          ((bonusTiles.length - totalTileWidth) / 2) * TILE_WIDTH,
          0,
          0,
        ]}
      />
      {melds.map((meld, index) => (
        <MeldMesh
          key={index}
          meld={meld}
          position={[
            (meldOffsets[index] +
              meld.revealedTileWidth / 2 -
              totalTileWidth / 2) *
              TILE_WIDTH,
            0,
            0,
          ]}
        />
      ))}
    </group>
  );
};

export default PlayerRevealedTiles;
