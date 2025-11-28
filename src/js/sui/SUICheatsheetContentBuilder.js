import {SUINotImplementedError} from "./SUINotImplementedError";
import {SUICheatsheetRenderer} from "./SUICheatsheetRenderer";

export class SUICheatsheetContentBuilder {

  constructor() {
    this.renderer = new SUICheatsheetRenderer();
  }

  /**
   * @param {object} dataset triggering element's data attributes
   * @return {string}
   */
  build(dataset) {
    throw new SUINotImplementedError(`build() not implemented for ${dataset.cheatsheetKey}`);
  }
}
