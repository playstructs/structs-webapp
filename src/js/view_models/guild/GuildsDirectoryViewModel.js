import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NumberFormatter} from "../../util/NumberFormatter";
import {GenericResourceComponent} from "../components/GenericResourceComponent";

export class GuildsDirectoryViewModel extends AbstractViewModel {

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
    this.numberFormatter = new NumberFormatter();
    this.guilds = [];
    this.genericResourceComponent = new GenericResourceComponent(gameState);

    this.membersId = 'guild-dir-members';
    this.alphaInfusedId = 'guild-dir-alpha-infused';

    this.genericResourcePageCode = [
      this.genericResourceComponent.getPageCode(this.membersId),
      this.genericResourceComponent.getPageCode(this.alphaInfusedId),
    ];
  }

  initPageCode() {
    for (let i = 0; i < this.genericResourcePageCode.length; i++) {
      this.genericResourcePageCode[i]();
    }

    this.guilds.forEach((guild) => {
      document.getElementById(`guild-search-result-${guild.guild_id}`).addEventListener('click', () => {
        MenuPage.router.goto('Guild', 'profile', {guildId: guild.guild_id})
      });
    })
  }

  /**
   * @param {GuildSearchResultDTO} guildSearchResultDTO
   * @return {string}
   */
  renderIconHTML(guildSearchResultDTO) {
    let html = `
      <div class="sui-result-row-portrait-icon sui-text-secondary">
        <i class="sui-icon sui-icon-md icon-unknown"></i>
      </div>
    `;

    if (guildSearchResultDTO.logo) {
      html = `
        <div class="sui-result-row-portrait">
          <img src="${guildSearchResultDTO.logo}" alt="Guild ${guildSearchResultDTO.name}'s logo">
        </div>
      `;
    }

    return html;
  }

  /**
   * @param {GuildSearchResultDTO} guildSearchResultDTO
   * @return {string}
   */
  renderGuildInfoHTML(guildSearchResultDTO) {
    let name = guildSearchResultDTO.name
      ? guildSearchResultDTO.name
      : `Guild #${guildSearchResultDTO.guild_id}`;

    return `
      <div class="sui-result-row-player-info">
        <div class="sui-text-label-block">
          ${name}
        </div>
      </div>
    `;
  }

  /**
   * @param {GuildSearchResultDTO} guildSearchResultDTO
   * @return {string}
   */
  renderResultRowHTML(guildSearchResultDTO) {

    const iconHTML = this.renderIconHTML(guildSearchResultDTO);
    const guildInfoHTML = this.renderGuildInfoHTML(guildSearchResultDTO);
    const btnId = `guild-search-result-${guildSearchResultDTO.guild_id}`;

    return `
      <div class="sui-result-row">
        <div class="sui-result-row-left-section">
          ${iconHTML}
          ${guildInfoHTML}
        </div>
        <div class="sui-result-row-right-section">
          <div class="sui-result-row-resources">
            <div>
              ${
                this.genericResourceComponent.renderHTML(
                  this.membersId,
                  'icon-member',
                  'Number of members in the guild',
                  this.numberFormatter.format(guildSearchResultDTO.members)
                )
              }
            </div>
            <div>
              ${
                this.genericResourceComponent.renderHTML(
                  this.alphaInfusedId,
                  'sui-icon-alpha-matter',
                  'Alpha infused with the guild',
                  this.numberFormatter.format(guildSearchResultDTO.alpha)
                )
              }
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
    this.guildAPI.getGuildsDirectory().then((guilds) => {

      this.guilds = guilds;

      let noResultsMessage = this.guilds.length > 0 ? '' : `<div>Guild has no members yet.</div>`;

      MenuPage.enablePageTemplate(MenuPage.navItemGuildId);

      MenuPage.setPageTemplateHeaderBtn("Guild's Directory", true, () => {
        MenuPage.router.goto('Guild', 'index');
      });

      const guildsListHTML = guilds.reduce((html, guild) => {
        return html + this.renderResultRowHTML(guild)
      }, '');

      MenuPage.setPageTemplateContent(`
        <div class="common-result-table-layout">
        
          ${noResultsMessage}
          
          <div class="sui-result-rows sui-result-table">
          
            ${guildsListHTML}
  
          </div>

        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
    });
  }
}
