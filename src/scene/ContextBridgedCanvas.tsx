import { useContextBridge } from '@react-three/drei';
import { Canvas, Props } from 'react-three-fiber';
import { GameContext } from '../GameContext';
import { TooltipContext } from './TooltipContext';

const ContextBridgedCanvas = (
  props: Props & React.RefAttributes<HTMLCanvasElement>
) => {
  const ContextBridge = useContextBridge(TooltipContext, GameContext);

  return (
    <Canvas>
      <ContextBridge>{props.children}</ContextBridge>
    </Canvas>
  );
};

export default ContextBridgedCanvas;
