export class MenuPageLayout {

  /* Element IDs Start */

  static pageLayoutId = 'menu-page-layout';

  static navId = 'menu-page-nav-items';

  static closeBtnId = 'menu-page-nav-close';

  static bodyId = 'menu-page-body-content';

  static dialoguePanelId = 'menu-page-dialogue';

  static dialogueIndicatorId = 'menu-page-dialogue-indicator';

  static dialogueScreenId = 'menu-page-dialogue-screen';

  static dialogueBtnChunkBId = 'menu-page-dialogue-btn-chunk-b';

  static dialogueBtnAId = 'menu-page-dialogue-btn-a';

  static dialogueBtnBId = 'menu-page-dialogue-btn-b';

  /* Element IDs End */

  static dialogueBtnAHandler = () => {};

  static dialogueBtnBHandler = () => {};

  static disableCloseBtn() {
    document.getElementById(MenuPageLayout.closeBtnId).classList.add('hidden');
  }

  static enableCloseBtn() {
    document.getElementById(MenuPageLayout.closeBtnId).classList.remove('hidden');
  }

  static setBodyContent(content) {
    document.getElementById(MenuPageLayout.bodyId).innerHTML = content;
  }

  static setDialogueScreenContent(content) {
    document.getElementById(MenuPageLayout.dialogueScreenId).innerHTML = content;
  }

  static setDialogueScreenTheme(theme) {
    const dialogueScreen = document.getElementById(MenuPageLayout.dialogueScreenId);
    dialogueScreen.classList.remove(...dialogueScreen.classList);
    dialogueScreen.classList.add('sui-screen-dialogue');
    dialogueScreen.classList.add(theme);
  }

  static setDialogueScreenThemeToNeutral() {
    MenuPageLayout.setDialogueScreenTheme('sui-theme-neutral');
  }

  static setDialogueScreenThemeToEnemy() {
    MenuPageLayout.setDialogueScreenTheme('sui-theme-enemy');
  }

  static enableDialogueBtnA() {
    document.getElementById(MenuPageLayout.dialogueBtnAId).classList.remove('hidden');
  }

  static disableDialogueBtnA() {
    document.getElementById(MenuPageLayout.dialogueBtnAId).classList.add('hidden');
  }

  static enableDialogueBtnB() {
    document.getElementById(MenuPageLayout.dialogueBtnChunkBId).classList.remove('hidden');
  }

  static disableDialogueBtnB() {
    document.getElementById(MenuPageLayout.dialogueBtnChunkBId).classList.add('hidden');
  }

  static clearDialogueScreen() {
    document.getElementById(MenuPageLayout.dialogueScreenId).innerHTML = '';
  }

  static clearDialogueBtnAHandler() {
    MenuPageLayout.dialogueBtnAHandler = () => {};
  }

  static clearDialogueBtnBHandler() {
    MenuPageLayout.dialogueBtnBHandler = () => {};
  }

  static hideAndClearDialoguePanel() {
    document.getElementById(MenuPageLayout.dialoguePanelId).classList.add('hidden');
    MenuPageLayout.clearDialogueScreen();
    MenuPageLayout.setDialogueScreenThemeToNeutral();
    MenuPageLayout.clearDialogueBtnAHandler();
    MenuPageLayout.clearDialogueBtnBHandler();
  }

  static showDialoguePanel() {
    document.getElementById(MenuPageLayout.dialoguePanelId).classList.remove('hidden');
  }

  static closeBtnHandler() {
    document.getElementById(MenuPageLayout.pageLayoutId).classList.add('hidden');
  }

  static initCloseBtnListener() {
    document.getElementById(MenuPageLayout.closeBtnId).addEventListener('click', MenuPageLayout.closeBtnHandler);
  }

  static initDialogueBtnAListener() {
    const dialogueBtnA = document.getElementById(MenuPageLayout.dialogueBtnAId);
    dialogueBtnA.addEventListener('click', () => {
      MenuPageLayout.dialogueBtnAHandler();
    });
  }

  static initDialogueBtnBListener() {
    const dialogueBtnB = document.getElementById(MenuPageLayout.dialogueBtnBId);
    dialogueBtnB.addEventListener('click', () => {
      MenuPageLayout.dialogueBtnBHandler();
    });
  }

  static initListeners() {
    MenuPageLayout.initCloseBtnListener();
    MenuPageLayout.initDialogueBtnAListener();
    MenuPageLayout.initDialogueBtnBListener();
  }
}
