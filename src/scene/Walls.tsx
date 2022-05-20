import { useContext, useState } from "react";
import { GroupProps } from "react-three-fiber";
import { Vector3 } from "three";
import type { WallStack } from "../game-state/pre-hand";

import {
  TILE_WIDTH,
  CENTER_SQUARE_LENGTH,
  TILE_HEIGHT,
  WALL_TILT,
  WALL_GAP,
} from "./constants";
import { WithoutGeoMat } from "./object-props";
import { TooltipContext } from "./TooltipContext";
import WallMesh from "./WallMesh";
// import TooltipContent from "./TooltipContent.svelte";
// import WallMesh from "./WallMesh.svelte";

export type WallsProps = {
  wallStacks: WallStack[];
  onClick: (event: CustomEvent) => void;
};

const Walls = ({
  wallStacks,
  onClick,
  ...rest
}: WithoutGeoMat<GroupProps> & WallsProps) => {
  const tooltipContext = useContext(TooltipContext);

  const [highlight, setHighlight] = useState(false);

  const onPointerOver = () => {
    setHighlight(true);
    tooltipContext.setContent("Draw from wall");
  };

  const onPointerOut = () => {
    setHighlight(false);
    tooltipContext.setContent(null);
  };

  return (
    <group
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      {wallStacks.map((wallStack, index) => {
        return (
          <WallMesh
            key={index}
            highlight={highlight}
            wallStack={wallStack}
            position={new Vector3(
              -(
                ((wallStack.initialLength / 2) * TILE_WIDTH) / 2 -
                CENTER_SQUARE_LENGTH / 2 +
                WALL_GAP
              ),
              -(CENTER_SQUARE_LENGTH / 2 + TILE_HEIGHT / 2),
              0
            )
              .applyAxisAngle(
                new Vector3(0, 0, 1),
                (index * Math.PI) / 2 + WALL_TILT
              )
              .toArray()}
            rotation={new Vector3(
              0,
              0,
              (index * Math.PI) / 2 + WALL_TILT
            ).toArray()}
          />
        );
      })}
    </group>
  );
};

export default Walls;
