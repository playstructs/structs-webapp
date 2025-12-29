import {AbstractFactory} from "../framework/AbstractFactory";
import {Fleet} from "../models/Fleet";

export class FleetFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {Fleet}
   */
  make(obj) {
    const fleet = new Fleet();
    Object.assign(fleet, obj);
    return fleet;
  }
}