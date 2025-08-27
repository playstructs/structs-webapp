import {AbstractMapTransitionLayerComponent} from "./AbstractMapTransitionLayerComponent";

/**
 * For transition layers that use a 3 image tile set with a horizontally repeating middle.
 */
export class MapTransitionLayerTileSetComponent extends AbstractMapTransitionLayerComponent {

  /**
   * @param {int} mapColCount
   * @param {string} leftTileClassName
   * @param {string} middleTileClassName
   * @param {string} rightTileClassName
   */
  constructor(
    mapColCount,
    leftTileClassName,
    middleTileClassName,
    rightTileClassName
  ) {
    super();
    this.mapColCount = mapColCount;
    this.leftTileClassName = leftTileClassName;
    this.middleTileClassName = middleTileClassName;
    this.rightTileClassName = rightTileClassName;
  }

  /**
   * @param {int} layerOrderNumber
   *
   * @return {string}
   */
  renderHTML(layerOrderNumber) {
    let html = `<div class="map-terrain-transition-layer map-terrain-transition-tile-set-layer ${layerOrderNumber}">`;

    for(let i = 0; i < this.mapColCount; i++) {
      if (i === 0) {
        html += `<div class="map-terrain-transition-tile ${this.leftTileClassName}"></div>`;
      } else if (0 < i && i < this.mapColCount - 1) {
        html += `<div class="map-terrain-transition-tile ${this.middleTileClassName}"></div>`;
      } else {
        html += `<div class="map-terrain-transition-tile ${this.rightTileClassName}"></div>`;
      }
    }

    html += `</div>`;

    return html;
  }
}
