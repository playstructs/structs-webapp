import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {RaidStatusUtil} from "../../util/RaidStatusUtil";
import {PlanetCardBuilder} from "../../builders/PlanetCardBuilder";
import {EVENTS} from "../../constants/Events";

export class FleetIndexViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {FleetManager} fleetManager
   * @param {GrassManager} grassManager
   * @param {PlanetManager} planetManager
   * @param {MapManager} mapManager
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
    );
    this.alphaBaseCard = this.planetCardBuilder.build(false, this.planetCardType);
    this.raidCard = this.planetCardBuilder.build(true, this.raidCardType);
  }

  initPageCode() {
    this.alphaBaseCard.initPageCode();
    this.raidCard.initPageCode();

    window.addEventListener(EVENTS.RAID_STATUS_CHANGED, () => {
      MenuPage.router.goto('Fleet', 'index');
    })
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
            
          </div>
          
        </div>
        
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();

  }
}
