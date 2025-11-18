import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RaidStatusUtil} from "../util/RaidStatusUtil";
import {TaskSpawnEvent} from "../events/TaskSpawnEvent";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TaskKillEvent} from "../events/TaskKillEvent";

export class StructBuildStatusListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('STRUCTS_BUILD_STATUS_CHANGE');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'struct_block_build_start'
      && messageData.subject === `structs.planet.${this.gameState.thisPlayer.planetId}`
      && messageData.detail.block > 0
    ) {
      //TODO we need difficulty target here
      // I assume it'll be in the gameState eventually.
      dispatchEvent(new TaskSpawnEvent(new TaskStateFactory().initStructTask(messageData.detail.struct_id, TASK_TYPES.BUILD, messageData.detail.block, 5000)));

    } else if (
        messageData.category === 'struct_status'
        && messageData.subject === `structs.planet.${this.gameState.thisPlayer.planetId}`
        // Check to see if the status has changed to Built (feature flag 2)
        && ((messageData.detail.status_old & 2) === 0
        && (messageData.detail.status & 2) > 0)
    ) {
      dispatchEvent(new TaskKillEvent(messageData.detail.struct_id));
    }

  }
}