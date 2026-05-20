import {EVENTS} from "../constants/Events";

export class ClearTileSelectionEvent extends CustomEvent {

  constructor() {
    super(EVENTS.CLEAR_TILE_SELECTION);
  }
}

