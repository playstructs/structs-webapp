export class Settings {
  
  constructor() {
    this.settings = new Map();
  }

  /** @param {Setting} setting */
  add(setting) {
    this.settings.set(setting.name, setting);
  }

  /**
   * @param {string} settingName
   * @return {string|number|null}
   */
  get(settingName) {
    if (!this.settings.has(settingName)) {
     return null;
    }

    const value = this.settings.get(settingName).value;
    const parsedValue =  parseInt(value);

    return isNaN(parsedValue) ? value : parsedValue;
  }

}