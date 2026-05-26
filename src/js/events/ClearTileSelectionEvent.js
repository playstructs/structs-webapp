import {EVENTS} from "../constants/Events";

export class ClearTileSelectionEvent extends CustomEvent {

  /**
   * @param {boolean} clearSelected if true, clear the currently selected tile too
   */
  constructor(clearSelected = true) {
    super(EVENTS.CLEAR_TILE_SELECTION);
    this.clearSelected = clearSelected;
  }
}

