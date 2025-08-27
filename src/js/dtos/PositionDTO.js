/**
 * Generic position data transfer object
 */
export class PositionDTO {

  /**
   * @param {int} x
   * @param {int} y
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
