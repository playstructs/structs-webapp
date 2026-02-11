export class NotificationDialogueSequenceStep {

  /**
   * @param {string} indicatorContent
   * @param {string} screenContent
   * @param {function} stepScript
   */
  constructor(indicatorContent, screenContent, stepScript = () => {}) {
    this.indicatorContent = indicatorContent;
    this.screenContent = screenContent;
    this.stepScript = stepScript;
  }
}