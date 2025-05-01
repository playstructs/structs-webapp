//TODO: Awaiting working stargate ts client

import {FEE} from "../constants/Fee";

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
    const msg = this.signingClientManager.createMsgPlanetExplore(
      this.gameState.signingAccount.address,
      this.gameState.thisPlayerId
    );

    return await this.gameState.signingClient.signAndBroadcast(
      this.gameState.signingAccount.address,
      [msg],
      FEE
    );
  }
}