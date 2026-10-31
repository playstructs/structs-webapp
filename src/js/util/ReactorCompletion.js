import {TxBody, TxRaw} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {MsgReactorInfuse, MsgReactorDefuse} from "../ts/structs.structs/types/structs/structs/tx";
import {TX_STATUS} from "../models/SigningTransaction";
import {CHAIN} from "../constants/ChainConstants";
import {REACTOR_TRANSACTION} from "../constants/ReactorTransactions";
import {reactorIntent, exactAlphaAmount} from "./ReactorIntent";
import {transferAddress} from "./TransferIntent";
import {exactQueryHeight, protocolAtHeight, validateSigningSnapshot} from "./ChainProtocol";
import {submissionBytes} from "./SignedSubmission";
import {verifyVaultFunding} from "./VaultFundingCompletion";
import {abortableDelay} from "./AbortableDelay";

/** Bind all legs to one verified committed transaction, including after reload. */
export function reactorCommit(tx) {
  const intent = reactorIntent(tx.intent);
  const {submission, response} = tx;
  const prepared = submission?.reactor;
  if (tx.status !== TX_STATUS.SUCCEEDED || response?.stage !== 'committed' || response.code !== 0
      || response.chainId !== CHAIN.ID || response.transactionHash !== submission?.hash
      || !/^[A-F0-9]{64}$/.test(response.blockHash ?? '')
      || prepared?.ownerId !== intent.ownerId || prepared?.guildId !== intent.guildId
      || prepared?.reactorId !== intent.reactorId || prepared?.direction !== intent.direction
      || prepared?.amount !== intent.amount || !Array.isArray(prepared.legs)
      || !prepared.legs.length || prepared.legs.length > REACTOR_TRANSACTION.MAX_POSITIONS) {
    throw new Error('Reactor completion requires a matching committed identity');
  }
  const height = exactQueryHeight(response.height);
  const protocol = protocolAtHeight(response.chainId,height);
  if (protocol !== submission.protocol || BigInt(exactQueryHeight(prepared.height)) > BigInt(height)) {
    throw new Error('Reactor inclusion does not match its preparation');
  }
  const body = TxBody.decode(TxRaw.decode(submissionBytes(submission)).bodyBytes);
  const prefix = verifyVaultFunding(body.messages, tx, prepared.funding, prepared.legs[0].address, BigInt(intent.amount));
  if (prefix && (intent.direction !== 'infuse' || protocol !== CHAIN.PROTOCOL)) throw new Error('Only vault infusion may collect funds');
  if (body.messages.length !== prefix + prepared.legs.length || (intent.direction === 'infuse' && prepared.legs.length !== 1)) {
    throw new Error('Reactor message group changed');
  }
  const type = intent.direction === 'infuse' ? MsgReactorInfuse : MsgReactorDefuse;
  const typeUrl = intent.direction === 'infuse' ? '/structs.structs.MsgReactorInfuse' : '/structs.structs.MsgReactorDefuse';
  const seen = new Set();
  let amount = 0n;
  for (let i=0;i<prepared.legs.length;i++) {
    const leg = prepared.legs[i];
    transferAddress(leg.address);
    const value = exactAlphaAmount(leg.amount);
    if (!value || typeof leg.isVault !== 'boolean' || seen.has(leg.address)
        || (leg.isVault && (i !== 0 || protocol !== CHAIN.PROTOCOL)) || body.messages[prefix + i].typeUrl !== typeUrl) {
      throw new Error('Invalid reactor completion leg');
    }
    seen.add(leg.address);amount += value;
    const message = type.decode(body.messages[prefix + i].value);
    if (message.creator !== tx.accountAddress || message.validatorAddress !== prepared.validator
        || message.ownerId !== (leg.isVault ? intent.ownerId : '') || message.delegatorAddress !== (leg.isVault ? '' : leg.address)
        || message.amount?.denom !== 'ualpha' || message.amount.amount !== leg.amount) throw new Error('Signed reactor leg changed');
  }
  if (amount !== BigInt(intent.amount)) throw new Error('Signed reactor amount changed');
  return Object.freeze({ownerId:intent.ownerId,height});
}

export function reactorRefreshReady(infusion, player, committed, observedHeight) {
  try {
    for (const data of [infusion,player]) {
      const meta = data?.snapshot_meta;
      const tip = exactQueryHeight(meta?.observed_tip);
      const observed = observedHeight ? exactQueryHeight(observedHeight) : tip;
      validateSigningSnapshot(meta,{chainId:CHAIN.ID,height:BigInt(observed)>BigInt(tip)?observed:tip},['inventory']);
      if (BigInt(meta.height) < BigInt(committed.height)) return false;
    }
    if (player.id !== committed.ownerId || infusion.player_id !== committed.ownerId
        || BigInt(player.snapshot_meta.height) < BigInt(infusion.snapshot_meta.height)) return false;
    for (const field of ['fuel_p','defusing_p','power_p']) exactAlphaAmount(infusion[field]);
    if (infusion.snapshot_meta.protocol === CHAIN.PROTOCOL
        && (infusion.owner_id !== committed.ownerId || infusion.positions_meta?.complete !== true
          || infusion.positions_meta.power_ready !== true || infusion.positions_meta.height !== infusion.snapshot_meta.height)) return false;
    if (infusion.snapshot_meta.protocol === CHAIN.PROTOCOL) exactAlphaAmount(infusion.owner_power_p);
    if (player.snapshot_meta.protocol === CHAIN.PROTOCOL) {
      if (player.funds_meta?.ready !== true || player.funds_meta.height !== player.snapshot_meta.height) return false;
      exactAlphaAmount(player.spendable_alpha_p);
    }
    return true;
  } catch { return false; }
}

/** Read retries only. No amount delta or notification category proves completion. */
export async function waitForReactorRefresh(guildAPI, tx, signal, observedHeight = () => null) {
  const committed = reactorCommit(tx);
  let delay = 2000;
  while (!signal.aborted) {
    try {
      const infusion = await guildAPI.getInfusionByPlayerId(committed.ownerId,{signal,timeoutMs:5000});
      const player = await guildAPI.getPlayer(committed.ownerId,{signal,timeoutMs:16000});
      signal.throwIfAborted();
      if (reactorRefreshReady(infusion,player,committed,observedHeight())) return {infusion,player};
    } catch (error) {
      signal.throwIfAborted();
      console.debug('[ReactorCompletion] indexed state unavailable:',error);
    }
    await abortableDelay(delay,signal);
    delay = Math.min(delay*2,30000);
  }
  signal.throwIfAborted();
}
