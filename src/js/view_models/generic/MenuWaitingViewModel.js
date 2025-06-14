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

  renderWaitingAnimation() {
    switch (this.options.waitingAnimation) {
      case 'ALPHA_TRANSFER':
        return `<img src="/img/alpha-transfer.gif" class="alpha-transfer-animation"  alt="alpha transferring from one player to another animation"/>`;
      default:
        return `<img src="/img/loading-3-dots.gif" class="loading-3-dots"  alt="3 dots loading animation"/>`;
    }
  }

  renderWaitingMessage() {
    return this.options.waitingMessage ? this.options.waitingMessage : '';
  }

  renderDoNotCloseWarning() {
    return this.options.hasDoNotCloseMessage
      ? `<span class="sui-text-warning">Do not close this screen.</span>`
      : '';
  }

  render () {
    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn(
      this.options.headerBtnLabel,
      this.options.headerBtnShowBackIcon,
      this.options.headerBtnHandler
    );

    const waitingAnimation = this.renderWaitingAnimation();
    const waitingMessage = this.renderWaitingMessage();
    const doNotCloseWarning = this.renderDoNotCloseWarning();

    MenuPage.setPageTemplateContent(`
      <div class="login-activating-device-layout">
        ${waitingAnimation}
        <div>
          ${waitingMessage}
          ${(waitingMessage && doNotCloseWarning) ? `<br><br>` : ''}
          ${doNotCloseWarning}
        </div>
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.options.initPageCode();
  }
}
