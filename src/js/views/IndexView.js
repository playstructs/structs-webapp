import {NavItemDTO} from "../dtos/NavItemDTO";
import {MenuPage} from "../framework/MenuPage";
import {AbstractView} from "../framework/AbstractView";

export class IndexView extends AbstractView {

  initPageCode() {
    document.getElementById('new-player-btn').addEventListener('click', () => {
      MenuPage.router.goto('Auth', 'signupConnectingToCorporate1');
    });
    document.getElementById('returning-player-btn').addEventListener('click', () => {
      console.log('Returning Player');
    });
  }

  render () {
    const navItems = [
      new NavItemDTO(
        'nav-item-structs',
        'Structs'
      )
    ];
    MenuPage.setNavItems(navItems, 'nav-item-structs');
    MenuPage.disableCloseBtn()

    MenuPage.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <img class="glitch-logo" src="/img/sui/logo/logo-structs.gif" alt="Animated Structs logo with glitching">
      
      <a id="new-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-primary">New Player</a>
      <a id="returning-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-secondary">Returning Player</a>
    </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
