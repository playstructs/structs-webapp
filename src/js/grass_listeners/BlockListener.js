import {AbstractGrassListener} from "../framework/AbstractGrassListener";

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
      && messageData.subject === 'consensus'
    ) {
      this.gameState.setCurrentBlockHeight(messageData.height);
    }
  }
}
