import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {PlanetCardComponent} from "../components/PlanetCardComponent";

export class FleetIndexViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(
    gameState,
    guildAPI
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;

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

  initPageCode() {
    this.alphaBaseCard.initPageCode();
    this.raidCard.initPageCode();
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
    this.raidCard.hasGeneralMessage = true;
    this.raidCard.generalMessageIconClass = 'hidden';
    this.raidCard.generalMessage = 'No Raid active.';

    this.raidCard.hasSecondaryBtn = true;
    this.raidCard.secondaryBtnLabel = 'Scan';
    this.raidCard.secondaryBtnHandler = () => {
      MenuPage.router.goto('Fleet', 'scan');
    }

    return this.raidCard.renderHTML();
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
          
          <div class="fleet-card-wrapper">
            
            ${this.renderRaidCardHTML()}
            
          </div>
          
        </div>
        
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();

  }
}
