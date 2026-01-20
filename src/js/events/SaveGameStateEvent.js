import {EVENTS} from "../constants/Events";

export class SaveGameStateEvent extends CustomEvent {
  constructor() {
    super(EVENTS.SAVE_GAME_STATE);
  }
}
