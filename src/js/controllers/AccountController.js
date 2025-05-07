import {AbstractController} from "../framework/AbstractController";
import {AccountIndexViewModel} from "../view_models/account/AccountIndexViewModel";
import {AccountProfileViewModel} from "../view_models/account/AccountProfileViewModel";
import {AccountDevicesViewModel} from "../view_models/account/AccountDevicesViewModel";

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
    const viewModel = new AccountIndexViewModel(this.gameState, this.guildAPI, this.authManager);
    viewModel.render();
  }

  profile() {
    const viewModel = new AccountProfileViewModel(this.gameState, this.guildAPI);
    viewModel.render();
  }

  devices() {
    const viewModel = new AccountDevicesViewModel(this.gameState, this.guildAPI, this.authManager);
    viewModel.render();
  }
}