import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {SEARCH_STRING_PATTERN} from "../../constants/RegexPattern";
import {RaidSearchRequestDTO} from "../../dtos/RaidSearchRequestDTO";

export class ScanViewModel extends AbstractViewModel {

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

    this.minVulnerableOreId = 'minVulnerableOre';
    this.guildFilterSelectId = 'guildFilterSelect';
    this.fleetStatusId = 'fleetStatusCheckbox';
    this.searchByStatusBtnId = 'searchByStatusBtn';
    this.playerSearchInputId = 'playerSearch';
    this.playerSearchBtnId = 'playerSearchBtn';
    this.playerSearchErrorId = 'playerSearchError';
  }

  getMinOre() {
    const minOre = parseInt(document.getElementById(this.minVulnerableOreId).value);
    return isNaN(minOre)
      ? 0
      : Math.max(minOre, 0);
  }

  initPageCode() {
    MenuPage.sui.inputStepper.autoInitAll();

    // Search By Status Submission
    document.getElementById(this.searchByStatusBtnId).addEventListener('click', () => {
      const raidSearchRequest = new RaidSearchRequestDTO();
      raidSearchRequest.min_ore = this.getMinOre();
      raidSearchRequest.guild_id = document.getElementById(this.guildFilterSelectId).value;
      raidSearchRequest.fleet_away_only = document.getElementById(this.fleetStatusId).checked;

      console.log('Searching by status:', raidSearchRequest);
    });

    // Search By Player Input Checker
    const playerSearchInput = document.getElementById(this.playerSearchInputId);
    playerSearchInput.addEventListener('keyup', () => {
      const submitBtn = document.getElementById(this.playerSearchBtnId);

      if (playerSearchInput.value.length > 0 && submitBtn.classList.contains('sui-mod-disabled')) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('sui-mod-disabled');
        submitBtn.classList.add('sui-mod-primary');
      } else if (playerSearchInput.value.length === 0 && submitBtn.classList.contains('sui-mod-primary')) {
        submitBtn.disabled = true;
        submitBtn.classList.remove('sui-mod-primary');
        submitBtn.classList.add('sui-mod-disabled');
      }
    });

    // Search By Player Submission
    document.getElementById(this.playerSearchBtnId).addEventListener('click', () => {
      document.getElementById(this.playerSearchErrorId).classList.remove('sui-mod-show');

      const playerSearchInput = document.getElementById(this.playerSearchInputId);

      if (!SEARCH_STRING_PATTERN.test(playerSearchInput.value)) {
        document.getElementById(this.playerSearchErrorId).classList.add('sui-mod-show');
      } else {
        const raidSearchRequest = new RaidSearchRequestDTO();
        raidSearchRequest.search_string = playerSearchInput.value;

        console.log('Searching by player:', raidSearchRequest);

        // MenuPage.router.goto('Account', 'recipientSearchResults', transferSearchRequest);
      }
    });
  }

  render() {
    this.guildAPI.getGuildFilterList().then(guilds => {

      const guildFilterOptions = guilds.reduce((options, guild) =>
          options + `<option value="${guild.id}">${guild.name ? guild.name : guild.id}</option>`
        , '');

      MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

      MenuPage.setPageTemplateHeaderBtn(
        'Scan',
        true,
        () => {
          MenuPage.router.goto('Fleet', 'index');
        });

      MenuPage.setPageTemplateContent(`
        <div class="scan-layout">
        
          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Search By Status</div>
            <div class="sui-data-card-body sui-mod-spacing-xl">
            
              <label class="sui-input-text" for="${this.minVulnerableOreId}">
                <span>Min. Vulnerable Ore</span>
                <div class="sui-input-stepper">
                  <button class="sui-screen-btn sui-mod-secondary">
                    <i class="sui-icon sui-icon-md icon-subtract"></i>
                  </button>
                  <input
                    id="${this.minVulnerableOreId}"
                    name="${this.minVulnerableOreId}"
                    type="number"
                    step="1"
                    min="0"
                    max="99"
                    value="0"
                  >
                  <button class="sui-screen-btn sui-mod-secondary">
                    <i class="sui-icon sui-icon-md icon-add"></i>
                  </button>
                </div>
              </label>
            
              <label class="sui-input-text" for="${this.guildFilterSelectId}">
                <span>Filter By Guild</span>
                <select
                  id="${this.guildFilterSelectId}"
                  name="${this.guildFilterSelectId}"
                >
                  <option value="">Any Guild</option>
                  ${guildFilterOptions}
                </select>
              </label>
              
              <label class="sui-input-text">
                <span>Fleet Status</span>
                <div class="sui-checkbox-container">
                  <input
                    type="checkbox"
                    class="sui-checkbox"
                    name="${this.fleetStatusId}"
                    id="${this.fleetStatusId}"
                  >
                  <span class="sui-checkbox-display"></span>
                  <label for="${this.fleetStatusId}">Fleet Away</label>
                </div>
              </label>
              
              <button 
                id="${this.searchByStatusBtnId}" 
                class="sui-screen-btn sui-mod-align-flex-end sui-mod-primary"
              >Search</button>    
            </div>
          </div>
        
          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Search By Player</div>
            <div class="sui-data-card-body sui-mod-spacing-xl">
              <div class="common-inline-text-input-group-container">
                <div class="common-inline-text-input-controls-container">
                  <label class="sui-input-text" for="${this.playerSearchInputId}">
                    <span>Player Search</span>
                    <input
                      type="text"
                      name="${this.playerSearchInputId}"
                      id="${this.playerSearchInputId}"
                      placeholder="Name, PID, or Address"
                    >
                  </label>
                  <button id="${this.playerSearchBtnId}" class="sui-screen-btn sui-mod-primary sui-mod-disabled" disabled>Search</button>
                </div>
                <div class="common-inline-text-input-error-container">
                  <div id="${this.playerSearchErrorId}" class="sui-input-text-warning">Enter at least 3 characters, using only letters, numbers, '-' and '_'.</div>
                </div>
              </div>  
            </div>
          </div>
          
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();

    });
  }
}
