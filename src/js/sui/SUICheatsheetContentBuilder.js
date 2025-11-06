import {SUINotImplementedError} from "./SUINotImplementedError";
import {SUICheatsheetRenderer} from "./SUICheatsheetRenderer";

export class SUICheatsheetContentBuilder {

  constructor() {
    this.renderer = new SUICheatsheetRenderer();
  }

  /**
   * @param {string} cheatsheetKey
   * @return {string}
   */
  build(cheatsheetKey) {
    throw new SUINotImplementedError(`build() not implemented for ${cheatsheetKey}`);
  }
}
