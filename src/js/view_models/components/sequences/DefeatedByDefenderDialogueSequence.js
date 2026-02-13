import {NotificationDialogueSequence} from "../../../framework/NotificationDialogueSequence";
import {NotificationDialogueSequenceStep} from "../../../framework/NotificationDialogueSequenceStep";
import {DefeatBannerViewModel} from "../../banners/DefeatBannerViewModel";

export class DefeatedByDefenderDialogueSequence extends NotificationDialogueSequence {
  constructor() {
    super();

    this.bannerViewModel = new DefeatBannerViewModel();

    this.dialogueSequence = [
      new NotificationDialogueSequenceStep(
        '<i class="sui-icon-md icon-alert sui-text-warning"></i>',
        `<strong class="sui-text-destructive">Defeat!</strong> Your command ship was destroyed.`,
        () => this.bannerViewModel.close()
      ),
      new NotificationDialogueSequenceStep(
        '<i class="sui-icon-md icon-alert sui-text-warning"></i>',
        'You will now be returned to your base.',
      ),
    ];

    this.initPageCode = () => {
      this.bannerViewModel.render();
    }
  }
}