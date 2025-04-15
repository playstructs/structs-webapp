import {AbstractController} from "../framework/AbstractController";
import {AccountIndexView} from "../view_models/account/AccountIndexViewModel";

export class AccountController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(
    gameState,
    guildAPI
  ) {
    super('Account', gameState);
    this.guildAPI = guildAPI;
  }

  index() {
    const viewModel = new AccountIndexView(this.gameState, this.guildAPI);
    viewModel.render();
  }
}