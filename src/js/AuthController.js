import {MenuPage} from './MenuPage';

export class AuthController {
  constructor() {
    this.name = 'Auth';
  }

  index() {
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
    MenuPage.disableCloseBtn()
    MenuPage.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <img class="glitch-logo" src="/img/sui/logo/logo-structs.gif" alt="Animated Structs logo with glitching">
    </div>
    `);
    MenuPage.showDialoguePanel();
    MenuPage.setDialogueScreenContent(`Connecting to Corporate Database...`);
    MenuPage.disableDialogueBtnB();
    MenuPage.disableDialogueBtnA();
  }

}