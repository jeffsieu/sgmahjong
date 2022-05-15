// IN CENTIMETRES
export const TILE_WIDTH = 2.6;
export const TILE_HEIGHT = 3.7;
export const TILE_THICKNESS = 1.2;
export const TABLE_WIDTH = 88;
export const WALL_GAP = 0.5 * TILE_WIDTH;
export const HAND_TO_TABLE_EDGE = TILE_THICKNESS * 4;
export const DISCARD_PILE_ROW_LENGTH = 9;
export const CENTER_SQUARE_LENGTH = (DISCARD_PILE_ROW_LENGTH + 2) * TILE_WIDTH;
export const WALL_TILT = (10 * Math.PI) / 180;
export const TURN_INDICATOR_WIDTH = TABLE_WIDTH * 0.8;
export const REVEALED_TILE_DISTANCE = TILE_HEIGHT * 2;
export const TURN_INDICATOR_HEIGHT =
  REVEALED_TILE_DISTANCE + TILE_HEIGHT / 2 + HAND_TO_TABLE_EDGE * 2;
export const DISCARD_TILE_TILT = (60 * Math.PI) / 180;
export const TILE_COLOR_FACE = 0xf8f0e3;
export const KEY_CANVAS_CONTEXT = Symbol();
export const KEY_TOOLTIP_CONTEXT = Symbol();
