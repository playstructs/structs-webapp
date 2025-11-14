import {SUIInputStepper} from "./SUIInputStepper.js";
import {SUITooltip} from "./SUITooltip.js";
import {SUICheatsheet} from "./SUICheatsheet.js";
import {SUIOffcanvas} from "./SUIOffcanvas";

export class SUI {

  constructor() {
    this.inputStepper = new SUIInputStepper();
    this.tooltip = new SUITooltip();
    this.cheatsheet = new SUICheatsheet();
    this.offcanvas = new SUIOffcanvas();

    this.autoInitClasses = [
      this.inputStepper,
      this.tooltip,
      this.cheatsheet,
      this.offcanvas
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
