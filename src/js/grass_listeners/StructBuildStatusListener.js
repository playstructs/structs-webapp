import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TaskCmdKillEvent} from "../events/TaskCmdKillEvent";
import {TaskCmdSpawnEvent} from "../events/TaskCmdSpawnEvent";
import {RenderStructEvent} from "../events/RenderStructEvent";
import {UpdateTileStructIdEvent} from "../events/UpdateTileStructIdEvent";
import {RefreshActionBarEvent} from "../events/RefreshActionBarEvent";
import {Struct} from "../models/Struct";

export class StructBuildStatusListener extends AbstractGrassListener {

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
    super('STRUCTS_BUILD_STATUS_CHANGE');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.structManager = structManager
  }

  /**
   * @param {string} structId
   */
  async refreshStruct(structId) {
    /** @type {Struct} */
    const struct = await this.guildAPI.getStruct(structId);
    this.gameState.setStruct(struct);

    const tileType = this.structManager.getTileTypeFromStruct(struct);
    const ambit = struct.operating_ambit.toUpperCase();

    // Remove pending build from gameState
    if (tileType) {
      this.gameState.removePendingBuild(tileType, ambit, struct.slot, struct.owner);
    }

    // Dispatch event to update the struct layer
    const renderStructEvent = new RenderStructEvent(this.gameState.alphaBaseMap.structLayerId, struct);
    window.dispatchEvent(renderStructEvent);

    // Dispatch event to update the tile selection layer's struct ID
    if (tileType) {
      const updateTileEvent = new UpdateTileStructIdEvent(
        this.gameState.alphaBaseMap.tileSelectionId,
        tileType,
        ambit,
        struct.slot,
        struct.owner,
        struct.id
      );
      window.dispatchEvent(updateTileEvent);

      // Dispatch event to refresh action bar if this struct's tile is currently selected
      const refreshActionBarEvent = new RefreshActionBarEvent(
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
      && messageData.subject === `structs.planet.${this.gameState.thisPlayer.planet_id}`
      && messageData.detail.block > 0
    ) {
      this.refreshStruct(messageData.detail.struct_id).then();

      //TODO we need difficulty target here
      // I assume it'll be in the gameState eventually.
      window.dispatchEvent(new TaskCmdSpawnEvent(new TaskStateFactory().initStructTask(messageData.detail.struct_id, TASK_TYPES.BUILD, messageData.detail.block, 5000)));
    } else if (
        messageData.category === 'struct_status'
        && messageData.subject === `structs.planet.${this.gameState.thisPlayer.planet_id}`
        // Check to see if the status has changed to Built (feature flag 2)
        && ((messageData.detail.status_old & 2) === 0
        && (messageData.detail.status & 2) > 0)
    ) {
      this.refreshStruct(messageData.detail.struct_id).then();

      //TODO this needs to be fixed. Has error:
      // Cannot read properties of null (reading 'terminate')
      window.dispatchEvent(new TaskCmdKillEvent(messageData.detail.struct_id));
    }

  }
}