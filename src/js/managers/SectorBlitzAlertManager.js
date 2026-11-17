import {MenuPage} from "../framework/MenuPage";
import {NotificationDialogue} from "../framework/NotificationDialogue";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {EVENTS} from "../constants/Events";
import {SECTOR_BLITZ_ALERTS} from "../constants/SectorBlitzConstants";
import {TutorialMode} from "../tutorial/TutorialMode";
import {SectorBlitzDialogueSequence} from "../view_models/components/sequences/SectorBlitzDialogueSequence";

const CHECK_INTERVAL_MS = 3000;

/**
 * Shows each Sector Blitz alert sequence once per contest: the start alert while a contest
 * runs, the results report while its results are shown. A player who missed the start
 * only gets the results. Alerts wait until the player is on the map with no menu or other
 * notification open, which for new players is after sign up and the optional tutorial.
 */
export class SectorBlitzAlertManager {

  /**
   * @param {GameState} gameState
   * @param {SectorBlitzManager} sectorBlitzManager
   * @param {InfluenceAPI} influenceAPI
   */
  constructor(gameState, sectorBlitzManager, influenceAPI) {
    this.gameState = gameState;
    this.sectorBlitzManager = sectorBlitzManager;
    this.influenceAPI = influenceAPI;
    this.busy = false;
    this.interval = null;
  }

  init() {
    if (!this.sectorBlitzManager.isEnabled() || this.interval) return;
    this.interval = setInterval(() => this.check(), CHECK_INTERVAL_MS);
    window.addEventListener(EVENTS.SECTOR_BLITZ_PHASE_CHANGED, () => this.check());
  }

  /**
   * @param {string} elementId
   * @return {boolean}
   */
  isHidden(elementId) {
    const element = document.getElementById(elementId);
    return !element || element.classList.contains('hidden');
  }

  /**
   * @return {boolean} whether the player is looking at the map with nothing in the way
   */
  isPlayerOnMap() {
    return !!this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player
      && !TutorialMode.isActive()
      && this.isHidden(MenuPage.loadingScreenId)
      && this.isHidden(MenuPage.pageLayoutId)
      && this.isHidden(NotificationDialogue.dialoguePanelId);
  }

  async check() {
    if (this.busy || !this.isPlayerOnMap()) return;

    this.busy = true;
    try {
      // Cached for a minute, so this also notices contests configured after login.
      const {contest} = await this.sectorBlitzManager.refresh();
      if (!contest || !this.isPlayerOnMap()) return;

      if (this.sectorBlitzManager.isActive()) {
        this.showStartAlert(contest);
      } else if (this.sectorBlitzManager.isShowingResults()) {
        await this.showResultsAlert(contest);
      }
    } catch (error) {
      console.debug('[SectorBlitz] alert unavailable:', error);
    } finally {
      this.busy = false;
    }
  }

  /**
   * @param {object} contest
   */
  showStartAlert(contest) {
    if (this.gameState.hasSeenSectorBlitzAlert(SECTOR_BLITZ_ALERTS.START, contest.contest_id)) return;
    this.gameState.markSectorBlitzAlertSeen(SECTOR_BLITZ_ALERTS.START, contest.contest_id);
    SectorBlitzDialogueSequence.start().start();
  }

  /**
   * @param {object} contest
   */
  async showResultsAlert(contest) {
    if (this.gameState.hasSeenSectorBlitzAlert(SECTOR_BLITZ_ALERTS.RESULTS, contest.contest_id)) return;

    const overall = await this.influenceAPI.getGuildRanks(contest.contest_id, null, 1, 10, true);
    const winners = overall.data
      .filter(row => row.rank === '1' && row.sectors_controlled > 0)
      .map(row => ({
        name: row.profile?.name || row.profile?.tag || `Guild ${row.guild_id}`,
        sectors: row.controlled_sectors,
      }));

    // Something may have opened while the standings loaded; try again on a later check.
    if (winners.length && !this.isPlayerOnMap()) return;

    // The results report is only for a contest somebody won, and is never shown later.
    this.gameState.markSectorBlitzAlertSeen(SECTOR_BLITZ_ALERTS.RESULTS, contest.contest_id);
    // A player who never saw the start alert for this contest should not get it afterwards.
    this.gameState.markSectorBlitzAlertSeen(SECTOR_BLITZ_ALERTS.START, contest.contest_id);

    if (winners.length) {
      SectorBlitzDialogueSequence.results(winners).start();
    }
  }
}
