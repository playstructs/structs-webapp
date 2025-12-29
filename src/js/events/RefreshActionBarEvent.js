import {EVENTS} from "../constants/Events";

export class RefreshActionBarEvent extends CustomEvent {

  constructor() {
    super(EVENTS.REFRESH_ACTION_BAR);
  }
}
