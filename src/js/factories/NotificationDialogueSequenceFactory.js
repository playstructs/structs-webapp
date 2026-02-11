import {NOTIFICATION_DIALOGUE_SEQUENCES} from "../constants/NotificationDialogueSequences";
import {AttackerVictoryDialogueSequence} from "../view_models/components/sequences/AttackerVictoryDialogueSequence";
import {DefeatedByAttackerDialogueSequence} from "../view_models/components/sequences/DefeatedByAttackerDialogueSequence";
import {DefenderVictoryDialogueSequence} from "../view_models/components/sequences/DefenderVictoryDialogueSequence";
import {
  DefeatedByDefenderDialogueSequence
} from "../view_models/components/sequences/DefeatedByDefenderDialogueSequence";

export class NotificationDialogueSequenceFactory {

  /**
   * @param {string} sequenceName See NOTIFICATION_DIALOGUE_SEQUENCES
   * @param {object} params
   */
  make(sequenceName, params = {}) {
    switch (sequenceName) {
      case NOTIFICATION_DIALOGUE_SEQUENCES.ATTACKER_VICTORY:
        return new AttackerVictoryDialogueSequence(params?.alphaOreRecovered);
      case NOTIFICATION_DIALOGUE_SEQUENCES.DEFENDER_VICTORY:
        return new DefenderVictoryDialogueSequence();
      case NOTIFICATION_DIALOGUE_SEQUENCES.DEFEATED_BY_ATTACKER:
        return new DefeatedByAttackerDialogueSequence(params?.alphaOreLost);
      case NOTIFICATION_DIALOGUE_SEQUENCES.DEFEATED_BY_DEFENDER:
        return new DefeatedByDefenderDialogueSequence();
      default:
        throw new Error(`NotificationDialogueSequenceFactory: No notification dialogue sequence with name: ${sequenceName}`);
    }
  }
}