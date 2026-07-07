import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RaidStatusUtil} from "../util/RaidStatusUtil";

export class KeyPlayerShieldChangeStatusListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   * @param {string} playerType
   */
  constructor(gameState, playerType) {
    super(`${playerType}_SHIELD_CHANGE`);
    this.gameState = gameState;
    this.playerType = playerType;
    this.raidStatusUtil = new RaidStatusUtil();
  }

  handler(messageData) {
    const planetSubject = `structs.planet.${this.gameState.keyPlayers[this.playerType].getPlanetId()}.${this.gameState.keyPlayers[this.playerType].id}`;

    // shield_change: update the shield strength only; never touch block_start_raid
    if (messageData.category === 'shield_change' && messageData.subject === planetSubject) {
      this.gameState.keyPlayers[this.playerType].planetShieldInfo.planetary_shield = messageData.detail.planetary_shield;
      this.gameState.keyPlayers[this.playerType].setPlanetShieldHealth(this.gameState.currentBlockHeight);
    }

    // block_raid_start: set block_start_raid if the shield value is known, otherwise fetch it
    if (messageData.category === 'block_raid_start' && messageData.subject === planetSubject) {
      if (
          this.gameState.keyPlayers[this.playerType].planetShieldInfo.planetary_shield !== null
        && this.gameState.keyPlayers[this.playerType].planetShieldInfo.planetary_shield !== undefined
      ) {
        this.gameState.keyPlayers[this.playerType].planetShieldInfo.block_start_raid = messageData.detail.block_start_raid;
        this.gameState.keyPlayers[this.playerType].setPlanetShieldHealth(this.gameState.currentBlockHeight);
      } else {
        this.gameState.guildAPI.getPlanetaryShieldInfo(this.gameState.keyPlayers[this.playerType].getPlanetId()).then(shieldInfo => {
          this.gameState.keyPlayers[this.playerType].setPlanetShieldInfo(shieldInfo, this.gameState.currentBlockHeight);
        });
      }
    }

    if (
        this.gameState.keyPlayers[this.playerType].isRaidDependent()
      && messageData.category === 'raid_status'
      && messageData.subject === planetSubject
      && this.raidStatusUtil.hasRaidEnded(messageData.detail.status)
    ) {
      this.shouldUnregister = () => true;
    }
  }
}
