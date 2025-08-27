/**
 * A unified class for generating css tile class names;
 */
export class TileClassNameUtil {

  /**
   * @param {string} ambit
   * @param {string} verticalPos
   * @param {string} horizontalPos
   *
   * @return {string}
   */
  getTileClassName(ambit, verticalPos, horizontalPos) {
    return `tile-${ambit.toLowerCase()}-${verticalPos}-${horizontalPos}`;
  }

  /**
   * @param {string} ambit
   * @param {string} verticalPos
   * @param {string} horizontalPos
   *
   * @return {string}
   */
  getTileEdgeClassName(ambit, verticalPos, horizontalPos) {
    return `tile-${ambit.toLowerCase()}-edge-${verticalPos}-${horizontalPos}`;
  }

  /**
   * @param {string} transitionName
   * @param {string} horizontalPos
   *
   * @return {string}
   */
  getTileNamedTransitionClassName(transitionName, horizontalPos) {
    return `tile-${transitionName.toLowerCase()}-${horizontalPos}`;
  }

  /**
   * @param {string} ambit
   *
   * @return {string}
   */
  getTileBlockedClassName(ambit) {
    return `tile-blocked-${ambit.toLowerCase()}`;
  }

  /**
   * @param {string} ambit
   *
   * @return {string}
   */
  getTileBeaconClassName(ambit) {
    return `tile-beacon-${ambit.toLowerCase()}`;
  }

}