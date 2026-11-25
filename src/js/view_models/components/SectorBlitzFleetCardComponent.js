import {MenuPage} from "../../framework/MenuPage";
import {EVENTS} from "../../constants/Events";
import {SECTOR_BLITZ} from "../../constants/SectorBlitzConstants";
import {SectorBlitzFormat} from "../../util/SectorBlitzFormat";
import {SectorBlitzHTML} from "../sector_blitz/SectorBlitzHTML";

/**
 * The Sector Blitz card at the top of the Fleet Status page: live sector control bars
 * while a contest runs, and the winning guilds while its results are shown.
 */
export class SectorBlitzFleetCardComponent {

  /**
   * Survives page renders, so a redrawn Fleet page shows the last scores instead of
   * collapsing to the loading dots, which would lose the reader's scroll position.
   *
   * @type {{key: string, html: string}|null}
   */
  static lastBody = null;

  /**
   * Shared across instances so each render replaces the previous listeners.
   * @type {function|null}
   */
  static refreshHandler = null;

  /**
   * @param {SectorBlitzManager} sectorBlitzManager
   * @param {InfluenceAPI} influenceAPI
   */
  constructor(sectorBlitzManager, influenceAPI) {
    this.sectorBlitzManager = sectorBlitzManager;
    this.influenceAPI = influenceAPI;
    this.containerId = 'sector-blitz-fleet-card';
    this.remainingId = 'sector-blitz-fleet-card-remaining';
    this.eventRulesBtnId = 'sector-blitz-event-rules-btn';
    this.contest = sectorBlitzManager.contest;
    this.isResults = sectorBlitzManager.isShowingResults();
    this.cacheKey = `${this.contest?.contest_id}:${this.isResults}`;
  }

  /**
   * @return {boolean}
   */
  isVisible() {
    return this.sectorBlitzManager.isVisible();
  }

  renderHTML() {
    if (!this.isVisible()) {
      return '';
    }

    return `
      <div id="${this.containerId}" class="sui-data-card sector-blitz-fleet-card${this.isResults ? ' sector-blitz-fleet-card-results' : ''}">
        ${this.renderHeaderHTML()}
        <div class="sector-blitz-fleet-card-body">
          ${this.lastBodyHTML() ?? `
            <div class="sector-blitz-fleet-card-loading">
              <img src="/img/loading-3-dots.gif" class="loading-3-dots" alt="3 dots loading animation">
            </div>
          `}
        </div>
      </div>
    `;
  }

  renderHeaderHTML() {
    const subtitle = this.isResults
      ? 'Event Results'
      : `<span id="${this.remainingId}">${SectorBlitzFormat.remaining(this.sectorBlitzManager.getMsRemaining())}</span> Remaining`;

    const eventRulesBtn = this.isResults
      ? ''
      : `
        <a id="${this.eventRulesBtnId}" href="javascript: void(0)" class="sector-blitz-fleet-card-rules-btn sui-text-secondary">
          <i class="sui-icon icon-tip"></i>
          <span class="sui-text-header">Event Rules</span>
        </a>
      `;

    return `
      <div class="sector-blitz-fleet-card-header">
        <div class="sector-blitz-title">
          <i class="sui-icon sui-icon-md icon-guild sui-text-primary"></i>
          <div class="sector-blitz-title-text">
            <div class="sui-text-header sui-text-primary">${SECTOR_BLITZ.NAME}</div>
            <div class="sui-text-header">${subtitle}</div>
          </div>
        </div>
        ${eventRulesBtn}
      </div>
    `;
  }

  initPageCode() {
    if (!this.isVisible()) {
      return;
    }

    document.getElementById(this.eventRulesBtnId)?.addEventListener('click', () => {
      MenuPage.router.goto('Fleet', 'eventRules');
    });

    const removeHandler = () => {
      [EVENTS.SECTOR_BLITZ_UPDATED, EVENTS.BLOCK_HEIGHT_CHANGED].forEach(name =>
        window.removeEventListener(name, SectorBlitzFleetCardComponent.refreshHandler)
      );
    };
    removeHandler();

    SectorBlitzFleetCardComponent.refreshHandler = (event) => {
      if (!document.getElementById(this.containerId)) {
        removeHandler();
        return;
      }
      if (event.type === EVENTS.BLOCK_HEIGHT_CHANGED) {
        const remaining = document.getElementById(this.remainingId);
        if (remaining) {
          remaining.textContent = SectorBlitzFormat.remaining(this.sectorBlitzManager.getMsRemaining());
        }
        return;
      }
      this.loadAndRender().then();
    };

    [EVENTS.SECTOR_BLITZ_UPDATED, EVENTS.BLOCK_HEIGHT_CHANGED].forEach(name =>
      window.addEventListener(name, SectorBlitzFleetCardComponent.refreshHandler)
    );

    this.initSectorLinks();
    this.loadAndRender().then();
  }

  /**
   * @return {string|null} the last scores shown for this contest phase, if any
   */
  lastBodyHTML() {
    const last = SectorBlitzFleetCardComponent.lastBody;
    return last?.key === this.cacheKey ? last.html : null;
  }

  async loadAndRender() {
    const contestId = this.contest.contest_id;
    let html;
    let loaded = false;

    try {
      const [standings, overall] = await Promise.all([
        this.influenceAPI.getStandings(contestId),
        this.influenceAPI.getGuildRanks(contestId, null, 1, 100, true),
      ]);
      html = this.isResults
        ? this.renderResultsHTML(standings.data, overall.data)
        : this.renderSectorsHTML(standings.data, overall.data);
      loaded = true;
    } catch (error) {
      console.debug('[SectorBlitz] fleet card unavailable:', error);
      // Scores already on screen are better than none.
      if (this.lastBodyHTML() !== null) return;
      html = `<div class="sector-blitz-empty">Sector data is currently unavailable.</div>`;
    }

    const body = document.querySelector(`#${this.containerId} .sector-blitz-fleet-card-body`);
    // Most score updates leave this card as it was. Redrawing it anyway flashes and drops hover.
    if (body && this.lastBodyHTML() !== html) {
      body.innerHTML = html;
      this.initSectorLinks();
    }
    if (body && loaded) {
      SectorBlitzFleetCardComponent.lastBody = {key: this.cacheKey, html};
    }
  }

  initSectorLinks() {
    document.querySelectorAll(`#${this.containerId} [data-sector-link]`).forEach(link => {
      link.addEventListener('click', () => {
        MenuPage.router.goto('Fleet', 'sectorLeaderboard', {sector: Number(link.dataset.sectorLink)});
      });
    });
  }

  /**
   * @param {number} sectorId
   * @return {string}
   */
  renderSectorLinkHTML(sectorId) {
    return SectorBlitzHTML.sectorLinkHTML(sectorId);
  }

  /**
   * @param {object[]} standings
   * @param {object[]} overall
   * @return {string}
   */
  renderSectorsHTML(standings, overall) {
    const sectorsHTML = SectorBlitzHTML.sectorsHTML(standings, overall, sectorId => this.renderSectorLinkHTML(sectorId));
    return `${sectorsHTML}${SectorBlitzHTML.legendHTML(overall)}`;
  }

  /**
   * @param {object[]} standings
   * @param {object[]} overall
   * @return {string}
   */
  renderResultsHTML(standings, overall) {
    return SectorBlitzHTML.resultsHTML(standings, overall, sectorId => this.renderSectorLinkHTML(sectorId));
  }
}
