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
import {RecoveryKeyFaqViewModel} from "../view_models/signup/RecoveryKeyFaqViewModel";
import {SignupSuccessViewModel} from "../view_models/signup/SignupSuccessViewModel";
import {AuthManager} from "../managers/AuthManager";
import {Orientation1ViewModel} from "../view_models/signup/Orientation1ViewModel";
import {Orientation2ViewModel} from "../view_models/signup/Orientation2ViewModel";
import {Orientation3ViewModel} from "../view_models/signup/Orientation3ViewModel";
import {Orientation4ViewModel} from "../view_models/signup/Orientation4ViewModel";
import {Orientation5ViewModel} from "../view_models/signup/Orientation5ViewModel";
import {Orientation6ViewModel} from "../view_models/signup/Orientation6ViewModel";

export class AuthController extends AbstractController {

  /**
   *
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {WalletManager} walletManager
   * @param {AuthManager} authManager
   */
  constructor(
    gameState,
    guildAPI,
    walletManager,
    authManager
  ) {
    super('Auth', gameState);
    this.guildAPI = guildAPI;
    this.walletManager = walletManager;
    this.authManager  = authManager;
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
    const viewModel = new RecoveryKeyConfirmationViewModel(
      this.mnemonic,
      this.authManager
    );
    viewModel.render();
  }

  /**
   * @param {object} options
   */
  signupRecoveryKeyConfirmFail(options) {
    const viewModel = new RecoveryKeyCreationViewModel(this.mnemonic);
    viewModel.render(options.view);
  }

  /**
   * @param {object} options
   */
  signupRecoveryKeyFaq(options) {
    const viewModel = new RecoveryKeyFaqViewModel(options.backButtonHandler);
    viewModel.render();
  }

  signupSuccess() {
    const viewModel = new SignupSuccessViewModel();
    viewModel.render();
  }

  signupAwaitingId() {
    const viewModel = new AwaitingIdViewModel();
    viewModel.render();
  }

  orientation1() {
    const viewModel = new Orientation1ViewModel();
    viewModel.render();
  }

  orientation2() {
    const viewModel = new Orientation2ViewModel();
    viewModel.render();
  }

  orientation3() {
    const viewModel = new Orientation3ViewModel();
    viewModel.render();
  }

  orientation4() {
    const viewModel = new Orientation4ViewModel();
    viewModel.render();
  }

  orientation5() {
    const viewModel = new Orientation5ViewModel();
    viewModel.render();
  }

  orientation6() {
    const viewModel = new Orientation6ViewModel();
    viewModel.render();
  }
}