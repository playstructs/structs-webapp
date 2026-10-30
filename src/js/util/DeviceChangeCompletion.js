import {TxBody, TxRaw} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {MsgAddressRevoke, MsgPermissionSetOnAddress} from "../ts/structs.structs/types/structs/structs/tx";
import {CHAIN} from "../constants/ChainConstants";
import {TX_STATUS} from "../models/SigningTransaction";
import {deviceChangeIntent} from "./DeviceChangeIntent";
import {registrationUint64} from "./RegistrationProof";
import {exactQueryHeight, protocolAtHeight, validateSigningSnapshot} from "./ChainProtocol";
import {submissionBytes} from "./SignedSubmission";
import {abortableDelay} from "./AbortableDelay";

export function deviceChangeCommit(tx) {
  const intent=deviceChangeIntent(tx.intent), {submission,response}=tx;
  if (tx.status !== TX_STATUS.SUCCEEDED || response?.stage !== 'committed' || response.code !== 0
      || response.chainId !== CHAIN.ID || response.transactionHash !== submission?.hash
      || !/^[A-F0-9]{64}$/.test(response.blockHash ?? '')) throw new Error('Device change needs matching committed evidence');
  const height=exactQueryHeight(response.height);
  if (protocolAtHeight(response.chainId,height) !== intent.context.protocol || submission.protocol !== intent.context.protocol
      || BigInt(height) < BigInt(intent.context.source_height)) throw new Error('Device inclusion changed protocol');
  const body=TxBody.decode(TxRaw.decode(submissionBytes(submission)).bodyBytes);
  const type=intent.operation === 'revoke' ? 'MsgAddressRevoke' : 'MsgPermissionSetOnAddress';
  if (body.messages.length !== 1 || body.messages[0].typeUrl !== `/structs.structs.${type}`) throw new Error('Device message changed');
  const message=(intent.operation === 'revoke' ? MsgAddressRevoke : MsgPermissionSetOnAddress).decode(body.messages[0].value);
  if (message.creator !== tx.accountAddress || message.address !== intent.address
      || (intent.operation === 'permissions' && message.permissions !== intent.permissions)) throw new Error('Signed device change differs from its intent');
  return {intent,height};
}

/** A later valid change may supersede ours; display current state after verified inclusion. */
export function deviceChangeRefreshReady(response, expected) {
  try {
    const {chain,indexed}=response.data, {intent,height}=expected;
    validateSigningSnapshot(response.meta,{chainId:chain.chain_id,height:chain.source_height});
    if (chain.address !== intent.address || chain.player_id !== intent.ownerId || BigInt(response.meta.height) < BigInt(height)
        || chain.protocol !== protocolAtHeight(chain.chain_id,chain.source_height)) return false;
    const indexedOwner=indexed?.status === 'approved' ? indexed.player_id : '';
    if (indexed && indexed.address !== intent.address) return false;
    if (chain.registered_player_id !== indexedOwner) return false;
    if (indexedOwner && registrationUint64(chain.permissions) !== registrationUint64(indexed.permissions)) return false;
    if (intent.context.protocol === CHAIN.PROTOCOL) {
      const nonce=registrationUint64(chain.proof_nonce), before=registrationUint64(intent.context.proof_nonce);
      if (nonce < before || (intent.operation === 'revoke' && chain.registered_player_id !== '' && nonce === before)) return false;
    }
    return true;
  } catch { return false; }
}

export async function waitForDeviceChange(guildAPI, expected, signal) {
  let delay=2000;
  while (!signal.aborted) {
    try {
      const response=await guildAPI.getDeviceState(expected.intent.address,{signal,timeoutMs:16000});
      signal.throwIfAborted();
      if (deviceChangeRefreshReady(response,expected)) return response;
    } catch (error) {
      signal.throwIfAborted();
      console.debug('[DeviceChange] current state unavailable:',error);
    }
    await abortableDelay(delay,signal);delay=Math.min(delay*2,30000);
  }
  signal.throwIfAborted();
}
