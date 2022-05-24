import { useState } from 'react';
import { GroupProps } from 'react-three-fiber';
import { Vector3 } from 'three';
import { WithoutGeoMat } from './object-props';
import TextButton from './TextButton';

export type ButtonAction = {
  name: string;
  show: boolean;
  onClick: () => void;
};

export type PlayerSideButtonsProps = {
  size: number;
  actions: ButtonAction[];
};

const PlayerSideButtons = ({
  size,
  actions,
  ...rest
}: WithoutGeoMat<GroupProps> & PlayerSideButtonsProps) => {
  const spacing = size / 2;

  const [buttonWidths, setButtonWidths] = useState(
    Array.from({ length: actions.length }, () => 0)
  );

  const [positions, setPositions] = useState(
    Array.from({ length: actions.length }, () => new Vector3())
  );

  const getTotalWidth = (): number => {
    return (
      actions
        .map((_, index) => buttonWidths[index])
        .reduce((totalWidth, currWidth) => totalWidth + currWidth, 0) +
      spacing * (actions.length - 1)
    );
  };

  return (
    <group {...rest}>
      {actions.map((action, index) => (
        <TextButton
          key={index}
          visible={action.show}
          size={size}
          alignTop
          alignLeft
          text={action.name}
          onClick={action.onClick}
          position={positions[index]}
          onLoad={(width) => {
            if (width !== buttonWidths[index]) {
              buttonWidths[index] = width;

              let offset = 0;
              const totalWidth = getTotalWidth();

              for (let i = 0; i < actions.length; i++) {
                positions[i] = new Vector3(offset - totalWidth, 0, 0.01);
                offset += buttonWidths[i] + spacing;
              }
              setButtonWidths([...buttonWidths]);
              setPositions([...positions]);
            }
          }}
        />
      ))}
    </group>
  );
};

export default PlayerSideButtons;
