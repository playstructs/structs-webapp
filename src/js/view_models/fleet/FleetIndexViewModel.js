import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {RaidStatusUtil} from "../../util/RaidStatusUtil";
import {PlanetCardBuilder} from "../../builders/PlanetCardBuilder";
import {EVENTS} from "../../constants/Events";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";

export class FleetIndexViewModel extends AbstractViewModel {

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
    raidCardType= null
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
      structManager
    );
    this.alphaBaseCard = this.planetCardBuilder.build(false, this.planetCardType);
    this.raidCard = this.planetCardBuilder.build(true, this.raidCardType);
  }

  initPageCode() {
    this.alphaBaseCard.initPageCode();
    this.raidCard.initPageCode();

    window.addEventListener(EVENTS.PLANET_RAID_STATUS_CHANGED, (event) => {
      if (event.playerType === PLAYER_TYPES.PLAYER || event.playerType === PLAYER_TYPES.RAID_ENEMY) {
        MenuPage.router.goto('Fleet', 'index');
      }
    })
  }

  renderRaidLogBtnHTML() {
    if (
      this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo === null
      || !this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.isRaidActive()
    ) {
      return '';
    }

    return `
      <div>
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
        
        <div class="fleet-index-cards">
        
          <div class="fleet-card-wrapper">
          
            ${this.alphaBaseCard.renderHTML()}
            
            <div>
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
