import {PositionDTO} from "../../../dtos/PositionDTO";
import {
  MAP_COL_ATTACKER_COMMAND, MAP_COL_DEFENDER_COMMAND, MAP_COL_DEFENDER_PLANETARY,
  MAP_TILE_ROWS_PER_AMBIT,
  MAP_TILE_SIZE,
  MAP_TRANSITION_HEIGHT
} from "../../../constants/MapConstants";
import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";

/**
 * An overlay to show obstructions and other indicators on top of map tiles.
 */
export class MapTileMarkersComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {TileClassNameUtil} tileClassNameUtil
   * @param {string[]} mapColBreakdown
   * @param {Planet} planet
   */
  constructor(
    gameState,
    tileClassNameUtil,
    mapColBreakdown,
    planet
  ) {
    super(gameState);
    this.tileClassNameUtil = tileClassNameUtil;
    this.mapColBreakdown = mapColBreakdown;
    this.planet = planet;
  }

  /**
   * Converts a relative ambit tile position (such as Space, column 2, row 1)
   * to an x, y, z pixel coordinate with respect to the overall map.
   *
   * @param {string} ambit
   * @param {int} ambitRow
   * @param {int} col
   *
   * @return {PositionDTO} pos
   */
  convertAmbitPosToPixelPos(ambit, ambitRow, col) {

    const pos = new PositionDTO();

    // Calculate x pixel position
    pos.x = col * MAP_TILE_SIZE;

    // Calculate y pixel position
    const planetAmbits = this.planet.getAmbits();
    const ambitIndex = planetAmbits.indexOf(ambit);

    let lastAmbit = '';
    for(let i = 0; i <= ambitIndex; i++) {
      const currentAmbit = planetAmbits[i];

      // Transition height
      pos.y += MAP_TRANSITION_HEIGHT;

      // Ambit height
      if (ambit !== currentAmbit) {
        pos.y += MAP_TILE_ROWS_PER_AMBIT * MAP_TILE_SIZE;
      }

      lastAmbit = currentAmbit;
    }

    pos.y += ambitRow * MAP_TILE_SIZE;

    return pos;
  }

  /**
   * Renders the tile marker overlay
   * determining where blocked and beacon markers should go based on
   * the map column breakdown and planetary slots.
   *
   * @return {string} html
   */
  renderHTML() {
    const markers = [];
    const planetAmbits = this.planet.getAmbits();

    for (const ambit of planetAmbits) {
      const slotTracker = this.createSlotTracker(ambit);

      for (let r = 0; r < MAP_TILE_ROWS_PER_AMBIT; r++) {
        for (const c of this.getColumnIndices()) {
          const marker = this.processCell(ambit, r, c, slotTracker);
          if (marker) {
            markers.push(marker);
          }
        }
      }
    }

    return markers.join('');
  }

  /**
   * Creates a slot tracker object for an ambit with consumption logic.
   *
   * @param {string} ambit
   * @return {Object} slotTracker
   */
  createSlotTracker(ambit) {
    return {
      [MAP_COL_ATTACKER_COMMAND]: 1,
      [MAP_COL_DEFENDER_COMMAND]: 1,
      [MAP_COL_DEFENDER_PLANETARY]: this.planet.getPlanetarySlotsByAmbit(ambit, this.gameState.structTypes),
    };
  }

  /**
   * Returns column indices in the correct order based on perspective.
   * If the view is from the attacker's perspective, the blockers and beacons should be swapped.
   *
   * @return {number[]} indices
   */
  getColumnIndices() {
    const isAttackerPerspective = this.mapColBreakdown[0] === MAP_COL_ATTACKER_COMMAND;
    const indices = [...Array(this.mapColBreakdown.length).keys()];
    return isAttackerPerspective ? indices : indices.reverse();
  }

  /**
   * Processes a single cell and returns marker HTML or null.
   *
   * @param {string} ambit
   * @param {int} row
   * @param {int} col
   * @param {Object} slotTracker
   * @return {string|null} marker HTML or null
   */
  processCell(ambit, row, col, slotTracker) {
    const colType = this.mapColBreakdown[col];

    if (!(colType in slotTracker)) {
      return null;
    }

    const hasAvailableSlot = slotTracker[colType] > 0;

    if (hasAvailableSlot) {
      slotTracker[colType]--;

      // Only planetary tiles show beacons for available slots
      if (colType !== MAP_COL_DEFENDER_PLANETARY) {
        return null;
      }
    }

    return this.renderMarker(ambit, row, col, hasAvailableSlot);
  }

  /**
   * Renders a single marker div.
   *
   * @param {string} ambit
   * @param {int} row
   * @param {int} col
   * @param {boolean} isBeacon
   * @return {string} marker HTML
   */
  renderMarker(ambit, row, col, isBeacon = false) {
    const pos = this.convertAmbitPosToPixelPos(ambit, row, col);
    const className = isBeacon
      ? this.tileClassNameUtil.getTileBeaconClassName(ambit)
      : this.tileClassNameUtil.getTileBlockedClassName(ambit);

    return `<div class="map-marker ${className}" style="top: ${pos.y}px; left: ${pos.x}px"></div>`;
  }
}
