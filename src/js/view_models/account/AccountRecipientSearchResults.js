import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NumberFormatter} from "../../util/NumberFormatter";

export class AccountRecipientSearchResults extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {TransferSearchRequestDTO|object} transferSearchRequest
   */
  constructor(
    gameState,
    guildAPI,
    transferSearchRequest
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.transferSearchRequest = transferSearchRequest;
    this.numberFormatter = new NumberFormatter();
    this.players = [];
  }

  initPageCode() {
    this.players.forEach((player) => {
      document.getElementById(`recipient-${player.id}`).addEventListener('click', () => {
        MenuPage.router.goto('Account', 'recipient', player)
      });
    })
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderIconHTML(playerSearchResultDTO) {
    let html = `
      <div class="sui-result-row-portrait">
        <div class="sui-result-row-portrait-image"></div>
      </div>
    `;

    if (!playerSearchResultDTO.pfp) {
      html = `
        <div class="sui-result-row-portrait-icon sui-text-secondary">
          <i class="sui-icon sui-icon-md icon-unknown"></i>
        </div>
      `;
    }

    return html;
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderPlayerInfoHTML(playerSearchResultDTO) {
    let html = `
      <div class="sui-result-row-player-info">
        <div class="sui-text-label-block">
          Address ${playerSearchResultDTO.address}
        </div>
      </div>
    `;

    if (playerSearchResultDTO.id) {
      let tag = playerSearchResultDTO.tag
        ? `<span class="sui-mod-secondary">[${playerSearchResultDTO.tag}]</span>`
        : '';
      let username = playerSearchResultDTO.username
        ? playerSearchResultDTO.username
        : 'Name Redacted'

      html = `
        <div class="sui-result-row-player-info">
          <div class="sui-text-label-block">
            ${tag} ${username}<br>
            <span class="sui-text-hint">PID #${playerSearchResultDTO.id}</span>
          </div>
        </div>
      `;
    }

    return html;
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderAlphaHTML(playerSearchResultDTO) {
    if (isNaN(parseInt(playerSearchResultDTO.alpha))) {
      return '';
    }

    const amount = this.numberFormatter.format(playerSearchResultDTO.alpha);
    return `
      <span>${amount}</span>
      <i class="sui-icon sui-icon-alpha-matter"></i>
    `;
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderResultRowHTML(playerSearchResultDTO) {

    const iconHTML = this.renderIconHTML(playerSearchResultDTO);
    const playerInfoHTML = this.renderPlayerInfoHTML(playerSearchResultDTO);
    const alphaHTML = this.renderAlphaHTML(playerSearchResultDTO);
    const btnId = `recipient-${playerSearchResultDTO.id}`;

    return `
      <div class="sui-result-row">
        <div class="sui-result-row-left-section">
          ${iconHTML}
          ${playerInfoHTML}
        </div>
        <div class="sui-result-row-right-section">
          <div class="sui-result-row-resources">
            <div class="sui-resource">
              ${alphaHTML}
            </div>
          </div>
          <a
            id="${btnId}"
            href="javascript:void(0)"
            class="sui-screen-btn sui-mod-secondary"
          >View</a>
        </div>
      </div>
    `;
  }

  render () {
    this.guildAPI.transferSearch(this.transferSearchRequest).then((players) => {

      this.players = players;

      let noResultsMessage = this.players.length > 0
        ? ''
        : `<div>No results found. Please try a different search term.</div>`;
      let maxResultsMessage = this.players.length >= 25
        ? `<div>Showing the first 25 results. Try narrowing your search for better results.</div>`
        : '';

      MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

      MenuPage.setPageTemplateHeaderBtn('Search Results', true, () => {
        MenuPage.router.goto('Account', 'recipientSearch');
      });

      const playersListHTML = players.reduce((html, player) => {
        return html + this.renderResultRowHTML(player)
      }, '');

      MenuPage.setPageTemplateContent(`
        <div class="common-result-table-layout">
        
          ${noResultsMessage}
          
          <div class="sui-result-rows sui-result-table">
          
            ${playersListHTML}
  
          </div>
          
          ${maxResultsMessage}

        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
    });
  }
}
