import {MenuPage} from "./MenuPage";
import {NotificationDialogue} from "./NotificationDialogue";

/**
 * Enter confirms a dialogue and Escape goes back.
 *
 * The dialogue buttons cannot read these keys themselves. They are anchors, so
 * they are only sent key events while focused, and nothing in the app moves
 * focus to them. The keys are read from the document and routed here instead.
 */
export class DialogueKeyboardControls {

  /**
   * Hiding a button does not clear the handler the screen installed, and the
   * menu page as a whole is hidden while a map is up, so ancestors count.
   *
   * @param {string} btnId
   * @return {boolean}
   */
  static isBtnActionable(btnId) {
    const btn = document.getElementById(btnId);

    return Boolean(btn) && btn.closest('.hidden') === null;
  }

  /**
   * An anchor or button turns Enter into a click of its own while focused, so
   * routing the same press to a handler would run it twice.
   *
   * @return {boolean}
   */
  static isEnterHandledByFocusedElement() {
    return Boolean(document.activeElement?.closest('a, button'));
  }

  static handleEnter() {
    if (DialogueKeyboardControls.isEnterHandledByFocusedElement()) {
      return;
    }

    // The notification panel sits over the menu page when both are open.
    if (DialogueKeyboardControls.isBtnActionable(NotificationDialogue.dialogueBtnAId)) {
      NotificationDialogue.dialogueBtnAHandler();
      return;
    }

    if (DialogueKeyboardControls.isBtnActionable(MenuPage.dialogueBtnAId)) {
      MenuPage.dialogueBtnAHandler();
    }
  }

  static handleEscape() {
    // A notification has nothing to go back to, and it covers the button that
    // would answer for the menu page underneath it.
    if (
      DialogueKeyboardControls.isBtnActionable(NotificationDialogue.dialogueBtnAId)
      || !DialogueKeyboardControls.isBtnActionable(MenuPage.dialogueBtnBId)
    ) {
      return;
    }

    MenuPage.dialogueBtnBHandler();
  }

  /**
   * @param {KeyboardEvent} event
   */
  static handleKeydown(event) {
    // Holding a key down would otherwise race through a dialogue sequence.
    if (event.repeat) {
      return;
    }

    if (event.key === 'Enter') {
      DialogueKeyboardControls.handleEnter();
    } else if (event.key === 'Escape') {
      DialogueKeyboardControls.handleEscape();
    }
  }

  static initListeners() {
    document.addEventListener('keydown', DialogueKeyboardControls.handleKeydown);
  }
}
