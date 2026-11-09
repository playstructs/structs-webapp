import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {legacyToBase, toBase} from "../util/Units";

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
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
    ) {
      const precise = toBase(messageData.value_p);
      if (precise !== null) {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLoadP(precise);
      } else {
        // Legacy value is watts; scale to mW and mark approximate.
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLoad(messageData.value);
      }
    }
  }
}
