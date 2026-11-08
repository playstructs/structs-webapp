import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

/**
 * Combat Training's main menu, opened from the bottom-left portrait while the
 * tutorial runs: restart it or leave it.
 */
export class TutorialMenuViewModel extends AbstractViewModel {

  constructor() {
    super();
    this.restartBtnId = 'tutorial-menu-restart-btn';
    this.abandonBtnId = 'tutorial-menu-abandon-btn';
  }

  initPageCode() {
    document.getElementById(this.restartBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Tutorial', 'restartConfirm');
    });
    document.getElementById(this.abandonBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Tutorial', 'abandonConfirm');
    });
  }

  render() {
    MenuPage.setNavItems([
      new NavItemDTO(
        'nav-item-text-only',
        'Combat Training'
      )
    ]);
    MenuPage.enableCloseBtn();
    MenuPage.showNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
      <div class="common-layout-col">
        <div class="confirm-template-btn-container">
          <div class="sui-screen-btn-flex-wrapper">
            <button id="${this.restartBtnId}" class="sui-screen-btn sui-mod-primary">Restart Tutorial</button>
          </div>
          <div class="sui-screen-btn-flex-wrapper">
            <button id="${this.abandonBtnId}" class="sui-screen-btn sui-mod-destructive">Abandon Tutorial</button>
          </div>
        </div>
      </div>
    </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
