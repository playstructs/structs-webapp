import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {PlanetCardComponent} from "../components/PlanetCardComponent";
import {RAID_STATUS} from "../../constants/RaidStatus";
import {RaidStatusUtil} from "../../util/RaidStatusUtil";
import {EVENTS} from "../../constants/Events";
import {RaidStatusListener} from "../../grass_listeners/RaidStatusListener";

export class FleetIndexViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {FleetManager} fleetManager
   * @param {PlayerManager} playerManager
   * @param {GrassManager} grassManager
   */
  constructor(
    gameState,
    guildAPI,
    fleetManager,
    playerManager,
    grassManager
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.fleetManager = fleetManager;
    this.playerManager = playerManager;
    this.grassManager = grassManager;
    this.raidStatusUtil = new RaidStatusUtil();
    this.raidCardContainerId = 'raid-card-container';

    this.alphaBaseCard = new PlanetCardComponent(
      this.gameState,
      'alpha-base',
      false
    );
    this.raidCard = new PlanetCardComponent(
      this.gameState,
      'raid',
      true
    )
  }

  handleRaidRequested() {
    if (this.gameState.raidStatus !== RAID_STATUS.REQUESTED) {
      return;
    }

    // Listen for the raid to actually start
    this.grassManager.registerListener(new RaidStatusListener(
      this.gameState,
      (status) => {
        if (status === RAID_STATUS.INITIATED) {
          this.playerManager.initRaidEnemy().then(() => {
            this.raidCard.useRaidStartedBodyPreset();
            this.raidCard.secondaryBtnHandler = () => {
              this.raidCard.useRaidActiveBodyPreset();

              this.rerenderRaidCard();
            }

            this.rerenderRaidCard();
          });
        }
      }
    ));

    this.fleetManager.moveFleet(this.gameState.raidPlanetId).then(() => {
      console.log('Fleet move request sent');
    });
  }

  initPageCode() {
    this.alphaBaseCard.initPageCode();
    this.raidCard.initPageCode();
    this.handleRaidRequested();
  }

  renderAlphaBaseCardHTML() {
    this.alphaBaseCard.hasStatusGroup = true;
    this.alphaBaseCard.undiscoveredOre = this.gameState.planet.undiscovered_ore;
    this.alphaBaseCard.alphaOre = this.gameState.thisPlayer.ore;
    this.alphaBaseCard.shieldHealth = this.gameState.planetShieldHealth;

    this.alphaBaseCard.hasPrimaryBtn = true;
    this.alphaBaseCard.primaryBtnLabel = 'Command';
    this.alphaBaseCard.primaryBtnHandler = () => {
      console.log('Command');
    }

    return this.alphaBaseCard.renderHTML();
  }

  renderRaidCardHTML() {
    if (this.gameState.raidStatus === RAID_STATUS.REQUESTED) {
      this.raidCard.useLoadingBodyPreset();
    } else if (this.gameState.raidStatus === RAID_STATUS.INITIATED) {
      this.raidCard.useRaidActiveBodyPreset();
    } else {
      this.raidCard.useScanBodyPreset();
    }

    return this.raidCard.renderHTML();
  }

  rerenderRaidCard() {
    document.getElementById(this.raidCardContainerId).innerHTML = this.raidCard.renderHTML();

    this.raidCard.initPageCode();
  }

  render() {

    MenuPage.enablePageTemplate(MenuPage.navItemFleetId);

    MenuPage.setPageTemplateHeaderBtn('Fleet Status');

    MenuPage.setPageTemplateContent(`
      <div class="fleet-index-layout">
        
        <div class="fleet-index-cards">
        
          <div class="fleet-card-wrapper">
          
            ${this.renderAlphaBaseCardHTML()}
            
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
            
            ${this.renderRaidCardHTML()}
            
          </div>
          
        </div>
        
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();

  }
}
