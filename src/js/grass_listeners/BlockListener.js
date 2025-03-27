import {AbstractGrassListener} from "./AbstractGrassListener";

export class BlockListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('BLOCK');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'block'
      && messageData.subject === 'structs.consensus'
    ) {
      this.gameState.currentBlockHeight = messageData.height;
    }
  }
}
