import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NumberFormatter} from "../../util/NumberFormatter";
import {Pagination} from "../templates/partials/Pagination";
import {PAGINATION_LIMITS} from "../../constants/PaginationLimits";
import {PlanetRaidFactory} from "../../factories/PlanetRaidFactory";

export class ScanResultsViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {FleetManager} fleetManager
   * @param {GrassManager} grassManager
   * @param {RaidManager} raidManager
   * @param {MapManager} mapManager
   * @param {RaidSearchRequestDTO|object} raidSearchRequest
   */
  constructor(
    gameState,
    guildAPI,
    fleetManager,
    grassManager,
    raidManager,
    mapManager,
    raidSearchRequest
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.fleetManager = fleetManager;
    this.grassManager = grassManager;
    this.raidManager = raidManager;
    this.mapManager = mapManager;
    this.raidSearchRequest = raidSearchRequest;
    this.planetRaidFactory = new PlanetRaidFactory();
    this.numberFormatter = new NumberFormatter();
    this.players = [];
  }

  initPageCode() {
    this.players.forEach((player) => {
      document.getElementById(`scan-${player.id}`).addEventListener('click', () => {

        this.guildAPI.getActivePlanetRaidByPlanetId(player.planet_id).then(
          planetRaid => {
            MenuPage.router.goto('Fleet', 'preview', {
              planet_id: player.planet_id,
              planet_undiscovered_ore: player.undiscovered_ore ? player.undiscovered_ore : 0,
              defender_id: player.id,
              defender_ore: player.ore ? player.ore : 0,
              attacker_id: planetRaid.isRaidActive() ? planetRaid.fleet_owner : null
            });
          }
        );
      });
    })
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderIconHTML(playerSearchResultDTO) {
    let html = `
      <div class="sui-result-row-portrait">
        <div class="sui-result-row-portrait-image"></div>
      </div>
    `;

    if (!playerSearchResultDTO.pfp) {
      html = `
        <div class="sui-result-row-portrait-icon sui-text-secondary">
          <i class="sui-icon sui-icon-md icon-unknown"></i>
        </div>
      `;
    }

    return html;
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderPlayerInfoHTML(playerSearchResultDTO) {
    let tag = playerSearchResultDTO.tag
      ? `<span class="sui-mod-secondary">[${playerSearchResultDTO.tag}]</span>`
      : '';
    let username = playerSearchResultDTO.username
      ? playerSearchResultDTO.username
      : `PID #${playerSearchResultDTO.id}`;
    let fleetBadge = playerSearchResultDTO.fleet_status === 'away'
      ? `<span class="sui-badge sui-mod-default">Fleet Away</span>`
      : `<span class="sui-badge sui-mod-warning">On Station</span>`;

    return `
      <div class="sui-result-row-player-info">
        <div class="sui-text-label-block">
          ${tag} ${username}<br>
          ${fleetBadge}
        </div>
      </div>
    `;
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderResultRowHTML(playerSearchResultDTO) {

    const iconHTML = this.renderIconHTML(playerSearchResultDTO);
    const playerInfoHTML = this.renderPlayerInfoHTML(playerSearchResultDTO);
    const btnId = `scan-${playerSearchResultDTO.id}`;

    return `
      <div class="sui-result-row">
        <div class="sui-result-row-left-section">
          ${iconHTML}
          ${playerInfoHTML}
        </div>
        <div class="sui-result-row-right-section">
          <div class="sui-result-row-resources">
            <div class="sui-resource">
              <span>${this.numberFormatter.format(playerSearchResultDTO.undiscovered_ore)}</span>
              <i class="sui-icon sui-icon-undiscovered-ore"></i>
            </div>
            <div class="sui-resource">
              <span>${this.numberFormatter.format(playerSearchResultDTO.ore)}</span>
              <i class="sui-icon sui-icon-alpha-ore"></i>
            </div>
          </div>
          <a
            id="${btnId}"
            href="javascript:void(0)"
            class="sui-screen-btn sui-mod-secondary"
          >View</a>
        </div>
      </div>
    `;
  }

  render() {
    Promise.all([
      this.guildAPI.raidSearch(this.raidSearchRequest),
      this.guildAPI.raidSearchCount(this.raidSearchRequest)
    ]).then(([
      players,
      count
    ]) => {
      this.players = players;

      let noResultsMessage = `<div>No results found. Please try a different search term.</div>`;
      let paginationHTML = '';

      const pagination = new Pagination(
        this.raidSearchRequest.page,
        PAGINATION_LIMITS.DEFAULT,
        count,
        'scan',
        'Fleet',
        'scan'
      );

      if (count) {
        noResultsMessage = '';
        paginationHTML = pagination.render();
      }

      MenuPage.enablePageTemplate(MenuPage.navItemFleetId);

      MenuPage.setPageTemplateHeaderBtn('Scan Results', true, () => {
        MenuPage.router.goto('Fleet', 'scan');
      });

      const playersListHTML = players.reduce((html, player) => {
        return html + this.renderResultRowHTML(player)
      }, '');

      MenuPage.setPageTemplateContent(`
        <div class="common-result-table-layout">
        
          ${noResultsMessage}
          
          <div class="sui-result-rows sui-result-table">
          
            ${playersListHTML}
  
          </div>
          
          ${paginationHTML}
  
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
    });

  }
}
