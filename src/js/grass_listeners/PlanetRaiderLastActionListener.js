import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RaidStatusUtil} from "../util/RaidStatusUtil";

export class PlanetRaiderLastActionListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('PLANET_RAIDER_LAST_ACTION');
    this.gameState = gameState;
    this.raidStatusUtil = new RaidStatusUtil();
  }

  handler(messageData) {
    if (
      messageData.category === 'lastAction'
      && messageData.subject === `structs.grid.player.${this.gameState.planetRaiderId}`
    ) {
      this.gameState.setPlanetRaiderLastActionBlockHeight(messageData.value);
    }

    if (
      messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.thisPlayer.planetId}`
      && this.raidStatusUtil.hasRaidEnded(messageData.status)
    ) {
      this.shouldUnregister = () => true;
    }
  }
}