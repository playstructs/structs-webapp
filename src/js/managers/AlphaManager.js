import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {readReactorSnapshot} from "./ReactorSnapshot";
import {maxQueryHeight, validateSigningSnapshot} from "../util/ChainProtocol";
import {readGeneratorSnapshot} from "./GeneratorSnapshot";
import {playerFunds} from "../util/PlayerFunds";
import {CHAIN} from "../constants/ChainConstants";

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
    const funding = indexed.snapshot_meta?.protocol === CHAIN.PROTOCOL
      ? await this.gameState.guildAPI.getPlayer(ownerId, {signal,timeoutMs:16000}) : null;
    signal.throwIfAborted();
    const snapshot = await query.readSnapshot(rpc=>readReactorSnapshot(rpc,indexed,ownerId,guildId,
      this.gameState.thisGuild.reactor_ratio,funding,account), {height:indexed.snapshot_meta?.height});
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
  async structGeneratorInfuse(structId, alphaAmount, context, signal = undefined) {
    const ownerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    if (context?.ownerId !== ownerId || context.structId !== structId) throw new Error('Generator funding context changed');
    return this.signingClientManager.queueGenerator({kind:'generator_fund',version:1,ownerId,structId,
      amount:this.convertAlphaToUAlpha(alphaAmount)}, signal);
  }

  async getGeneratorState(structId, signal) {
    signal.throwIfAborted();
    const manager = this.signingClientManager;
    const query = manager.chainQuery;
    const keyPlayer = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER];
    const ownerId = keyPlayer.id;
    const account = this.gameState.signingAccount?.address;
    if (!query || query.closed) throw new Error('Generator query connection unavailable');
    const options = {signal,timeoutMs:5000};
    const player = await this.gameState.guildAPI.getPlayer(ownerId,{signal});
    const funds = playerFunds(player,this.gameState.currentBlockHeight);
    if (funds.ownerId !== ownerId) throw new Error('Generator funds owner changed');
    const source = funds.protocol === CHAIN.PROTOCOL ? player.vault_address : player.primary_address;
    const indexed = await this.gameState.guildAPI.getGeneratorSnapshot(structId,source,options);
    signal.throwIfAborted();
    if (!indexed) throw new Error('Generator snapshot unavailable');
    const snapshot = await query.readSnapshot(rpc=>readGeneratorSnapshot(rpc,indexed,ownerId,structId,account,player),
      {height:indexed.snapshot_meta?.height});
    signal.throwIfAborted();
    if (query !== manager.chainQuery || account !== this.gameState.signingAccount?.address
        || keyPlayer !== this.gameState.keyPlayers[PLAYER_TYPES.PLAYER] || ownerId !== keyPlayer.id) {
      throw new Error('Generator view context changed');
    }
    validateSigningSnapshot(indexed.snapshot_meta,{chainId:snapshot.chainId,
      height:maxQueryHeight(snapshot.observedHeight,this.gameState.currentBlockHeight || snapshot.observedHeight)},['inventory']);
    return snapshot.data;
  }
}
