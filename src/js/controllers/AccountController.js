import {AbstractController} from "../framework/AbstractController";
import {AccountIndexViewModel} from "../view_models/account/AccountIndexViewModel";
import {AccountProfileViewModel} from "../view_models/account/AccountProfileViewModel";
import {AccountDevicesViewModel} from "../view_models/account/AccountDevicesViewModel";
import {AccountNewDeviceCodeViewModel} from "../view_models/account/AccountNewDeviceCodeViewModel";
import {AccountApproveNewDeviceViewModel} from "../view_models/account/AccountApproveNewDeviceViewModel";
import {AccountActivatingDeviceViewModel} from "../view_models/account/AccountActivatingDeviceViewModel";
import {AccountDeviceActivationComplete} from "../view_models/account/AccountDeviceActivationComplete";
import {AccountDeviceActivationCancelled} from "../view_models/account/AccountDeviceActivationCancelled";
import {AccountDeviceViewModel} from "../view_models/account/AccountDeviceViewModel";

export class AccountController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {AuthManager} authManager
   * @param {PermissionManager} permissionManager
   */
  constructor(
    gameState,
    guildAPI,
    authManager,
    permissionManager
  ) {
    super('Account', gameState);
    this.guildAPI = guildAPI;
    this.authManager = authManager;
    this.permissionManager = permissionManager;
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
    const viewModel = new AccountDevicesViewModel(
      this.gameState,
      this.guildAPI,
      this.authManager,
      this.permissionManager
    );
    viewModel.render();
  }

  newDeviceCode() {
    const viewModel = new AccountNewDeviceCodeViewModel(this.gameState, this.guildAPI, this.authManager);
    viewModel.render();
  }

  /**
   * @param {PlayerAddressPending} playerAddressPending
   */
  approveNewDevice(playerAddressPending) {
    const viewModel = new AccountApproveNewDeviceViewModel(
      this.gameState,
      this.permissionManager,
      playerAddressPending
    );
    viewModel.render();
  }

  /**
   * @param {PlayerAddressPending} playerAddressPending
   */
  activatingDevice(playerAddressPending) {
    const viewModel = new AccountActivatingDeviceViewModel(
      this.gameState,
      this.authManager,
      playerAddressPending
    );
    viewModel.render();
  }

  deviceActivationComplete() {
    const viewModel = new AccountDeviceActivationComplete();
    viewModel.render();
  }

  deviceActivationCancelled() {
    const viewModel = new AccountDeviceActivationCancelled();
    viewModel.render();
  }

  /**
   * @param {PlayerAddress} deviceAddress
   */
  manageDevice(deviceAddress) {
    const viewModel = new AccountDeviceViewModel(
      this.gameState,
      this.guildAPI,
      this.permissionManager,
      deviceAddress
    );
    viewModel.render();
  }
}