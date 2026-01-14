
export class FleetManager {

  /**
   * @param gameState
   * @param {SigningClientManager} signingClientManager
   */
  constructor(gameState, signingClientManager) {
    this.gameState = gameState;
    this.signingClientManager = signingClientManager;
  }

  /**
   * @param {string} destinationLocationId
   */
  async moveFleet(destinationLocationId) {
    await this.signingClientManager.queueMsgFleetMove(
        this.gameState.thisPlayer.fleet_id,
        destinationLocationId
    );
  }
}