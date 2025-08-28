import {
  MAP_COL_COUNT_PROPS,
  MAP_COL_ORDER,
  MAP_DEFAULT_COMMAND_COL_COUNT,
  MAP_DEFAULT_DIVIDER_COL_COUNT,
  MAP_DEFAULT_FLEET_COL_COUNT,
  MAP_DEFAULT_PLANETARY_COL_COUNT, MAP_TILE_ROWS_PER_AMBIT
} from "../../../constants/MapConstants";
import {MapTerrainAmbitComponent} from "./MapTerrainAmbitComponent";
import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";

/**
 * The terrain part of the map including ambit transitions.
 */
export class MapTerrainComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {MapTransitionComponentBuilder} transitionBuilder
   * @param {TileClassNameUtil} tileClassNameUtil
   * @param {Planet} planet
   */
  constructor(
    gameState,
    transitionBuilder,
    tileClassNameUtil,
    planet
  ) {
    super(gameState);
    this.transitionBuilder = transitionBuilder;
    this.tileClassNameUtil = tileClassNameUtil;

    this.planet = planet;

    this.defenderCommandColCount = MAP_DEFAULT_COMMAND_COL_COUNT;
    this.defenderPlanetaryColCount = MAP_DEFAULT_PLANETARY_COL_COUNT;
    this.defenderFleetColCount = MAP_DEFAULT_FLEET_COL_COUNT;
    this.dividerColCount = MAP_DEFAULT_DIVIDER_COL_COUNT;
    this.attackerFleetColCount = MAP_DEFAULT_FLEET_COL_COUNT;
    this.attackerCommandColCount = MAP_DEFAULT_COMMAND_COL_COUNT;

    this.mapColCount = 0;
  }

  /**
   * Determines how many tile columns are needed based on the number of slots.
   *
   * @param {Planet|Fleet} slotsPerAmbit Planet or Fleet
   * @param {int} maxRows
   *
   * @return {number}
   */
  calcColsNeededBySlots(slotsPerAmbit, maxRows = MAP_TILE_ROWS_PER_AMBIT) {
    return Math.ceil(
      Math.max(
        slotsPerAmbit.space_slots,
        slotsPerAmbit.air_slots,
        slotsPerAmbit.land_slots,
        slotsPerAmbit.water_slots
      ) / maxRows
    );
  }

  /**
   * Count the number of tile columns in the map.
   *
   * @return {number}
   */
  countMapCols() {
    return MAP_COL_ORDER.reduce((sum, col) =>
        sum + this[MAP_COL_COUNT_PROPS[col]]
      , 0);
  }

  /**
   * Calculate and store the number of each type of tile column.
   */
  init() {
    this.defenderPlanetaryColCount = Math.max(this.calcColsNeededBySlots(this.planet), MAP_DEFAULT_PLANETARY_COL_COUNT);
    this.mapColCount = this.countMapCols();
  }

  /**
   * Determine the type of each column.
   *
   * @param {boolean} planetOwnerView if the viewing player is not the planet owner, the column order needs to be reverse
   *
   * @return {string[]} the type of each column
   */
  getMapColBreakdown(planetOwnerView = true) {
    let breakdown = [];

    for (let i = 0; i < MAP_COL_ORDER.length; i++) {

      const columnType = MAP_COL_ORDER[i];

      for (let j = 0; j < this[MAP_COL_COUNT_PROPS[columnType]]; j++) {
        breakdown.push(columnType);
      }

    }

    if (!planetOwnerView) {
      breakdown.reverse();
    }

    return breakdown;
  }

  /**
   * Renders the full terrain layer of the map.
   *
   * @return {string} html
   */
  renderHTML() {
    let html = '';
    let lastAmbit = '';
    const ambits = this.planet.getAmbits();

    for (let i = 0; i < ambits.length; i++) {

      let transition = this.transitionBuilder.make(this.mapColCount, lastAmbit, ambits[i]);
      html += transition.renderHTML();

      html += (new MapTerrainAmbitComponent(
        gameState,
        this.tileClassNameUtil,
        ambits[i],
        this.countMapCols(),
        MAP_TILE_ROWS_PER_AMBIT
      )).renderHTML();

      if (i === ambits.length - 1) {
        transition = this.transitionBuilder.make(this.mapColCount, ambits[i]);
        html += transition.renderHTML();
      }

      lastAmbit = ambits[i];
    }

    return html;
  }
}