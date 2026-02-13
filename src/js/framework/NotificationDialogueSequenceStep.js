export class NotificationDialogueSequenceStep {

  /**
   * @param {string} indicatorContent
   * @param {string} screenContent
   * @param {function} btnAExtraAction
   */
  constructor(indicatorContent, screenContent, btnAExtraAction = () => {}) {
    this.indicatorContent = indicatorContent;
    this.screenContent = screenContent;
    this.btnAExtraAction = btnAExtraAction;
  }
}