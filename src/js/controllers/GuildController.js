import {AbstractController} from "../framework/AbstractController";
import {GuildIndexViewModel} from "../view_models/guild/GuildIndexViewModel";
import {GuildProfileViewModel} from "../view_models/guild/GuildProfileViewModel";
import {MemberRosterViewModel} from "../view_models/guild/MemberRosterViewModel";
import {GuildsDirectoryViewModel} from "../view_models/guild/GuildsDirectoryViewModel";
import {ReactorViewModel} from "../view_models/guild/ReactorViewModel";
import {ManageAlphaViewModel} from "../view_models/guild/ManageAlphaViewModel";

export class GuildController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {GrassManager} grassManager
   * @param {AlphaManager} alphaManager
   */
  constructor(
    gameState,
    guildAPI,
    grassManager,
    alphaManager
  ) {
    super('Guild', gameState);
    this.guildAPI = guildAPI;
    this.grassManager = grassManager;
    this.alphaManager = alphaManager;
  }

  index() {
    const viewModel = new GuildIndexViewModel(this.gameState, this.guildAPI);
    viewModel.render();
  }

  /**
   * @param {object} options
   */
  profile(options) {
    const viewModel = new GuildProfileViewModel(this.gameState, this.guildAPI, options.guildId);
    viewModel.render();
  }

  /**
   * @param {object} options
   */
  roster(options) {
    const viewModel = new MemberRosterViewModel(this.gameState, this.guildAPI, options.guildId);
    viewModel.render();
  }

  directory() {
    const viewModel = new GuildsDirectoryViewModel(this.gameState, this.guildAPI);
    viewModel.render();
  }

  reactor() {
    const viewModel = new ReactorViewModel(this.gameState, this.guildAPI);
    viewModel.render();
  }

  /**
   * @param {object} options
   */
  manageAlpha(options) {
    const viewModel = new ManageAlphaViewModel(
      this.gameState,
      this.guildAPI,
      this.grassManager,
      this.alphaManager,
      options
    );
    viewModel.render();
  }
}