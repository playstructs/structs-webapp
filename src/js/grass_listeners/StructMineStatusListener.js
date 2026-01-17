import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TaskCmdKillEvent} from "../events/TaskCmdKillEvent";
import {TaskCmdSpawnEvent} from "../events/TaskCmdSpawnEvent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class StructMineStatusListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('STRUCTS_MINE_STATUS_CHANGE');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'struct_block_ore_mine_start'
      && messageData.subject === `structs.planet.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.planet_id}`
    ) {
      if (messageData.detail.block === 0) {
        window.dispatchEvent(new TaskCmdKillEvent(messageData.detail.struct_id));
      } else {
        const structId = messageData.detail.struct_id;
        const structTypeId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].structs[structId].type;
        const oreMineDifficulty = this.gameState.structTypes.getStructTypeById(structTypeId).ore_mining_difficulty;

        window.dispatchEvent(new TaskCmdSpawnEvent(new TaskStateFactory().initStructTask(messageData.detail.struct_id, TASK_TYPES.MINE, messageData.detail.block, oreMineDifficulty)));
      }
    }
  }
}