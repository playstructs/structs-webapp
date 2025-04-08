import {AbstractGrassListener} from "../framework/AbstractGrassListener";

export class PlayerStructsLoadListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('PLAYER_STRUCTS_LOAD');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'structsLoad'
      && messageData.subject === `structs.grid.player.${this.gameState.thisPlayerId}`
    ) {
      this.gameState.setThisPlayerStructsLoad(messageData.value);
    }
  }
}
