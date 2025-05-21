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
import {Orientation7ViewModel} from "../view_models/signup/Orientation7ViewModel";
import {Orientation8ViewModel} from "../view_models/signup/Orientation8ViewModel";
import {OrientationEndViewModel} from "../view_models/signup/OrientationEndViewModel";
import {ActivateDeviceViewModel} from "../view_models/login/ActivateDeviceViewModel";
import {ActivateDeviceVerifyViewModel} from "../view_models/login/ActivateDeviceVerifyViewModel";
import {ActivationCodeInfoDTO} from "../dtos/ActivationCodeInfoDTO";
import {ActivateDeviceCancelledViewModel} from "../view_models/login/ActivateDeviceCancelledViewModel";
import {
  ActivateDeviceWaitingForApprovalViewModel
} from "../view_models/login/ActivateDeviceWaitingForApprovalViewModel";
import {ActivatingDeviceViewModel} from "../view_models/login/ActivatingDeviceViewModel";
import {ActivateDeviceCompleteViewModel} from "../view_models/login/ActivateDeviceCompleteViewModel";

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
    if (this.gameState.mnemonic === null) {
      this.gameState.mnemonic = this.walletManager.createMnemonic();
    }
    const viewModel = new RecoveryKeyCreationViewModel(this.gameState.mnemonic);
    viewModel.render();
  }

  signupRecoveryKeyConfirmation() {
    const viewModel = new RecoveryKeyConfirmationViewModel(
      this.gameState,
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

  orientation7() {
    const viewModel = new Orientation7ViewModel();
    viewModel.render();
  }

  orientation8() {
    const viewModel = new Orientation8ViewModel();
    viewModel.render();
  }

  orientationEnd() {
    const viewModel = new OrientationEndViewModel();
    viewModel.render();
  }

  loginActivateDevice() {
    const viewModel = new ActivateDeviceViewModel(this.guildAPI);
    viewModel.render();
  }

  /**
   * @param {ActivationCodeInfoDTO|null} activationCodeInfoDTO
   */
  loginActivateDeviceVerify(activationCodeInfoDTO = null) {
    const viewModel = new ActivateDeviceVerifyViewModel(
      this.authManager,
      activationCodeInfoDTO
    );
    viewModel.render();
  }

  loginActivateDeviceCancelled() {
    const viewModel = new ActivateDeviceCancelledViewModel();
    viewModel.render();
  }

  /**
   * @param {ActivationCodeInfoDTO|null} activationCodeInfoDTO
   */
  loginActivateDeviceWaitingForApproval(activationCodeInfoDTO = null) {
    const viewModel = new ActivateDeviceWaitingForApprovalViewModel(
      this.gameState,
      activationCodeInfoDTO
    );
    viewModel.render();
  }

  /**
   * @param {ActivationCodeInfoDTO|null} activationCodeInfoDTO
   */
  loginActivatingDevice(activationCodeInfoDTO) {
    const viewModel = new ActivatingDeviceViewModel(
      this.gameState,
      this.authManager,
      activationCodeInfoDTO
    );
    viewModel.render();
  }

  loginActivateDeviceComplete() {
    const viewModel = new ActivateDeviceCompleteViewModel(this.gameState);
    viewModel.render();
  }
}