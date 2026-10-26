import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {ConfirmTemplate} from "../templates/ConfirmTemplate";
import {TutorialMode} from "../../tutorial/TutorialMode";

/**
 * Confirms replaying Combat Training from the Account menu.
 */
export class AccountStartTutorialViewModel extends AbstractViewModel {

  render() {
    const view = new ConfirmTemplate();

    view.headerBtnLabel = 'Combat Tutorial';
    view.headerShowBackBtn = true;
    view.headerBackBtnHandler = () => MenuPage.router.goto('Account', 'index');

    view.messageHeaderColorClass = 'sui-mod-warning';
    view.messageHeaderIconClass = 'icon-alert';
    view.messageHeaderText = 'Start Tutorial?';
    view.messageBody1HTML = 'Your Structs will continue to operate normally in the background. You can exit the tutorial at any time from the main menu.';

    view.confirmBtn1Enabled = true;
    view.confirmBtn1Label = 'Start Tutorial';
    view.confirmBtn1ColorClass = 'sui-mod-primary';

    view.confirmBtn2Enabled = true;
    view.confirmBtn2Label = 'Cancel';
    view.confirmBtn2ColorClass = 'sui-mod-destructive';

    view.initPageCode = () => {
      document.getElementById(view.confirmBtn1Id).addEventListener('click', () => {
        TutorialMode.launch();
      });
      document.getElementById(view.confirmBtn2Id).addEventListener('click', () => {
        MenuPage.router.goto('Account', 'index');
      });
    };

    view.render();
  }
}
