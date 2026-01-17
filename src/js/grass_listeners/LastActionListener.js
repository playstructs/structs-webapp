import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

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
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
    ) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLastActionBlockHeight(this.gameState.currentBlockHeight, messageData.value);
    }
  }
}