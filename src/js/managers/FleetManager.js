import {FEE} from "../constants/Fee";

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
   * @return {Promise<void>}
   */
  async moveFleet(destinationLocationId) {
    const msg = this.signingClientManager.createMsgFleetMove(
      this.gameState.signingAccount.address,
      this.gameState.thisPlayer.fleet_id,
      destinationLocationId
    );

    try {
      await this.gameState.signingClient.signAndBroadcast(
        this.gameState.signingAccount.address,
        [msg],
        FEE
      );
    } catch (error) {
      console.log('Sign and Broadcast Error:', error);
    }
  }
}