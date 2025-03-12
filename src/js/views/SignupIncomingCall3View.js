import {HRBotTalkingTemplate} from "./templates/HRBotTalkingTemplate";
import {MenuPage} from "../framework/MenuPage";

export class SignupIncomingCall3View {
  render() {
    const view = new HRBotTalkingTemplate();
    view.dialogueSequence = [
      `<strong>SN.CORP:</strong> Greetings, SN.CORPORATION employee. I am your designated Synthetic Resources Officer.`,
      `I have been tasked with assisting you as you complete your <span class="sui-text-secondary">Employee Orientation.</span>`
    ];
    view.actionOnSequenceEnd = () => {
      MenuPage.router.goto('Auth', 'signupSetUsername');
    }
    view.render();
  }
}
