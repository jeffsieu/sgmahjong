import { type Texture, TextureLoader } from "three";
import {
  type Tile,
  NumberedTile,
  StandardMahjong,
  HonorTile,
  FlowerTile,
  SingaporeMahjong,
} from "../tiles";

export const getTextureName = (tile: Tile | null): string => {
  if (tile === null) {
    return "Blank.png";
  }
  if (tile instanceof NumberedTile) {
    if (tile.suit === StandardMahjong.SUIT_BAMBOOS) {
      return `Sou${tile.value}.png`;
    } else if (tile.suit === StandardMahjong.SUIT_CHARACTERS) {
      return `Man${tile.value}.png`;
    } else if (tile.suit === StandardMahjong.SUIT_DOTS) {
      return `Pin${tile.value}.png`;
    }
  } else if (tile instanceof HonorTile) {
    if (tile.suit === StandardMahjong.SUIT_DRAGON_GREEN) {
      return "Hatsu.png";
    } else if (tile.suit === StandardMahjong.SUIT_DRAGON_RED) {
      return "Chun.png";
    } else if (tile.suit === StandardMahjong.SUIT_DRAGON_WHITE) {
      return "Haku.png";
    } else if (tile.suit === StandardMahjong.SUIT_EAST) {
      return "Ton.png";
    } else if (tile.suit === StandardMahjong.SUIT_SOUTH) {
      return "Nan.png";
    } else if (tile.suit === StandardMahjong.SUIT_WEST) {
      return "Shaa.png";
    } else if (tile.suit === StandardMahjong.SUIT_NORTH) {
      return "Pei.png";
    }
  } else {
    if (tile instanceof FlowerTile) {
      if (tile.suit === StandardMahjong.SUIT_FLOWER_1) {
        return `Flower1${tile.index + 1}.png`;
      } else {
        return `Flower2${tile.index + 1}.png`;
      }
    } else if (tile instanceof SingaporeMahjong.AnimalTile) {
      return `${tile.type}.png`;
    }
  }
  throw new Error(`Unknown tile type: ${tile}`);
};

const textureCache: Map<string, Texture> = new Map();

export const getTexture = (tile: Tile | null): Texture => {
  const textureName = getTextureName(tile);
  if (textureCache.has(textureName)) {
    return textureCache.get(textureName)!;
  }
  const texture = new TextureLoader().load(`tiles/${textureName}`);
  texture.anisotropy = 16;
  textureCache.set(textureName, texture);
  return texture;
};
