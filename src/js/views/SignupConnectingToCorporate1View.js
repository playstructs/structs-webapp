import {NavItemDTO} from "../dtos/NavItemDTO";
import {MenuPage} from "../framework/MenuPage";
import {AbstractView} from "../framework/AbstractView";

export class SignupConnectingToCorporate1View extends AbstractView {

  initPageCode() {
    document.getElementById('glitch-logo-fade').addEventListener('animationstart', () => {
      MenuPage.router.goto('Auth', 'signupConnectingToCorporate2');
    });
  }

  render() {
    const navItems = [
      new NavItemDTO(
        'nav-item-text-only',
        'Connecting...'
      )
    ];
    MenuPage.setNavItems(navItems);
    MenuPage.disableCloseBtn()

    MenuPage.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <div class="connecting-logo-swap-container">
        <img
          id="glitch-logo-fade"
          class="glitch-logo fade-out"
          src="/img/sui/logo/logo-structs.gif"
          alt="Animated Structs logo with glitching"
        >
        <div id="snc-logo-wrapper" class="snc-logo-wrapper fade-in">
        </div>
      </div>
    </div>
    `);

    MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-info sui-text-primary"></i>`);
    MenuPage.setDialogueScreenContent(`Connecting to Corporate Database...`);
    MenuPage.disableDialogueBtnB();
    MenuPage.disableDialogueBtnA();
    MenuPage.showDialoguePanel();

    this.initPageCode();
  }
}
