import {PlayerAddressPending} from "../models/PlayerAddressPending";

export class PlayerAddressPendingFactory {

  /**
   * @param {Object} obj
   * @return {PlayerAddressPending}
   */
  make(obj) {
    const playerAddressPending = new PlayerAddressPending();
    Object.assign(playerAddressPending, obj);
    return playerAddressPending;
  }
}