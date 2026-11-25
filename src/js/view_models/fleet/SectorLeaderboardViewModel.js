import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {Pagination} from "../templates/partials/Pagination";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {EVENTS} from "../../constants/Events";
import {SECTOR_BLITZ} from "../../constants/SectorBlitzConstants";
import {SectorBlitzFormat} from "../../util/SectorBlitzFormat";
import {RaidTarget} from "../../util/RaidTarget";
import {SECTOR_BLITZ_TIPS} from "./EventRulesViewModel";
import {SectorBlitzHTML} from "../sector_blitz/SectorBlitzHTML";

const NO_ACTIVITY_HTML = SectorBlitzHTML.emptyHTML('No Activity in Sector');

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
    this.contentHTML = null;
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
    return SectorBlitzHTML.toTarget(row);
  }

  initPageCode() {
    document.querySelectorAll(`#${this.layoutId} [data-guild-view]`).forEach(btn => {
      btn.addEventListener('click', () => {
        MenuPage.router.goto('Guild', 'profile', {guildId: btn.dataset.guildView, navItemId: MenuPage.navItemFleetId});
      });
    });

    document.querySelectorAll(`#${this.layoutId} [data-player-target]`).forEach(btn => {
      btn.addEventListener('click', () => {
        // Looked up on click: an unchanged page keeps its rows while the data behind them refreshes.
        const row = (this.players?.data ?? []).find(player => player.player_id === btn.dataset.playerTarget);
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

  renderGuildRowsHTML() {
    const rows = this.guilds?.data ?? [];
    if (!rows.length) {
      return NO_ACTIVITY_HTML;
    }

    const rowsHTML = rows.map(row => SectorBlitzHTML.guildRowHTML(row,
      `<a href="javascript: void(0)" class="sui-screen-btn sui-mod-secondary" data-guild-view="${SectorBlitzFormat.escape(row.guild_id)}">View</a>`
    )).join('');

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
      const button = row.player_id === myId || !target.planet_id
        ? ''
        : `<a href="javascript: void(0)" class="sui-screen-btn sui-mod-secondary" data-player-target="${SectorBlitzFormat.escape(row.player_id)}">${RaidTarget.buttonLabel(target)}</a>`;
      return SectorBlitzHTML.playerRowHTML(row, button);
    }).join('');

    return `<div class="sui-result-rows sui-result-table">${rowsHTML}</div>${this.playerPagination.render()}`;
  }

  renderResultsHTML() {
    if (!this.sectorBlitzManager.isShowingResults()) {
      return '';
    }
    return SectorBlitzHTML.sectorResultsCardHTML(this.sector, this.podiumGuilds, this.podiumPlayers);
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

      const contentHTML = `
        <div id="${this.layoutId}" class="profile-layout sector-blitz-layout">

          ${this.renderResultsHTML()}

          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Your Performance</div>
            <div class="sui-data-card-body">${this.renderPerformanceHTML()}</div>
          </div>

          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Guild Leaderboard</div>
            <div class="sui-data-card-body sector-blitz-leaderboard-body">${this.renderGuildRowsHTML()}</div>
          </div>

          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Player Leaderboard</div>
            <div class="sui-data-card-body sector-blitz-leaderboard-body">${this.renderPlayerRowsHTML()}</div>
          </div>

        </div>
      `;

      // A live update arrives for any score in the contest, so this sector is usually unchanged.
      const isLiveUpdate = !scrollToTop && !!document.getElementById(this.layoutId);
      if (isLiveUpdate && contentHTML === this.contentHTML) {
        return;
      }
      this.contentHTML = contentHTML;

      if (isLiveUpdate) {
        MenuPage.keepScroll(() => MenuPage.setPageTemplateContent(contentHTML));
      } else {
        MenuPage.enablePageTemplate(MenuPage.navItemFleetId);

        MenuPage.setPageTemplateHeaderBtn(SectorBlitzFormat.sectorLabel(this.sector), true, () => {
          MenuPage.router.goto('Fleet', 'index');
        });

        MenuPage.setPageTemplateContent(contentHTML);
      }

      if (scrollToTop) {
        MenuPage.scrollPageTemplateToTop();
      }
      if (!isLiveUpdate) {
        MenuPage.hideAndClearDialoguePanel();
      }

      this.initPageCode();
      if (this.guilds?.data?.length) this.guildPagination.init();
      if (this.players?.data?.length) this.playerPagination.init();
    });
  }
}
