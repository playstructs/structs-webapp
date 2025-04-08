import {AbstractGrassListener} from "../framework/AbstractGrassListener";

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
      && messageData.subject === `structs.grid.player.${this.gameState.thisPlayerId}`
    ) {
      this.gameState.setThisPlayerCapacity(messageData.value);
    }
  }
}
