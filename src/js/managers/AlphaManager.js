import {FEE} from "../constants/Fee";

export class AlphaManager {

  /**
   * @param gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
  }

  /**
   * @param {number} alphaAmount
   * @return {string}
   */
  convertAlphaToUAlpha(alphaAmount) {
    return (BigInt(alphaAmount) * BigInt(1000000)).toString();
  }

  /**
   * @param {string} recipientAddress
   * @param {number} alphaAmount
   * @return {Promise<void>}
   */
  async transferAlpha(recipientAddress, alphaAmount) {
    await this.gameState.signingClient.sendTokens(
      gameState.signingAccount.address,
      recipientAddress,
      [{
        denom: "ualpha",
        amount: this.convertAlphaToUAlpha(alphaAmount),
      }],
      FEE
    );
  }
}