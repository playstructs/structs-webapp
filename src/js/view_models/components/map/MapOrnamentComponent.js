import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";

/**
 * A decorative layer that overlays an ambit between the terrain and map marker layers.
 */
export class MapOrnamentComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {string} ornamentClassName
   * @param {int} width in pixels
   * @param {int} height in pixels
   * @param {int} top in pixels
   */
  constructor(
    gameState,
    ornamentClassName,
    width,
    height,
    top
  ) {
    super(gameState);
    this.ornamentClassName = ornamentClassName;
    this.width = width;
    this.height = height;
    this.top = top;
  }

  /**
   * Renders an ornament.
   *
   * @return {string} html
   */
  renderHTML() {
    return `
        <div class="map-ornament-ambit" style="height: ${this.height}px; width: ${this.width}px; top: ${this.top}">
          <div class="map-ornament ${this.ornamentClassName}"></div>
        </div>
      `;
  }
}
