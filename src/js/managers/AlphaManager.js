import {PLAYER_TYPES} from "../constants/PlayerTypes";

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
   * @param {string|null} recipientId
   * @param {AbortSignal} [signal]
   */
  async transferAlpha(recipientAddress, alphaAmount, recipientId = null, signal = undefined) {
    return this.signingClientManager.queueTransfer({
      kind: 'alpha_transfer',
      version: 1,
      ownerId: this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id,
      recipientId,
      recipientAddress,
      amount: this.convertAlphaToUAlpha(alphaAmount),
    }, signal);
  }

  /**
   * @param {number} alphaAmount
   */
  async infuse(alphaAmount) {
    await this.signingClientManager.queueMsgReactorInfuse(
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.primary_address,
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
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.primary_address,
      this.gameState.thisGuild.validator,
      {
        denom: "ualpha",
        amount: this.convertAlphaToUAlpha(alphaAmount),
      }
    );
  }

  /**
   * @param {string} structId
   * @param {number} alphaAmount
   */
  async structGeneratorInfuse(structId, alphaAmount) {
    await this.signingClientManager.queueMsgStructGeneratorInfuse(
      structId,
      `${this.convertAlphaToUAlpha(alphaAmount)}ualpha`
    );
  }
}
