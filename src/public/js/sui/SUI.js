import {SUIInputStepper} from "./SUIInputStepper.js";
import {SUITooltip} from "./SUITooltip.js";

export class SUI {

  constructor() {
    this.autoInitClasses = [
      new SUIInputStepper(),
      new SUITooltip()
    ];
  }

  /**
   * Auto initialize all SUI features
   */
  init() {
    this.autoInitClasses.forEach(suiFeature => {
      suiFeature.init();
    });
  }

}
