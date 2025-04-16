import {AbstractController} from "../framework/AbstractController";
import {AccountIndexView} from "../view_models/account/AccountIndexViewModel";

export class AccountController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {AuthManager} authManager
   */
  constructor(
    gameState,
    guildAPI,
    authManager
  ) {
    super('Account', gameState);
    this.guildAPI = guildAPI;
    this.authManager = authManager;
  }

  index() {
    const viewModel = new AccountIndexView(this.gameState, this.guildAPI, this.authManager);
    viewModel.render();
  }
}