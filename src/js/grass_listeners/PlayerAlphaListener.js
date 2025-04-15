import {AbstractGrassListener} from "../framework/AbstractGrassListener";

export class PlayerAlphaListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('PLAYER_ALPHA');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'alpha'
      && messageData.subject === `structs.grid.player.${this.gameState.thisPlayerId}`
    ) {
      this.gameState.setThisPlayerAlpha(messageData.value);
    }
  }
}
