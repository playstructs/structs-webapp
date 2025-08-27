import {PositionDTO} from "../../../dtos/PositionDTO";
import {
  MAP_COL_ATTACKER_COMMAND, MAP_COL_DEFENDER_PLANETARY,
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
    let html = '';

    const planetAmbits = this.planet.getAmbits();

    for (let a = 0; a < planetAmbits.length; a++) {

      const ambit = planetAmbits[a];
      let slotsPerAmbit = this.planet[`${ambit.toLowerCase()}_slots`];

      for (let r = 0; r < MAP_TILE_ROWS_PER_AMBIT; r++) {

        let colLoopInit = this.mapColBreakdown.length;
        let colLoopTest = c => c > 0;
        let colLoopAdvance = c => c - 1;

        // If it's the view is from the attacker's perspective
        // the blockers and beacons should be swapped
        if (this.mapColBreakdown[0] === MAP_COL_ATTACKER_COMMAND) {
          colLoopInit = 0;
          colLoopTest = c => c < this.mapColBreakdown.length;
          colLoopAdvance = c => c + 1;
        }

        for (let c = colLoopInit; colLoopTest(c); c = colLoopAdvance(c)) {

          const colType = this.mapColBreakdown[c];

          if (colType === MAP_COL_DEFENDER_PLANETARY) {

            // For planetary tiles need to display beacons for slots and blocked otherwise.
            let markerClassName = this.tileClassNameUtil.getTileBlockedClassName(ambit);
            if (slotsPerAmbit > 0) {
              markerClassName = this.tileClassNameUtil.getTileBeaconClassName(ambit);
              slotsPerAmbit--;
            }

            const pos = this.convertAmbitPosToPixelPos(ambit, r, c);

            html += `<div class="map-marker ${markerClassName}" style="top: ${pos.y}px; left: ${pos.x}px"></div>`;
          }

        }
      }

    }

    return html;
  }
}
