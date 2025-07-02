import {FEE} from "../constants/Fee";

export class AlphaManager {

  /**
   * @param gameState
   * @param {SigningClientManager} signingClientManager
   */
  constructor(gameState, signingClientManager) {
    this.gameState = gameState;
    this.signingClientManager = signingClientManager;
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

  /**
   * @param {number} alphaAmount
   * @return {Promise<void>}
   */
  async infuse(alphaAmount) {
    await this.gameState.signingClient.delegateTokens(
      gameState.signingAccount.address,
      this.gameState.thisGuild.validator,
      {
        denom: "ualpha",
        amount: this.convertAlphaToUAlpha(alphaAmount),
      },
      FEE
    );
  }

  /**
   * @param {number} alphaAmount
   * @return {Promise<void>}
   */
  async defuse(alphaAmount) {
    await this.gameState.signingClient.undelegateTokens(
      gameState.signingAccount.address,
      this.gameState.thisGuild.validator,
      {
        denom: "ualpha",
        amount: this.convertAlphaToUAlpha(alphaAmount),
      },
      FEE
    );
  }
}