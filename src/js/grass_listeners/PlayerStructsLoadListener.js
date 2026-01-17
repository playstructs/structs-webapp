import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

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
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
    ) {
      this.gameState.setThisPlayerStructsLoad(messageData.value);
    }
  }
}
