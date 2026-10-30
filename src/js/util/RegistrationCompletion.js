import {TxBody, TxRaw} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {MsgAddressRegister} from "../ts/structs.structs/types/structs/structs/tx";
import {CHAIN} from "../constants/ChainConstants";
import {TX_STATUS} from "../models/SigningTransaction";
import {registrationIntent} from "./RegistrationIntent";
import {registrationProofContext, registrationUint64} from "./RegistrationProof";
import {exactQueryHeight, protocolAtHeight, validateSigningSnapshot} from "./ChainProtocol";
import {submissionBytes} from "./SignedSubmission";
import {abortableDelay} from "./AbortableDelay";

export function registrationCommit(tx) {
  const intent=registrationIntent(tx.intent), {submission,response}=tx;
  if (tx.status !== TX_STATUS.SUCCEEDED || response?.stage !== 'committed' || response.code !== 0
      || response.chainId !== CHAIN.ID || response.transactionHash !== submission?.hash
      || !/^[A-F0-9]{64}$/.test(response.blockHash ?? '')) throw new Error('Registration needs matching committed evidence');
  const height=exactQueryHeight(response.height);
  if (protocolAtHeight(response.chainId,height) !== intent.proof.protocol || submission.protocol !== intent.proof.protocol
      || BigInt(height) < BigInt(intent.proof.source_height)) throw new Error('Registration inclusion changed protocol');
  const body=TxBody.decode(TxRaw.decode(submissionBytes(submission)).bodyBytes);
  if (body.messages.length !== 1 || body.messages[0].typeUrl !== '/structs.structs.MsgAddressRegister') throw new Error('Registration message changed');
  const message=MsgAddressRegister.decode(body.messages[0].value);
  if (message.creator !== tx.accountAddress || message.playerId !== intent.ownerId || message.address !== intent.address
      || message.proofPubKey !== intent.pubkey || message.proofSignature !== intent.signature || message.permissions !== intent.permissions) {
    throw new Error('Signed registration differs from its consent');
  }
  return {playerId:intent.ownerId,address:intent.address,height,proof:intent.proof};
}

/** Both the native owner and the indexed login association must agree. */
export function registrationAssociation(response, expected) {
  try {
    const proof=registrationProofContext(expected.proof);
    if (proof.player_id !== expected.playerId || proof.address !== expected.address) return false;
    const {indexed,chain}=response.data;
    validateSigningSnapshot(response.meta,{chainId:chain.chain_id,height:chain.source_height});
    const minimum=exactQueryHeight(expected.height ?? expected.proof.source_height);
    if (chain.player_id !== expected.playerId || chain.address !== expected.address
        || chain.registered_player_id !== expected.playerId || chain.protocol !== protocolAtHeight(chain.chain_id,chain.source_height)
        || BigInt(response.meta.height) < BigInt(minimum) || indexed?.address !== expected.address
        || indexed.player_id !== expected.playerId || indexed.guild_id !== expected.guildId || indexed.status !== 'approved') return false;
    if (expected.proof.protocol === CHAIN.PROTOCOL
        && registrationUint64(chain.proof_nonce) <= registrationUint64(expected.proof.proof_nonce)) return false;
    return true;
  } catch { return false; }
}

export class RegistrationConsentUnavailable extends Error {}

function consentWasConsumed(response, expected) {
  try {
    const proof=registrationProofContext(expected.proof), chain=response.data.chain;
    validateSigningSnapshot(response.meta,{chainId:chain.chain_id,height:chain.source_height});
    if (chain.address !== expected.address || chain.player_id !== expected.playerId
        || BigInt(exactQueryHeight(chain.source_height)) < BigInt(proof.source_height)
        || chain.registered_player_id === expected.playerId) return false;
    // An absent code alone cannot disprove an in-flight transaction. A consumed
    // native nonce (or an unassociated legacy proof past H) can.
    return proof.protocol === CHAIN.LEGACY_PROTOCOL
      ? chain.protocol === CHAIN.PROTOCOL
      : registrationUint64(chain.proof_nonce) > registrationUint64(proof.proof_nonce);
  } catch { return false; }
}

export async function waitForRegistration(guildAPI, expected, signal) {
  let delay=2000;
  while (!signal.aborted) {
    try {
      const response=await guildAPI.getRegistrationStatus(expected.playerId,expected.address,{signal,timeoutMs:16000});
      signal.throwIfAborted();
      if (registrationAssociation(response,expected)) return response;
      if (consentWasConsumed(response,expected)) throw new RegistrationConsentUnavailable('Device registration consent is no longer usable');
    } catch (error) {
      signal.throwIfAborted();
      if (error instanceof RegistrationConsentUnavailable) throw error;
      console.debug('[RegistrationCompletion] current association unavailable:',error);
    }
    await abortableDelay(delay,signal);
    delay=Math.min(delay*2,30000);
  }
  signal.throwIfAborted();
}
