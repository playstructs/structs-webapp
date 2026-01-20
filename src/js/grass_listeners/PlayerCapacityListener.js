import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class PlayerCapacityListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('PLAYER_CAPACITY');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'capacity'
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
    ) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlayerCapacity(messageData.value);
    }
  }
}
