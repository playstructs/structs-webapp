import {Struct} from "../models/Struct";
import {StructType} from "../models/StructType";
import {MAP_TILE_TYPES} from "../constants/MapConstants";

export class StructManager {

  /**
   * @param {GameState} gameState
   */
  constructor(
    gameState
  ) {
    this.gameState = gameState;
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
   * Get a struct by its owner, and it's position on planet or in fleet
   * @param {string} playerId - The id of the struct owner
   * @param {string} locationType - "fleet" or "planet"
   * @param {string} locationId - Fleet ID or Planet ID
   * @param {string} ambit - "space", "air", "land", "water"
   * @param {number} slot - Slot number
   * @param {boolean} isCommandSlot - Whether the slot is a command slot or just a planetary or fleet slot
   * @return {Struct|null}
   */
  getStructByPositionAndPlayerId(
    playerId,
    locationType,
    locationId,
    ambit,
    slot,
    isCommandSlot
  ) {

    /**
     * @type {Struct[]}
     */
    const allStructs = [
      ...this.gameState.thisPlayerStructs,
      ...this.gameState.planetRaiderStructs,
      ...this.gameState.raidEnemyStructs,
      ...this.gameState.previewDefenderStructs,
      ...this.gameState.previewAttackerStructs
    ];

    return allStructs.find(struct =>
      struct.owner === playerId
      && struct.location_type === locationType
      && struct.location_id === locationId
      && struct.operating_ambit.toLowerCase() === ambit.toLowerCase()
      && `${struct.slot}` === `${slot}`
      && this.isCommandStruct(struct) === isCommandSlot
    ) || null;
  }

  /**
   * Get a struct id by its owner, and it's position on planet or in fleet
   * @param {string} playerId - The id of the struct owner
   * @param {string} locationType - "fleet" or "planet"
   * @param {string} locationId - Fleet ID or Planet ID
   * @param {string} ambit - "space", "air", "land", "water"
   * @param {string|number} slot - Slot number
   * @param {boolean} isCommandSlot - Whether the slot is a command slot or just a planetary or fleet slot
   * @return {string}
   */
  getStructIdByPositionAndPlayerId(
    playerId,
    locationType,
    locationId,
    ambit,
    slot,
    isCommandSlot
  ) {
    if (slot === "") {
      return "";
    }

    const struct = this.getStructByPositionAndPlayerId(playerId, locationType, locationId, ambit, parseInt(slot), isCommandSlot);
    return struct ? struct.id : '';
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  getDeploymentBlockerBuildLimitReached(structType) {
    if (structType.build_limit > 0) {
      const structTypeCount = this.gameState.thisPlayerStructs.filter(struct =>
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
    return this.gameState.getThisPlayerCharge() < structType.build_charge
      ? 'Insufficient battery'
      : '';
  }

  /**
   * @return {number}
   */
  getEnergySupply() {
    let totalLoad = this.gameState.thisPlayer.load + this.gameState.thisPlayer.structs_load;
    let totalCapacity = this.gameState.thisPlayer.capacity + this.gameState.thisPlayer.connection_capacity;

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

    return !this.gameState.thisPlayerFleet.command_struct
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

    return this.gameState.thisPlayerFleet.status === 'away'
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
   * Gets a struct by ID from all available struct arrays.
   *
   * @param {string} structId
   * @return {Struct|null}
   */
  getStructById(structId) {
    if (!structId) {
      return null;
    }

    const allStructs = [
      ...this.gameState.thisPlayerStructs,
      ...this.gameState.planetRaiderStructs,
      ...this.gameState.raidEnemyStructs,
      ...this.gameState.previewDefenderStructs,
      ...this.gameState.previewAttackerStructs
    ];

    return allStructs.find(struct => struct.id === structId) || null;
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
}