import {PlayerAddress} from "../models/PlayerAddress";

export class PlayerAddressFactory {
  make(obj) {
    const playerAddress = new PlayerAddress();
    Object.assign(playerAddress, obj);
    return playerAddress;
  }

  /**
   * @param {Object[]}list
   * @return {PlayerAddress[]}
   */
  parseList(list) {
    return list.map(this.make);
  }
}