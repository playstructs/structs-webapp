import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RaidStatusUtil} from "../util/RaidStatusUtil";

export class KeyPlayerLastActionListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {string} playerType
   */
  constructor(gameState, playerType) {
    super(`${playerType}_LAST_ACTION`);
    this.gameState = gameState;
    this.playerType = playerType;
    this.raidStatusUtil = new RaidStatusUtil();
  }

  handler(messageData) {
    if (
      messageData.category === 'lastAction'
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[this.playerType].id}`
    ) {
      this.gameState.keyPlayers[this.playerType].setLastActionBlockHeight(this.gameState.currentBlockHeight, messageData.value);
    }

    if (
      this.gameState.keyPlayers[this.playerType].isRaidDependent()
      && messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.getPlanetRaidInfoForKeyPlayer(this.playerType).planet_id}`
      && this.raidStatusUtil.hasRaidEnded(messageData.detail.status)
    ) {
      this.shouldUnregister = () => true;
    }
  }
}