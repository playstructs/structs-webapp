import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RaidStatusUtil} from "../util/RaidStatusUtil";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TaskCmdKillEvent} from "../events/TaskCmdKillEvent";
import {TaskCmdSpawnEvent} from "../events/TaskCmdSpawnEvent";


export class StructRefineStatusListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('STRUCTS_REFINE_STATUS_CHANGE');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'struct_block_refine_start'
      && messageData.subject === `structs.planet.${this.gameState.thisPlayer.planetId}`
    ) {
      if (messageData.detail.block === 0) {
        dispatchEvent(new TaskCmdKillEvent(messageData.detail.struct_id));
      } else {
        //TODO we need difficulty target here
        // I assume it'll be in the gameState eventually.
        dispatchEvent(new TaskCmdSpawnEvent(new TaskStateFactory().initStructTask(messageData.detail.struct_id, TASK_TYPES.REFINE, messageData.detail.block, 28000)));
      }
    }
  }
}