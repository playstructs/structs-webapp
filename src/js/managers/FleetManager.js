
import {PLAYER_TYPES} from "../constants/PlayerTypes";

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
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.fleet_id,
        destinationLocationId
    );
  }
}