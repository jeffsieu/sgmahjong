import {
  FlowerTile,
  NumberedTile,
  SingaporeMahjong,
  StandardMahjong,
  Tile,
} from './tiles';

const characters = [...'🀇🀈🀉🀊🀋🀌🀍🀎🀏'];
const bamboos = [...'🀐🀑🀒🀓🀔🀕🀖🀗🀘'];
const dots = [...'🀙🀚🀛🀜🀝🀞🀟🀠🀡'];
const flowers1 = [...'🀢🀣🀤🀥'];
const flowers2 = [...'🀦🀧🀨🀩'];

export const tileToChar = (tile: Tile): string => {
  if (tile instanceof NumberedTile) {
    if (tile.suit === StandardMahjong.SUIT_CHARACTERS) {
      return characters[tile.value - 1];
    } else if (tile.suit === StandardMahjong.SUIT_BAMBOOS) {
      return bamboos[tile.value - 1];
    } else if (tile.suit === StandardMahjong.SUIT_DOTS) {
      return dots[tile.value - 1];
    }
  } else {
    if (tile.suit === StandardMahjong.SUIT_NORTH) {
      return '🀃';
    } else if (tile.suit === StandardMahjong.SUIT_EAST) {
      return '🀀';
    } else if (tile.suit === StandardMahjong.SUIT_SOUTH) {
      return '🀁';
    } else if (tile.suit === StandardMahjong.SUIT_WEST) {
      return '🀂';
    } else if (tile.suit === StandardMahjong.SUIT_DRAGON_GREEN) {
      return '🀅';
    } else if (tile.suit === StandardMahjong.SUIT_DRAGON_WHITE) {
      return '🀆';
    } else if (tile.suit === StandardMahjong.SUIT_DRAGON_RED) {
      return '🀄';
    } else if (tile instanceof FlowerTile) {
      if (tile.suit === StandardMahjong.SUIT_FLOWER_1) {
        return flowers1[tile.index];
      } else if (tile.suit === StandardMahjong.SUIT_FLOWER_2) {
        return flowers2[tile.index];
      }
    } else if (tile instanceof SingaporeMahjong.AnimalTile) {
      if (tile.type === 'Cat') {
        return '🐈';
      } else if (tile.type === 'Centipede') {
        return '🐛';
      } else if (tile.type === 'Chicken') {
        return '🐓';
      } else if (tile.type === 'Mouse') {
        return '🐁';
      }
    }
  }
  throw new Error(`Unknown tile: ${tile}`);
};
