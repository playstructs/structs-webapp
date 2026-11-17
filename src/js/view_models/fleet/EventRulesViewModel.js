import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {SECTOR_BLITZ} from "../../constants/SectorBlitzConstants";
import {SectorBlitzFormat} from "../../util/SectorBlitzFormat";

export const SECTOR_BLITZ_TIPS = Object.freeze({
  RAID_WIN: 'Multiple Raids by members of your Guild against the same planet do not earn additional points.',
  KOTH: 'Awarded for each planet your Guild was the last to successfully Raid at contest end.',
  SECTOR_SCORE: 'Your points earned in this sector.',
  TOTAL_SCORE: 'Your points earned across all sectors.',
});

export class EventRulesViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {SectorBlitzManager} sectorBlitzManager
   */
  constructor(gameState, sectorBlitzManager) {
    super();
    this.gameState = gameState;
    this.sectorBlitzManager = sectorBlitzManager;
  }

  /**
   * @param {string} label
   * @param {string} tip
   * @param {string} points
   * @return {string}
   */
  renderScoringRowHTML(label, tip, points) {
    return `
      <div class="sui-data-card-row">
        <div>
          ${label}
          <a
            class="sui-text-secondary"
            href="javascript: void(0)"
            data-sui-tooltip="${tip}"
          >
            <i class="sui-icon icon-tip"></i>
          </a>
        </div>
        <div>${SectorBlitzFormat.escape(points)} IP</div>
      </div>
    `;
  }

  render() {
    // The contest check may finish after the player has moved on to another page.
    const navigationId = MenuPage.router.navigationId;

    this.sectorBlitzManager.refresh().then(() => {
      if (navigationId !== MenuPage.router.navigationId) {
        return;
      }
      if (!this.sectorBlitzManager.isActive()) {
        MenuPage.router.goto('Fleet', 'index');
        return;
      }

      const contest = this.sectorBlitzManager.contest;

      MenuPage.enablePageTemplate(MenuPage.navItemFleetId);

      MenuPage.setPageTemplateHeaderBtn('Event Rules', true, () => {
        MenuPage.router.goto('Fleet', 'index');
      });

      MenuPage.setPageTemplateContent(`
        <div class="profile-layout sector-blitz-layout sector-blitz-event-rules">

          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">${SECTOR_BLITZ.NAME}</div>
            <div class="sui-data-card-body sector-blitz-rules">
              <p>
                ${SECTOR_BLITZ.NAME} is a time-limited event where Guilds compete to acquire
                <i class="sui-icon sector-blitz-influence-icon sector-blitz-influence-icon-inline"></i><span class="sui-text-warning">Influence Points</span>
                across galactic sectors.
              </p>
              <ul class="sector-blitz-rules-list">
                <li>
                  <i class="sui-icon sui-icon-md icon-info sui-text-secondary"></i>
                  <span>Launch at least 1 Raid to qualify.</span>
                </li>
                <li>
                  <i class="sui-icon sui-icon-md icon-raid sui-text-secondary"></i>
                  <span>Earn points for each unique rival planet successfully Raided by your Guild.</span>
                </li>
                <li>
                  <i class="sui-icon sui-icon-md icon-guild sui-text-secondary"></i>
                  <span>The Guild with the most points in a sector controls that sector.</span>
                </li>
                <li>
                  <i class="sui-icon sui-icon-md icon-success sui-text-secondary"></i>
                  <span>The Guild that controls the most sectors when the event ends wins the ${SECTOR_BLITZ.NAME}.</span>
                </li>
              </ul>
              <p>
                <span class="sui-text-warning">TIP:</span> Use the "SCAN" button on the Fleet Menu to find opponents.
              </p>
            </div>
          </div>

          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Scoring</div>
            <div class="sui-data-card-body">
              ${this.renderScoringRowHTML('Win an Offensive Raid', SECTOR_BLITZ_TIPS.RAID_WIN, contest.win_points)}
              ${this.renderScoringRowHTML('King of the Hill Bonus', SECTOR_BLITZ_TIPS.KOTH, contest.claim_points)}
            </div>
          </div>

        </div>
      `);

      MenuPage.scrollPageTemplateToTop();
      MenuPage.hideAndClearDialoguePanel();
    });
  }
}
