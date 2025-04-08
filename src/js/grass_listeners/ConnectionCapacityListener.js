import {AbstractGrassListener} from "../framework/AbstractGrassListener";

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
      && messageData.subject === `structs.grid.substation.${this.gameState.thisPlayer.substation_id}`
    ) {
      this.gameState.setConnectionCapacity(messageData.value);
    }
  }
}
