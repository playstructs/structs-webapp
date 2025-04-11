import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class AccountIndexView extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super();
    this.gameState = gameState;
  }

  initPageCode() {

  }

  render () {
    const navItems = [
      new NavItemDTO(
        'nav-item-fleet',
        'FLEET'
      ),
      new NavItemDTO(
        'nav-item-guild',
        'GUILD'
      ),
      new NavItemDTO(
        'nav-item-account',
        'ACCOUNT'
      )
    ];
    MenuPage.setNavItems(navItems, 'nav-item-account');
    MenuPage.enableCloseBtn();

    MenuPage.setBodyContentWithPageTemplate(`
    <div class="sui-result-rows sui-result-table">
  
  
  
                    <div class="sui-result-row">
                      <div class="sui-result-row-left-section">
                        <div class="sui-result-row-portrait">
                          <div class="sui-result-row-portrait-image"></div>
                        </div>
                        <div class="sui-result-row-player-info">
                          <div class="sui-text-label-block">
                            <span class="sui-mod-secondary">[TAG]</span> ABSTRACT<br>
                            <span class="sui-text-hint">PID #7283</span>
                          </div>
                        </div>
                      </div>
                      <div class="sui-result-row-right-section">
                        <div class="sui-result-row-resources">
                          <div class="sui-resource">
                            <span>01</span>
                            <i class="sui-icon sui-icon-alpha-matter"></i>
                          </div>
                        </div>
                        <a href="javascript:void(0)" class="sui-screen-btn sui-mod-secondary">View</a>
                      </div>
                    </div>
  
  
  
                    <div class="sui-result-row">
                      <div class="sui-result-row-left-section">
                        <div class="sui-result-row-portrait">
                          <div class="sui-result-row-portrait-image"></div>
                        </div>
                        <div class="sui-result-row-player-info">
                          <div class="sui-text-label-block">
                            <span class="sui-mod-secondary">[TAG]</span> DETHMASHENE<br>
                            <span class="sui-text-hint">PID #7283</span>
                          </div>
                        </div>
                      </div>
                      <div class="sui-result-row-right-section">
                        <div class="sui-result-row-resources">
                          <div class="sui-resource">
                            <span>01</span>
                            <i class="sui-icon sui-icon-alpha-matter"></i>
                          </div>
                        </div>
                        <a href="javascript:void(0)" class="sui-screen-btn sui-mod-secondary">View</a>
                      </div>
                    </div>
  
  
  
                    <div class="sui-result-row">
                      <div class="sui-result-row-left-section">
                        <div class="sui-result-row-portrait">
                          <div class="sui-result-row-portrait-image"></div>
                        </div>
                        <div class="sui-result-row-player-info">
                          <div class="sui-text-label-block">
                            <span class="sui-mod-secondary">[TAG]</span> TXUE<br>
                            <span class="sui-text-hint">PID #7283</span>
                          </div>
                        </div>
                      </div>
                      <div class="sui-result-row-right-section">
                        <div class="sui-result-row-resources">
                          <div class="sui-resource">
                            <span>01</span>
                            <i class="sui-icon sui-icon-alpha-matter"></i>
                          </div>
                        </div>
                        <a href="javascript:void(0)" class="sui-screen-btn sui-mod-secondary">View</a>
                      </div>
                    </div>
  
  
  
                    <div class="sui-result-row">
                      <div class="sui-result-row-left-section">
                        <div class="sui-result-row-portrait">
                          <div class="sui-result-row-portrait-image"></div>
                        </div>
                        <div class="sui-result-row-player-info">
                          <div class="sui-text-label-block">
                            <span class="sui-mod-secondary">[TAG]</span> NETLAG<br>
                            <span class="sui-text-hint">PID #7283</span>
                          </div>
                        </div>
                      </div>
                      <div class="sui-result-row-right-section">
                        <div class="sui-result-row-resources">
                          <div class="sui-resource">
                            <span>01</span>
                            <i class="sui-icon sui-icon-alpha-matter"></i>
                          </div>
                        </div>
                        <a href="javascript:void(0)" class="sui-screen-btn sui-mod-secondary">View</a>
                      </div>
                    </div>
  
  
  
                    <div class="sui-result-row">
                      <div class="sui-result-row-left-section">
                        <div class="sui-result-row-portrait">
                          <div class="sui-result-row-portrait-image"></div>
                        </div>
                        <div class="sui-result-row-player-info">
                          <div class="sui-text-label-block">
                            <span class="sui-mod-secondary">[TAG]</span> SAINT<br>
                            <span class="sui-text-hint">PID #7283</span>
                          </div>
                        </div>
                      </div>
                      <div class="sui-result-row-right-section">
                        <div class="sui-result-row-resources">
                          <div class="sui-resource">
                            <span>01</span>
                            <i class="sui-icon sui-icon-alpha-matter"></i>
                          </div>
                        </div>
                        <a href="javascript:void(0)" class="sui-screen-btn sui-mod-secondary">View</a>
                      </div>
                    </div>
  
  
  
                    <div class="sui-result-row">
                      <div class="sui-result-row-left-section">
                        <div class="sui-result-row-portrait">
                          <div class="sui-result-row-portrait-image"></div>
                        </div>
                        <div class="sui-result-row-player-info">
                          <div class="sui-text-label-block">
                            <span class="sui-mod-secondary">[TAG]</span> ABSTRACT<br>
                            <span class="sui-text-hint">PID #7283</span>
                          </div>
                        </div>
                      </div>
                      <div class="sui-result-row-right-section">
                        <div class="sui-result-row-resources">
                          <div class="sui-resource">
                            <span>01</span>
                            <i class="sui-icon sui-icon-alpha-matter"></i>
                          </div>
                        </div>
                        <a href="javascript:void(0)" class="sui-screen-btn sui-mod-secondary">View</a>
                      </div>
                    </div>
  
  
  
                    <div class="sui-result-row">
                      <div class="sui-result-row-left-section">
                        <div class="sui-result-row-portrait">
                          <div class="sui-result-row-portrait-image"></div>
                        </div>
                        <div class="sui-result-row-player-info">
                          <div class="sui-text-label-block">
                            <span class="sui-mod-secondary">[TAG]</span> DETHMASHENE<br>
                            <span class="sui-text-hint">PID #7283</span>
                          </div>
                        </div>
                      </div>
                      <div class="sui-result-row-right-section">
                        <div class="sui-result-row-resources">
                          <div class="sui-resource">
                            <span>01</span>
                            <i class="sui-icon sui-icon-alpha-matter"></i>
                          </div>
                        </div>
                        <a href="javascript:void(0)" class="sui-screen-btn sui-mod-secondary">View</a>
                      </div>
                    </div>
  
  
  
                    <div class="sui-result-row">
                      <div class="sui-result-row-left-section">
                        <div class="sui-result-row-portrait">
                          <div class="sui-result-row-portrait-image"></div>
                        </div>
                        <div class="sui-result-row-player-info">
                          <div class="sui-text-label-block">
                            <span class="sui-mod-secondary">[TAG]</span> TXUE<br>
                            <span class="sui-text-hint">PID #7283</span>
                          </div>
                        </div>
                      </div>
                      <div class="sui-result-row-right-section">
                        <div class="sui-result-row-resources">
                          <div class="sui-resource">
                            <span>01</span>
                            <i class="sui-icon sui-icon-alpha-matter"></i>
                          </div>
                        </div>
                        <a href="javascript:void(0)" class="sui-screen-btn sui-mod-secondary">View</a>
                      </div>
                    </div>
  
  
  
                    <div class="sui-result-row">
                      <div class="sui-result-row-left-section">
                        <div class="sui-result-row-portrait">
                          <div class="sui-result-row-portrait-image"></div>
                        </div>
                        <div class="sui-result-row-player-info">
                          <div class="sui-text-label-block">
                            <span class="sui-mod-secondary">[TAG]</span> NETLAG<br>
                            <span class="sui-text-hint">PID #7283</span>
                          </div>
                        </div>
                      </div>
                      <div class="sui-result-row-right-section">
                        <div class="sui-result-row-resources">
                          <div class="sui-resource">
                            <span>01</span>
                            <i class="sui-icon sui-icon-alpha-matter"></i>
                          </div>
                        </div>
                        <a href="javascript:void(0)" class="sui-screen-btn sui-mod-secondary">View</a>
                      </div>
                    </div>
  
  
  
                    <div class="sui-result-row">
                      <div class="sui-result-row-left-section">
                        <div class="sui-result-row-portrait">
                          <div class="sui-result-row-portrait-image"></div>
                        </div>
                        <div class="sui-result-row-player-info">
                          <div class="sui-text-label-block">
                            <span class="sui-mod-secondary">[TAG]</span> SAINT<br>
                            <span class="sui-text-hint">PID #7283</span>
                          </div>
                        </div>
                      </div>
                      <div class="sui-result-row-right-section">
                        <div class="sui-result-row-resources">
                          <div class="sui-resource">
                            <span>01</span>
                            <i class="sui-icon sui-icon-alpha-matter"></i>
                          </div>
                        </div>
                        <a href="javascript:void(0)" class="sui-screen-btn sui-mod-secondary">View</a>
                      </div>
                    </div>
  
  
  
                  </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
