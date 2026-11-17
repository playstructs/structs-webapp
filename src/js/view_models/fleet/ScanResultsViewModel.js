import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NumberFormatter} from "../../util/NumberFormatter";
import {Pagination} from "../templates/partials/Pagination";
import {PAGINATION_LIMITS} from "../../constants/PaginationLimits";
import {PlanetRaidFactory} from "../../factories/PlanetRaidFactory";
import {PfpViewerComponent} from "../components/PfpViewerComponent";
import {FEATURE_FLAGS} from "../../constants/FeatureFlags";
import {SECTOR_BLITZ} from "../../constants/SectorBlitzConstants";
import {RaidTarget} from "../../util/RaidTarget";
import {SectorBlitzFormat} from "../../util/SectorBlitzFormat";

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
        RaidTarget.preview(this.guildAPI, player);
      });
    })
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderIconHTML(playerSearchResultDTO) {
    const pfpViewer = new PfpViewerComponent(playerSearchResultDTO.pfp_client_render_attributes);
    return `
      <div class="sui-result-row-portrait">
        <div class="sui-result-row-portrait-image">${pfpViewer.renderHTML()}</div>
      </div>
    `;
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
    const fleetBadge = RaidTarget.statusBadgeHTML(playerSearchResultDTO);

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
   * Sector Blitz searches show the influence points a win would earn instead of undiscovered ore.
   *
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderResourcesHTML(playerSearchResultDTO) {
    const ore = `
            <div class="sui-resource">
              <span>${this.numberFormatter.format(playerSearchResultDTO.ore)}</span>
              <i class="sui-icon sui-icon-alpha-ore"></i>
            </div>
    `;

    if (
      FEATURE_FLAGS.SECTOR_BLITZ
      && this.raidSearchRequest.contest_id
      && playerSearchResultDTO.influence_points !== null
      && playerSearchResultDTO.influence_points !== undefined
    ) {
      return `
            ${ore}
            <a class="sui-resource" href="javascript: void(0)" data-sui-tooltip="Influence Points">
              <span>+${SectorBlitzFormat.points(playerSearchResultDTO.influence_points)}</span>
              ${SECTOR_BLITZ.INFLUENCE_ICON_HTML}
            </a>
      `;
    }

    return `
            <div class="sui-resource">
              <span>${this.numberFormatter.format(playerSearchResultDTO.undiscovered_ore)}</span>
              <i class="sui-icon sui-icon-undiscovered-ore"></i>
            </div>
            ${ore}
    `;
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderButtonLabel(playerSearchResultDTO) {
    return FEATURE_FLAGS.SECTOR_BLITZ ? RaidTarget.buttonLabel(playerSearchResultDTO) : 'View';
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
            ${this.renderResourcesHTML(playerSearchResultDTO)}
          </div>
          <a
            id="${btnId}"
            href="javascript:void(0)"
            class="sui-screen-btn sui-mod-secondary"
          >${this.renderButtonLabel(playerSearchResultDTO)}</a>
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
        'scanResults',
        this.raidSearchRequest
      );

      if (count) {
        noResultsMessage = '';
        paginationHTML = pagination.render();
      }

      MenuPage.enablePageTemplate(MenuPage.navItemFleetId);

      MenuPage.setPageTemplateHeaderBtn('Scan Results', true, () => {
        MenuPage.router.goto('Fleet', 'scan', this.raidSearchRequest);
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

      MenuPage.scrollPageTemplateToTop();

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
      pagination.init();
    });

  }
}
