import {HRBotTalkingTemplate} from "../templates/HRBotTalkingTemplate";
import {MenuPage} from "../../framework/MenuPage";

export class RecoveryKeyIntroViewModel {
  render() {
    const view = new HRBotTalkingTemplate();
    view.startWithScanLines = true;
    view.dialogueSequence = [
      `Next, you will create a Recovery Key for your account. This Key allows you to recover your account in the event that you lose access.`,
    ];
    view.actionOnSequenceEnd = () => {
      MenuPage.router.goto('Auth', 'signupRecoveryKeyCreation');
    }
    view.render();
  }
}