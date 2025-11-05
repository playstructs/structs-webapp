import {HRBotTalkingTemplate} from "../templates/HRBotTalkingTemplate";
import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class Orientation8ViewModel extends AbstractViewModel {
  render() {
    const view = new HRBotTalkingTemplate();
    view.startWithScanLines = true;
    view.dialogueSequence = [
      `SN.CORPORATION accepts no responsibility for damages incurred during Alpha mining operations, including but not limited to...`,
      `...piracy, corporate espionage, raids, Alpha-tear events, acts of cosmic beings, interplanetary warf... <a id="seeFullMessageHint" class="sui-mod-secondary" href="javascript: void(0)" data-sui-tooltip="Insufficient Memory.">(See full message: 602,1023 pages)</a>`
    ];
    view.actionOnSequenceEnd = () => {
      MenuPage.router.goto('Auth', 'orientationEnd');
    }
    view.render();
  }
}