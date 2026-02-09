import {EVENTS} from "../constants/Events";

export class TrackDestroyedStructsEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(EVENTS.TRACK_DESTROYED_STRUCTS);
    this.playerType = playerType;
  }
}

