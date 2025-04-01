export class ChargeCalculator {
  constructor() {
    this.chargeLevelThresholds = [
      0,
      1,
      8,
      20,
      39,
      666
    ];
  }

  /**
   * @param {number} currentBlockHeight
   * @param {number} lastActionBlockHeight
   * @return {number}
   */
  calc(currentBlockHeight, lastActionBlockHeight) {
    const charge = currentBlockHeight - lastActionBlockHeight;

    for (let i = 0; i < this.chargeLevelThresholds.length; i++) {
      if (charge < this.chargeLevelThresholds[i]) {
        return i;
      }
    }

    return this.chargeLevelThresholds.length - 1;
  }
}