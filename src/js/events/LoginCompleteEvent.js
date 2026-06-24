import {EVENTS} from "../constants/Events";

export class LoginCompleteEvent extends CustomEvent {

  constructor() {
    super(EVENTS.LOGIN_COMPLETE);
  }
}

