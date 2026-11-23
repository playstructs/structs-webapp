import {SECTOR_BLITZ} from "../../constants/SectorBlitzConstants";
import {TASK} from "../../constants/TaskConstants";
import {SectorBlitzFormat} from "../../util/SectorBlitzFormat";
import {SectorBlitzHTML} from "./SectorBlitzHTML";
import {Pagination} from "../templates/partials/Pagination";

const PHASES = Object.freeze({NONE: 'none', ACTIVE: 'active', RESULTS: 'results'});

/** The page numbers each list keeps in the URL's query string. */
const PAGE_PARAMS = Object.freeze({guilds: 'guildPage', players: 'playerPage', battles: 'battlePage'});

/**
 * Pagination that changes a page number in the URL instead of using the menu router.
 */
class PublicPagination extends Pagination {

  /**
   * @param {number} currentPage
   * @param {number} resultsPerPage
   * @param {number} totalResults
   * @param {string} idPrefix
   * @param {function(number)} onPage
   */
  constructor(currentPage, resultsPerPage, totalResults, idPrefix, onPage) {
    super(currentPage, resultsPerPage, totalResults, idPrefix, null, null);
    this.onPage = onPage;
  }

  goto(page) {
    this.onPage(page);
  }
}

/**
 * The public Sector Blitz leaderboard (/sector-blitz and /sector-blitz/{sector}).
 *
 * Anyone can open it, so it only reads the cached public API, and it refreshes itself at a
 * random point 30-60 seconds after each load so viewers don't all ask at once. It stops
 * refreshing while the browser tab is hidden.
 */
export class PublicLeaderboardPage {

  /**
   * @param {HTMLElement} root
   * @param {PublicSectorBlitzAPI} api
   */
  constructor(root, api) {
    this.root = root;
    this.api = api;
    this.sector = root.dataset.sector ? Number(root.dataset.sector) : null;
    this.homeUrl = root.dataset.homeUrl || '/sector-blitz';
    this.playUrl = root.dataset.playUrl || '/';

    this.pages = this.readPages();
    this.refreshTimer = null;
    this.lastLoadedAt = 0;
    this.requestId = 0;
    this.hasRendered = false;
    /** @type {PublicPagination[]} */
    this.paginations = [];
  }

  start() {
    window.addEventListener('popstate', () => {
      this.pages = this.readPages();
      this.load().then();
    });
    document.addEventListener('visibilitychange', () => this.onVisibilityChange());
    this.load().then();
  }

  /**
   * @return {{guilds: number, players: number, battles: number}}
   */
  readPages() {
    const params = new URLSearchParams(window.location.search);
    const page = name => Math.min(1000, Math.max(1, parseInt(params.get(name)) || 1));
    return {
      guilds: page(PAGE_PARAMS.guilds),
      players: page(PAGE_PARAMS.players),
      battles: page(PAGE_PARAMS.battles),
    };
  }

  /**
   * Show another page of one list, keeping it in the URL so Back and shared links work.
   *
   * @param {string} list guilds, players or battles
   * @param {number} page
   */
  gotoPage(list, page) {
    this.pages = {...this.pages, [list]: page};
    const params = new URLSearchParams(window.location.search);
    if (page > 1) {
      params.set(PAGE_PARAMS[list], `${page}`);
    } else {
      params.delete(PAGE_PARAMS[list]);
    }
    const query = params.toString();
    window.history.pushState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
    this.load().then();
  }

