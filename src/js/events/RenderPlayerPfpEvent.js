import {EVENTS} from "../constants/Events";

export class RenderPlayerPfpEvent extends CustomEvent {
  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(EVENTS.RENDER_PLAYER_PFP);
    this.playerType = playerType;
  }
}

