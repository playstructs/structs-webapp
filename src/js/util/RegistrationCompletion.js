import {TxBody, TxRaw} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {MsgAddressRegister} from "../ts/structs.structs/types/structs/structs/tx";
import {CHAIN} from "../constants/ChainConstants";
import {TX_STATUS} from "../models/SigningTransaction";
import {registrationIntent} from "./RegistrationIntent";
import {registrationProofContext} from "./RegistrationProof";
import {exactQueryHeight, protocolAtHeight, validateSigningSnapshot} from "./ChainProtocol";
import {submissionBytes} from "./SignedSubmission";
import {RegistrationRefreshListener} from "../grass_listeners/RegistrationRefreshListener";
import {uint64} from "./ExactInteger";
import {pollUntil} from "./PollUntil";

/**
 * Check a committed registration against the consent it was signed from.
 *
 * @param {SigningTransaction} tx
 * @return {object} the association to wait for
 */
export function registrationCommit(tx) {
  const intent = registrationIntent(tx.intent);
  const {submission, response} = tx;
  if (
    tx.status !== TX_STATUS.SUCCEEDED
    || response?.stage !== 'committed'
    || response.code !== 0
    || response.chainId !== CHAIN.ID
    || response.transactionHash !== submission?.hash
    || !/^[A-F0-9]{64}$/.test(response.blockHash ?? '')
  ) {
    throw new Error('Registration needs matching committed evidence');
  }
  const height = exactQueryHeight(response.height);
  if (
    protocolAtHeight(response.chainId, height) !== intent.proof.protocol
    || submission.protocol !== intent.proof.protocol
    || BigInt(height) < BigInt(intent.proof.source_height)
  ) {
    throw new Error('Registration inclusion changed protocol');
  }
  const body = TxBody.decode(TxRaw.decode(submissionBytes(submission)).bodyBytes);
  if (body.messages.length !== 1 || body.messages[0].typeUrl !== '/structs.structs.MsgAddressRegister') {
    throw new Error('Registration message changed');
  }
  const message = MsgAddressRegister.decode(body.messages[0].value);
  if (
    message.creator !== tx.accountAddress
    || message.playerId !== intent.ownerId
    || message.address !== intent.address
    || message.proofPubKey !== intent.pubkey
    || message.proofSignature !== intent.signature
    || message.permissions !== intent.permissions
  ) {
    throw new Error('Signed registration differs from its consent');
  }
  return {playerId: intent.ownerId, address: intent.address, height, proof: intent.proof};
}

/**
 * Both the native owner and the indexed login association must agree.
 *
 * @param {object} response
 * @param {object} expected
 * @return {boolean}
 */
export function registrationAssociation(response, expected) {
  try {
    const proof = registrationProofContext(expected.proof);
    if (proof.player_id !== expected.playerId || proof.address !== expected.address) return false;
    const {indexed, chain} = response.data;
    validateSigningSnapshot(response.meta, {chainId: chain.chain_id, height: chain.source_height});
    const minimum = exactQueryHeight(expected.height ?? expected.proof.source_height);
    if (
      chain.player_id !== expected.playerId
      || chain.address !== expected.address
      || chain.registered_player_id !== expected.playerId
      || chain.protocol !== protocolAtHeight(chain.chain_id, chain.source_height)
      || BigInt(response.meta.height) < BigInt(minimum)
      || indexed?.address !== expected.address
      || indexed.player_id !== expected.playerId
      || indexed.guild_id !== expected.guildId
      || indexed.status !== 'approved'
    ) {
      return false;
    }
    if (
      expected.proof.protocol === CHAIN.PROTOCOL
      && uint64(chain.proof_nonce) <= uint64(expected.proof.proof_nonce)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export class RegistrationConsentUnavailable extends Error {}

/**
 * @param {object} response
 * @param {object} expected
 * @return {boolean}
 */
function consentWasConsumed(response, expected) {
  try {
    const proof = registrationProofContext(expected.proof);
    const chain = response.data.chain;
    validateSigningSnapshot(response.meta, {chainId: chain.chain_id, height: chain.source_height});
    if (
      chain.address !== expected.address
      || chain.player_id !== expected.playerId
      || BigInt(exactQueryHeight(chain.source_height)) < BigInt(proof.source_height)
      || chain.registered_player_id === expected.playerId
    ) {
      return false;
    }
    // An absent code alone cannot disprove an in-flight transaction. A consumed
    // native nonce (or an unassociated legacy proof past H) can.
    return proof.protocol === CHAIN.LEGACY_PROTOCOL
      ? chain.protocol === CHAIN.PROTOCOL
      : uint64(chain.proof_nonce) > uint64(proof.proof_nonce);
  } catch {
    return false;
  }
}

/**
 * Wait until the registration's association is visible, or its consent is spent.
 *
 * @param {GuildAPI} guildAPI
 * @param {object} expected
 * @param {AbortSignal} signal
 * @param {GrassManager} grassManager
 * @return {Promise<object>}
 */
export async function waitForRegistration(guildAPI, expected, signal, grassManager) {
  const refresh = new RegistrationRefreshListener(grassManager, message =>
    message.category === 'player_address'
    && message.address === expected.address
    && message.subject === `structs.player.${expected.guildId}.${expected.playerId}`);
  try {
    return await pollUntil(async () => {
      const response = await guildAPI.getRegistrationStatus(expected.playerId, expected.address, {signal, timeoutMs: 16000});
      signal.throwIfAborted();
      if (registrationAssociation(response, expected)) return response;
      if (consentWasConsumed(response, expected)) {
        throw new RegistrationConsentUnavailable('Device registration consent is no longer usable');
      }
    }, signal, {
      label: '[RegistrationCompletion] current association unavailable:',
      wait: (delay, waitSignal) => refresh.wait(delay, waitSignal),
      isFinal: error => error instanceof RegistrationConsentUnavailable,
    });
  } finally {
    refresh.close();
  }
}
