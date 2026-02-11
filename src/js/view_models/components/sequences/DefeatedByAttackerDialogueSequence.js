import {NotificationDialogueSequence} from "../../../framework/NotificationDialogueSequence";
import {NotificationDialogueSequenceStep} from "../../../framework/NotificationDialogueSequenceStep";

export class DefeatedByAttackerDialogueSequence extends NotificationDialogueSequence {
  constructor(alphaOreLost) {
    super();

    this.alphaOreLost = alphaOreLost;

    this.dialogueSequence = [
      new NotificationDialogueSequenceStep(
        '<i class="sui-icon-md icon-alert sui-text-warning"></i>',
        `<strong class="sui-text-destructive">Defeat!</strong> Your Planetary Shield was depleted, allowing the enemy to steal <strong class="sui-text-destructive">${this.alphaOreLost} Alpha Ore</strong>.`,
      )
    ];
  }
}