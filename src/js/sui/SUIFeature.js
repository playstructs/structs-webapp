import {SUINotImplementedError} from "./SUINotImplementedError.js";

export class SUIFeature {

  init(featureElement) {
    throw new SUINotImplementedError(`init() not implemented for ${featureElement.id}`);
  }

  /**
   * Auto initialize feature
   */
  autoInitAll() {
    throw new SUINotImplementedError();
  }

}