  onVisibilityChange() {
    if (document.hidden) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
      return;
    }
    const due = this.lastLoadedAt + SECTOR_BLITZ.PUBLIC_REFRESH_MIN_MS - Date.now();
    if (due <= 0) {
      this.load().then();
    } else {
      this.scheduleRefresh(due + Math.random() * SECTOR_BLITZ.PUBLIC_REFRESH_JITTER_MS);
    }
  }

  /**
   * @param {number} delay ms; by default 30-60 seconds
   */
  scheduleRefresh(delay = SECTOR_BLITZ.PUBLIC_REFRESH_MIN_MS + Math.random() * SECTOR_BLITZ.PUBLIC_REFRESH_JITTER_MS) {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = null;
    if (document.hidden) {
      return;
    }
    this.refreshTimer = setTimeout(() => this.load().then(), delay);
  }

  async load() {
    const requestId = ++this.requestId;
    clearTimeout(this.refreshTimer);
    this.refreshTimer = null;

    const isMain = this.sector === null;
    const results = await Promise.allSettled([
      this.api.getSummary(this.sector),
      this.api.getGuilds(this.sector, this.pages.guilds),
      this.api.getPlayers(this.sector, this.pages.players),
      isMain ? this.api.getBattles(this.pages.battles) : Promise.resolve(null),
    ]);

    // A newer load (a page change) has started since.
    if (requestId !== this.requestId) {
      return;
    }

    const [summary, guilds, players, battles] = results.map(result => result.status === 'fulfilled' ? result.value : null);
    results.filter(result => result.status === 'rejected')
      .forEach(result => console.debug('[SectorBlitz] public leaderboard unavailable:', result.reason));

    // A failed refresh keeps what is already on screen.
    if (summary || !this.hasRendered) {
      this.render(summary, guilds, players, battles);
      this.hasRendered = true;
    }
    this.lastLoadedAt = Date.now();
    this.scheduleRefresh();
  }

  /**
   * @param {object|null} summary
   * @param {object|null} guilds
   * @param {object|null} players
   * @param {object|null} battles
   */
  render(summary, guilds, players, battles) {
    this.paginations = [];
    // Before a contest starts and once its results stop showing, there is nothing to list.
    const phase = summary?.phase ?? null;
    const sections = this.sector === null
      ? [
        this.renderTopRowHTML(summary),
        // The event is over once its results show, so there are no battles to follow.
        phase === PHASES.RESULTS ? '' : this.renderBattlesHTML(battles),
        this.renderGuildsHTML(guilds, phase),
        this.renderPlayersHTML(players, phase),
      ]
      : [
        this.renderSectorCardHTML(summary),
        this.renderGuildsHTML(guilds, phase),
        this.renderPlayersHTML(players, phase),
      ];

    this.root.innerHTML = `
      <div class="sui-page-header">${this.renderHeaderHTML()}</div>
      <div class="sui-screen-body">
        <div class="sector-blitz-layout public-leaderboard-content">${sections.join('')}</div>
      </div>
    `;

    this.paginations.forEach(pagination => pagination.init());
  }

  renderHeaderHTML() {
    if (this.sector === null) {
      return `<div class="sui-nav-btn public-leaderboard-heading"><h1 class="public-leaderboard-title">Event Leaderboard</h1></div>`;
    }
    return `
      <a href="${SectorBlitzFormat.escape(this.homeUrl)}" class="sui-nav-btn">
        <i class="sui-icon-sm icon-chevron-left sui-text-secondary"></i>
        <h1 class="public-leaderboard-title">${SectorBlitzFormat.sectorLabel(this.sector)} Leaderboard</h1>
      </a>
    `;
  }

  /**
   * @param {number} sectorId
   * @return {string}
   */
  sectorUrl(sectorId) {
    return `${this.homeUrl.replace(/\/$/, '')}/${sectorId}`;
  }

  /**
   * @param {object|null} summary
   * @return {string} e.g. 4D 23H 16M, or N/A when no contest is running
   */
  remainingText(summary) {
    if (summary?.phase !== PHASES.ACTIVE || !summary.contest) {
      return 'N/A';
    }
    const blocks = Number(summary.contest.end_height) - Number(summary.contest.height);
    return SectorBlitzFormat.remaining(Math.max(0, blocks) * TASK.ESTIMATED_BLOCK_TIME);
  }

  /**
   * @param {string} iconClass
   * @param {string} title
   * @param {string} subtitle
   * @return {string}
   */
  cardHeaderHTML(iconClass, title, subtitle) {
    return `
      <div class="sector-blitz-fleet-card-header">
        <div class="sector-blitz-title">
          <i class="sui-icon sui-icon-md ${iconClass} sui-text-primary"></i>
          <div class="sector-blitz-title-text">
            <div class="sui-text-header sui-text-primary">${title}</div>
            <div class="sui-text-header">${subtitle}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * The Sector Blitz card and the Play Now card.
   *
   * @param {object|null} summary
   * @return {string}
   */
  renderTopRowHTML(summary) {
    const isResults = summary?.phase === PHASES.RESULTS;
    const link = sectorId => SectorBlitzHTML.sectorLinkHTML(sectorId, this.sectorUrl(sectorId));
    const standings = summary?.standings ?? [];
    const overall = summary?.guilds ?? [];

    let bodyHTML;
    if (!summary) {
      bodyHTML = SectorBlitzHTML.emptyHTML('Sector data is currently unavailable.');
    } else if (isResults) {
      bodyHTML = SectorBlitzHTML.resultsHTML(standings, overall, link);
    } else {
      bodyHTML = `${SectorBlitzHTML.sectorsHTML(standings, overall, link)}${SectorBlitzHTML.legendHTML(overall)}`;
    }

    return `
      <div class="public-leaderboard-top">
        <div class="sui-data-card sector-blitz-fleet-card${isResults ? ' sector-blitz-fleet-card-results' : ''}">
          ${this.cardHeaderHTML('icon-guild', SECTOR_BLITZ.NAME, isResults ? 'Event Results' : `${this.remainingText(summary)} Remaining`)}
          <div class="sector-blitz-fleet-card-body">${bodyHTML}</div>
        </div>
        <div class="public-leaderboard-play">
          <img class="public-leaderboard-play-logo" src="/img/sector-blitz/glitch-grey.gif" alt="Structs">
          <a href="${SectorBlitzFormat.escape(this.playUrl)}" class="sui-screen-btn sui-mod-primary public-leaderboard-play-btn">Play Now</a>
        </div>
      </div>
    `;
  }

  /**
   * The drill-down's sector card: statistics while the contest runs, the podium after it.
   *
   * @param {object|null} summary
   * @return {string}
   */
  renderSectorCardHTML(summary) {
    if (summary?.phase === PHASES.RESULTS) {
      return SectorBlitzHTML.sectorResultsCardHTML(this.sector, summary.podium?.guilds ?? [], summary.podium?.players ?? []);
    }

    const overall = summary?.guilds ?? [];
    const label = sectorId => `<span class="sui-text-header">${SectorBlitzFormat.sectorLabel(sectorId)}</span>`;
    const bodyHTML = summary
      ? `${SectorBlitzHTML.sectorsHTML(summary.standings ?? [], overall, label, [this.sector])}${SectorBlitzHTML.legendHTML(overall)}`
      : SectorBlitzHTML.emptyHTML('Sector data is currently unavailable.');

    return `
      <div class="sui-data-card sector-blitz-fleet-card">
        ${this.cardHeaderHTML('icon-raid', `${SectorBlitzFormat.sectorLabel(this.sector)} Statistics`, `${this.remainingText(summary)} Remaining`)}
        <div class="sector-blitz-fleet-card-body">${bodyHTML}</div>
      </div>
    `;
  }

  /**
   * @param {string} title
   * @param {string} bodyHTML
   * @return {string}
   */
  listCardHTML(title, bodyHTML) {
    return `
      <section class="sui-data-card">
        <h2 class="sui-data-card-header sui-text-header">${title}</h2>
        <div class="sui-data-card-body sector-blitz-leaderboard-body">${bodyHTML}</div>
      </section>
    `;
  }

  /**
   * @param {string} list
   * @param {object|null} response
   * @param {number} pageSize
   * @return {PublicPagination}
   */
  pagination(list, response, pageSize) {
    return new PublicPagination(
      this.pages[list], pageSize, Number(response?.total ?? 0), `public-${list}`, page => this.gotoPage(list, page)
    );
  }


  /**
   * @param {string} list
   * @param {object|null} response
   * @param {number} pageSize
   * @param {function(object): string} rowFn
   * @param {string} emptyMessage
   * @return {string}
   */
  rowsHTML(list, response, pageSize, rowFn, emptyMessage) {
    if (!response) {
      return SectorBlitzHTML.emptyHTML('Currently unavailable');
    }
    const rows = response.data ?? [];
    if (!rows.length) {
      return SectorBlitzHTML.emptyHTML(emptyMessage);
    }
    // init() wires up the page buttons this same instance rendered.
    const pagination = this.pagination(list, response, pageSize);
    this.paginations.push(pagination);
    return `
      <div class="sui-result-rows sui-result-table">${rows.map(rowFn).join('')}</div>
      ${pagination.render()}
    `;
  }

  /**
   * @param {object|null} guilds
   * @param {string} phase
   * @return {string}
   */
  renderGuildsHTML(guilds, phase) {
    const rows = phase === PHASES.NONE ? {data: [], total: '0'} : guilds;
    return this.listCardHTML('Top Guilds', this.rowsHTML('guilds', rows, SECTOR_BLITZ.LEADERBOARD_PAGE_SIZE,
      row => SectorBlitzHTML.publicGuildRowHTML(row), 'No Activity'));
  }

  /**
   * @param {object|null} players
   * @param {string} phase
   * @return {string}
   */
  renderPlayersHTML(players, phase) {
    const rows = phase === PHASES.NONE ? {data: [], total: '0'} : players;
    return this.listCardHTML('Top Players', this.rowsHTML('players', rows, SECTOR_BLITZ.LEADERBOARD_PAGE_SIZE,
      row => SectorBlitzHTML.playerRowHTML(row), 'No Activity'));
  }

  /**
   * @param {object} battle
   * @return {string}
   */
  battleRowHTML(battle) {
    const spectateHref = `${this.playUrl}?${new URLSearchParams({spectate: battle.planet_id})}`;
    return SectorBlitzHTML.battleRowHTML(battle.defender, battle.attacker,
      `<a href="${SectorBlitzFormat.escape(spectateHref)}" class="sui-screen-btn sui-mod-secondary public-battle-spectate-btn">Spectate</a>`);
  }

  /**
   * @param {object|null} battles
   * @return {string}
   */
  renderBattlesHTML(battles) {
    return this.listCardHTML('Current Battles', this.rowsHTML('battles', battles, SECTOR_BLITZ.PUBLIC_BATTLES_PAGE_SIZE,
      battle => this.battleRowHTML(battle), 'No Battles in Progress'));
  }
}

