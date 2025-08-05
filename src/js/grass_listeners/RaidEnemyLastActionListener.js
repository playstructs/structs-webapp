import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RaidStatusUtil} from "../util/RaidStatusUtil";

export class RaidEnemyLastActionListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('RAID_ENEMY_LAST_ACTION');
    this.gameState = gameState;
    this.raidStatusUtil = new RaidStatusUtil();
  }

  handler(messageData) {
    if (
      messageData.category === 'lastAction'
      && messageData.subject === `structs.grid.player.${this.gameState.getRaidEnemyId()}`
    ) {
      this.gameState.setRaidEnemyLastActionBlockHeight(messageData.value);
    }

    if (
      messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.raidPlanetRaidInfo.planet_id}`
      && this.raidStatusUtil.hasRaidEnded(messageData.status)
    ) {
      this.shouldUnregister = () => true;
    }
  }
}