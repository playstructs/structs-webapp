import {NotificationDialogueSequence} from "../../../framework/NotificationDialogueSequence";
import {NotificationDialogueSequenceStep} from "../../../framework/NotificationDialogueSequenceStep";
import {VictoryBannerViewModel} from "../../banners/VictoryBannerViewModel";

export class DefenderVictoryDialogueSequence extends NotificationDialogueSequence {
  constructor() {
    super();

    this.bannerViewModel = new VictoryBannerViewModel();

    this.dialogueSequence = [
      new NotificationDialogueSequenceStep(
        '<i class="sui-icon-md icon-success sui-text-primary"></i>',
        '<strong class="sui-text-primary">Victory!</strong> You successfully repelled the enemy\'s attack.',
        () => this.bannerViewModel.close()
      )
    ];

    this.initPageCode = () => {
      this.bannerViewModel.render();
    }
  }
}