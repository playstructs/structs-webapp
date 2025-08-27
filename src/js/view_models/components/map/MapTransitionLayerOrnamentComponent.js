import {AbstractMapTransitionLayerComponent} from "./AbstractMapTransitionLayerComponent";

/**
 * For transition layers that use a single non-repeating image.
 */
export class MapTransitionLayerOrnamentComponent extends AbstractMapTransitionLayerComponent {

  /**
   * @param {string} ornamentClassName
   */
  constructor(ornamentClassName) {
    super();
    this.ornamentClassName = ornamentClassName;
  }

  /**
   * @param {int} layerOrderNumber
   *
   * @return {string}
   */
  renderHTML(layerOrderNumber) {
    return `
        <div class="map-terrain-transition-layer map-terrain-transition-ornament-layer ${layerOrderNumber}">
          <div class="${this.ornamentClassName}"></div>
        </div>
      `;
  }
}
