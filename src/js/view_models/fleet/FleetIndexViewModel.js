import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {RaidStatusUtil} from "../../util/RaidStatusUtil";
import {PlanetCardBuilder} from "../../builders/PlanetCardBuilder";
import {EVENTS} from "../../constants/Events";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {SectorBlitzFleetCardComponent} from "../components/SectorBlitzFleetCardComponent";

export class FleetIndexViewModel extends AbstractViewModel {

  /**
   * Shared across instances so each render replaces the previous listener instead of stacking another.
   *
   * @type {function|null}
   */
  static raidStatusChangedHandler = null;

  /**
   * Re-renders the page when a Sector Blitz contest starts or its results begin/end.
   *
   * @type {function|null}
   */
  static sectorBlitzPhaseChangedHandler = null;

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {FleetManager} fleetManager
   * @param {GrassManager} grassManager
   * @param {PlanetManager} planetManager
   * @param {MapManager} mapManager
   * @param {RaidManager} raidManager
   * @param {StructManager} structManager
   * @param {string|null} planetCardType
   * @param {string|null} raidCardType
   * @param {InfluenceAPI|null} influenceAPI
   * @param {SectorBlitzManager|null} sectorBlitzManager
   */
  constructor(
    gameState,
    guildAPI,
    fleetManager,
    grassManager,
    planetManager,
    mapManager,
    raidManager,
    structManager,
    planetCardType = null,
    raidCardType= null,
    influenceAPI = null,
    sectorBlitzManager = null
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.fleetManager = fleetManager;
    this.grassManager = grassManager;
    this.planetManager = planetManager;
    this.mapManager = mapManager;
    this.structManager = structManager;
    this.planetCardType = planetCardType;
    this.raidCardType = raidCardType;
    this.sectorBlitzManager = sectorBlitzManager;
    this.sectorBlitzCard = sectorBlitzManager
      ? new SectorBlitzFleetCardComponent(sectorBlitzManager, influenceAPI)
      : null;

    this.raidStatusUtil = new RaidStatusUtil();
    this.raidCardContainerId = 'raid-card-container';

    this.planetCardBuilder = new PlanetCardBuilder(
      gameState,
      guildAPI,
      grassManager,
      fleetManager,
      planetManager,
      mapManager,
      raidManager,
      structManager,
      sectorBlitzManager
    );
    this.alphaBaseCard = this.planetCardBuilder.build(false, this.planetCardType);
    this.raidCard = this.planetCardBuilder.build(true, this.raidCardType);
  }

  initPageCode() {
    this.alphaBaseCard.initPageCode();
    this.raidCard.initPageCode();

    window.removeEventListener(EVENTS.PLANET_RAID_STATUS_CHANGED, FleetIndexViewModel.raidStatusChangedHandler);

    FleetIndexViewModel.raidStatusChangedHandler = (event) => {
      if (!document.getElementById(this.raidCardContainerId)) {
        window.removeEventListener(EVENTS.PLANET_RAID_STATUS_CHANGED, FleetIndexViewModel.raidStatusChangedHandler);
        return;
      }

      if (event.playerType === PLAYER_TYPES.PLAYER || event.playerType === PLAYER_TYPES.RAID_ENEMY) {
        MenuPage.router.goto('Fleet', 'index');
      }
    };

    window.addEventListener(EVENTS.PLANET_RAID_STATUS_CHANGED, FleetIndexViewModel.raidStatusChangedHandler);

    this.sectorBlitzCard?.initPageCode();

    window.removeEventListener(EVENTS.SECTOR_BLITZ_PHASE_CHANGED, FleetIndexViewModel.sectorBlitzPhaseChangedHandler);
    FleetIndexViewModel.sectorBlitzPhaseChangedHandler = () => {
      window.removeEventListener(EVENTS.SECTOR_BLITZ_PHASE_CHANGED, FleetIndexViewModel.sectorBlitzPhaseChangedHandler);
      if (document.getElementById(this.raidCardContainerId)) {
        MenuPage.router.goto('Fleet', 'index', {
          planetCardType: this.planetCardType,
          raidCardType: this.raidCardType
        }, {replace: true});
      }
    };
    window.addEventListener(EVENTS.SECTOR_BLITZ_PHASE_CHANGED, FleetIndexViewModel.sectorBlitzPhaseChangedHandler);

    // Picks up a contest that started (or was configured) since the last check; a change re-renders this page.
    this.sectorBlitzManager?.refresh().catch(() => {});
  }

  renderRaidLogBtnHTML() {
    if (
      this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo === null
      || !this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.isRaidActive()
    ) {
      return '';
    }

    return `
      <div class="hidden">
        <a href="javascript: void(0)" class="fleet-card-log-btn">
          <div class="fleet-card-log-btn-icon-wrapper">
            <i class="sui-icon sui-icon-sm icon-combat-log sui-text-secondary"></i>
          </div>
          <span class="sui-text-header">Raid Log</span>
        </a>
      </div>
    `;
  }

  render() {

    MenuPage.enablePageTemplate(MenuPage.navItemFleetId);

    MenuPage.setPageTemplateHeaderBtn('Fleet Status');

    MenuPage.setPageTemplateContent(`
      <div class="fleet-index-layout">

        ${this.sectorBlitzCard?.renderHTML() ?? ''}

        <div class="fleet-index-cards">
        
          <div class="fleet-card-wrapper">
          
            ${this.alphaBaseCard.renderHTML()}
            
            <div class="hidden">
              <a href="javascript: void(0)" class="fleet-card-log-btn">
                <div class="fleet-card-log-btn-icon-wrapper">
                  <i class="sui-icon sui-icon-sm icon-combat-log sui-text-secondary"></i>
                </div>
                <span class="sui-text-header">Base Log</span>
              </a>
            </div>
            
          </div>
          
          <div id="${this.raidCardContainerId}" class="fleet-card-wrapper">
            
            ${this.raidCard.renderHTML()}
            
            ${this.renderRaidLogBtnHTML()}
            
          </div>
          
        </div>
        
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();

  }
}
