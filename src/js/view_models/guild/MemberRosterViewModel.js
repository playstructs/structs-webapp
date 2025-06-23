import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NumberFormatter} from "../../util/NumberFormatter";

export class MemberRosterViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {string} guildId
   */
  constructor(
    gameState,
    guildAPI,
    guildId
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.guildId = guildId;
    this.numberFormatter = new NumberFormatter();
    this.players = [];
  }

  initPageCode() {
    this.players.forEach((player) => {
      document.getElementById(`player-search-result-${player.id}`).addEventListener('click', () => {
        MenuPage.router.goto('Account', 'profile', {playerId: player.id})
      });
    })
  }

  /**
   * @return {string}
   */
  renderIconHTML() {
    return `
      <div class="sui-result-row-portrait">
        <div class="sui-result-row-portrait-image"></div>
      </div>
    `;
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

    const iconHTML = this.renderIconHTML();
    const playerInfoHTML = this.renderPlayerInfoHTML(playerSearchResultDTO);
    const alphaHTML = this.renderAlphaHTML(playerSearchResultDTO);
    const btnId = `player-search-result-${playerSearchResultDTO.id}`;

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
    this.guildAPI.getGuildRoster(this.guildId).then((players) => {

      this.players = players;

      let noResultsMessage = this.players.length > 0 ? '' : `<div>Guild has no members yet.</div>`;

      MenuPage.enablePageTemplate(MenuPage.navItemGuildId);

      MenuPage.setPageTemplateHeaderBtn('Member Roster', true, () => {
        MenuPage.router.goto('Guild', 'index');
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

        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
    });
  }
}
