import {NotificationDialogueSequenceStep} from "./NotificationDialogueSequenceStep";
import {NotificationDialogue} from "./NotificationDialogue";

export class NotificationDialogueSequence {
  constructor() {

    /** @type {NotificationDialogueSequenceStep[]} dialogueSequence */
    this.dialogueSequence = [];

    /** @type {number} */
    this.dialogueIndex = 0;

    /** @type {function} */
    this.actionOnSequenceEnd = () => {};

    this.initPageCode = () => {};
  }

  step() {
    if (this.dialogueIndex < this.dialogueSequence.length) {
      const step = this.dialogueSequence[this.dialogueIndex];

      NotificationDialogue.setDialogueIndicatorContent(step.indicatorContent)
      NotificationDialogue.setDialogueScreenContent(step.screenContent);

      this.dialogueIndex++;
    }
  }

  start() {
    NotificationDialogue.hideAndClearDialoguePanel();

    let pendingAction = null;

    NotificationDialogue.dialogueBtnAHandler = () => {
      const actionResult = this.dialogueSequence[this.dialogueIndex - 1]?.btnAExtraAction();

      if (actionResult instanceof Promise) {
        pendingAction = actionResult;
      }

      if (this.dialogueIndex === this.dialogueSequence.length) {
        NotificationDialogue.hideAndClearDialoguePanel();

        if (pendingAction) {
          pendingAction.then(() => {
            this.actionOnSequenceEnd();
          });
        } else {
          this.actionOnSequenceEnd();
        }
        return;
      }

      this.step();
    };

    this.step();
    this.initPageCode();

    NotificationDialogue.showDialoguePanel();
  }
}