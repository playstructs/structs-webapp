import {sha256} from "js-sha256";
import {TxBody, TxRaw} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {CHAIN} from "../constants/ChainConstants";
import {TX_STATUS} from "../models/SigningTransaction";
import {exactQueryHeight, protocolAtHeight} from "./ChainProtocol";
import {submissionBytes} from "./SignedSubmission";
import {workUint64} from "./WorkDifficulty";

const messages=Object.freeze({BUILD:'MsgStructBuildComplete',MINE:'MsgStructOreMinerComplete',
  REFINE:'MsgStructOreRefineryComplete',RAID:'MsgPlanetRaidComplete'});

/** Derive identity independently of a mutable worker's cached prefix. */
export function workMessageIdentity(state) {
  if (!Object.hasOwn(messages,state.task_type) || typeof state.object_id !== 'string' || !state.object_id
      || (state.task_type === 'RAID' && (typeof state.target_id !== 'string' || !state.target_id))) throw new Error('Invalid proof work identity');
  const anchor=String(workUint64(state.block_start));
  const object=state.task_type === 'RAID' ? `${state.object_id}@${state.target_id}` : state.object_id;
  return {typeUrl:`/structs.structs.${messages[state.task_type]}`,field:state.task_type === 'RAID' ? 'fleetId' : 'structId',
    prefix:`${object}${state.task_type}${anchor}NONCE`};
}

/** The proof itself binds object, raid target and original anchor across reload. */
export function workSubmissionMatches(tx, state, registry) {
  const expected=workMessageIdentity(state);
  let message=tx.intent?.kind === 'gameplay' ? {typeUrl:tx.intent.typeUrl,payload:tx.intent.payload} : tx.message;
  if (tx.submission) {
    const body=TxBody.decode(TxRaw.decode(submissionBytes(tx.submission)).bodyBytes);
    if (body.messages.length !== 1 || body.messages[0].typeUrl !== expected.typeUrl) return false;
    const payload=registry.decode(body.messages[0]);
    if (payload.creator !== tx.accountAddress) throw new Error('Proof submission signer changed');
    message={typeUrl:body.messages[0].typeUrl,payload};
  }
  return message?.typeUrl === expected.typeUrl && message.payload?.[expected.field] === state.object_id
    && typeof message.payload.nonce === 'string' && typeof message.payload.proof === 'string'
    && sha256(expected.prefix+message.payload.nonce) === message.payload.proof;
}

export function workSubmissionCommit(tx, state, registry) {
  if (tx.status !== TX_STATUS.SUCCEEDED || tx.response?.stage !== 'committed' || tx.response.code !== 0
      || tx.response.chainId !== CHAIN.ID || tx.response.transactionHash !== tx.submission?.hash
      || !/^[A-F0-9]{64}$/.test(tx.response.blockHash ?? '') || !workSubmissionMatches(tx,state,registry)) {
    throw new Error('Work completion needs matching committed evidence');
  }
  const height=exactQueryHeight(tx.response.height);
  if (protocolAtHeight(tx.response.chainId,height) !== tx.submission.protocol) throw new Error('Proof inclusion protocol changed');
  return height;
}

export function workAttemptHeight(tx) {
  let height=0n;
  for (const value of [tx.enqueuedAtBlock,tx.submission?.observedHeight,tx.response?.height]) {
    if (value == null || value === 0) continue;
    const candidate=BigInt(exactQueryHeight(value));
    if (candidate > height) height=candidate;
  }
  return height;
}
