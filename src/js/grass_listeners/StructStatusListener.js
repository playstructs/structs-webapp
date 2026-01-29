import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TaskCmdKillEvent} from "../events/TaskCmdKillEvent";
import {TaskCmdSpawnEvent} from "../events/TaskCmdSpawnEvent";
import {RenderStructEvent} from "../events/RenderStructEvent";
import {UpdateTileStructIdEvent} from "../events/UpdateTileStructIdEvent";
import {RefreshActionBarIfSelectedEvent} from "../events/RefreshActionBarIfSelectedEvent";
import {STRUCT_STATUS_FLAGS} from "../constants/StructConstants";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class StructStatusListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {StructManager} structManager
   * @param {string} targetPlayerType - The player type whose planet this listener monitors
   */
  constructor(
    gameState,
    guildAPI,
    structManager,
    targetPlayerType = PLAYER_TYPES.PLAYER
  ) {
    super('STRUCTS_STATUS_CHANGE');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.structManager = structManager;
    this.targetPlayerType = targetPlayerType;
  }

  /**
   * Get the player type for a given owner ID.
   * @param {string} ownerId
   * @returns {string|null}
   */
  getOwnerPlayerType(ownerId) {
    for (const playerType of Object.values(PLAYER_TYPES)) {
      if (this.gameState.keyPlayers[playerType].id === ownerId) {
        return playerType;
      }
    }
    return null;
  }

  /**
   * Determines if this listener should be unregistered.
   * For RAID_ENEMY listeners, unregister when the raid is no longer active.
   * @returns {boolean}
   */
  shouldUnregister() {
    if (this.gameState.keyPlayers[this.targetPlayerType].isRaidDependent()) {
      return !this.gameState.getPlanetRaidInfoForKeyPlayer(this.targetPlayerType)?.isRaidActive();
    }
    return false;
  }

  /**
   * @param {string} structId
   * @param {boolean} removePendingBuild
   * @return {Promise<Struct|null>}
   */
  async refreshStruct(structId, removePendingBuild = false) {
    const struct = await this.guildAPI.getStruct(structId);
    this.gameState.setStruct(struct);

    const tileType = this.structManager.getTileTypeFromStruct(struct);
    const ambit = struct.operating_ambit.toUpperCase();
    const mapType = this.gameState.keyPlayers[this.targetPlayerType].planetMapType;

    if (!mapType) {
      console.warn(`StructStatusListener: No map type for target player type ${this.targetPlayerType}`);
      return null;
    }

    // Remove pending build from gameState
    if (tileType && removePendingBuild) {
      this.gameState.removePendingBuild(tileType, ambit, struct.slot, struct.owner);
    }

    // Dispatch event to update the struct layer
    const renderStructEvent = new RenderStructEvent(this.gameState[mapType].mapId, struct);
    window.dispatchEvent(renderStructEvent);

    // Dispatch event to update the tile selection layer's struct ID
    if (tileType) {
      const updateTileEvent = new UpdateTileStructIdEvent(
        this.gameState[mapType].mapId,
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

    return struct;
  }

  handler(messageData) {
    const targetPlanetId = this.gameState.keyPlayers[this.targetPlayerType].getPlanetId();

    // Skip if we don't have a target planet ID yet
    if (!targetPlanetId) {
      return;
    }

    const expectedSubject = `structs.planet.${targetPlanetId}`;

    if (
      messageData.category === 'struct_block_build_start'
      && messageData.subject === expectedSubject
      && messageData.detail.block > 0
    ) {

      this.refreshStruct(messageData.detail.struct_id).then((struct) => {

        if (struct && this.getOwnerPlayerType(struct.owner) === PLAYER_TYPES.PLAYER) {
          window.dispatchEvent(new TaskCmdSpawnEvent(new TaskStateFactory().initStructTask(
            messageData.detail.struct_id,
            TASK_TYPES.BUILD,
            messageData.detail.block,
            this.gameState.structTypes.getStructTypeById(struct.type).build_difficulty
          )));
        }

      });

    } else if (
        messageData.category === 'struct_status'
        && messageData.subject === expectedSubject
    ) {

      // Check to see if the status has changed to Built (feature flag 2)
      const removePendingBuild = (
        (messageData.detail.status_old & STRUCT_STATUS_FLAGS.BUILT) === 0
        && (messageData.detail.status & STRUCT_STATUS_FLAGS.BUILT) > 0
      );

      this.refreshStruct(messageData.detail.struct_id, removePendingBuild).then((struct) => {

        // Only kill build tasks for the player's own structs
        if (
          removePendingBuild
          && struct
          && (struct.owner === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id)
        ) {
          window.dispatchEvent(new TaskCmdKillEvent(messageData.detail.struct_id));
        }
      });

    }

  }
}