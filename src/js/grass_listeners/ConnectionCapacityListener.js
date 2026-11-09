import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {toBase} from "../util/Units";

export class ConnectionCapacityListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('CONNECTION_CAPACITY');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'connectionCapacity'
        && this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player
        && messageData.subject.startsWith(`structs.grid.substation.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.substation_id}.`)
    ) {
      const precise = toBase(messageData.value_p);
      if (precise !== null) {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setConnectionCapacityP(precise);
      } else {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setConnectionCapacity(messageData.value);
      }
    }
  }
}
