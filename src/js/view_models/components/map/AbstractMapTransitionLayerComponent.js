/**
 * Transition layer interface.
 *
 * There are different types of transition layers such a tile set layer and ornament layers.
 */
export class AbstractMapTransitionLayerComponent {

  /**
   * Renders the transition layer
   *
   * @param {int} layerOrderNumber determines the layer's z position
   *
   * @return {string} html
   */
  renderHTML(layerOrderNumber) {
    return '';
  }
}