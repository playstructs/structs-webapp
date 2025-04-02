import {SUIInputStepper} from "./SUIInputStepper.js";
import {SUITooltip} from "./SUITooltip.js";

export class SUI {

  constructor() {
    this.inputStepper = new SUIInputStepper();
    this.tooltip = new SUITooltip();

    this.autoInitClasses = [
      this.inputStepper,
      this.tooltip
    ];
  }

  /**
   * Auto initialize all SUI features
   */
  autoInitAll() {
    this.autoInitClasses.forEach(suiFeature => {
      suiFeature.autoInitAll();
    });
  }

}
