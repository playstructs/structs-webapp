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
import {AccountChangeUsername} from "../view_models/account/AccountChangeUsername";
import {AccountTransfersViewModel} from "../view_models/account/AccountTransfersViewModel";
import {AccountTransactionHistory} from "../view_models/account/AccountTransactionHistory";
import {AccountTransactionViewModel} from "../view_models/account/AccountTransactionViewModel";
import {AccountTransferAmountViewModel} from "../view_models/account/AccountTransferAmountViewModel";
import {AccountRecipientSearchViewModel} from "../view_models/account/AccountRecipientSearchViewModel";
import {AccountRecipientSearchResults} from "../view_models/account/AccountRecipientSearchResults";
import {AccountRecipientViewModel} from "../view_models/account/AccountRecipientViewModel";
import {AccountConfirmTransfer} from "../view_models/account/AccountConfirmTransfer";

export class AccountController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {AuthManager} authManager
   * @param {PermissionManager} permissionManager
   * @param {AlphaManager} alphaManager
   * @param {GrassManager} grassManager
   */
  constructor(
    gameState,
    guildAPI,
    authManager,
    permissionManager,
    alphaManager,
    grassManager
  ) {
    super('Account', gameState);
    this.guildAPI = guildAPI;
    this.authManager = authManager;
    this.permissionManager = permissionManager;
    this.alphaManager = alphaManager;
    this.grassManager = grassManager;
  }

  index() {
    const viewModel = new AccountIndexViewModel(this.gameState, this.guildAPI, this.authManager);
    viewModel.render();
  }

  /**
   * @param {object} options
   */
  profile(options) {
    const playerId = (options.hasOwnProperty('playerId') && options.playerId)
      ? options.playerId
      : this.gameState.thisPlayerId;
    const viewModel = new AccountProfileViewModel(
      this.gameState,
      this.guildAPI,
      playerId
    );
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

  changeUsername() {
    const viewModel = new AccountChangeUsername(this.gameState, this.guildAPI);
    viewModel.render();
  }

  transfers() {
    const viewModel = new AccountTransfersViewModel();
    viewModel.render();
  }

  /**
   * @param {object} options
   */
  transactionHistory(options) {
    const page = options.hasOwnProperty('page') ? options.page : 1;
    const viewModel = new AccountTransactionHistory(
      this.gameState,
      this.guildAPI,
      page
    );
    viewModel.render();
  }

  /**
   * @param {object} options
   */
  transaction(options) {
    const viewModel = new AccountTransactionViewModel(
      this.gameState,
      this.guildAPI,
      options.txId,
      options.comingFromPage,
      options.hasOwnProperty('hasBackToAccountBtn') ? options.hasBackToAccountBtn : false,
    );
    viewModel.render();
  }

  transferAmount() {
    const viewModel = new AccountTransferAmountViewModel(this.gameState);
    viewModel.render();
  }

  recipientSearch() {
    const viewModel = new AccountRecipientSearchViewModel(this.gameState, this.guildAPI);
    viewModel.render();
  }

  /**
   * @param {object} options
   */
  recipientSearchResults(options) {
    const viewModel = new AccountRecipientSearchResults(this.gameState, this.guildAPI, options)
    viewModel.render();
  }

  /**
   * @param {object} options
   */
  recipient(options) {
    const viewModel = new AccountRecipientViewModel(this.gameState, this.guildAPI, options);
    viewModel.render();
  }

  /**
   * @param {object} options
   */
  confirmTransfer(options) {
    const viewModel = new AccountConfirmTransfer(
      this.gameState,
      this.guildAPI,
      this.alphaManager,
      this.grassManager,
      options
    );
    viewModel.render();
  }
}