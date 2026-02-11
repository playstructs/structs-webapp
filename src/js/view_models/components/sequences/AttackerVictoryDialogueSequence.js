import {NotificationDialogueSequence} from "../../../framework/NotificationDialogueSequence";
import {NotificationDialogueSequenceStep} from "../../../framework/NotificationDialogueSequenceStep";

export class AttackerVictoryDialogueSequence extends NotificationDialogueSequence {
  constructor(alphaOreRecovered) {
    super();

    this.alphaOreRecovered = alphaOreRecovered;

    this.dialogueSequence = [
      new NotificationDialogueSequenceStep(
        '<i class="sui-icon-md icon-success sui-text-primary"></i>',
        '<strong class="sui-text-primary">Victory!</strong> The enemy\'s planetary shield has been defeated.',
      ),
      new NotificationDialogueSequenceStep(
        '<i class="sui-icon-md icon-success sui-text-primary"></i>',
        `You recovered <strong class="sui-text-primary">${this.alphaOreRecovered} Alpha Ore</strong> from the enemy base.`,
      ),
      new NotificationDialogueSequenceStep(
        '<i class="sui-icon-md icon-success sui-text-primary"></i>',
        'Your fleet will now return to base.',
      ),
    ];
  }
}