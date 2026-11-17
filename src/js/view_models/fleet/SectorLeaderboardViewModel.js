import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {Pagination} from "../templates/partials/Pagination";
import {PfpViewerComponent} from "../components/PfpViewerComponent";
import {PfpClientRenderAttributes} from "../../models/PfpClientRenderAttributes";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {EVENTS} from "../../constants/Events";
import {SECTOR_BLITZ} from "../../constants/SectorBlitzConstants";
import {SectorBlitzFormat} from "../../util/SectorBlitzFormat";
import {RaidTarget} from "../../util/RaidTarget";
import {SECTOR_BLITZ_TIPS} from "./EventRulesViewModel";

const NO_ACTIVITY_HTML = `<div class="sector-blitz-empty">No Activity in Sector</div>`;

/**
 * One sector's Your Performance, Guild Leaderboard and Player Leaderboard.
 * After the contest it is headed by the sector's results podium.
 */
export class SectorLeaderboardViewModel extends AbstractViewModel {

  /**
   * Shared across instances so each render replaces the previous live-update listener.
   * @type {function|null}
   */
  static updateHandler = null;

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {InfluenceAPI} influenceAPI
   * @param {SectorBlitzManager} sectorBlitzManager
   * @param {object} options {sector, guildPage, playerPage}
   */
  constructor(gameState, guildAPI, influenceAPI, sectorBlitzManager, options = {}) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.influenceAPI = influenceAPI;
    this.sectorBlitzManager = sectorBlitzManager;
    this.sector = Number(options.sector);
    this.guildPage = Math.max(1, parseInt(options.guildPage) || 1);
    this.playerPage = Math.max(1, parseInt(options.playerPage) || 1);
    this.options = {sector: this.sector, guildPage: this.guildPage, playerPage: this.playerPage};
    this.layoutId = 'sector-leaderboard-layout';

