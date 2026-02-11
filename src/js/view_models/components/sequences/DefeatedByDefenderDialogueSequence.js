import {NotificationDialogueSequence} from "../../../framework/NotificationDialogueSequence";
import {NotificationDialogueSequenceStep} from "../../../framework/NotificationDialogueSequenceStep";

export class DefeatedByDefenderDialogueSequence extends NotificationDialogueSequence {
  constructor() {
    super();

    this.dialogueSequence = [
      new NotificationDialogueSequenceStep(
        '<i class="sui-icon-md icon-alert sui-text-warning"></i>',
        `<strong class="sui-text-destructive">Defeat!</strong> Your command ship was destroyed.`,
      ),
      new NotificationDialogueSequenceStep(
        '<i class="sui-icon-md icon-alert sui-text-warning"></i>',
        'You will now be returned to your base.',
      ),
    ];
  }
}