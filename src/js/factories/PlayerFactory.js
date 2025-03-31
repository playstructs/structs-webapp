import {Player} from "../models/Player";

export class PlayerFactory {
  make(obj) {
    const player = new Player();
    Object.assign(player, obj);
    return player;
  }
}