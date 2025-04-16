import {AbstractController} from "../framework/AbstractController";
import {AccountIndexView} from "../view_models/account/AccountIndexViewModel";
import {AccountProfileView} from "../view_models/account/AccountProfileViewModel";

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

  profile() {
    const viewModel = new AccountProfileView(this.gameState, this.guildAPI);
    viewModel.render();
  }
}