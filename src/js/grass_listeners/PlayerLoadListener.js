import {AbstractGrassListener} from "../framework/AbstractGrassListener";

export class PlayerLoadListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('PLAYER_LOAD');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'load'
      && messageData.subject === `structs.grid.player.${this.gameState.thisPlayerId}`
    ) {
      this.gameState.setThisPlayerLoad(messageData.value);
    }
  }
}
