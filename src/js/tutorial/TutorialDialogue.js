import {NotificationDialogue} from "../framework/NotificationDialogue";

export const TUTORIAL_DIALOGUE_POSITIONS = {
  TOP: 'top',
  BOTTOM: 'bottom'
};

/**
 * The tutorial's narrator, shown in the in-game notification dialogue.
 *
 * Unlike regular notifications it does not hide the whole HUD: at the bottom
 * it only covers the action bars, and at the top it takes the place of the
 * status bars so the action bar stays usable.
 */
export class TutorialDialogue {

  constructor() {
    this.panel = document.getElementById(NotificationDialogue.dialoguePanelId);
    this.btnA = document.getElementById(NotificationDialogue.dialogueBtnAId);
    this.portraitLoaded = false;
  }

  init() {
    // The panel keeps the template's colouring (medium portrait and text
    // chunks, default button chunk), which is what the design draws.
    this.panel.classList.add('tutorial-dialogue');
    NotificationDialogue.setDialogueScreenThemeToNeutral();
  }

  loadPortrait() {
    if (this.portraitLoaded) {
      return;
    }
    this.portraitLoaded = true;

    NotificationDialogue.setDialogueIndicatorContent(`<div id="tutorial-hrbot-talking-small" class="tutorial-dialogue-portrait"></div>`);

    const {lottie} = window;
    if (lottie) {
      lottie.loadAnimation({
        container: document.getElementById('tutorial-hrbot-talking-small'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/lottie/hr-bot/data.json'
      });
    }
  }

  /**
   * @param {string} position see TUTORIAL_DIALOGUE_POSITIONS
   */
  setPosition(position) {
    const isTop = position === TUTORIAL_DIALOGUE_POSITIONS.TOP;
    this.panel.classList.toggle('mod-top', isTop);
    document.body.classList.toggle('tutorial-dialogue-top', isTop);
    document.body.classList.toggle('tutorial-dialogue-bottom', !isTop);
  }

  /**
   * Shows a line of dialogue.
   *
   * @param {string} html
   * @param {string} position see TUTORIAL_DIALOGUE_POSITIONS
   * @param {boolean} hasOkButton whether the player continues with OK or by doing what is asked
   * @return {Promise<void>} resolves when OK is pressed (never, if there is no OK button)
   */
  show(html, position, hasOkButton) {
    this.loadPortrait();
    this.setPosition(position);

    NotificationDialogue.setDialogueScreenContent(html);
    this.btnA.classList.toggle('hidden', !hasOkButton);
    this.panel.classList.remove('hidden');

    return new Promise(resolve => {
      NotificationDialogue.dialogueBtnAHandler = hasOkButton
        ? () => {
          NotificationDialogue.clearDialogueBtnAHandler();
          resolve();
        }
        : () => {};
    });
  }

  hide() {
    this.panel.classList.add('hidden');
    NotificationDialogue.clearDialogueBtnAHandler();
    document.body.classList.remove('tutorial-dialogue-top', 'tutorial-dialogue-bottom');
  }
}
