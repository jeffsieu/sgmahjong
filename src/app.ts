import type { Canvas, OrbitControls } from "svelthree";

export type CanvasContext = {
  getOrbitControls: () => OrbitControls;
  getCanvas: () => Canvas;
};
