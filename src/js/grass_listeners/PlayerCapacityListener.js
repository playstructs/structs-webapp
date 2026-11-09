import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {toBase} from "../util/Units";

export class PlayerCapacityListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('PLAYER_CAPACITY');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'capacity'
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
    ) {
      const precise = toBase(messageData.value_p);
      if (precise !== null) {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlayerCapacityP(precise);
      } else {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlayerCapacity(messageData.value);
      }
    }
  }
}
