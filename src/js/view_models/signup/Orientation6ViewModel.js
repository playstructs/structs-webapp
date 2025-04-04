import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {MenuPage} from "../../framework/MenuPage";
import {OrientationStructDeployedTemplate} from "../templates/OrientationStructDeployedTemplate";

export class Orientation6ViewModel extends AbstractViewModel {

  render() {
    const view = new OrientationStructDeployedTemplate();

    view.bodyTextSequence = {
      0: `Galactic Codex Entry #2722`,
      1: `Status: <span class="sui-text-destructive">DISPUTED</span>`,
    };

    view.dialogueSequence = [
      `For this reason, Alpha mining operations are now conducted by a race of advanced machines known as
      <a 
        id="dialogueStructsHint" 
        class="sui-mod-secondary"
        href="javascript: void(0)" 
        data-sui-tooltip="A civilization of  machines, discovered approximately 1200 years ago."
      >Structs.</a>`,

      `Structs are not officially recognized as sentient lifeforms by the Alpha Star Council, granting them sole access to Alpha-laced worlds.`
    ];

    view.pageCodeSequence = {
      0: () => {
        MenuPage.sui.tooltip.init(document.getElementById('dialogueStructsHint'));
      }
    };

    view.actionOnSequenceEnd = () => {
      MenuPage.router.goto('Auth', 'orientation6');
    }

    view.render();
  }
}
