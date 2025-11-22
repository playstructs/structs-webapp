import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {EVENTS} from "../constants/Events";

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
      window.dispatchEvent(new CustomEvent(EVENTS.BLOCK_HEIGHT_CHANGED));
    }
  }
}