    this.contest = null;
    this.me = null;
    this.guilds = null;
    this.players = null;
    this.podiumGuilds = [];
    this.podiumPlayers = [];
  }

  async fetchPageData() {
    const contestId = this.contest.contest_id;
    const pageSize = SECTOR_BLITZ.LEADERBOARD_PAGE_SIZE;
    const isResults = this.sectorBlitzManager.isShowingResults();

    const [me, guilds, players, podiumGuilds, podiumPlayers] = await Promise.all([
      this.influenceAPI.getPlayer(contestId, this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id, this.sector),
      this.influenceAPI.getGuildRanks(contestId, this.sector, this.guildPage, pageSize),
      this.influenceAPI.getPlayerRanks(contestId, this.sector, this.playerPage, pageSize),
      isResults
        ? this.influenceAPI.getGuildRanks(contestId, this.sector, 1, SECTOR_BLITZ.RESULTS_TOP_GUILDS)
        : Promise.resolve(null),
      isResults
        ? this.influenceAPI.getPlayerRanks(contestId, this.sector, 1, SECTOR_BLITZ.RESULTS_TOP_PLAYERS)
        : Promise.resolve(null),
    ]);

    this.me = me;
    this.guilds = guilds;
    this.players = players;
    this.podiumGuilds = podiumGuilds?.data ?? [];
    this.podiumPlayers = podiumPlayers?.data ?? [];
  }

  /**
   * @param {object} row player rank row
   * @return {object} raid target fields
   */
  toTarget(row) {
    return {
      id: row.player_id,
      planet_id: row.profile?.planet_id,
      undiscovered_ore: row.profile?.undiscovered_ore,
      ore: row.profile?.ore,
      under_attack: row.profile?.under_attack,
      fleet_status: row.profile?.fleet_status,
    };
  }

  initPageCode() {
    document.querySelectorAll(`#${this.layoutId} [data-guild-view]`).forEach(btn => {
      btn.addEventListener('click', () => {
        MenuPage.router.goto('Guild', 'profile', {guildId: btn.dataset.guildView, navItemId: MenuPage.navItemFleetId});
      });
    });

    const rowsById = new Map((this.players?.data ?? []).map(row => [row.player_id, row]));
    document.querySelectorAll(`#${this.layoutId} [data-player-target]`).forEach(btn => {
      btn.addEventListener('click', () => {
        const row = rowsById.get(btn.dataset.playerTarget);
        if (row) {
          RaidTarget.preview(this.guildAPI, this.toTarget(row));
        }
      });
    });

    window.removeEventListener(EVENTS.SECTOR_BLITZ_UPDATED, SectorLeaderboardViewModel.updateHandler);
    SectorLeaderboardViewModel.updateHandler = () => {
      if (!document.getElementById(this.layoutId)) {
        window.removeEventListener(EVENTS.SECTOR_BLITZ_UPDATED, SectorLeaderboardViewModel.updateHandler);
        return;
      }
      this.render(false);
    };
    window.addEventListener(EVENTS.SECTOR_BLITZ_UPDATED, SectorLeaderboardViewModel.updateHandler);
  }

  /**
   * @param {string} label
   * @param {string} value
   * @param {string|null} tip
   * @param {boolean} showIcon
   * @param {string|null} tipPlacement e.g. 'bottom' for a tip that would be cut off above
   * @return {string}
   */
  renderStatRowHTML(label, value, tip = null, showIcon = true, tipPlacement = null) {
    const placementAttr = tipPlacement ? ` data-sui-mod-placement="${tipPlacement}"` : '';
    const tipHTML = tip
      ? `
        <a class="sui-text-secondary" href="javascript: void(0)" data-sui-tooltip="${tip}"${placementAttr}>
          <i class="sui-icon icon-tip"></i>
        </a>
      `
      : '';
    return `
      <div class="sui-data-card-row">
        <div>${label} ${tipHTML}</div>
        ${showIcon
          ? `<a class="sui-resource sector-blitz-points" href="javascript: void(0)" data-sui-tooltip="Influence Points" data-sui-mod-placement="bottom">
              <span>${value}</span>
              ${SECTOR_BLITZ.INFLUENCE_ICON_HTML}
            </a>`
          : `<div class="sector-blitz-points">${value}</div>`}
      </div>
    `;
  }

  renderPerformanceHTML() {
    if (!this.me || BigInt(this.me.points ?? '0') === 0n) {
      return NO_ACTIVITY_HTML;
    }

    const sectorRow = (this.me.sectors ?? []).find(row => Number(row.sector) === this.sector)
      ?? {unique_planets: this.me.unique_planets, held_planets: this.me.held_planets};
    const earnedFromRaids = (BigInt(sectorRow.unique_planets) * BigInt(this.contest.win_points)).toString();
    const kothBonus = (BigInt(sectorRow.held_planets) * BigInt(this.contest.claim_points)).toString();

    return `
      ${this.renderStatRowHTML('Leaderboard Position', SectorBlitzFormat.rank(this.me.rank), null, false)}
      ${this.renderStatRowHTML('Earned from Raids', SectorBlitzFormat.escape(earnedFromRaids), SECTOR_BLITZ_TIPS.RAID_WIN)}
      ${this.renderStatRowHTML('KOTH Bonus', SectorBlitzFormat.escape(kothBonus), SECTOR_BLITZ_TIPS.KOTH, true, 'bottom')}
      ${this.renderStatRowHTML('Sector Score', SectorBlitzFormat.escape(this.me.points), SECTOR_BLITZ_TIPS.SECTOR_SCORE)}
      ${this.renderStatRowHTML('Total Event Score', SectorBlitzFormat.escape(this.me.overall_points), SECTOR_BLITZ_TIPS.TOTAL_SCORE)}
    `;
  }

  /**
   * @param {object|null} profile
   * @return {string}
   */
  renderGuildIconHTML(profile) {
    if (profile?.logo) {
      return `
        <div class="sui-result-row-portrait">
          <img class="sui-result-row-portrait-image sector-blitz-guild-logo" src="${SectorBlitzFormat.escape(profile.logo)}" alt="">
        </div>
      `;
    }
    return `
      <div class="sui-result-row-portrait sector-blitz-guild-placeholder sui-text-secondary">
        <i class="sui-icon sui-icon-md icon-unknown"></i>
      </div>
    `;
  }

  /**
   * @param {string} points
   * @param {string} rank
   * @return {string}
   */
  renderScoreHTML(points, rank) {
    return `
      <div class="sui-result-row-resources">
        <a class="sui-resource" href="javascript: void(0)" data-sui-tooltip="Influence Points">
          <span>${SectorBlitzFormat.points(points)}</span>
          ${SECTOR_BLITZ.INFLUENCE_ICON_HTML}
        </a>
        <div class="sector-blitz-rank">${SectorBlitzFormat.rank(rank)}</div>
      </div>
    `;
  }

  renderGuildRowsHTML() {
    const rows = this.guilds?.data ?? [];
    if (!rows.length) {
      return NO_ACTIVITY_HTML;
    }

    const rowsHTML = rows.map(row => `
      <div class="sui-result-row">
        <div class="sui-result-row-left-section">
          ${this.renderGuildIconHTML(row.profile)}
          <div class="sui-result-row-player-info">
            <div class="sui-text-label-block">${SectorBlitzFormat.guildName(row.profile, row.guild_id)}</div>
          </div>
        </div>
        <div class="sui-result-row-right-section">
          ${this.renderScoreHTML(row.points, row.rank)}
          <a href="javascript: void(0)" class="sui-screen-btn sui-mod-secondary" data-guild-view="${SectorBlitzFormat.escape(row.guild_id)}">View</a>
        </div>
      </div>
    `).join('');

    return `<div class="sui-result-rows sui-result-table">${rowsHTML}</div>${this.guildPagination.render()}`;
  }

  renderPlayerRowsHTML() {
    const rows = this.players?.data ?? [];
    if (!rows.length) {
      return NO_ACTIVITY_HTML;
    }

    const myId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;

    const rowsHTML = rows.map(row => {
      const target = this.toTarget(row);
      const pfpViewer = new PfpViewerComponent(PfpClientRenderAttributes.fromJson(row.profile?.pfp_client_render_attributes ?? null));
      const button = row.player_id === myId || !target.planet_id
        ? ''
        : `<a href="javascript: void(0)" class="sui-screen-btn sui-mod-secondary" data-player-target="${SectorBlitzFormat.escape(row.player_id)}">${RaidTarget.buttonLabel(target)}</a>`;

      return `
        <div class="sui-result-row">
          <div class="sui-result-row-left-section">
            <div class="sui-result-row-portrait">
              <div class="sui-result-row-portrait-image">${pfpViewer.renderHTML()}</div>
            </div>
            <div class="sui-result-row-player-info">
              <div class="sui-text-label-block">
                ${SectorBlitzFormat.playerName(row.profile, row.player_id)}<br>
                ${RaidTarget.statusBadgeHTML(target)}
              </div>
            </div>
          </div>
          <div class="sui-result-row-right-section">
            ${this.renderScoreHTML(row.points, row.rank)}
            ${button}
          </div>
        </div>
      `;
    }).join('');

    return `<div class="sui-result-rows sui-result-table">${rowsHTML}</div>${this.playerPagination.render()}`;
  }

  /**
   * Places follow the shared ranks, so tied entries get the same label.
   *
   * @param {object[]} rows
   * @param {function(object): string} nameFn
   * @return {string}
   */
  renderPlaceNames(rows, nameFn) {
    const places = {'1': 'Tied First', '2': 'Second Place', '3': 'Third Place', '4': 'Fourth Place'};
    return rows.map(row => `
      <div class="sector-blitz-podium-place">
        <div class="sui-text-header">${places[row.rank] ?? SectorBlitzFormat.rank(row.rank)}</div>
        <div class="sui-text-header sector-blitz-podium-name">${nameFn(row)}</div>
      </div>
    `).join('');
  }

  renderResultsHTML() {
    if (!this.sectorBlitzManager.isShowingResults()) {
      return '';
    }

    const guildName = row => SectorBlitzFormat.guildName(row.profile, row.guild_id);
    const playerName = row => SectorBlitzFormat.playerName(row.profile, row.player_id);
    const [topGuild, ...otherGuilds] = this.podiumGuilds;
    const [topPlayer, ...otherPlayers] = this.podiumPlayers;

    const guildsHTML = topGuild
      ? `
        <div class="sector-blitz-podium">
          <div class="sui-text-header">Top Guild</div>
          <div class="sui-text-display sui-text-secondary">${guildName(topGuild)}</div>
          <div class="sector-blitz-podium-places">${this.renderPlaceNames(otherGuilds, guildName)}</div>
        </div>
      `
      : '';
    const playersHTML = topPlayer
      ? `
        <div class="sector-blitz-podium">
          <div class="sui-text-header">Top Player</div>
          <div class="sui-text-display">${playerName(topPlayer)}</div>
          <div class="sector-blitz-podium-places">${this.renderPlaceNames(otherPlayers, playerName)}</div>
        </div>
      `
      : '';

    return `
      <div class="sui-data-card sector-blitz-fleet-card">
        <div class="sector-blitz-fleet-card-header">
          <div class="sector-blitz-title">
            <i class="sui-icon sui-icon-md icon-guild sui-text-primary"></i>
            <div class="sector-blitz-title-text">
              <div class="sui-text-header sui-text-primary">Sector Results</div>
              <div class="sui-text-header">${SectorBlitzFormat.sectorLabel(this.sector)}</div>
            </div>
          </div>
        </div>
        ${guildsHTML || playersHTML ? `${guildsHTML}${playersHTML}` : NO_ACTIVITY_HTML}
      </div>
    `;
  }

  /**
   * @param {boolean} scrollToTop false for live refreshes, so the reader keeps their place
   */
  render(scrollToTop = true) {
    // Anything awaited below may finish after the player has moved on to another page.
    const navigationId = MenuPage.router.navigationId;

    this.sectorBlitzManager.refresh().then(async () => {
      if (navigationId !== MenuPage.router.navigationId) {
        return;
      }
      if (!this.sectorBlitzManager.isVisible()) {
        MenuPage.router.goto('Fleet', 'index');
        return;
      }

      this.contest = this.sectorBlitzManager.contest;

      try {
        await this.fetchPageData();
      } catch (error) {
        console.debug('[SectorBlitz] leaderboard unavailable:', error);
      }

      // The player may have moved on while the scores loaded.
      if (navigationId !== MenuPage.router.navigationId) {
        return;
      }

      const pageSize = SECTOR_BLITZ.LEADERBOARD_PAGE_SIZE;
      this.guildPagination = new Pagination(
        this.guildPage, pageSize, Number(this.guilds?.total ?? 0),
        'sector-guilds', 'Fleet', 'sectorLeaderboard', this.options, 'guildPage'
      );
      this.playerPagination = new Pagination(
        this.playerPage, pageSize, Number(this.players?.total ?? 0),
        'sector-players', 'Fleet', 'sectorLeaderboard', this.options, 'playerPage'
      );

      MenuPage.enablePageTemplate(MenuPage.navItemFleetId);

      MenuPage.setPageTemplateHeaderBtn(SectorBlitzFormat.sectorLabel(this.sector), true, () => {
        MenuPage.router.goto('Fleet', 'index');
      });

      MenuPage.setPageTemplateContent(`
        <div id="${this.layoutId}" class="profile-layout sector-blitz-layout">

          ${this.renderResultsHTML()}

          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Your Performance</div>
            <div class="sui-data-card-body">${this.renderPerformanceHTML()}</div>
          </div>

          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Guild Leaderboard</div>
            <div class="sui-data-card-body">${this.renderGuildRowsHTML()}</div>
          </div>

          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Player Leaderboard</div>
            <div class="sui-data-card-body">${this.renderPlayerRowsHTML()}</div>
          </div>

        </div>
      `);

      if (scrollToTop) {
        MenuPage.scrollPageTemplateToTop();
      }
      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
      if (this.guilds?.data?.length) this.guildPagination.init();
      if (this.players?.data?.length) this.playerPagination.init();
    });
  }
}
