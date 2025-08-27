import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";

/**
 * Component for rendering the terrain tiles that make up an ambit, excluding transitions.
 */
export class MapTerrainAmbitComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {TileClassNameUtil} tileClassNameUtil
   * @param {string} ambit
   * @param {int} mapColCount
   * @param {int} rowsPerAmbit
   */
  constructor(
    gameState,
    tileClassNameUtil,
    ambit,
    mapColCount,
    rowsPerAmbit
  ) {
    super(gameState);
    this.tileClassNameUtil = tileClassNameUtil;
    this.ambit = ambit;
    this.mapColCount = mapColCount;
    this.rowsPerAmbit = rowsPerAmbit;
  }

  /**
   * Converts a tile row index to a vertical position.
   *
   * @param {int} rowIndex
   *
   * @return {string} top|middle|bottom
   */
  rowIndexToVerticalPos(rowIndex) {
    let verticalPos = 'bottom';
    if (rowIndex === 0) {
      verticalPos = 'top';
    } else if (rowIndex > 0 && rowIndex < this.rowsPerAmbit - 1) {
      verticalPos = 'middle';
    }
    return verticalPos;
  }

  /**
   * Converts a tile column index to a horizontal position.
   *
   * @param {int} colIndex
   *
   * @return {string} left|middle|right
   */
  colIndexToHorizontalPos(colIndex) {
    let horizontalPos = 'right';
    if (colIndex === 0) {
      horizontalPos = 'left';
    } else if (colIndex > 0 && colIndex < this.mapColCount - 1) {
      horizontalPos = 'middle';
    }
    return horizontalPos;
  }

  /**
   * Renders an individual terrain tile.
   *
   * @param {string} ambit
   * @param {string} verticalPos
   * @param {string} horizontalPos
   *
   * @return {string} html
   */
  renderTile(ambit, verticalPos, horizontalPos) {
    const tileClassName = this.tileClassNameUtil.getTileClassName(ambit, verticalPos, horizontalPos);
    return `<div class="map-terrain-tile ${tileClassName}"></div>`;
  }

  /**
   * Render the terrain tiles that make up the ambit.
   *
   * @return {string} html
   */
  renderHTML() {
    let html = `<div class="map-terrain-ambit">`;

    for (let rowIndex = 0; rowIndex < this.rowsPerAmbit; rowIndex++) {

      const verticalPos = this.rowIndexToVerticalPos(rowIndex);
      html += `<div class="map-terrain-row">`;

      for (let colIndex = 0; colIndex < this.mapColCount; colIndex++) {

        const horizontalPos = this.colIndexToHorizontalPos(colIndex);
        html += this.renderTile(this.ambit, verticalPos, horizontalPos);

      }

      html += `</div>`;
    }

    html += `</div>`;

    return html;
  }
}