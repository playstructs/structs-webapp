import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {toBase} from "../util/Units";
import {TX_STATUS} from "../models/SigningTransaction";

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
   * Validate a ualpha amount and return it as a decimal string for Coin payloads.
   * Callers must pass base units (ualpha BigInt / string), not whole Alpha.
   *
   * @param {bigint|string|number} ualphaAmount
   * @return {string}
   */
  toUAlphaString(ualphaAmount) {
    const n = toBase(ualphaAmount);
    if (n === null || n <= 0n) {
      throw new Error('AlphaManager: amount must be a positive integer ualpha value');
    }
    return n.toString();
  }

  /**
   * @deprecated Use toUAlphaString with base units. Kept for any leftover whole-Alpha callers.
   * @param {number} alphaAmount
   * @return {string}
   */
  convertAlphaToUAlpha(alphaAmount) {
    return (BigInt(alphaAmount) * BigInt(1000000)).toString();
  }

  /**
   * @param {string} recipientAddress
   * @param {bigint|string|number} ualphaAmount
   * @return {Promise<object>} settled SigningTransaction
   */
  async transferAlpha(recipientAddress, ualphaAmount) {
    return this.signingClientManager.queueMsgPlayerSend(
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.primary_address,
      recipientAddress,
      [{
        denom: "ualpha",
        amount: this.toUAlphaString(ualphaAmount),
      }]
    );
  }

  /**
   * @param {bigint|string|number} ualphaAmount
   * @return {Promise<object>}
   */
  async infuse(ualphaAmount) {
    return this.signingClientManager.queueMsgReactorInfuse(
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.primary_address,
      this.gameState.thisGuild.validator,
      {
        denom: "ualpha",
        amount: this.toUAlphaString(ualphaAmount),
      }
    );
  }

  /**
   * @param {bigint|string|number} ualphaAmount
   * @return {Promise<object>}
   */
  async defuse(ualphaAmount) {
    return this.signingClientManager.queueMsgReactorDefuse(
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.primary_address,
      this.gameState.thisGuild.validator,
      {
        denom: "ualpha",
        amount: this.toUAlphaString(ualphaAmount),
      }
    );
  }

  /**
   * @param {string} structId
   * @param {bigint|string|number} ualphaAmount
   * @return {Promise<object>}
   */
  async structGeneratorInfuse(structId, ualphaAmount) {
    return this.signingClientManager.queueMsgStructGeneratorInfuse(
      structId,
      `${this.toUAlphaString(ualphaAmount)}ualpha`
    );
  }

  /**
   * @param {object} tx
   * @return {boolean}
   */
  isSettledSuccess(tx) {
    return !!tx && tx.status === TX_STATUS.SUCCEEDED;
  }
}
