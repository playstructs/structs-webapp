import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {STRUCT_ACTIONS} from "../constants/StructConstants";

export class GridStructListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {string} structId
   */
  constructor(gameState, structId) {
    super(`GRID_STRUCT_${structId}`);
    this.gameState = gameState;
    this.structId = structId;
  }

  handleFuel(messageData) {
    if (messageData.category === 'fuel') {
      this.shouldUnregister = () => true;

      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].structs[this.structId].fuel = parseInt(messageData.value);

      if (
        this.gameState.actionBarLock.getCurrentAction() === STRUCT_ACTIONS.CONSUME_ALPHA
        && this.gameState.actionBarLock.isLocked()
      ) {
        this.gameState.actionBarLock.clear();
      }
    }
  }

  handler(messageData) {
    if (messageData.subject === `structs.grid.struct.${this.structId}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`) {
      this.handleFuel(messageData);
    }
  }
}