import { GroupProps } from 'react-three-fiber';
import { Kong, Meld, MeldInstance } from '../../melds';
import KongMesh from '../KongMesh';
import { WithoutGeoMat } from '../object-props';
import TileRow from '../TileRow';

export type MeldMeshProps = {
  meld: MeldInstance<Meld>;
};

const MeldMesh = (props: WithoutGeoMat<GroupProps> & MeldMeshProps) => {
  const { meld, ...rest } = props;

  if (meld.value instanceof Kong) {
    return (
      <group {...rest}>
        <KongMesh kong={meld as MeldInstance<Kong>}></KongMesh>
      </group>
    );
  } else {
    return (
      <group {...rest}>
        <TileRow faceUp tiles={meld.tiles}></TileRow>
      </group>
    );
  }
};

export default MeldMesh;
