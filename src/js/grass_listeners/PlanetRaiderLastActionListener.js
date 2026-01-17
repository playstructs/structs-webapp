import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RaidStatusUtil} from "../util/RaidStatusUtil";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

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
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id}`
    ) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].setLastActionBlockHeight(this.gameState.currentBlockHeight, messageData.value);
    }

    if (
      messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.planetId}`
      && this.raidStatusUtil.hasRaidEnded(messageData.detail.status)
    ) {
      this.shouldUnregister = () => true;
    }
  }
}