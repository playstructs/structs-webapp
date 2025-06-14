import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NumberFormatter} from "../../util/NumberFormatter";

export class AccountRecipientViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {PlayerSearchResultDTO|object} playerSearchResultDTO
   */
  constructor(
    gameState,
    guildAPI,
    playerSearchResultDTO
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.playerSearchResultDTO = playerSearchResultDTO;
    this.numberFormatter = new NumberFormatter();
    this.selectThisPlayerBtnId = 'select-this-player-btn';
  }

  initPageCode() {
    document.getElementById(this.selectThisPlayerBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Account', 'confirmTransfer', this.playerSearchResultDTO)
    })
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderIconHTML(playerSearchResultDTO) {
    let html = `
      <div class="profile-header-image-container">
        <div class="profile-header-image"></div>
      </div>
    `;

    if (!playerSearchResultDTO.pfp) {
      html = `
        <div class="profile-header-image-container sui-text-disabled">
          <i class="sui-icon sui-icon-xl icon-unknown"></i>
        </div>
      `;
    }

    return html;
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderNameHTML(playerSearchResultDTO) {
    let html = 'Non-Player Address';
    if (playerSearchResultDTO.id) {
      let tag = playerSearchResultDTO.tag
        ? `<span class="sui-mod-secondary">[${playerSearchResultDTO.tag}]</span>`
        : '';
      let username = playerSearchResultDTO.username
        ? playerSearchResultDTO.username
        : 'Name Redacted';
      html = `${tag} ${username}`;
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
  getCardTitle(playerSearchResultDTO) {
    return playerSearchResultDTO.id ? `Player Details` : 'Recipient Details';
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderGuildDataRow(playerSearchResultDTO) {
    return playerSearchResultDTO.guild_name
      ? `
        <div class="sui-data-card-row">
          <div>Guild</div>
          <div>${playerSearchResultDTO.guild_name}</div>
        </div>
      `
      : '';
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderPlayerIdDataRow(playerSearchResultDTO) {
    return playerSearchResultDTO.id
      ? `
        <div class="sui-data-card-row">
          <div>Player ID</div>
          <div>${playerSearchResultDTO.id}</div>
        </div>
      `
      : '';
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderAddressDataRow(playerSearchResultDTO) {
    return playerSearchResultDTO.address
      ? `
        <div class="sui-data-card-row">
          <div>Blockchain Address</div>
          <div>${playerSearchResultDTO.address}</div>
        </div>
      `
      : '';
  }

  render () {

    const iconHTML = this.renderIconHTML(this.playerSearchResultDTO);
    const nameHTML = this.renderNameHTML(this.playerSearchResultDTO);
    const alphaHTML = this.renderAlphaHTML(this.playerSearchResultDTO);
    const cardTitle = this.getCardTitle(this.playerSearchResultDTO);
    const guildDataRow = this.renderGuildDataRow(this.playerSearchResultDTO);
    const playerIdDataRow = this.renderPlayerIdDataRow(this.playerSearchResultDTO);
    const addressDataRow = this.renderAddressDataRow(this.playerSearchResultDTO);

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

    MenuPage.setPageTemplateHeaderBtn('Recipient', true, () => {
      MenuPage.router.goto('Account', 'recipientSearchResults');
    });

    MenuPage.setPageTemplateContent(`
      <div class="profile-layout">
        <div class="profile-header">
          ${iconHTML}
          <div class="profile-header-info-container">
            <div class="profile-header-info-name sui-text-display">
              ${nameHTML}
            </div>
            <div class="profile-header-info-player-id">
              ${alphaHTML}
            </div>
          </div>
        </div>
        
        <div class="sui-data-card">
          <div class="sui-data-card-header sui-text-header">${cardTitle}</div>
          <div class="sui-data-card-body">
            ${guildDataRow}
            ${playerIdDataRow}
            ${addressDataRow}
          </div>
        </div>
        
        <div class="sui-screen-btn-flex-wrapper">
          <a 
            id="${this.selectThisPlayerBtnId}"
            href="javascript: void(0)" 
            class="sui-screen-btn sui-mod-secondary"
          >Select This Player</a>
        </div>
        
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
