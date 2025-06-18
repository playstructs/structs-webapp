import {AbstractController} from "../framework/AbstractController";
import {GuildIndexViewModel} from "../view_models/guild/GuildIndexViewModel";
import {GuildProfileViewModel} from "../view_models/guild/GuildProfileViewModel";

export class GuildController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(
    gameState,
    guildAPI
  ) {
    super('Guild', gameState);
    this.guildAPI = guildAPI;
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
}