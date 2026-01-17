import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";

export class GuildIndexViewModel extends AbstractViewModel {

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
    this.alphaReactorBtnId = 'guild-menu-alpha-reactor-btn';
    this.guildProfileBtnId = 'guild-menu-profile-btn';
    this.memberRosterBtnId = 'guild-menu-member-roster-btn';
    this.guildsDirectoryBtnId = 'guild-menu-guilds-directory-btn';
  }

  initPageCode() {
    document.getElementById(this.alphaReactorBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Guild', 'reactor');
    });
    document.getElementById(this.guildProfileBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Guild', 'profile', {guildId: this.gameState.thisGuild.id});
    });
    document.getElementById(this.memberRosterBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Guild', 'roster', {guildId: this.gameState.thisGuild.id});
    });
    document.getElementById(this.guildsDirectoryBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Guild', 'directory');
    });
  }

  render () {

    const alphaInfusedPromise = this.guildAPI.getInfusionByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id);
    const memberCountPromise = this.guildAPI.countGuildMembers(this.gameState.thisGuild.id);
    const guildCountPromise = this.guildAPI.countGuilds();

    Promise.all([
      alphaInfusedPromise,
      memberCountPromise,
      guildCountPromise
    ]).then((responseValues) => {
      const alphaInfused = responseValues[0].fuel;
      const memberCount = responseValues[1];
      const guildCount = responseValues[2];

      MenuPage.enablePageTemplate(MenuPage.navItemGuildId);

      MenuPage.setPageTemplateHeaderBtn('Guild Status');

      MenuPage.setPageTemplateContent(`
        <div class="menu-index-layout">
          
          <a id="${this.alphaReactorBtnId}" class="menu-index-btn" href="javascript: void(0)">
            <i class="sui-icon sui-icon-lg icon-refine sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class=menu-index-btn-nav-label>
                <span class="sui-text-header">Alpha Reactor</span>
                <i class="sui-icon icon-chevron-right sui-text-primary"></i>
              </div>
              <div class="sui-text-header sui-text-secondary">${alphaInfused} Alpha Infused</div>
            </div>
          </a>
          
          <a id="${this.guildProfileBtnId}" class="menu-index-btn" href="javascript: void(0)">
            <i class="sui-icon sui-icon-lg icon-guild sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class=menu-index-btn-nav-label>
                <span class="sui-text-header">Guild Profile</span>
                <i class="sui-icon icon-chevron-right sui-text-primary"></i>
              </div>
              <div class="sui-text-header sui-text-secondary">${this.gameState.thisGuild.name}</div>
            </div>
          </a>
          
          <a id="${this.memberRosterBtnId}" class="menu-index-btn" href="javascript: void(0)">
            <i class="sui-icon sui-icon-lg icon-member sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class=menu-index-btn-nav-label>
                <span class="sui-text-header">Member Roster</span>
                <i class="sui-icon icon-chevron-right sui-text-primary"></i>
              </div>
              <div class="sui-text-header sui-text-secondary">${memberCount} Members</div>
            </div>
          </a>
          
          <a id="${this.guildsDirectoryBtnId}" class="menu-index-btn" href="javascript: void(0)">
            <i class="sui-icon sui-icon-lg icon-guild-directory sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class=menu-index-btn-nav-label>
                <span class="sui-text-header">Guilds Directory</span>
                <i class="sui-icon icon-chevron-right sui-text-primary"></i>
              </div>
              <div class="sui-text-header sui-text-secondary">${guildCount} Guilds</div>
            </div>
          </a>
          
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();

    });
  }
}
