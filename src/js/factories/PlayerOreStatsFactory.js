import {PlayerOreStats} from "../models/PlayerOreStats";

export class PlayerOreStatsFactory {
  make(obj, playerId) {
    const player = new PlayerOreStats();

    if (!obj) {
      player.playerId = playerId;
      player.forfeited = 0;
      player.mined = 0;
      player.seized = 0;
    } else {
      Object.assign(player, obj);
    }

    return player;
  }
}