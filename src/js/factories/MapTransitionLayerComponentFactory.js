import {AMBIT_ORDER} from "../constants/Ambits";
import {MapTransitionLayerTileSetComponent} from "../view_models/components/map/MapTransitionLayerTileSetComponent";
import {MAP_NAMED_TRANSITIONS} from "../constants/MapConstants";
import {MapTransitionLayerComponentFactoryError} from "../errors/MapTransitionLayerComponentFactoryError";
import {MapTransitionLayerOrnamentComponent} from "../view_models/components/map/MapTransitionLayerOrnamentComponent";

/**
 * Produces different types of transition layers.
 */
export class MapTransitionLayerComponentFactory {

  /**
   * @param {TileClassNameUtil} tileClassNameUtil
   */
  constructor(tileClassNameUtil) {
    this.tileClassNameUtil = tileClassNameUtil;
  }

  /**
   * @param {string} ornamentClassName
   * @param {int} mapColCount
   * @param {string} ambitOrTransition ambit or named transition (such as Horizon)
   * @param {string} verticalPos top|middle|bottom
   *
   * @return {AbstractMapTransitionLayerComponent}
   *
   * @throws {MapTransitionLayerComponentFactoryError}
   */
  make(ornamentClassName = '', mapColCount = 0, ambitOrTransition = '', verticalPos = '') {

    if (AMBIT_ORDER.includes(ambitOrTransition)) {

      return new MapTransitionLayerTileSetComponent(
        mapColCount,
        this.tileClassNameUtil.getTileEdgeClassName(ambitOrTransition, verticalPos, 'left'),
        this.tileClassNameUtil.getTileEdgeClassName(ambitOrTransition, verticalPos, 'middle'),
        this.tileClassNameUtil.getTileEdgeClassName(ambitOrTransition, verticalPos, 'right'),
      );

    } else if (MAP_NAMED_TRANSITIONS[ambitOrTransition]) {

      return new MapTransitionLayerTileSetComponent(
        mapColCount,
        this.tileClassNameUtil.getTileNamedTransitionClassName(ambitOrTransition, 'left'),
        this.tileClassNameUtil.getTileNamedTransitionClassName(ambitOrTransition, 'middle'),
        this.tileClassNameUtil.getTileNamedTransitionClassName(ambitOrTransition, 'right')
      );

    } else if (ornamentClassName) {

      return new MapTransitionLayerOrnamentComponent(ornamentClassName);

    } else {

      throw new MapTransitionLayerComponentFactoryError(`Unknown ornament, ambit or named transition: (${ornamentClassName}${ambitOrTransition})`);

    }
  }
}
