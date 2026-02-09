import {EVENTS} from "../constants/Events";

export class TrackDestroyedStructEvent extends CustomEvent {

  /**
   * @param {string} playerType
   * @param {string} structId
   */
  constructor(playerType, structId) {
    super(EVENTS.TRACK_DESTROYED_STRUCT);
    this.playerType = playerType;
    this.structId = structId;
  }
}

