import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class MenuWaitingViewModel extends AbstractViewModel {

  /**
   * @param {MenuWaitingOptions} options
   */
  constructor(options) {
    super();
    this.options = options;
  }

  render () {
    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn(
      this.options.headerBtnLabel,
      this.options.headerBtnShowBackIcon,
      this.options.headerBtnHandler
    );

    MenuPage.setPageTemplateContent(`
      <div class="login-activating-device-layout">
        <img src="/img/loading-3-dots.gif" class="loading-3-dots"  alt="3 dots loading animation"/>
        <div>
          ${this.options.waitingMessage}<br>
          <br>
          <span class="sui-text-warning">Do not close this screen.</span>
        </div>
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.options.initPageCode();
  }
}
