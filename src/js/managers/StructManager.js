import {Struct} from "../models/Struct";
import {StructType} from "../models/StructType";

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
   * @return {string} struct id
   */
  getStructTrueLocation(struct) {
    if (struct.location_type === 'planet') {
      return struct.location_id;
    }

    if (struct.location_type === 'fleet') {
      const playerType = this.gameState.getPlayerTypeById(struct.owner);
      const fleet = this.gameState.getFleetByPlayerType(playerType);
      if (struct.location_id === fleet.id) {
        return fleet.location_id;
      }
    }

    console.log(struct);
    throw new Error('Struct location unknown');
  }

  /**
   * @return {Struct[]}
   */
  getStructsOnAlphaBasePlanet() {
    return this.gameState.thisPlayerStructs.filter(struct =>
      this.getStructTrueLocation(struct) === this.gameState.planet.id
    ).concat(
      this.gameState.planetRaiderStructs.filter(struct =>
        this.getStructTrueLocation(struct) === this.gameState.planet.id
      )
    );
  }

  /**
   * @return {Struct[]}
   */
  getStructsOnRaidPlanet() {
    return this.gameState.thisPlayerStructs.filter(struct =>
      this.getStructTrueLocation(struct) === this.gameState.raidPlanet.id
    ).concat(
      this.gameState.raidEnemyStructs.filter(struct =>
        this.getStructTrueLocation(struct) === this.gameState.raidPlanet.id
      )
    );
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
   * Get a struct by its position on a planet
   * @param {boolean} isRaidPlanet - Whether to search raid planet structs
   * @param {string} locationType - "fleet" or "planet"
   * @param {string} locationId - Fleet ID or Planet ID
   * @param {string} ambit - "space", "air", "land", "water"
   * @param {number} slot - Slot number
   * @param {boolean} isCommandSlot - Whether the slot is a command slot or just a planetary or fleet slot
   * @return {Struct|null}
   */
  getStructByPosition(
    isRaidPlanet,
    locationType,
    locationId,
    ambit,
    slot,
    isCommandSlot
  ) {
    const structs = isRaidPlanet ? this.getStructsOnRaidPlanet() : this.getStructsOnAlphaBasePlanet();

    for (const struct of structs.values()) {

      /** @type {StructType} */
      if (
        struct.location_type === locationType
        && struct.location_id === locationId
        && struct.operating_ambit === ambit.toLowerCase()
        && struct.slot === slot
        && this.isCommandStruct(struct) === isCommandSlot
      ) {
        return struct;
      }
    }

    return null;
  }
}