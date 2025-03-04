export class MenuPageLayout {

  /* Element IDs Start */

  static pageLayoutId = 'menu-page-layout';

  static navId = 'menu-page-nav-items';

  static closeBtnId = 'menu-page-nav-close';

  static bodyId = 'menu-page-body-content';

  static dialoguePanelId = 'menu-page-dialogue';

  static dialogueIndicatorId = 'menu-page-dialogue-indicator';

  static dialogueScreenId = 'menu-page-dialogue-screen';

  static dialogueBtnAId = 'menu-page-dialogue-btn-a';

  static dialogueBtnBId = 'menu-page-dialogue-btn-b';

  /* Element IDs End */

  static hasDialogueBtnA = false;

  static hasDialogueBtnB = false;

  static dialogueBtnAIconClass = 'icon-arrow sui-flip-horizontal';

  static dialogueBtnBIconClass = 'icon-okay';

  static dialogueBtnRightAction = () => {};

  static dialogueBtnLeftAction = () => {};

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

  static closeBtnHandler() {
    document.getElementById(MenuPageLayout.pageLayoutId).classList.add('hidden');
  }

  static initCloseBtnListener() {
    document.getElementById(MenuPageLayout.closeBtnId).addEventListener('click', MenuPageLayout.closeBtnHandler);
  }
}
