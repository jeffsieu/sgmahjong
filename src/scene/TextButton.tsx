import {
  MeshBasicMaterial,
  PlaneBufferGeometry,
  ShapeBufferGeometry,
  Vector3,
} from "three";

import Text from "./Text";
import gsap from "gsap";
import { useMemo, useState } from "react";
import { MeshProps } from "react-three-fiber";

export type TextButtonProps = {
  text: string;
  size: number;
  verticalPadding?: number;
  horizontalPadding?: number;
  alignTop?: boolean;
  alignLeft?: boolean;
  onClick: () => void;
  onLoad?: (width: number) => void;
};

const TextButton = ({
  text,
  size,
  verticalPadding = size,
  horizontalPadding = size * 1.5,
  alignTop = false,
  alignLeft = false,
  onClick,
  onLoad = () => {},
  ...rest
}: MeshProps & TextButtonProps) => {
  const [geometry, setGeometry] = useState(new PlaneBufferGeometry(0, 0));
  const [isGeometryLoaded, setGeometryLoaded] = useState(false);

  const [textPosition, setTextPosition] = useState(new Vector3());

  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
      }),
    []
  );

  console.log("rest", rest);

  const onTextGeometryLoaded = (textGeometry: ShapeBufferGeometry) => {
    if (isGeometryLoaded) {
      return;
    }
    setGeometryLoaded(true);
    textGeometry.computeBoundingBox();
    const boundingBox = textGeometry.boundingBox!;

    const width = boundingBox.max.x - boundingBox.min.x + horizontalPadding * 2;
    const height = size + verticalPadding * 2;

    const newGeometry = new PlaneBufferGeometry(width, height);
    const newTextPosition = new Vector3(
      -boundingBox.max.x / 2,
      -boundingBox.max.y / 2,
      0.01
    );

    if (alignTop) {
      newGeometry.translate(0, -height / 2, 0);
      newTextPosition.add(new Vector3(0, -height / 2, 0));
    }

    if (alignLeft) {
      newGeometry.translate(width / 2, 0, 0);
      newTextPosition.add(new Vector3(width / 2, 0, 0));
    }

    setGeometry(newGeometry);
    setTextPosition(newTextPosition);
  };

  const onPointerOut = () => {
    gsap.to(material, {
      opacity: 0.5,
      duration: 0.2,
    });
  };

  const onPointerOver = () => {
    gsap.to(material, {
      opacity: 1,
      duration: 0.2,
    });
  };

  // const getWidth = () => {
  //   return geometry.parameters.width;
  // };

  // const getHeight = () => {
  //   return geometry.parameters.height;
  // };

  return (
    <mesh
      geometry={geometry}
      material={material}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      {...rest}
      onClick={() => {
        console.log(text);
        onClick();
      }}
      castShadow
    >
      <Text
        text={text}
        position={textPosition.toArray()}
        onGeometry={(textGeometry) => {
          onTextGeometryLoaded(textGeometry);
          onLoad(geometry.parameters.width);
        }}
        color={0x012101}
        size={size}
      />
    </mesh>
  );
};

export default TextButton;
