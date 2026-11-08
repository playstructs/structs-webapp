import {MAP_TILE_TYPES} from "../constants/MapConstants";
import {STRUCT_CATEGORIES} from "../constants/StructConstants";
import {StructType} from "./StructType";

export class StructTypeCollection {
  constructor() {
    this.structTypes = [];
    this.snapshot_meta = null;
  }

  /**
   * @param {StructType[]} structTypes
   */
  setStructTypes(structTypes) {
    // Existing cards may retain the type object; update that object in place
    // once the whole new catalog has been validated by GameState.
    const previous=new Map(this.structTypes.map(type=>[type.id,type]));
    this.structTypes=structTypes.map(type=>previous.has(type.id) ? Object.assign(previous.get(type.id),type) : type);
    this.snapshot_meta=structTypes.snapshot_meta ?? null;
  }

  /**
   * @param {String}type
   * @return {StructType|undefined}
   */
  getStructType(type) {
    return this.structTypes.find((structType) =>
      structType.type === type
      && !this.isExcluded(structType)
    );
  }

  /**
   * @param {number} id
   * @return {StructType}
   */
  getStructTypeById(id) {
    return this.structTypes.find((structType) =>
      structType.id === id
      && !this.isExcluded(structType)
    );
  }

  /**
   * @param {StructType} structType
   * @return {boolean}
   */
  isExcluded(structType) {
    return structType.type.toLowerCase() === 'continental power plant'
      || structType.type.toLowerCase() === 'world engine';
  }

  /**
   * @param {string} tileType
   * @param {string} ambit
   * @return {StructType[]}
   */
  fetchAllByTileTypeAndAmbit(tileType, ambit) {
    return this.structTypes.filter((structType) =>
      structType.possible_ambit_array.includes(ambit.toLowerCase())
      && (
        (
          tileType === MAP_TILE_TYPES.PLANETARY_SLOT
          && structType.category === STRUCT_CATEGORIES.PLANET
          && !this.isExcluded(structType)
        ) || (
          tileType === MAP_TILE_TYPES.FLEET
          && structType.category === STRUCT_CATEGORIES.FLEET
          && !structType.is_command
        ) || (
          tileType === MAP_TILE_TYPES.COMMAND
          && structType.is_command
        )
      )
    );
  }
}
