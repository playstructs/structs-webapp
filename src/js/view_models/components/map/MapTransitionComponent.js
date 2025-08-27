import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";

/**
 * Transition space between ambits.
 */
export class MapTransitionComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {AbstractMapTransitionLayerComponent[]} layers
   */
  constructor(gameState, layers) {
    super(gameState);
    this.layers = layers;
  }

  /**
   * Renders the transition space using a composition of transition layers.
   *
   * @return {string} html
   */
  renderHTML() {
    let html = `<div class="map-terrain-transition">`;

    for(let i = 0; i < this.layers.length; i++) {
      html += this.layers[i].renderHTML(i);
    }

    html += `</div>`;
    return html;
  }
}