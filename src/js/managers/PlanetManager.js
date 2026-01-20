import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class PlanetManager {

  /**
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   */
  constructor(gameState, signingClientManager) {
    this.gameState = gameState;
    this.signingClientManager = signingClientManager;
  }

  async findNewPlanet() {
    await this.signingClientManager.queueMsgPlanetExplore(
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
    );
  }
}