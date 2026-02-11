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

      step.stepScript();

      this.dialogueIndex++;
    }
  }

  start() {
    NotificationDialogue.hideAndClearDialoguePanel();

    NotificationDialogue.dialogueBtnAHandler = () => {
      this.step();

      if (this.dialogueIndex === this.dialogueSequence.length) {
        this.dialogueIndex++;
        this.actionOnSequenceEnd();
        NotificationDialogue.hideAndClearDialoguePanel();
      }
    };

    this.step();
    this.initPageCode();

    NotificationDialogue.showDialoguePanel();
  }
}