import { ConcealedKong, ExposedKong } from '../melds';
import { TILE_THICKNESS } from './constants';
import TileRow from './TileRow';

export type KongMeshProps = {
  kong: ConcealedKong | ExposedKong;
};

const KongMesh = (props: KongMeshProps) => {
  const { kong } = props;

  if (kong instanceof ConcealedKong) {
    return (
      <group>
        <TileRow
          tiles={[kong.tiles[3]]}
          faceUp
          position={[0, 0, TILE_THICKNESS]}
        />
        <TileRow tiles={kong.tiles.slice(0, 3)} faceUp />
      </group>
    );
  } else {
    return <TileRow tiles={kong.tiles} faceUp />;
  }
};

export default KongMesh;
