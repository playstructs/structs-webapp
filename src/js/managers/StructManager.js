import {Struct} from "../models/Struct";
import {StructType} from "../models/StructType";
import {MAP_TILE_TYPES} from "../constants/MapConstants";
import {TaskCmdKillEvent} from "../events/TaskCmdKillEvent";
import {ClearStructTileEvent} from "../events/ClearStructTileEvent";
import {UpdateTileStructIdEvent} from "../events/UpdateTileStructIdEvent";
import {HUDViewModel} from "../view_models/HUDViewModel";
import {RefreshActionBarEvent} from "../events/RefreshActionBarEvent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {STRUCT_ACTIONS} from "../constants/StructConstants";
import {RefreshActionBarIfSelectedEvent} from "../events/RefreshActionBarIfSelectedEvent";
import {RenderStructEvent} from "../events/RenderStructEvent";
import {RenderStructHUDEvent} from "../events/RenderStructHUDEvent";
import {ShowStructStillEvent} from "../events/ShowStructStillEvent";
import {Fleet} from "../models/Fleet";
import {AnimationEventFactory} from "../factories/AnimationEventFactory";

export class StructManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {SigningClientManager} signingClientManager
   */
  constructor(
    gameState,
    guildAPI,
    signingClientManager
  ) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.signingClientManager = signingClientManager;
    this.animationEventFactory = new AnimationEventFactory();
  }

  /**
   * @param {Struct} struct
   * @return {boolean}
   */
  isCommandStruct(struct) {
    const structType = this.gameState.structTypes.getStructTypeById(struct.type);
    return !!structType.is_command;
  }

  /**
   * @param {Struct} struct
   * @param {string} planetId
   * @param {Fleet} fleet
   * @return {boolean}
   */
  isStructOnPlanet(struct, planetId, fleet = null) {
    return (struct.location_type === 'planet' && struct.location_id === planetId)
      || (struct.location_type === 'fleet' && fleet?.location_id === planetId);
  }

  /**
   * Get a struct by its owner, and it's position on planet or in fleet
   * @param {string} playerId - The id of the struct owner
   * @param {string} locationType - "fleet" or "planet"
   * @param {string} locationId - Fleet ID or Planet ID
   * @param {string} mapPlanetId - the planet to look for the struct on
   * @param {string} ambit - "space", "air", "land", "water"
   * @param {number} slot - Slot number
   * @param {boolean} isCommandSlot - Whether the slot is a command slot or just a planetary or fleet slot
   * @param {Fleet} fleet - The fleet belonging to the player, required for fleet structs
   * @return {Struct|null}
   */
  getStructByPositionAndPlayerId(
    playerId,
    locationType,
    locationId,
    mapPlanetId,
    ambit,
    slot,
    isCommandSlot,
    fleet
  ) {

    /**
     * @type {Struct[]}
     */
    const allStructs = [
      ...Object.values(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].structs),
      ...Object.values(this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].structs),
      ...Object.values(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].structs),
      ...Object.values(this.gameState.previewDefenderStructs),
      ...Object.values(this.gameState.previewAttackerStructs)
    ];

    return allStructs.find(struct =>
      struct.owner === playerId
      && struct.location_type === locationType
      && struct.location_id === locationId
      && struct.operating_ambit.toLowerCase() === ambit.toLowerCase()
      && `${struct.slot}` === `${slot}`
      && this.isCommandStruct(struct) === isCommandSlot
      && this.isStructOnPlanet(struct, mapPlanetId, fleet)
    ) || null;
  }

  /**
   * Get a struct id by its owner, and it's position on planet or in fleet
   * @param {string} playerId - The id of the struct owner
   * @param {string} locationType - "fleet" or "planet"
   * @param {string} locationId - Fleet ID or Planet ID
   * @param {string} mapPlanetId - the planet to look for the struct on
   * @param {string} ambit - "space", "air", "land", "water"
   * @param {string|number} slot - Slot number
   * @param {boolean} isCommandSlot - Whether the slot is a command slot or just a planetary or fleet slot
   * @param {Fleet} fleet - The fleet belonging to the player, required for fleet structs
   * @return {string}
   */
  getStructIdByPositionAndPlayerId(
    playerId,
    locationType,
    locationId,
    mapPlanetId,
    ambit,
    slot,
    isCommandSlot,
    fleet
  ) {
    if (slot === "") {
      return "";
    }

    const struct = this.getStructByPositionAndPlayerId(playerId, locationType, locationId, mapPlanetId, ambit, parseInt(slot), isCommandSlot, fleet);
    return struct ? struct.id : '';
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  getDeploymentBlockerBuildLimitReached(structType) {
    if (structType.build_limit > 0) {
      const structTypeCount = Object.values(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].structs).filter(struct =>
        struct.type === structType.id
      ).length;

      if (structTypeCount >= structType.build_limit) {
        return 'Already deployed';
      }
    }

    return '';
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  getDeploymentBlockerInsufficientCharge(structType) {
    const playerCharge = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].getCharge(this.gameState.currentBlockHeight);
    return playerCharge < structType.build_charge
      ? 'Insufficient battery'
      : '';
  }

  /**
   * @return {number}
   */
  getEnergySupply() {
    let totalLoad = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.load + this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.structs_load;
    let totalCapacity = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.capacity + this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.connection_capacity;

    return totalCapacity - totalLoad;
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  getDeploymentBlockerInsufficientEnergySupply(structType) {
    const energySupply = this.getEnergySupply();
    return (energySupply < structType.build_draw || energySupply < structType.passive_draw)
      ? 'Insufficient energy supply'
      : '';
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  getDeploymentBlockerNoCommandShip(structType) {
    if (structType.is_command) {
      return '';
    }

    return !this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].fleet.command_struct
      ? 'Requires command ship'
      : '';
  }

  /**
   * @param {StructType} structType
   * @return {string|string}
   */
  getDeploymentBlockerCommandShipAway(structType) {
    if (structType.is_command) {
      return '';
    }

    return this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].fleet.status === 'away'
      ? 'Command ship is away'
      : '';
  }

  /**
   * Checks if the logged in player is eligible to deploy the select struct type and returns any blockers.
   *
   * @param {StructType} structType
   * @return {string}
   */
  getDeploymentBlocker(structType) {
    return this.getDeploymentBlockerNoCommandShip(structType)
      || this.getDeploymentBlockerBuildLimitReached(structType)
      || this.getDeploymentBlockerInsufficientEnergySupply(structType)
      || this.getDeploymentBlockerInsufficientCharge(structType)
      || this.getDeploymentBlockerCommandShipAway(structType);
  }

  /**
   * Gets a struct by ID from all available struct objects. O(1) lookup.
   *
   * @param {string} structId
   * @return {Struct|null}
   */
  getStructById(structId) {
    if (!structId) {
      return null;
    }

    return this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].structs[structId]
      || this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].structs[structId]
      || this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].structs[structId]
      || this.gameState.previewDefenderStructs[structId]
      || this.gameState.previewAttackerStructs[structId]
      || null;
  }

  /**
   * Determine tile type from struct location and type
   * @param {Struct} struct
   * @return {string|null}
   */
  getTileTypeFromStruct(struct) {
    if (struct.location_type === 'planet') {
      return MAP_TILE_TYPES.PLANETARY_SLOT;
    }
    if (struct.location_type === 'fleet') {
      return this.isCommandStruct(struct)
        ? MAP_TILE_TYPES.COMMAND
        : MAP_TILE_TYPES.FLEET;
    }
    return null;
  }

  /**
   * Requests cancellation of a struct build.
   *
   * @param {Struct} struct
   */
  cancelStructBuild(struct) {
    if (struct.isDestroyed()) {
      return;
    }

    this.gameState.actionBarLock.setCurrentAction(STRUCT_ACTIONS.BUILD_CANCEL);
    this.gameState.actionBarLock.lock();

    this.signingClientManager.queueMsgStructBuildCancel(
      struct.id
    ).then();
  }

  /**
   * Finalizes a build cancel once the chain confirms it.
   *
   * @param {string} structId
   * @param {string|null} mapId
   */
  finalizeBuildCancel(structId, mapId) {
    const struct = this.getStructById(structId);
    let isOwnStruct = true;

    if (struct) {
      const tileType = this.getTileTypeFromStruct(struct);
      const ambit = struct.operating_ambit.toUpperCase();
      const slot = struct.slot;
      const playerId = struct.owner;
      isOwnStruct = playerId === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;

      // Kill the build task worker
      window.dispatchEvent(new TaskCmdKillEvent(structId));

      this.gameState.removeStruct(structId);

      if (tileType) {
        this.gameState.removePendingBuild(tileType, ambit, slot, playerId);
      }

      // Clear the struct layer tile
      window.dispatchEvent(new ClearStructTileEvent(
        mapId,
        tileType,
        ambit,
        slot,
        playerId
      ));

      // Clear the tile selection's data-struct-id
      window.dispatchEvent(new UpdateTileStructIdEvent(
        mapId,
        tileType,
        ambit,
        slot,
        playerId,
        ''  // Empty string to clear the struct ID
      ));

      if (
        HUDViewModel.currentSelectedTile
        && HUDViewModel.currentSelectedTile.structId === structId
      ) {
        HUDViewModel.currentSelectedTile.structId = null;
      }
    }

    // Release the lock only for the player's own pending cancel; clearing
    // refreshes the action bar, which now resolves to the empty tile state.
    if (
      isOwnStruct
      && this.gameState.actionBarLock.getCurrentAction() === STRUCT_ACTIONS.BUILD_CANCEL
      && this.gameState.actionBarLock.isLocked()
    ) {
      this.gameState.actionBarLock.clear();
    } else {
      window.dispatchEvent(new RefreshActionBarEvent());
    }
  }

  /**
   * @param {String} playerType
   * @return {Object<string, Struct>}
   */
  getStructsByPlayerType(playerType) {
    switch (playerType) {
      case PLAYER_TYPES.PLAYER:
        return this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].structs;
      case PLAYER_TYPES.PLANET_RAIDER:
        return this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].structs;
      case PLAYER_TYPES.RAID_ENEMY:
        return this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].structs;
      default:
        throw new Error(`No such player type ${playerType}`);
    }
  }

  /**
   * @param {string} playerType
   * @return {string}
   */
  getStructCountByPlayerType(playerType) {
    const structs = this.getStructsByPlayerType(playerType);
    const isFleetAway = this.gameState.keyPlayers[playerType]?.fleet?.status === 'away';
    let planetaryStructCount = 0;
    let fleetStructCount = 0;
    for (const struct of Object.values(structs)) {
      if (struct.location_type === 'planet') {
        planetaryStructCount++;
      } else if (struct.location_type === 'fleet' && !isFleetAway) {
        fleetStructCount++;
      }
    }
    return `${fleetStructCount}+${planetaryStructCount}`;
  }

  /**
   * @param {string} structId
   * @param {string} mapType
   * @param {boolean} removePendingBuild
   * @param {boolean} renderStruct
   * @param {AnimationEvent} animationToAutoplay
   * @return {Promise<Struct|null>}
   */
  async refreshStruct(
    structId,
    mapType,
    removePendingBuild = false,
    renderStruct = true,
    animationToAutoplay = null
  ) {
    const oldStruct = this.getStructById(structId);
    const wasOnline = oldStruct ? oldStruct.isOnline() : null;

    const struct = await this.guildAPI.getStruct(structId);
    this.gameState.setStruct(struct);

    const tileType = this.getTileTypeFromStruct(struct);
    const ambit = struct.operating_ambit.toUpperCase();
    const mapId = this.gameState[mapType]?.mapId ?? null;

    // Remove pending build from gameState
    if (tileType && removePendingBuild) {
      this.gameState.removePendingBuild(tileType, ambit, struct.slot, struct.owner);

      if (!animationToAutoplay) {
        animationToAutoplay = this.animationEventFactory.makeDeploymentAnimationEvent(
          struct.id,
          ambit,
          mapId
        );
      }
    }

    // Dispatch event to update the struct layer
    if (renderStruct) {
      const renderStructEvent = new RenderStructEvent(
        this.gameState[mapType].mapId,
        struct,
        animationToAutoplay
      );
      window.dispatchEvent(renderStructEvent);
    } else if (
      tileType
      && mapId
      && wasOnline !== null
      && wasOnline !== struct.isOnline()
      && !this.gameState.animationEventQueue?.isStructAnimating(struct.id)
    ) {
      // ONLINE/OFFLINE transitions swap the struct still for an active-loop
      // animation on extractors/refineries; refresh the viewer without a full
      // re-render so in-flight animations aren't torn down. Skip while this
      // struct has a current or queued animation — showStructStill() runs again
      // when that animation completes (showStructStillAfterAnimation).
      window.dispatchEvent(new ShowStructStillEvent(mapId, struct.id));
    }

    const renderStructHUDEvent = new RenderStructHUDEvent(this.gameState[mapType].mapId, struct);
    window.dispatchEvent(renderStructHUDEvent);

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

  /**
   * @param {Struct} struct
   * @param {string} playerType
   */
  getMapIdByPlayerTypeAndStruct(struct, playerType) {

    let onPlanet = (struct.location_type === 'fleet')
      ? this.gameState.keyPlayers[playerType].fleet?.location_id
      : struct.location_id;

    if (this.gameState.alphaBaseMap.planet && onPlanet === this.gameState.alphaBaseMap.planet.id) {
      return this.gameState.alphaBaseMap.mapId;
    }

    if (this.gameState.raidMap.planet && onPlanet === this.gameState.raidMap.planet.id) {
      return this.gameState.raidMap.mapId;
    }

    return null;
  }
}