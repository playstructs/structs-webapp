export class ShieldHealthCalculator {

  /**
   * @param {number} planetaryShield
   * @param {number} blockStartRaid
   * @param {number} currentBlock
   * @return {number}
   */
  calc(
    planetaryShield,
    blockStartRaid,
    currentBlock
  ) {
    return Math.ceil(Math.max(1 - ( ( currentBlock - blockStartRaid ) / Math.max(planetaryShield, 1) ) * 100, 0) * 100);
  }
}