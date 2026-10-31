import {TxBody, TxRaw} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {MsgPlayerSend, MsgVaultSend} from "../ts/structs.structs/types/structs/structs/tx";
import {TX_STATUS} from "../models/SigningTransaction";
import {CHAIN} from "../constants/ChainConstants";
import {exactQueryHeight, protocolAtHeight} from "./ChainProtocol";
import {submissionBytes} from "./SignedSubmission";
import {transferAddress, transferIntent} from "./TransferIntent";
import {verifyVaultFunding} from "./VaultFundingCompletion";
import {pollUntil} from "./PollUntil";

/** Bind indexed completion to the signed intent and its verified committed result. */
export function transferSourceQuery(tx) {
  const intent = transferIntent(tx.intent);
  const {submission, response} = tx;
  const transfer = submission?.transfer;
  if (tx.status !== TX_STATUS.SUCCEEDED || response?.stage !== 'committed' || response.code !== 0
      || response.chainId !== CHAIN.ID || response.transactionHash !== submission?.hash
      || !/^[A-F0-9]{64}$/.test(response.blockHash ?? '')
      || !Number.isInteger(response.txIndex) || response.txIndex < 0 || response.txIndex > 2147483647
      || typeof response.blockTime !== 'string'
      || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?Z$/.test(response.blockTime)
      || transfer?.ownerId !== intent.ownerId || transfer?.amount !== intent.amount || transfer?.denom !== 'ualpha') {
    throw new Error('Transfer completion requires a matching committed identity');
  }
  const height = exactQueryHeight(response.height);
  const protocol = protocolAtHeight(response.chainId, height);
  if (submission.protocol !== protocol || BigInt(exactQueryHeight(transfer.height)) > BigInt(height)) {
    throw new Error('Transfer inclusion does not match its preparation');
  }
  transferAddress(transfer.source);
  transferAddress(transfer.destination);
  const body = TxBody.decode(TxRaw.decode(submissionBytes(submission)).bodyBytes);
  const prefix = verifyVaultFunding(body.messages, tx, transfer.funding, transfer.source, BigInt(intent.amount));
  if (body.messages.length !== prefix + 1) throw new Error('Expected one final transfer message');
  if (prefix && protocol !== CHAIN.PROTOCOL) throw new Error('Legacy transfer cannot collect vault funds');
  const wire = body.messages[prefix];
  let message;
  if (protocol === CHAIN.PROTOCOL && intent.recipientId !== null) {
    if (wire.typeUrl !== '/structs.structs.MsgVaultSend') throw new Error('Expected a vault transfer');
    message = MsgVaultSend.decode(wire.value);
    if (message.ownerId !== intent.ownerId || message.recipientOwnerId !== intent.recipientId) {
      throw new Error('Signed transfer owners changed');
    }
  } else {
    if (wire.typeUrl !== '/structs.structs.MsgPlayerSend') throw new Error('Expected an address transfer');
    message = MsgPlayerSend.decode(wire.value);
    if (message.fromAddress !== transfer.source || message.toAddress !== transfer.destination
        || message.toAddress !== intent.recipientAddress) throw new Error('Signed transfer addresses changed');
  }
  if (message.creator !== tx.accountAddress || message.amount.length !== 1
      || message.amount[0].denom !== 'ualpha' || message.amount[0].amount !== intent.amount) {
    throw new Error('Signed transfer amount or signer changed');
  }
  return Object.freeze({chain_id: CHAIN.ID, block_height: height, tx_index: String(response.txIndex),
    block_time: response.blockTime, address: transfer.source, counterparty: transfer.destination,
    denom: transfer.denom, amount_p: transfer.amount});
}

/** Missing, ambiguous, lagging or mismatched data never becomes a success. */
export function transferSourceRow(response, source) {
  const meta = response?.meta;
  const row = response?.data;
  try {
    const height = exactQueryHeight(meta?.height);
    const protocol = protocolAtHeight(meta.chain_id, height);
    if (meta.chain_id !== source.chain_id || meta.api_contract !== CHAIN.API_CONTRACT
        || meta.activation_height !== CHAIN.UPGRADE_HEIGHT || meta.protocol !== protocol
        || meta.cache_epoch !== `${CHAIN.API_CONTRACT}:${protocol}` || meta.data_ready !== true
        || meta.indexed_height !== height || BigInt(height) < BigInt(source.block_height)
        || !Array.isArray(meta.required_models) || !meta.required_models.includes('inventory') || meta.models?.inventory?.ready !== true
        || meta.models.inventory.height !== height
        || (protocol === CHAIN.PROTOCOL && meta.inventory_authority !== 'current-claims-v1')
        || meta.transfer_source?.ready !== true || meta.transfer_source.reason !== null
        || meta.transfer_source.required_height !== source.block_height
        || typeof row?.id !== 'string' || !/^[1-9][0-9]{0,18}$/.test(row.id)
        || BigInt(row.id) > 9223372036854775807n
        || row.chain_id !== source.chain_id || row.block_height !== source.block_height
        || row.tx_index !== Number(source.tx_index) || row.address !== source.address
        || row.counterparty !== source.counterparty || row.denom !== source.denom
        || row.amount_p !== source.amount_p || row.action !== 'sent' || row.direction !== 'debit') return null;
    return row;
  } catch { return null; }
}

/** Only read retries: the queue alone reconciles signed transactions. */
export async function waitForTransferSource(guildAPI, tx, signal) {
  const source = transferSourceQuery(tx);
  return pollUntil(async () => {
    const response = await guildAPI.getTransferSource(tx.intent.ownerId, source, {signal, timeoutMs: 5000});
    return transferSourceRow(response, source) ?? undefined;
  }, signal, {label: '[TransferCompletion] indexed source unavailable:'});
}
