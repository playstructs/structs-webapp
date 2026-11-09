import {PlayerOreStats} from "../models/PlayerOreStats";
import {toBase, toExact} from "../util/Units";

export class PlayerOreStatsFactory {
  make(obj, playerId) {
    const player = new PlayerOreStats();

    if (!obj) {
      player.player_id = playerId;
      player.forfeited = 0;
      player.forfeited_p = '0';
      player.mined = 0;
      player.mined_p = '0';
      player.seized = 0;
      player.seized_p = '0';
    } else {
      Object.assign(player, obj);
      player.forfeited_p = toExact(toBase(obj.forfeited_p) ?? toBase(obj.forfeited) ?? 0n);
      player.mined_p = toExact(toBase(obj.mined_p) ?? toBase(obj.mined) ?? 0n);
      player.seized_p = toExact(toBase(obj.seized_p) ?? toBase(obj.seized) ?? 0n);
      player.forfeited = Number(player.forfeited_p);
      player.mined = Number(player.mined_p);
      player.seized = Number(player.seized_p);
    }

    return player;
  }
}
