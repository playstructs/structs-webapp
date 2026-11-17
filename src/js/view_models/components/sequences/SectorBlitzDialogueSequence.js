import {NotificationDialogueSequence} from "../../../framework/NotificationDialogueSequence";
import {NotificationDialogueSequenceStep} from "../../../framework/NotificationDialogueSequenceStep";
import {SectorBlitzFormat} from "../../../util/SectorBlitzFormat";

const INDICATOR_ID = 'sector-blitz-hrbot';

/**
 * @param {string} text
 * @return {string}
 */
const highlight = text => `<span class="sui-text-neutral-primary">${text}</span>`;

/**
 * HR Bot briefings for Sector Blitz: the start alert and the results report.
 */
export class SectorBlitzDialogueSequence extends NotificationDialogueSequence {

  /**
   * @param {string[]} lines HTML for each step
   */
  constructor(lines) {
    super();
    this.dialogueSequence = lines.map(line => new NotificationDialogueSequenceStep(
      `<div id="${INDICATOR_ID}" class="sector-blitz-hrbot"></div>`,
      line
    ));
  }

  step() {
    super.step();
    this.animateIndicator();
  }

  animateIndicator() {
    const container = document.getElementById(INDICATOR_ID);
    const {lottie} = window;
    if (!container || !lottie) return;
    lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/lottie/hr-bot/data.json'
    });
  }

  /**
   * @return {SectorBlitzDialogueSequence}
   */
  static start() {
    return new SectorBlitzDialogueSequence([
      `${highlight('Priority Alert:')} Rival factions have launched a series of Raids against our assets in an effort to destabilize key ${highlight('Galactic Sectors')}.`,
      `This cannot go unanswered. You are being re-tasked to ${highlight('Operation: Sector Blitz')}.`,
      `Your objective is to secure our influence in each Sector by launching ${highlight('Raids')} against rival factions.`,
      `You can launch Raids and track our progress from the ${highlight('Fleet Menu')}. Click your Profile Picture to access the menu.`,
    ]);
  }

  /**
   * The second line names the guild(s) that controlled sectors. When the top spot is tied,
   * each tied guild is named with the sectors it secured.
   *
   * @param {{name: string, sectors: number[]}[]} winners the overall winner(s), each with the sectors they control
   * @return {SectorBlitzDialogueSequence}
   */
  static results(winners) {
    // Copy as specified: "sector 044", "sectors 044 and 127", "sector 044, 127, and 999".
    const sectorList = sectors => {
      const numbers = sectors.map(SectorBlitzFormat.sectorNumber);
      return `${numbers.length === 2 ? 'sectors' : 'sector'} ${SectorBlitzFormat.list(numbers)}`;
    };

    let summary;
    if (winners.length === 1) {
      const [winner] = winners;
      summary = `${highlight(SectorBlitzFormat.escape(winner.name))} used the opportunity to establish a firm grasp on key galactic sectors, securing ${sectorList(winner.sectors)}.`;
    } else {
      const [first, ...others] = winners;
      const otherClauses = others.map(other =>
        `${highlight(SectorBlitzFormat.escape(other.name))} secured ${sectorList(other.sectors)}`
      );
      summary = `${highlight(SectorBlitzFormat.escape(first.name))} used the opportunity to establish a firm grasp on galactic ${sectorList(first.sectors)} while ${SectorBlitzFormat.list(otherClauses)}.`;
    }

    return new SectorBlitzDialogueSequence([
      `${highlight('Update:')} Operation: Sector Blitz has ended. Activity in the disputed systems is returning to normal.`,
      summary,
      'A complete report can be viewed in the Fleet Menu.',
    ]);
  }
}
