import {EVENTS} from "../constants/Events";

export class ChargeLevelChangedEvent extends CustomEvent {
  constructor(playerId, chargeLevel) {
    super(EVENTS.CHARGE_LEVEL_CHANGED);
    this.playerId = playerId;
    this.chargeLevel = chargeLevel;
  }
}
