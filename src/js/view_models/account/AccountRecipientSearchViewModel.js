import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {SEARCH_STRING_PATTERN} from "../../constants/RegexPattern";
import {TransferSearchRequestDTO} from "../../dtos/TransferSearchRequestDTO";

export class AccountRecipientSearchViewModel extends AbstractViewModel {

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
    this.playerSearchInputId = 'playerSearch';
    this.playerSearchBtnId = 'playerSearchBtn';
    this.playerSearchErrorId = 'playerSearchError';
    this.guildFilterSelectId = 'guildFilterSelect';
  }

  initPageCode() {
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

    const submitBtnHandler = () => {
      document.getElementById(this.playerSearchErrorId).classList.remove('sui-mod-show');

      const playerSearchInput = document.getElementById(this.playerSearchInputId);

      if (!SEARCH_STRING_PATTERN.test(playerSearchInput.value)) {
        document.getElementById(this.playerSearchErrorId).classList.add('sui-mod-show');
      } else {
        const transferSearchRequest = new TransferSearchRequestDTO();
        transferSearchRequest.search_string = playerSearchInput.value;
        transferSearchRequest.guild_id = document.getElementById(this.guildFilterSelectId).value;

        MenuPage.router.goto('Account', 'recipientSearchResults', transferSearchRequest);
      }
    };

    document.getElementById(this.playerSearchBtnId).addEventListener('click', submitBtnHandler);
    playerSearchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        submitBtnHandler();
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
        'Find Recipient',
        true,
        () => {
          MenuPage.router.goto('Account', 'transferAmount');
        });

      MenuPage.setPageTemplateContent(`
        <div class="common-layout-col">
          <div>Who do you want to send to?</div>
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
              <button id="${this.playerSearchBtnId}" class="sui-screen-btn sui-mod-primary sui-mod-disabled" disabled>Search</button>
            </div>
            <div class="common-inline-text-input-error-container">
              <div id="${this.playerSearchErrorId}" class="sui-input-text-warning">Enter at least 3 characters, using only letters, numbers, '-' and '_'.</div>
            </div>
          </div>
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();

    });
  }
}
