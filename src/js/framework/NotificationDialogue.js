
export class NotificationDialogue {

  /* Element IDs Start */

  static dialoguePanelId = 'notification-dialogue';

  static dialogueIndicatorContentId = 'notification-dialogue-indicator-content';

  static dialogueScreenId = 'notification-dialogue-screen';

  static dialogueScreenContentId = 'notification-dialogue-screen-content';

  static dialogueBtnAId = 'notification-dialogue-btn-a';

  /* Element IDs End */

  /* Dynamic Handlers Start */

  static dialogueBtnAHandler = () => {};

  /* Dynamic Handlers End */

  static setDialogueIndicatorContent(content, useFadeAnimation = false) {
    const dialogueIndicatorContent = document.getElementById(NotificationDialogue.dialogueIndicatorContentId);
    dialogueIndicatorContent.innerHTML = content;

    if (useFadeAnimation) {
      NotificationDialogue.applyFadeInFadeOutAnimation(dialogueIndicatorContent);
    }
  }

  static applyFadeInFadeOutAnimation(element) {
    element.classList.add('fade-in-fade-out');
    element.addEventListener('animationend', () => {
      element.classList.remove('fade-in-fade-out');
    }, {once: true});
  }

  static setDialogueScreenContent(content, useFadeAnimation = false) {
    const dialogueScreenContent = document.getElementById(NotificationDialogue.dialogueScreenContentId);
    dialogueScreenContent.innerHTML = content;

    if (useFadeAnimation) {
      NotificationDialogue.applyFadeInFadeOutAnimation(dialogueScreenContent);
    }
  }

  static setDialogueScreenTheme(theme) {
    const dialogueScreen = document.getElementById(NotificationDialogue.dialogueScreenId);
    dialogueScreen.classList.remove(...dialogueScreen.classList);
    dialogueScreen.classList.add('sui-screen-dialogue');
    dialogueScreen.classList.add(theme);
  }

  static setDialogueScreenThemeToPlayer() {
    NotificationDialogue.setDialogueScreenTheme('sui-theme-player');
  }

  static setDialogueScreenThemeToNeutral() {
    NotificationDialogue.setDialogueScreenTheme('sui-theme-neutral');
  }

  static setDialogueScreenThemeToEnemy() {
    NotificationDialogue.setDialogueScreenTheme('sui-theme-enemy');
  }

  static clearDialogueScreen() {
    document.getElementById(NotificationDialogue.dialogueScreenContentId).innerHTML = '';
  }

  static clearDialogueBtnAHandler() {
    NotificationDialogue.dialogueBtnAHandler = () => {};
  }

  static hideAndClearDialoguePanel() {
    document.getElementById(NotificationDialogue.dialoguePanelId).classList.add('hidden');
    NotificationDialogue.clearDialogueScreen();
    NotificationDialogue.setDialogueScreenThemeToNeutral();
    NotificationDialogue.clearDialogueBtnAHandler();
  }

  static showDialoguePanel() {
    document.getElementById(NotificationDialogue.dialoguePanelId).classList.remove('hidden');
  }

  static initDialogueBtnAListener() {
    const dialogueBtnA = document.getElementById(NotificationDialogue.dialogueBtnAId);
    dialogueBtnA.addEventListener('click', () => {
      NotificationDialogue.dialogueBtnAHandler();
    });
  }

  static initListeners() {
    NotificationDialogue.initDialogueBtnAListener();
  }
}
