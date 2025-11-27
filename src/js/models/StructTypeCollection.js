import {MAP_TILE_TYPES} from "../constants/MapConstants";
import {STRUCT_CATEGORIES} from "../constants/StructConstants";

export class StructTypeCollection {
  constructor() {
    this.structTypes = [];
  }

  /**
   * @param {StructType[]} structTypes
   */
  setStructTypes(structTypes) {
    this.structTypes = structTypes;
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
          && structType.class.toLowerCase() !== 'continental power plant'
          && structType.class.toLowerCase() !== 'world engine'
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