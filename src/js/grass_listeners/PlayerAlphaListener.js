import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {toBase} from "../util/Units";

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
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
    ) {
      const precise = toBase(messageData.value_p);
      if (precise !== null) {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setAlphaP(precise);
      } else {
        // Legacy absolute value is whole Alpha (grams).
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setAlpha(messageData.value);
      }
    }
  }
}
