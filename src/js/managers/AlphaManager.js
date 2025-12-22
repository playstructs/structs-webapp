
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
   */
  async transferAlpha(recipientAddress, alphaAmount) {
    await this.signingClientManager.queueMsgPlayerSend(
      gameState.signingAccount.address,
        gameState.thisPlayerId,
        gameState.thisPlayer.primary_address,
      recipientAddress,
      [{
        denom: "ualpha",
        amount: this.convertAlphaToUAlpha(alphaAmount),
      }]
    );
  }

  /**
   * @param {number} alphaAmount
   */
  async infuse(alphaAmount) {
    await this.signingClientManager.queueMsgReactorInfuse(
      gameState.signingAccount.address,
      gameState.thisPlayer.primary_address,
      this.gameState.thisGuild.validator,
      {
        denom: "ualpha",
        amount: this.convertAlphaToUAlpha(alphaAmount),
      }
    );
  }

  /**
   * @param {number} alphaAmount
   */
  async defuse(alphaAmount) {
    await this.signingClientManager.queueMsgReactorDefuse(
      gameState.signingAccount.address,
      gameState.thisPlayer.primary_address,
      this.gameState.thisGuild.validator,
      {
        denom: "ualpha",
        amount: this.convertAlphaToUAlpha(alphaAmount),
      }
    );
  }
}