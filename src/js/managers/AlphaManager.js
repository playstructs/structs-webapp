import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {readReactorSnapshot} from "./ReactorSnapshot";
import {validateSigningSnapshot} from "../util/ChainProtocol";

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
    if (typeof alphaAmount === 'number' && !Number.isSafeInteger(alphaAmount)) throw new Error('Alpha amount is not exact');
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
  async infuse(alphaAmount, context, signal = undefined) {
    return this.queueReactorChange('infuse', alphaAmount, context, signal);
  }

  /**
   * @param {number} alphaAmount
   */
  async defuse(alphaAmount, context, signal = undefined) {
    return this.queueReactorChange('defuse', alphaAmount, context, signal);
  }

  async queueReactorChange(direction, alphaAmount, context, signal) {
    const ownerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    if (context?.ownerId !== ownerId) throw new Error('Reactor owner changed');
    return this.signingClientManager.queueReactor({kind:'reactor_change',version:1,ownerId,
      guildId:context.guildId,reactorId:context.reactorId,direction,amount:this.convertAlphaToUAlpha(alphaAmount)}, signal);
  }

  async getReactorState(indexed, signal) {
    signal.throwIfAborted();
    const manager = this.signingClientManager;
    const query = manager.chainQuery;
    const account = this.gameState.signingAccount?.address;
    const ownerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    const guildId = this.gameState.thisGuild.id;
    if (!query || query.closed) throw new Error('Reactor query connection unavailable');
    const snapshot = await query.readSnapshot(rpc=>readReactorSnapshot(rpc,indexed,ownerId,guildId,
      this.gameState.thisGuild.reactor_ratio), {height:indexed.snapshot_meta?.height});
    signal.throwIfAborted();
    if (query !== manager.chainQuery || account !== this.gameState.signingAccount?.address
        || ownerId !== this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id || guildId !== this.gameState.thisGuild.id) {
      throw new Error('Reactor view context changed');
    }
    validateSigningSnapshot(indexed.snapshot_meta,{chainId:snapshot.chainId,height:snapshot.observedHeight},['inventory']);
    return snapshot.data;
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
