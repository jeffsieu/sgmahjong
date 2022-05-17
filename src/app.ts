import type { Canvas, OrbitControls, WebGLRenderer } from "svelthree";

export type CanvasContext = {
  getOrbitControls: () => OrbitControls;
  getCanvas: () => Canvas;
  getRenderer: () => WebGLRenderer;
};
