import {TxBody, TxRaw} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {MsgStructGeneratorInfuse} from "../ts/structs.structs/types/structs/structs/tx";
import {TX_STATUS} from "../models/SigningTransaction";
import {CHAIN} from "../constants/ChainConstants";
import {generatorIntent} from "./GeneratorIntent";
import {exactAlphaAmount} from "./ReactorIntent";
import {transferAddress} from "./TransferIntent";
import {exactQueryHeight, maxQueryHeight, protocolAtHeight, validateSigningSnapshot} from "./ChainProtocol";
import {submissionBytes} from "./SignedSubmission";
import {playerFunds} from "./PlayerFunds";
import {abortableDelay} from "./AbortableDelay";

/** A changed fuel total or a notification never identifies a committed burn. */
export function generatorCommit(tx) {
  const intent = generatorIntent(tx.intent);
  const {submission,response} = tx;
  const prepared = submission?.generator;
  if (tx.status !== TX_STATUS.SUCCEEDED || response?.stage !== 'committed' || response.code !== 0
      || response.chainId !== CHAIN.ID || response.transactionHash !== submission?.hash
      || !/^[A-F0-9]{64}$/.test(response.blockHash ?? '') || prepared?.ownerId !== intent.ownerId
      || prepared?.structId !== intent.structId || prepared?.amount !== intent.amount) {
    throw new Error('Generator completion requires a matching committed identity');
  }
  const height = exactQueryHeight(response.height);
  if (protocolAtHeight(response.chainId,height) !== submission.protocol
      || BigInt(exactQueryHeight(prepared.height)) > BigInt(height)) throw new Error('Generator inclusion changed protocol');
  const source = transferAddress(prepared.source);
  const receipt = response.generatorReceipt;
  if (receipt?.ownerId !== intent.ownerId || receipt?.source !== source || receipt?.amount !== intent.amount) {
    throw new Error('Committed generator funding differs from the selected owner, source or amount');
  }
  transferAddress(receipt.primaryAddress);
  const body = TxBody.decode(TxRaw.decode(submissionBytes(submission)).bodyBytes);
  if (body.messages.length !== 1 || body.messages[0].typeUrl !== '/structs.structs.MsgStructGeneratorInfuse') {
    throw new Error('Generator signed message changed');
  }
  const message = MsgStructGeneratorInfuse.decode(body.messages[0].value);
  if (message.creator !== tx.accountAddress || message.structId !== intent.structId
      || message.infuseAmount !== `${intent.amount}ualpha`) throw new Error('Generator signed intent changed');
  return Object.freeze({ownerId:intent.ownerId,structId:intent.structId,source,height});
}

export function generatorRefreshReady(result, player, committed, observedHeight = null) {
  try {
    const meta = result?.meta;
    const observed = maxQueryHeight(meta?.observed_tip,observedHeight || meta?.observed_tip);
    validateSigningSnapshot(meta,{chainId:CHAIN.ID,height:observed},['inventory']);
    const funds = playerFunds(player,observed);
    if (funds.ownerId !== committed.ownerId || BigInt(meta.height) < BigInt(committed.height)
        || BigInt(funds.height) < BigInt(meta.height)) return false;
    if (result.data === null) return true; // A later ready snapshot can prove removal.
    const row = result.data;
    if (row.struct_id !== committed.structId || row.source_address !== committed.source
        || row.positions_ready !== true || row.snapshot_meta?.height !== meta.height) return false;
    exactAlphaAmount(row.fuel_p);exactAlphaAmount(row.power_p);
    return true;
  } catch { return false; }
}

/** Read retries only; the signing queue alone owns transaction reconciliation. */
export async function waitForGeneratorRefresh(guildAPI, tx, signal, observedHeight = () => null) {
  const committed = generatorCommit(tx);
  let delay = 2000;
  while (!signal.aborted) {
    try {
      const result = await guildAPI.getGeneratorSnapshotResult(committed.structId,committed.source,{signal,timeoutMs:5000});
      const player = await guildAPI.getPlayer(committed.ownerId,{signal,timeoutMs:16000});
      signal.throwIfAborted();
      if (generatorRefreshReady(result,player,committed,observedHeight())) return {result,player};
    } catch (error) {
      signal.throwIfAborted();
      console.debug('[GeneratorCompletion] indexed state unavailable:',error);
    }
    await abortableDelay(delay,signal);
    delay = Math.min(delay*2,30000);
  }
  signal.throwIfAborted();
}
