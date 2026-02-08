import {AbstractFactory} from "../framework/AbstractFactory";
import {Setting} from "../models/Setting";
import {Settings} from "../models/Settings";


export class SettingFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {Setting}
   */
  make(obj) {
    const setting = new Setting();
    Object.assign(setting, obj);
    return setting;
  }

  /**
   * @param {object[]} list
   * @return {Settings}
   */
  parseList(list) {
    const settings = new Settings();
    for (let i = 0; i < list.length; i++) {
      settings.add(this.make(list[i]));
    }
    return settings;
  }
}