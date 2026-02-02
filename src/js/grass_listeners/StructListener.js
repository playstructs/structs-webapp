import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TaskCmdKillEvent} from "../events/TaskCmdKillEvent";
import {TaskCmdSpawnEvent} from "../events/TaskCmdSpawnEvent";
import {STRUCT_STATUS_FLAGS} from "../constants/StructConstants";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {ClearStructTileEvent} from "../events/ClearStructTileEvent";
import {UpdateTileStructIdEvent} from "../events/UpdateTileStructIdEvent";
import {HUDViewModel} from "../view_models/HUDViewModel";

export class StructListener extends AbstractGrassListener {

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
   * @param {string} subject
   * @param {object} messageData
   */
  handleStructBlockBuildStart(subject, messageData) {
    if (!(
      messageData.category === 'struct_block_build_start'
      && messageData.subject === subject
      && messageData.detail.block > 0
    )) {
      return;
    }

    this.structManager.refreshStruct(
      messageData.detail.struct_id,
      this.gameState.keyPlayers[this.targetPlayerType].planetMapType
    ).then((struct) => {

      if (struct && this.getOwnerPlayerType(struct.owner) === PLAYER_TYPES.PLAYER) {
        window.dispatchEvent(new TaskCmdSpawnEvent(new TaskStateFactory().initStructTask(
          messageData.detail.struct_id,
          TASK_TYPES.BUILD,
          messageData.detail.block,
          this.gameState.structTypes.getStructTypeById(struct.type).build_difficulty
        )));
      }

    });
  }

  /**
   * @param {string} subject
   * @param {object} messageData
   */
  handleStructStatus(subject, messageData) {
    if (!(
      messageData.category === 'struct_status'
      && messageData.subject === subject
    )) {
      return;
    }

    // Check to see if the status has changed to Built (feature flag 2)
    const removePendingBuild = (
      (messageData.detail.status_old & STRUCT_STATUS_FLAGS.BUILT) === 0
      && (messageData.detail.status & STRUCT_STATUS_FLAGS.BUILT) > 0
    );

    this.structManager.refreshStruct(
      messageData.detail.struct_id,
      this.gameState.keyPlayers[this.targetPlayerType].planetMapType,
      removePendingBuild
    ).then((struct) => {

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

  /**
   * @param {string} subject
   * @param {object} messageData
   */
  handleStructMove(subject, messageData) {
    if (!(
      messageData.category === 'struct_move'
      && messageData.subject === subject
    )) {
      return;
    }

    // Handle struct move - clear old position and refresh at new location
    const structId = messageData.detail.struct_id;
    const oldStruct = this.structManager.getStructById(structId);
    const mapType = this.gameState.keyPlayers[this.targetPlayerType].planetMapType;
    const mapId = this.gameState[mapType]?.mapId;

    // Clear the old tile if we have the old struct data
    if (oldStruct && mapId) {
      const oldTileType = this.structManager.getTileTypeFromStruct(oldStruct);
      const oldAmbit = oldStruct.operating_ambit.toUpperCase();

      // Clear the struct layer at old position
      window.dispatchEvent(new ClearStructTileEvent(
        mapId,
        oldTileType,
        oldAmbit,
        oldStruct.slot,
        oldStruct.owner
      ));

      // Clear the struct ID from the old tile selection layer
      window.dispatchEvent(new UpdateTileStructIdEvent(
        mapId,
        oldTileType,
        oldAmbit,
        oldStruct.slot,
        oldStruct.owner,
        ''
      ));
    }

    // Refresh the struct at its new location
    this.structManager.refreshStruct(structId, mapType).then(() => {
      HUDViewModel.refreshActionBar();
    });
  }

  handler(messageData) {
    const targetPlanetId = this.gameState.keyPlayers[this.targetPlayerType].getPlanetId();

    // Skip if we don't have a target planet ID yet
    if (!targetPlanetId) {
      return;
    }

    const subject = `structs.planet.${targetPlanetId}`;

    this.handleStructBlockBuildStart(subject, messageData);
    this.handleStructStatus(subject, messageData);
    this.handleStructMove(subject, messageData);
  }
}