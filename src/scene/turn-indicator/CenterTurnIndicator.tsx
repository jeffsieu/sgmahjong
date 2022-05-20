import { MeshProps } from "react-three-fiber";
import { PlaneBufferGeometry, MeshStandardMaterial } from "three";
import { CENTER_SQUARE_LENGTH } from "../constants";
import { WithoutGeoMat } from "../object-props";
import { animateMaterial } from "./anim";

const CenterTurnIndicator = (props: WithoutGeoMat<MeshProps>) => {
  const geometry = new PlaneBufferGeometry(
    CENTER_SQUARE_LENGTH,
    CENTER_SQUARE_LENGTH
  );
  const material = new MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
  });
  animateMaterial(material);

  return <mesh geometry={geometry} material={material} {...props} />;
};

export default CenterTurnIndicator;
