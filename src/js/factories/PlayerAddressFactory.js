import {PlayerAddress} from "../models/PlayerAddress";
import {AbstractFactory} from "../framework/AbstractFactory";

export class PlayerAddressFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {PlayerAddress}
   */
  make(obj) {
    const playerAddress = new PlayerAddress();
    Object.assign(playerAddress, obj);
    return playerAddress;
  }
}