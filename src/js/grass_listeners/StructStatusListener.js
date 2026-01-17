import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TaskCmdKillEvent} from "../events/TaskCmdKillEvent";
import {TaskCmdSpawnEvent} from "../events/TaskCmdSpawnEvent";
import {RenderStructEvent} from "../events/RenderStructEvent";
import {UpdateTileStructIdEvent} from "../events/UpdateTileStructIdEvent";
import {RefreshActionBarIfSelectedEvent} from "../events/RefreshActionBarIfSelectedEvent";
import {Struct} from "../models/Struct";
import {STRUCT_STATUS_FLAGS} from "../constants/StructConstants";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class StructStatusListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {StructManager} structManager
   */
  constructor(
    gameState,
    guildAPI,
    structManager
  ) {
    super('STRUCTS_STATUS_CHANGE');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.structManager = structManager
  }

  /**
   * @param {string} structId
   * @param {boolean} removePendingBuild
   */
  async refreshStruct(structId, removePendingBuild = false) {
    /** @type {Struct} */
    const struct = await this.guildAPI.getStruct(structId);
    this.gameState.setStruct(struct);

    const tileType = this.structManager.getTileTypeFromStruct(struct);
    const ambit = struct.operating_ambit.toUpperCase();

    // Remove pending build from gameState
    if (tileType && removePendingBuild) {
      this.gameState.removePendingBuild(tileType, ambit, struct.slot, struct.owner);
    }

    // Dispatch event to update the struct layer
    const renderStructEvent = new RenderStructEvent(this.gameState.alphaBaseMap.structLayerId, struct);
    window.dispatchEvent(renderStructEvent);

    // Dispatch event to update the tile selection layer's struct ID
    if (tileType) {
      const updateTileEvent = new UpdateTileStructIdEvent(
        this.gameState.alphaBaseMap.mapId,
        tileType,
        ambit,
        struct.slot,
        struct.owner,
        struct.id
      );
      window.dispatchEvent(updateTileEvent);

      // Dispatch event to refresh action bar if this struct's tile is currently selected
      const refreshActionBarEvent = new RefreshActionBarIfSelectedEvent(
        tileType,
        ambit,
        struct.slot,
        struct.owner,
        struct.id
      );
      window.dispatchEvent(refreshActionBarEvent);
    }
  }

  handler(messageData) {
    if (
      messageData.category === 'struct_block_build_start'
      && messageData.subject === `structs.planet.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.planet_id}`
      && messageData.detail.block > 0
    ) {
      this.refreshStruct(messageData.detail.struct_id).then(() => {
        const structId = messageData.detail.struct_id;
        const structTypeId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].structs[structId].type;
        const buildDifficulty = this.gameState.structTypes.getStructTypeById(structTypeId).build_difficulty;

        window.dispatchEvent(new TaskCmdSpawnEvent(new TaskStateFactory().initStructTask(structId, TASK_TYPES.BUILD, messageData.detail.block, buildDifficulty)));
      }
    );

    } else if (
        messageData.category === 'struct_status'
        && messageData.subject === `structs.planet.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.planet_id}`
    ) {
      // Check to see if the status has changed to Built (feature flag 2)
      const removePendingBuild = (
        (messageData.detail.status_old & STRUCT_STATUS_FLAGS.BUILT) === 0
        && (messageData.detail.status & STRUCT_STATUS_FLAGS.BUILT) > 0
      );

      this.refreshStruct(messageData.detail.struct_id, removePendingBuild).then();
      if (removePendingBuild) {
        window.dispatchEvent(new TaskCmdKillEvent(messageData.detail.struct_id));
      }
    }

  }
}