import {NavItemDTO} from "../dtos/NavItemDTO";
import {MenuPage} from "../framework/MenuPage";
import {AbstractView} from "../framework/AbstractView";

export class SignupConnectingToCorporate2View extends AbstractView {

  initPageCode() {
    setTimeout(() => {
      MenuPage.router.goto('Auth', 'signupIncomingCall1');
    }, 4000);
  }

  render() {
    const navItems = [
      new NavItemDTO(
        'nav-item-text-only',
        'SN.Corporation'
      )
    ];
    MenuPage.setNavItems(navItems);

    document.getElementById('snc-logo-wrapper').innerHTML = `
        <img 
          class="snc-logo"
          src="/img/logo-snc.gif"
          alt="SNC logo"
        >
        <h2 class="sui-text-header sui-text-disabled">WE KNOW BETTER.</h2>
      `;

    MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-success sui-text-primary"></i>`, true);
    MenuPage.setDialogueScreenContent(`Connection Successful.`, true);
    MenuPage.showDialoguePanel();

    this.initPageCode();
  }
}
