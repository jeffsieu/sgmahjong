import { MeshProps } from "react-three-fiber";
import { PlaneBufferGeometry, MeshStandardMaterial } from "three";
import { TURN_INDICATOR_HEIGHT, TURN_INDICATOR_WIDTH } from "../constants";
import { WithoutGeoMat } from "../object-props";
import { animateMaterial } from "./anim";

const PlayerTurnIndicator = (props: WithoutGeoMat<MeshProps>) => {
  const geometry = new PlaneBufferGeometry(
    TURN_INDICATOR_WIDTH,
    TURN_INDICATOR_HEIGHT
  );
  const material = new MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
  });
  animateMaterial(material);

  return <mesh geometry={geometry} material={material} {...props} />;
};

export default PlayerTurnIndicator;
