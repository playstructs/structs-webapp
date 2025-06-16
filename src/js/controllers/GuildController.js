import {AbstractController} from "../framework/AbstractController";
import {GuildIndexViewModel} from "../view_models/guild/GuildIndexViewModel";

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
}