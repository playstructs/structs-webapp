import {AMBITS} from "../constants/Ambits";
import {MAP_NAMED_TRANSITIONS} from "../constants/MapConstants";
import {MapTransitionComponent} from "../view_models/components/map/MapTransitionComponent";
import {AbstractViewModelComponent} from "../framework/AbstractViewModelComponent";

/**
 * Builds a transition based on which ambit is above the transition
 * and which ambit is below the transition.
 */
export class MapTransitionComponentBuilder extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {MapTransitionLayerComponentFactory} transitionLayerFactory
   */
  constructor(gameState, transitionLayerFactory) {
    super(gameState);
    this.transitionLayerFactory = transitionLayerFactory;
  }

  /**
   * @param {int} mapColCount
   * @param {string} topAmbit
   * @param {string} bottomAmbit
   *
   * @return {MapTransitionComponent}
   */
  make(mapColCount, topAmbit = '', bottomAmbit = '') {
    let layers = [];

    if (topAmbit) {
      layers.push(this.transitionLayerFactory.make(
        '',
        mapColCount,
        topAmbit,
        'bottom'
      ));
    }

    if (bottomAmbit === AMBITS.AIR) {
      layers.push(this.transitionLayerFactory.make('map-transition-ornament-gundam'));
    }

    if (bottomAmbit === AMBITS.LAND) {
      layers.push(this.transitionLayerFactory.make(
        '',
        mapColCount,
        MAP_NAMED_TRANSITIONS.HORIZON
      ));
      layers.push(this.transitionLayerFactory.make('map-transition-ornament-bill-cipher'));
    }

    if (bottomAmbit) {
      layers.push(this.transitionLayerFactory.make(
        '',
        mapColCount,
        bottomAmbit,
        'top'
      ));
    }

    return new MapTransitionComponent(this.gameState, layers);
  }
}