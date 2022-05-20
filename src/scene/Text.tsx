import { useEffect, useMemo, useState } from "react";
import { MeshProps } from "react-three-fiber";
import {
  Color,
  DoubleSide,
  MeshStandardMaterial,
  ShapeBufferGeometry,
} from "three";

import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { WithoutGeoMat } from "./object-props";

export type TextProps = {
  text: string;
  color: string | Color | number;
  size: number;
  onGeometry?: (loadedGeometry: ShapeBufferGeometry) => void;
};

const Text = ({
  text,
  color,
  size,
  onGeometry,
  ...rest
}: WithoutGeoMat<MeshProps> & TextProps) => {
  const [font, setFont] = useState<Font | null>(null);

  new FontLoader().load("Poppins_Regular.json", (loadedFont) => {
    setFont(loadedFont);
  });

  const geometry = useMemo(() => {
    return font
      ? new ShapeBufferGeometry(font.generateShapes(text, size))
      : undefined;
  }, [font, text, size]);

  useEffect(() => {
    if (geometry && onGeometry) {
      onGeometry(geometry);
    }
  }, [geometry, onGeometry]);

  const material = new MeshStandardMaterial({
    color: color,
    roughness: 1,
    metalness: 0,
    side: DoubleSide,
  });

  return (
    <mesh geometry={geometry} material={material} {...(font ? rest : [])} />
  );
};

export default Text;
