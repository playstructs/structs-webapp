import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

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
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
    ) {
      this.gameState.setThisPlayerAlpha(messageData.value);
    }
  }
}
