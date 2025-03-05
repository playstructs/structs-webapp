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
      MenuPage.router.goto('Auth', 'signupConnectingToCorporate');
    });
    document.getElementById('returning-player-btn').addEventListener('click', () => {
      console.log('Returning Player');
    });
  }

  signupConnectingToCorporate() {
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

    document.getElementById('glitch-logo-fade').addEventListener('animationstart', () => {
      MenuPage.router.goto('Auth', 'signupConnectionSuccessful');
    })
  }

  signupConnectionSuccessful() {
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
  }
}