import {AbstractController} from "../framework/AbstractController";
import {IndexView} from "../view_models/IndexViewModel";
import {ConnectingToCorp1ViewModel} from "../view_models/signup/ConnectingToCorp1ViewModel";
import {ConnectingToCorp2ViewModel} from "../view_models/signup/ConnectingToCorp2ViewModel";
import {IncomingCall1ViewModel} from "../view_models/signup/IncomingCall1ViewModel";
import {IncomingCall2ViewModel} from "../view_models/signup/IncomingCall2ViewModel";
import {IncomingCall3ViewModel} from "../view_models/signup/IncomingCall3ViewModel";
import {SetUsernameViewModel} from "../view_models/signup/SetUsernameViewModel";
import {RecoveryKeyIntroViewModel} from "../view_models/signup/RecoveryKeyIntroViewModel";
import {RecoveryKeyCreationViewModel} from "../view_models/signup/RecoveryKeyCreationViewModel";
import {WalletManager} from "../managers/WalletManager";
import {RecoveryKeyConfirmationViewModel} from "../view_models/signup/RecoveryKeyConfirmationViewModel";
import {AwaitingIdViewModel} from "../view_models/signup/AwaitingIdViewModel";

export class AuthController extends AbstractController {
  constructor(gameState) {
    super('Auth', gameState);
    this.walletManager = new WalletManager();
    this.mnemonic = null;
  }

  index() {
    const viewModel = new IndexView();
    viewModel.render();
  }

  signupConnectingToCorporate1() {
    const viewModel = new ConnectingToCorp1ViewModel();
    viewModel.render();
  }

  signupConnectingToCorporate2() {
    const viewModel = new ConnectingToCorp2ViewModel();
    viewModel.render();
  }

  signupIncomingCall1() {
    const viewModel = new IncomingCall1ViewModel();
    viewModel.render();
  }

  signupIncomingCall2() {
    const viewModel = new IncomingCall2ViewModel();
    viewModel.render();
  }

  signupIncomingCall3() {
    const viewModel = new IncomingCall3ViewModel();
    viewModel.render();
  }

  signupSetUsername() {
    const viewModel = new SetUsernameViewModel(this.gameState);
    viewModel.render();
  }

  signupRecoveryKeyIntro() {
    const viewModel = new RecoveryKeyIntroViewModel();
    viewModel.render();
  }

  signupRecoveryKeyCreation() {
    if (this.mnemonic === null) {
      this.mnemonic = this.walletManager.createMnemonic();
    }
    const viewModel = new RecoveryKeyCreationViewModel(this.mnemonic);
    viewModel.render();
  }

  signupRecoveryKeyConfirmation() {
    const viewModel = new RecoveryKeyConfirmationViewModel(this.mnemonic);
    viewModel.render();
  }

  /**
   * @param {object} options
   */
  signupRecoveryKeyConfirmFail(options) {
    const viewModel = new RecoveryKeyCreationViewModel(this.mnemonic);
    viewModel.render(options.view);
  }

  signupAwaitingId() {
    const viewModel = new AwaitingIdViewModel();
    viewModel.render();
  }
}