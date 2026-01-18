import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class ConnectionCapacityListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('CONNECTION_CAPACITY');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'connectionCapacity'
      && messageData.subject === `structs.grid.substation.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.substation_id}`
    ) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setConnectionCapacity(messageData.value);
    }
  }
}
