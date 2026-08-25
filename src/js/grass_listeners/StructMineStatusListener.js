import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TaskCmdRefreshOreEvent} from "../events/TaskCmdRefreshOreEvent";
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
      && this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player
      && messageData.subject === `structs.planet.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.planet_id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
    ) {
      // The mine clock belongs to the planet and is shared by every rig on it,
      // so the event names no struct and one write covers them all. An event
      // carrying a struct instead is a replay of the retired per-struct
      // attribute, which no longer drives any work.
      if (!messageData.detail.planet_id) {
        return;
      }

      window.dispatchEvent(new TaskCmdRefreshOreEvent(TASK_TYPES.MINE, messageData.detail.block));
    }
  }
}
