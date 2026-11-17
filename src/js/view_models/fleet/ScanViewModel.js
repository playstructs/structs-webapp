import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {SEARCH_STRING_PATTERN} from "../../constants/RegexPattern";
import {RaidSearchRequestDTO} from "../../dtos/RaidSearchRequestDTO";
import {bindSubmitButtonToInput} from "../../util/SubmitButtonToggle";
import {SECTOR_BLITZ} from "../../constants/SectorBlitzConstants";

/** Guild select value for the contest default: every guild except the player's own. */
const RIVAL_GUILDS_ONLY = 'rival';

export class ScanViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {RaidSearchRequestDTO|object|null} previousSearch the search to restore, e.g. when returning from results
   * @param {SectorBlitzManager|null} sectorBlitzManager
   */
  constructor(
    gameState,
    guildAPI,
    previousSearch = null,
    sectorBlitzManager = null
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.previousSearch = previousSearch;
    this.sectorBlitzManager = sectorBlitzManager;

    /** The Sector Blitz variant, while a contest is running. */
    this.isContest = false;
    /** The contest the form was drawn for; submit checks it is still the running one. */
    this.contestId = null;
    /** Chosen on the Sector Map; applied to searches but not shown in the form. */
    this.sector = previousSearch?.sector ?? null;

    this.minVulnerableOreId = 'minVulnerableOre';
    this.guildFilterSelectId = 'guildFilterSelect';
    this.fleetStatusId = 'fleetStatusCheckbox';
    this.notUnderAttackId = 'notUnderAttackCheckbox';
    this.undefeatedId = 'undefeatedCheckbox';
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

  /**
   * The contest can start, end or change while the form is open. Submitting then would
   * send a search the form no longer matches, so redraw the form for the current state.
   *
   * @return {boolean} true when the form was out of date and is being redrawn
   */
  redrawIfContestChanged() {
    const currentContestId = this.sectorBlitzManager?.isActive()
      ? this.sectorBlitzManager.contest.contest_id
      : null;
    if (currentContestId === this.contestId) {
      return false;
    }
    MenuPage.router.goto('Fleet', 'scan', {sector: this.sector}, {replace: true});
    return true;
  }

  initPageCode() {
    MenuPage.sui.inputStepper.autoInitAll();

    // Search By Status Submission
    document.getElementById(this.searchByStatusBtnId).addEventListener('click', () => {
      if (this.redrawIfContestChanged()) return;

      const raidSearchRequest = new RaidSearchRequestDTO();
      const guildFilter = document.getElementById(this.guildFilterSelectId).value;
      raidSearchRequest.min_ore = this.getMinOre();
      raidSearchRequest.fleet_away_only = document.getElementById(this.fleetStatusId).checked;

      if (this.isContest) {
        raidSearchRequest.contest_id = this.contestId;
        raidSearchRequest.rival_guilds_only = guildFilter === RIVAL_GUILDS_ONLY;
        raidSearchRequest.guild_id = guildFilter === RIVAL_GUILDS_ONLY ? null : guildFilter;
        raidSearchRequest.undefeated = document.getElementById(this.undefeatedId).checked;
        raidSearchRequest.sector = this.sector;
      } else {
        raidSearchRequest.guild_id = guildFilter;
        raidSearchRequest.not_under_attack = document.getElementById(this.notUnderAttackId).checked;
      }

      MenuPage.router.goto('Fleet', 'scanResults', raidSearchRequest);
    });

    // Search By Player Input Checker
    const playerSearchInput = document.getElementById(this.playerSearchInputId);
    bindSubmitButtonToInput(playerSearchInput, () => document.getElementById(this.playerSearchBtnId));

    // Search By Player Submission
    const playerSearchHandler = () => {
      document.getElementById(this.playerSearchErrorId).classList.remove('sui-mod-show');

      if (!SEARCH_STRING_PATTERN.test(playerSearchInput.value)) {
        document.getElementById(this.playerSearchErrorId).classList.add('sui-mod-show');
      } else {
        if (this.redrawIfContestChanged()) return;

        const raidSearchRequest = new RaidSearchRequestDTO();
        raidSearchRequest.search_string = playerSearchInput.value;
        if (this.isContest) {
          raidSearchRequest.contest_id = this.contestId;
          // Keep the hidden sector so Back from the results returns to the same Scan.
          raidSearchRequest.sector = this.sector;
        }

        MenuPage.router.goto('Fleet', 'scanResults', raidSearchRequest);
      }
    };

    document.getElementById(this.playerSearchBtnId).addEventListener('click', playerSearchHandler);
    playerSearchInput.addEventListener('keyup', (e) => {
      // Mirror the button: it is disabled while the field is empty.
      if (e.key === 'Enter' && playerSearchInput.value.length > 0) {
        playerSearchHandler();
      }
    });
  }

  /**
   * Put the previous search back into the form so Back from the results keeps it.
   */
  restorePreviousSearch() {
    const search = this.previousSearch;
    if (!search) return;

    if (search.search_string) {
      document.getElementById(this.playerSearchInputId).value = search.search_string;
      return;
    }

    if (search.min_ore !== undefined && search.min_ore !== null) {
      document.getElementById(this.minVulnerableOreId).value = search.min_ore;
    }
    if (search.guild_id) {
      document.getElementById(this.guildFilterSelectId).value = search.guild_id;
    } else if (this.isContest && search.contest_id && !search.rival_guilds_only) {
      document.getElementById(this.guildFilterSelectId).value = '';
    }
    document.getElementById(this.fleetStatusId).checked = !!search.fleet_away_only;
    if (this.isContest) {
      document.getElementById(this.undefeatedId).checked = !!search.undefeated;
    } else {
      document.getElementById(this.notUnderAttackId).checked = !!search.not_under_attack;
    }
  }

  /**
   * @return {Promise<boolean>} whether the Sector Blitz variant applies
   */
  async resolveContest() {
    if (!this.sectorBlitzManager) return false;
    await this.sectorBlitzManager.refresh();
    return this.sectorBlitzManager.isActive();
  }

  /**
   * @param {string} guildFilterOptions
   * @return {string}
   */
  renderGuildSelectHTML(guildFilterOptions) {
    const label = this.isContest ? 'Guild' : 'Filter By Guild';
    const defaultOptions = this.isContest
      ? `<option value="${RIVAL_GUILDS_ONLY}">Rival Guilds Only</option><option value="">All Guilds</option>`
      : `<option value="">Any Guild</option>`;

    return `
              <label class="sui-input-text" for="${this.guildFilterSelectId}">
                <span>${label}</span>
                <select
                  id="${this.guildFilterSelectId}"
                  name="${this.guildFilterSelectId}"
                >
                  ${defaultOptions}
                  ${guildFilterOptions}
                </select>
              </label>
    `;
  }

  /**
   * @param {string} id
   * @param {string} label
   * @param {string} tip
   * @return {string}
   */
  renderCheckboxHTML(id, label, tip = '') {
    const tipHTML = tip
      ? `&nbsp;<a class="sui-text-secondary" href="javascript: void(0)" data-sui-tooltip="${tip}"><i class="sui-icon icon-tip"></i></a>`
      : '';

    return `
                <div class="sui-checkbox-container">
                  <input
                    type="checkbox"
                    class="sui-checkbox"
                    name="${id}"
                    id="${id}"
                  >
                  <span class="sui-checkbox-display"></span>
                  <label for="${id}">${label}</label>${tipHTML}
                </div>
    `;
  }

  /**
   * @return {string}
   */
  renderStatusFiltersHTML() {
    if (this.isContest) {
      return `
              <label class="sui-input-text">
                <span>Filters</span>
                <div class="scan-filters-inline">
                  ${this.renderCheckboxHTML(this.fleetStatusId, 'Fleet Away')}
                  ${this.renderCheckboxHTML(
                    this.undefeatedId,
                    'Undefeated',
                    `Planets that have not yet been Raided by your Guild in ${SECTOR_BLITZ.NAME}.`
                  )}
                </div>
              </label>
      `;
    }

    return `
              <label class="sui-input-text">
                <span>Fleet Status</span>
                ${this.renderCheckboxHTML(this.fleetStatusId, 'Fleet Away')}
              </label>
              
              <label class="sui-input-text">
                <span>Raid Status</span>
                ${this.renderCheckboxHTML(this.notUnderAttackId, 'Not Under Attack')}
              </label>
    `;
  }

  render() {
    // Waiting on the contest list can take a network call; drop this render if the player
    // has moved on by then (including the Fleet page re-rendering itself on a phase change).
    const navigationId = MenuPage.router.navigationId;

    Promise.all([
      this.guildAPI.getGuildFilterList(),
      this.resolveContest().catch(() => false)
    ]).then(([guilds, isContest]) => {
      if (navigationId !== MenuPage.router.navigationId) {
        return;
      }

      this.isContest = isContest;
      this.contestId = isContest ? this.sectorBlitzManager.contest.contest_id : null;
      if (!this.isContest) {
        this.sector = null;
      }

      const guildFilterOptions = guilds.reduce((options, guild) =>
          options + `<option value="${guild.id}">${guild.name ? guild.name : guild.id}</option>`
        , '');

      MenuPage.enablePageTemplate(MenuPage.navItemFleetId);

      MenuPage.setPageTemplateHeaderBtn(
        'Scan',
        true,
        () => {
          if (this.isContest) {
            MenuPage.router.goto('Fleet', 'sectorMap', {sector: this.sector});
          } else {
            MenuPage.router.goto('Fleet', 'index');
          }
        });

      MenuPage.setPageTemplateContent(`
        <div class="scan-layout">
        
          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Search By Status</div>
            <div class="sui-data-card-body sui-mod-spacing-xl">
            
              <label class="sui-input-text" for="${this.minVulnerableOreId}">
                <span>
                  Min. Vulnerable Ore&nbsp;
                  <a 
                    id="min-vulnerable-ore-tip"
                    class="sui-text-secondary"
                    href="javascript: void(0)" 
                    data-sui-tooltip="Extracted Ore that has not been refined is vulnerable to theft."
                    data-sui-mod-placement="bottom"
                  >
                    <i class="sui-icon icon-tip"></i>
                  </a>
                </span>
                
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
            
              ${this.renderGuildSelectHTML(guildFilterOptions)}
              
              ${this.renderStatusFiltersHTML()}
              
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
                    <span>
                      Player Search&nbsp;
                      <a 
                        id="player-search-tip" 
                        class="sui-text-secondary"
                        href="javascript: void(0)" 
                        data-sui-tooltip="Enter a player's Display Name, Player Id, or Blockchain Address"
                      >
                        <i class="sui-icon icon-tip"></i>
                      </a>
                    </span>
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

      this.restorePreviousSearch();
      this.initPageCode();

    });
  }
}
