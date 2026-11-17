import {MenuPage} from "../../framework/MenuPage";
import {EVENTS} from "../../constants/Events";
import {
  SECTOR_BLITZ,
  SECTOR_BLITZ_GUILD_COLOURS,
  SECTOR_BLITZ_OTHER_COLOUR,
  SECTORS
} from "../../constants/SectorBlitzConstants";
import {SectorBlitzFormat} from "../../util/SectorBlitzFormat";

/**
 * The Sector Blitz card at the top of the Fleet Status page: live sector control bars
 * while a contest runs, and the winning guilds while its results are shown.
 */
export class SectorBlitzFleetCardComponent {

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
      <div id="${this.containerId}" class="sui-data-card sector-blitz-fleet-card">
        ${this.renderHeaderHTML()}
        <div class="sector-blitz-fleet-card-body">
          <div class="sector-blitz-fleet-card-loading">
            <img src="/img/loading-3-dots.gif" class="loading-3-dots" alt="3 dots loading animation">
          </div>
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

    this.loadAndRender().then();
  }

  async loadAndRender() {
    const contestId = this.contest.contest_id;
    let html;

    try {
      const [standings, overall] = await Promise.all([
        this.influenceAPI.getStandings(contestId),
        this.influenceAPI.getGuildRanks(contestId, null, 1, 100, true),
      ]);
      html = this.isResults
        ? this.renderResultsHTML(standings.data, overall.data)
        : this.renderSectorsHTML(standings.data, overall.data);
    } catch (error) {
      console.debug('[SectorBlitz] fleet card unavailable:', error);
      html = `<div class="sector-blitz-empty">Sector data is currently unavailable.</div>`;
    }

    const body = document.querySelector(`#${this.containerId} .sector-blitz-fleet-card-body`);
    if (body) {
      body.innerHTML = html;
      this.initSectorLinks();
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
    return `
      <a href="javascript: void(0)" class="sector-blitz-sector-link sui-text-header" data-sector-link="${sectorId}">
        ${SectorBlitzFormat.sectorLabel(sectorId)}
        <i class="sui-icon sui-icon-sm icon-chevron-right sui-text-secondary"></i>
      </a>
    `;
  }

  /**
   * @param {object[]} overall ranked guilds with profiles
   * @return {Map<string, object>}
   */
  profilesById(overall) {
    return new Map(overall.map(row => [row.guild_id, row.profile]));
  }

  /**
   * @param {object[]} rows standings rows for one sector
   * @return {object[]} the sector's leaders (several when tied), empty if nobody scored
   */
  sectorLeaders(rows) {
    return rows.filter(row => row.sector_rank === '1' && BigInt(row.points) > 0n);
  }

  /**
   * @param {object[]} leaders
   * @param {Map<string, object>} profiles
   * @param {boolean} useTag
   * @return {string}
   */
  guildNames(leaders, profiles, useTag) {
    return leaders.map(row => {
      const profile = profiles.get(row.guild_id);
      if (useTag && profile?.tag) {
        return `[${SectorBlitzFormat.escape(profile.tag)}]`;
      }
      return SectorBlitzFormat.guildName(profile, row.guild_id);
    }).join(' / ');
  }

  /**
   * @param {object[]} standings
   * @param {object[]} overall
   * @return {string}
   */
  renderSectorsHTML(standings, overall) {
    const profiles = this.profilesById(overall);
    const topGuilds = overall.slice(0, SECTOR_BLITZ.FLEET_CARD_TOP_GUILDS).map(row => row.guild_id);

    const sectorsHTML = SECTORS.map(sector => {
      const rows = standings.filter(row => Number(row.sector) === sector.id);
      const total = rows.reduce((sum, row) => sum + BigInt(row.points), 0n);
      const leaders = this.sectorLeaders(rows);

      let barHTML = `<div class="sector-blitz-bar sector-blitz-bar-empty"></div>`;
      if (total > 0n) {
        const pointsFor = guildId => BigInt(rows.find(row => row.guild_id === guildId)?.points ?? '0');
        const topPoints = topGuilds.map(pointsFor);
        const otherPoints = total - topPoints.reduce((sum, points) => sum + points, 0n);
        const segment = (points, colourClass) => points > 0n
          ? `<div class="sector-blitz-bar-segment ${colourClass}" style="flex-grow: ${Number((points * 10000n) / total)}"></div>`
          : '';

        // Everyone else on the left, then 3rd, 2nd and the overall leader on the right.
        barHTML = `
          <div class="sector-blitz-bar">
            ${segment(otherPoints, SECTOR_BLITZ_OTHER_COLOUR)}
            ${topPoints.map((points, i) => ({points, i})).reverse()
              .map(({points, i}) => segment(points, SECTOR_BLITZ_GUILD_COLOURS[i])).join('')}
          </div>
        `;
      }

      return `
        <div class="sector-blitz-sector-row">
          <div class="sector-blitz-sector-row-header">
            ${this.renderSectorLinkHTML(sector.id)}
            <span class="sui-text-header">${leaders.length ? this.guildNames(leaders, profiles, true) : ''}</span>
          </div>
          ${barHTML}
        </div>
      `;
    }).join('');

    const legendHTML = topGuilds.length
      ? `
        <div class="sector-blitz-legend">
          ${topGuilds.map((guildId, i) => `
            <span class="sector-blitz-legend-item sui-text-header">
              <span class="sector-blitz-legend-dot ${SECTOR_BLITZ_GUILD_COLOURS[i]}"></span>
              ${SectorBlitzFormat.guildName(profiles.get(guildId), guildId)}
            </span>
          `).join('')}
          <span class="sector-blitz-legend-item sui-text-header">
            <span class="sector-blitz-legend-dot ${SECTOR_BLITZ_OTHER_COLOUR}"></span>
            Other
          </span>
        </div>
      `
      : '';

    return `${sectorsHTML}${legendHTML}`;
  }

  /**
   * @param {object[]} standings
   * @param {object[]} overall
   * @return {string}
   */
  renderResultsHTML(standings, overall) {
    const profiles = this.profilesById(overall);
    const winners = overall.filter(row => row.rank === '1' && row.sectors_controlled > 0);
    const winnerHTML = winners.length
      ? winners.map(row => SectorBlitzFormat.guildName(row.profile, row.guild_id)).join(' / ')
      : 'No Winner';

    const sectorsHTML = SECTORS.map(sector => {
      const leaders = this.sectorLeaders(standings.filter(row => Number(row.sector) === sector.id));
      return `
        <div class="sector-blitz-results-sector">
          ${this.renderSectorLinkHTML(sector.id)}
          <div class="sui-text-header">${leaders.length ? this.guildNames(leaders, profiles, false) : '&mdash;'}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="sector-blitz-results-winner">
        <div class="sui-text-header">Winning Guild</div>
        <div class="sui-text-display sui-text-secondary">${winnerHTML}</div>
      </div>
      <div class="sector-blitz-results-sectors">${sectorsHTML}</div>
    `;
  }
}
