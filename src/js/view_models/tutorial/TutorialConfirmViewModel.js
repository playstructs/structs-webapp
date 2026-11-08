import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

/**
 * A "Are you sure?" screen for Combat Training: skipping it at the end of
 * orientation, and restarting or abandoning it from its menu.
 */
export class TutorialConfirmViewModel extends AbstractViewModel {

  /**
   * @param {string} title
   * @param {string} body
   * @param {string} confirmLabel
   * @param {string} confirmColorClass
   * @param {function(): void} onConfirm
   * @param {function(): void} onCancel
   * @param {boolean} closable whether the menu's close button is shown
   */
  constructor(title, body, confirmLabel, confirmColorClass, onConfirm, onCancel, closable = true) {
    super();
    this.title = title;
    this.body = body;
    this.confirmLabel = confirmLabel;
    this.confirmColorClass = confirmColorClass;
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;
    this.closable = closable;
    this.confirmBtnId = 'tutorial-confirm-btn';
    this.cancelBtnId = 'tutorial-cancel-btn';
  }

  initPageCode() {
    document.getElementById(this.confirmBtnId).addEventListener('click', () => this.onConfirm());
    document.getElementById(this.cancelBtnId).addEventListener('click', () => this.onCancel());
  }

  render() {
    MenuPage.setNavItems([
      new NavItemDTO(
        'nav-item-text-only',
        'Combat Training'
      )
    ]);
    if (this.closable) {
      MenuPage.enableCloseBtn();
    } else {
      MenuPage.disableCloseBtn();
    }
    MenuPage.showNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
      <div class="common-layout-col">
        <div class="confirm-template-text-container">
          <div class="sui-mod-warning">
            <i class="sui-icon sui-icon-md icon-alert"></i>
            ${this.title}
          </div>
          <div>${this.body}</div>
        </div>

        <div class="confirm-template-btn-container">
          <div class="sui-screen-btn-flex-wrapper">
            <button id="${this.confirmBtnId}" class="sui-screen-btn ${this.confirmColorClass}">${this.confirmLabel}</button>
          </div>
          <div class="sui-screen-btn-flex-wrapper">
            <button id="${this.cancelBtnId}" class="sui-screen-btn sui-mod-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
