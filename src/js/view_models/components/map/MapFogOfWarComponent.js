import {MAP_TILE_ROWS_PER_AMBIT, MAP_TILE_SIZE, MAP_TRANSITION_HEIGHT} from "../../../constants/MapConstants";
import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";

/**
 * An overlay to hide the enemy side of the map when there is no enemy.
 */
export class MapFogOfWarComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {string[]} mapColBreakdown
   * @param {Planet} planet
   */
  constructor(
    gameState,
    mapColBreakdown,
    planet
  ) {
    super(gameState);
    this.mapColBreakdown = mapColBreakdown;
    this.planet = planet;
  }

  /**
   * Calculate the pixel width from the start of the map dividing column
   * to the right edge of the map.
   *
   * @return {int} the map width in pixels
   */
  calcWidthFromMapDividerToRightEdge() {
    const numColsFromDivider = this.mapColBreakdown.length - this.mapColBreakdown.indexOf('DIVIDER');
    return numColsFromDivider * MAP_TILE_SIZE;
  }

  /**
   * Calculate the left position of the map dividing column.
   *
   * @return {number} the left position in pixels
   */
  calcDividerLeftPos() {
    return this.mapColBreakdown.length * MAP_TILE_SIZE - this.calcWidthFromMapDividerToRightEdge();
  }

  /**
   * Calculate the pixel height of the map.
   *
   * @return {int} the map height in pixels
   */
  calcMapHeight() {
    const numAmbits = this.planet.getAmbits().length;

    const ambitRows = numAmbits * MAP_TILE_ROWS_PER_AMBIT;
    const heightOfAmbits = ambitRows * MAP_TILE_SIZE;

    const transitionRows = numAmbits + 1;
    const heightOfTransitions = transitionRows * MAP_TRANSITION_HEIGHT;

    return heightOfAmbits + heightOfTransitions;
  }

  /**
   * Renders fog of war overlay.
   *
   * @return {string} html
   */
  renderHTML() {
    const leftPosFogOfWar = this.calcDividerLeftPos();
    const widthFromDivider = this.calcWidthFromMapDividerToRightEdge();
    const mapHeight = this.calcMapHeight();
    return `
        <div class="map-fog-of-war" style="left:${leftPosFogOfWar}px; width:${widthFromDivider}px ; height:${mapHeight}px">
          <div class="map-fog-of-war-left-edge"></div>
          <div class="map-fog-of-war-body"></div>
        </div>
      `;
  }
}
