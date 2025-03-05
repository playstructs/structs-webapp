import {MenuPage} from './MenuPage';
import {NavItemDTO} from "./NavItemDTO";

export class AuthController {
  constructor() {
    this.name = 'Auth';
  }

  index() {
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
    document.getElementById('new-player-btn').addEventListener('click', () => {
      console.log('New Player');
      MenuPage.router.goto('Auth', 'connecting');
    });
    document.getElementById('returning-player-btn').addEventListener('click', () => {
      console.log('Returning Player');
    });
  }

  connecting() {
    const navItems = [
      new NavItemDTO(
        'nav-item-connecting',
        'Connecting...'
      )
    ];
    MenuPage.setNavItems(navItems, 'nav-item-connecting');
    MenuPage.disableCloseBtn()

    MenuPage.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <div class="connecting-logo-swap-container">
        <img 
          class="glitch-logo fade-out"
          src="/img/sui/logo/logo-structs.gif"
          alt="Animated Structs logo with glitching"
        >
        <div class="snc-logo-wrapper fade-in">
          <img 
            class="snc-logo"
            src="/img/logo-snc.gif"
            alt="SNC logo"
          >
          <h2 class="sui-text-header sui-text-disabled">WE KNOW BETTER.</h2>
        </div>
      </div>
    </div>
    `);

    MenuPage.showDialoguePanel();
    MenuPage.setDialogueScreenContent(`Connecting to Corporate Database...`);
    MenuPage.disableDialogueBtnB();
    MenuPage.disableDialogueBtnA();
  }

}