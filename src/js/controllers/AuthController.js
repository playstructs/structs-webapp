import {AbstractController} from "../framework/AbstractController";
import {IndexView} from "../views/IndexView";
import {SignupConnectingToCorporate1View} from "../views/SignupConnectingToCorporate1View";
import {SignupConnectingToCorporate2View} from "../views/SignupConnectingToCorporate2View";
import {SignupIncomingCall1View} from "../views/SignupIncomingCall1View";
import {SignupIncomingCall2View} from "../views/SignupIncomingCall2View";
import {SignupIncomingCall3View} from "../views/SignupIncomingCall3View";
import {SignupSetUsernameView} from "../views/SignupSetUsernameView";

export class AuthController extends AbstractController {
  constructor(gameState) {
    super('Auth', gameState);
  }

  index() {
    const view = new IndexView();
    view.render();
  }

  signupConnectingToCorporate1() {
    const view = new SignupConnectingToCorporate1View();
    view.render();
  }

  signupConnectingToCorporate2() {
    const view = new SignupConnectingToCorporate2View();
    view.render();
  }

  signupIncomingCall1() {
    const view = new SignupIncomingCall1View();
    view.render();
  }

  signupIncomingCall2() {
    const view = new SignupIncomingCall2View();
    view.render();
  }

  signupIncomingCall3() {
    const view = new SignupIncomingCall3View();
    view.render();
  }

  signupSetUsername() {
    const view = new SignupSetUsernameView(this.gameState);
    view.render();
  }
}