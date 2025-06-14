export class MenuWaitingOptions {
  constructor() {
    this.waitingAnimation = 'DEFAULT';
    this.waitingMessage = null;
    this.hasDoNotCloseMessage = true;
    this.headerBtnLabel = '';
    this.headerBtnShowBackIcon = false;
    this.headerBtnHandler = () => {};
    this.initPageCode = () => {};
  }
}