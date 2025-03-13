import {AbstractController} from "../framework/AbstractController";
import {IndexView} from "../view_models/IndexViewModel";
import {ConnectingToCorp1ViewModel} from "../view_models/signup/ConnectingToCorp1ViewModel";
import {ConnectingToCorp2ViewModel} from "../view_models/signup/ConnectingToCorp2ViewModel";
import {IncomingCall1ViewModel} from "../view_models/signup/IncomingCall1ViewModel";
import {IncomingCall2ViewModel} from "../view_models/signup/IncomingCall2ViewModel";
import {IncomingCall3ViewModel} from "../view_models/signup/IncomingCall3ViewModel";
import {SetUsernameViewModel} from "../view_models/signup/SetUsernameViewModel";

export class AuthController extends AbstractController {
  constructor(gameState) {
    super('Auth', gameState);
  }

  index() {
    const view = new IndexView();
    view.render();
  }

  signupConnectingToCorporate1() {
    const view = new ConnectingToCorp1ViewModel();
    view.render();
  }

  signupConnectingToCorporate2() {
    const view = new ConnectingToCorp2ViewModel();
    view.render();
  }

  signupIncomingCall1() {
    const view = new IncomingCall1ViewModel();
    view.render();
  }

  signupIncomingCall2() {
    const view = new IncomingCall2ViewModel();
    view.render();
  }

  signupIncomingCall3() {
    const view = new IncomingCall3ViewModel();
    view.render();
  }

  signupSetUsername() {
    const view = new SetUsernameViewModel(this.gameState);
    view.render();
  }
}