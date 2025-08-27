import {MAP_ORNAMENTS, MAP_TILE_ROWS_PER_AMBIT, MAP_TILE_SIZE, MAP_TRANSITION_HEIGHT} from "../constants/MapConstants";
import {MapOrnamentComponent} from "../view_models/components/map/MapOrnamentComponent";
import {MapOrnamentComponentBuilderError} from "../errors/MapOrnamentComponentBuilderError";

/**
 * Builds an ornament based on its name.
 */
export class MapOrnamentComponentBuilder {

  /**
   * @param {GameState} gameState
   * @param {Planet} planet
   * @param {int} mapColCount
   */
  constructor(
    gameState,
    planet,
    mapColCount
  ) {
    this.gameState = gameState;
    this.planet = planet;
    this.mapColCount = mapColCount;
  }

  /**
   * Determines the ornament ambit overlay's height based on the target ambit and whether to include
   * the surrounding transition areas.
   *
   * @param ambit the ambit the ornament is for
   * @param includeTopTransition whether or not the ornament area uses the top transition space
   * @param includeBottomTransition whether or not the ornament area uses the bottom transition space
   *
   * @return {number} the height of the ornament area in pixels
   */
  calculateOrnamentAmbitHeight(ambit, includeTopTransition = true, includeBottomTransition = true) {

    let height = 0;

    if (includeTopTransition) {
      height += MAP_TRANSITION_HEIGHT;
    }

    // Ambit height
    height += MAP_TILE_ROWS_PER_AMBIT * MAP_TILE_SIZE;

    if (includeBottomTransition) {
      height += MAP_TRANSITION_HEIGHT;
    }

    return height;
  }

  /**
   * Determines where the top of the ornament ambit's overlay should be positioned
   * based on the target ambit and if the top transition is included.
   *
   * @param {string} ornamentAmbit the ambit the ornament is for
   * @param {boolean} ornamentIncludesTopTransition whether or not the ornament area uses the top transition space
   *
   * @return {number} top position in pixels
   */
  calculateOrnamentAmbitTop(ornamentAmbit, ornamentIncludesTopTransition = true) {
    let top = 0;

    const planetAmbits = this.planet.getAmbits();
    const ambitIndex = planetAmbits.indexOf(ornamentAmbit);

    for(let i = 0; i <= ambitIndex; i++) {

      const currentAmbit = planetAmbits[i];

      // Transition height
      if (!(ornamentAmbit === currentAmbit && ornamentIncludesTopTransition)) {
        top += MAP_TRANSITION_HEIGHT;
      }

      // Ambit height
      if (ornamentAmbit !== currentAmbit) {
        top += MAP_TILE_ROWS_PER_AMBIT * MAP_TILE_SIZE;
      }
    }

    return top;
  }

  /**
   * @param {string} ornamentName
   * @param {string} ornamentAmbit
   *
   * @return {MapOrnamentComponent}
   *
   * @throws {MapOrnamentComponentBuilderError}
   */
  make(ornamentName, ornamentAmbit) {
    let ornament = null;
    const width = this.mapColCount * MAP_TILE_SIZE;
    let height = 0;
    let top = 0;

    switch(ornamentName) {
      case MAP_ORNAMENTS.ENTERPRISE:

        height = this.calculateOrnamentAmbitHeight(ornamentAmbit);
        top = this.calculateOrnamentAmbitTop(ornamentAmbit);

        ornament = new MapOrnamentComponent(
          this.gameState,
          'map-ornament-enterprise',
          width,
          height,
          top
        );

        break;

      case MAP_ORNAMENTS.SPACE_MONSTER:

        height = this.calculateOrnamentAmbitHeight(ornamentAmbit);
        top = this.calculateOrnamentAmbitTop(ornamentAmbit);

        ornament = new MapOrnamentComponent(
          this.gameState,
          'map-ornament-space-monster',
          width,
          height,
          top
        );

        break;
      default:
        throw new MapOrnamentComponentBuilderError(`Could find ornament with ornament name: (${ornamentName})`);
    }

    return ornament;
  }

}
