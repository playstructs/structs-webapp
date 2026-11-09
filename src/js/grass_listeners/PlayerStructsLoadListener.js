import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {toBase} from "../util/Units";

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
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
    ) {
      const precise = toBase(messageData.value_p);
      if (precise !== null) {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setStructsLoadP(precise);
      } else {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setStructsLoad(messageData.value);
      }
    }
  }
}
