import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {RaidStatusUtil} from "../../util/RaidStatusUtil";
import {PlanetCardBuilder} from "../../builders/PlanetCardBuilder";
import {PLANET_CARD_TYPES} from "../../constants/PlanetCardTypes";
import {EVENTS} from "../../constants/Events";

export class FleetIndexViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {FleetManager} fleetManager
   * @param {GrassManager} grassManager
   * @param {string|null} planetCardType
   * @param {string|null} raidCardType
   */
  constructor(
    gameState,
    guildAPI,
    fleetManager,
    grassManager,
    planetCardType = PLANET_CARD_TYPES.ALPHA_BASE_ACTIVE,
    raidCardType= null
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.fleetManager = fleetManager;
    this.grassManager = grassManager;
    this.planetCardType = planetCardType;
    this.raidCardType = raidCardType;

    this.raidStatusUtil = new RaidStatusUtil();
    this.raidCardContainerId = 'raid-card-container';

    this.planetCardBuilder = new PlanetCardBuilder(gameState, fleetManager);
    this.alphaBaseCard = this.planetCardBuilder.build(false, this.planetCardType);
    this.raidCard = this.planetCardBuilder.build(true, this.raidCardType);
  }

  initPageCode() {
    this.alphaBaseCard.initPageCode();
    this.raidCard.initPageCode();

    window.addEventListener(EVENTS.RAID_STATUS_CHANGED, () => {
      this.render();
      this.initPageCode();
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
