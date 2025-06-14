import {Guild} from "../models/Guild";
import {AbstractFactory} from "../framework/AbstractFactory";

export class GuildFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {Guild}
   */
  make(obj) {
    const guild = new Guild();
    Object.assign(guild, obj);
    return guild;
  }
}