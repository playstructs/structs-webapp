//TODO: Awaiting working stargate ts client

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
      this.gameState.signingAccount.address,
      this.gameState.thisPlayerId
    );
  }
}