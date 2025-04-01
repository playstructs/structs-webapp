import {AbstractGrassListener} from "../framework/AbstractGrassListener";

export class LastActionListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('LAST_ACTION');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'lastAction'
      && messageData.subject === `structs.grid.player.${this.gameState.thisPlayerId}`
    ) {
      this.gameState.setLastActionBlockHeight(messageData.height);
    }
  }
}