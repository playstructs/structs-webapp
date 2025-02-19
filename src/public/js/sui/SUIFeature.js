import {SUINotImplementedError} from "./SUINotImplementedError.js";

export class SUIFeature {

  /**
   * Auto initialize feature
   */
  init() {
    throw new SUINotImplementedError();
  }

}
