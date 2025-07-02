import {MenuPage} from "../framework/MenuPage";

export class MenuWaitingOptions {
  constructor() {
    this.navItemId = MenuPage.navItemAccountId
    this.waitingAnimation = 'DEFAULT';
    this.waitingMessage = null;
    this.hasDoNotCloseMessage = true;
    this.headerBtnLabel = '';
    this.headerBtnShowBackIcon = false;
    this.headerBtnHandler = () => {};
    this.initPageCode = () => {};
  }
}