import {HRBotTalkingTemplate} from "../templates/HRBotTalkingTemplate";
import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class IncomingCall3ViewModel extends AbstractViewModel {
  render() {
    const view = new HRBotTalkingTemplate();
    view.dialogueSequence = [
      `<strong>SN.CORP:</strong> Greetings, SN.CORPORATION employee. I am your designated Synthetic Resources Officer.`,
      `I have been tasked with assisting you as you complete your <a id="employeeOrientationHint" class="sui-mod-secondary" href="javascript: void(0)" data-sui-tooltip="Failure to complete Employee Orientation may result in serious injury or death.">Employee Orientation.</a>`
    ];
    view.actionOnSequenceEnd = () => {
      MenuPage.router.goto('Auth', 'signupSetUsername');
    }
    view.initPageCode = function () {
      if (this.dialogueIndex === 1) {
        MenuPage.sui.tooltip.init(document.getElementById('employeeOrientationHint'));
      }
    };
    view.render();
  }
}
