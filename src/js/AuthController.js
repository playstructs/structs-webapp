import {MenuPageLayout} from './MenuPageLayout';

export class AuthController {
  constructor() {
    this.name = 'Auth';
  }

  index() {
    MenuPageLayout.disableCloseBtn()
    MenuPageLayout.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <img class="glitch-logo" src="/img/sui/logo/logo-structs.gif" alt="Animated Structs logo with glitching">
      
      <a id="new-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-primary">New Player</a>
      <a id="returning-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-secondary">Returning Player</a>
    </div>
    `);
    MenuPageLayout.hideAndClearDialoguePanel();
    document.getElementById('new-player-btn').addEventListener('click', () => {
      console.log('New Player');
    });
    document.getElementById('returning-player-btn').addEventListener('click', () => {
      console.log('Returning Player');
    });
  }

  connecting() {
    MenuPageLayout.disableCloseBtn()
    MenuPageLayout.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <img class="glitch-logo" src="/img/sui/logo/logo-structs.gif" alt="Animated Structs logo with glitching">
    </div>
    `);
    MenuPageLayout.showDialoguePanel();
    MenuPageLayout.setDialogueScreenContent(`Connecting to Corporate Database...`);
    MenuPageLayout.disableDialogueBtnB();
    MenuPageLayout.disableDialogueBtnA();
  }

}