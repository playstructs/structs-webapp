import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RAID_STATUS} from "../constants/RaidStatus";
import {RaidStatusUtil} from "../util/RaidStatusUtil";

export class RaidStatusListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   * @param {function} callback
   */
  constructor(gameState, callback) {
    super('RAID_STATUS');
    this.gameState = gameState;
    this.callback = callback;
    this.raidStatusUtil = new RaidStatusUtil();
  }

  handler(messageData) {
    if (
      messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.raidPlanetId}`
    ) {
      this.gameState.raidStatus = messageData.status;

      this.callback(messageData.status);

      if (this.raidStatusUtil.hasRaidEnded(messageData.status)) {
        this.shouldUnregister = () => true;
      }
    }
  }
}
