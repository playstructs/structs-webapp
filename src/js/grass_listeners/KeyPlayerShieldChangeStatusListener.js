import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PlanetaryShieldInfoDTOFactory} from "../factories/PlanetaryShieldInfoDTOFactory";
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
    this.planetaryShieldInfoDTOFactory = new PlanetaryShieldInfoDTOFactory();
    this.raidStatusUtil = new RaidStatusUtil();
  }

  handler(messageData) {
    if (
      messageData.category === 'shield_change'
      && messageData.subject === `structs.planet.${this.gameState.keyPlayers[this.playerType].planet.id}`
    ) {
      const shieldInfo = this.planetaryShieldInfoDTOFactory.make(messageData.detail);
      this.gameState.keyPlayers[this.playerType].setPlanetShieldInfo(shieldInfo, this.gameState.currentBlockHeight);
    }

    if (
      this.gameState.keyPlayers[this.playerType].isRaidDependent()
      && messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.keyPlayers[this.playerType].planet.id}`
      && this.raidStatusUtil.hasRaidEnded(messageData.detail.status)
    ) {
      this.shouldUnregister = () => true;
    }
  }
}
