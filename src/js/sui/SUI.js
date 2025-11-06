import {SUIInputStepper} from "./SUIInputStepper.js";
import {SUITooltip} from "./SUITooltip.js";
import {SUICheatsheet} from "./SUICheatsheet.js";

export class SUI {

  constructor() {
    this.inputStepper = new SUIInputStepper();
    this.tooltip = new SUITooltip();
    this.cheatsheet = new SUICheatsheet();

    this.autoInitClasses = [
      this.inputStepper,
      this.tooltip,
      this.cheatsheet,
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
