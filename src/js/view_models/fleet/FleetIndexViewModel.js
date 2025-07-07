import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

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
  }

  initPageCode() {

  }

  render () {

    MenuPage.enablePageTemplate(MenuPage.navItemFleetId);

    MenuPage.setPageTemplateHeaderBtn('Fleet Status');

    MenuPage.setPageTemplateContent(`
      <div class="fleet-index-layout">
        
        <div class="fleet-index-cards">
        
          <div class="fleet-card-wrapper">
          
            <div class="fleet-card">
            
              <div class="fleet-card-header">
                <div class="fleet-card-header-label">
                  <i class="sui-icon sui-icon-md icon-planet sui-text-primary"></i>
                  <div class="fleet-card-header-label-title sui-text-header">
                    <span class="sui-text-primary">ALPHA BASE</span>
                    <span>[Base Planet]</span>
                  </div>  
                </div>
                <span class="sui-badge sui-mod-solid">Fleet</span>
              </div>
            
              <div class="fleet-card-body">
                <div class="fleet-card-body-content">
                  <div class="fleet-card-status-group">
                    <div class="fleet-card-status-group-col">
                      <a href="javascript: void(0)" class="sui-resource">
                        <i class="sui-icon sui-icon-undiscovered-ore"></i>
                        <span>00</span>
                      </a>
                      <a href="javascript: void(0)" class="sui-resource">
                        <i class="sui-icon sui-icon-alpha-ore"></i>
                        <span>01</span>
                      </a>
                    </div>
                    <div class="fleet-card-status-group-col">
                      <a href="javascript: void(0)" class="sui-resource">
                        <i class="sui-icon sui-icon-shield-health"></i>
                        <span>100%</span>
                      </a>
                      <a href="javascript: void(0)" class="sui-resource">
                        <i class="sui-icon sui-icon-deployed-structs"></i>
                        <span>12+04</span>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div class="sui-screen-btn-flex-wrapper">
                  <button class="sui-screen-btn sui-mod-primary">Command</button>
                </div>
                
              </div>
              
            </div>
            
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
            
            <div class="fleet-card">
            
              <div class="fleet-card-header">
                <div class="fleet-card-header-label">
                  <i class="sui-icon sui-icon-md icon-raid sui-text-primary"></i>
                  <div class="fleet-card-header-label-title sui-text-header">
                    <span class="sui-text-primary">Raid</span>
                  </div>  
                </div>
              </div>
            
              <div class="fleet-card-body">
                <div class="fleet-card-body-content">
                  <div class="fleet-card-status-group">
                    <div class="fleet-card-card-message">
                      No Raid active.
                    </div>
                  </div>
                </div>

                <div class="sui-screen-btn-flex-wrapper">
                  <button class="sui-screen-btn sui-mod-secondary">Scan</button>
                </div>
                
              </div>
              
            </div>
            
          </div>
          
        </div>
        
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();

  }
}
