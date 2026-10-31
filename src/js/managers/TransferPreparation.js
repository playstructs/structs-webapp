import {QueryClientImpl as StructsQuery} from "../ts/structs.structs/types/structs/structs/query";
import {QueryClientImpl as BankQuery} from "cosmjs-types/cosmos/bank/v1beta1/query";
import {CHAIN} from "../constants/ChainConstants";
import {PERMISSIONS} from "../constants/Permissions";
import {transferAddress, transferIntent} from "../util/TransferIntent";
import {readVaultFunding, collectVaultFunding} from "./VaultFunding";
import {FEE, STRUCTS_FREE_GAS} from "../constants/Fee";
import {protocolAtHeight} from "../util/ChainProtocol";

/** Reads only within the caller's pinned snapshot; never provisions a vault. */
export async function prepareTransfer(rpc, tx, indexedPlayer) {
  const intent = transferIntent(tx.intent);
  const query = new StructsQuery(rpc);
  const actor = await query.Address({address:tx.accountAddress});
  if (actor.address!==tx.accountAddress || actor.playerId!==intent.ownerId
      || !/^(0|[1-9][0-9]{0,19})$/.test(actor.permissions) || BigInt(actor.permissions)>18446744073709551615n
      || (BigInt(actor.permissions)&BigInt(PERMISSIONS.TOKEN_TRANSFER))===0n) {
    throw new Error('Signing address cannot transfer these player funds');
  }
  const player = (await query.Player({id:intent.ownerId})).Player;
  if (player?.id!==intent.ownerId || indexedPlayer?.id!==intent.ownerId) throw new Error('Transfer owner changed');
  const protocol = protocolAtHeight(rpc.chainId,rpc.height);
  let source, destination, message;
  if (protocol===CHAIN.PROTOCOL) {
    const vault = await query.Vault({ownerId:intent.ownerId});
    if (vault.ownerId!==intent.ownerId || typeof vault.provisioned!=='boolean') throw new Error('Invalid source vault');
    source = transferAddress(vault.address);
    if (indexedPlayer.vault_address!==source || indexedPlayer.funds_meta?.ready!==true
        || indexedPlayer.funds_meta.height!==indexedPlayer.snapshot_meta?.height) throw new Error('Indexed vault funds are unavailable');
    if (intent.recipientId!==null) {
      const recipient = intent.recipientId===intent.ownerId ? vault : await query.Vault({ownerId:intent.recipientId});
      if (recipient.ownerId!==intent.recipientId || typeof recipient.provisioned!=='boolean') throw new Error('Invalid recipient vault');
      destination = transferAddress(recipient.address);
      message = {typeUrl:'/structs.structs.MsgVaultSend',payload:{ownerId:intent.ownerId,recipientOwnerId:intent.recipientId,
        amount:[{denom:'ualpha',amount:intent.amount}]}};
    } else {
      if (!vault.provisioned) throw new Error('An address transfer requires a provisioned source vault');
      destination = intent.recipientAddress;
    }
  } else {
    source = transferAddress(player.primaryAddress);
    destination = intent.recipientAddress;
    if (intent.recipientId!==null) {
      const recipient = await query.Address({address:destination});
      if (recipient.address!==destination || recipient.playerId!==intent.recipientId) throw new Error('Selected recipient address changed owner');
    }
  }
  let collection = null;
  if (protocol === CHAIN.PROTOCOL) {
    const funds = await readVaultFunding(rpc, intent.ownerId, source, actor, indexedPlayer, BigInt(intent.amount));
    collection = collectVaultFunding(funds, source, BigInt(intent.amount));
  } else {
    const coin = (await new BankQuery(rpc).SpendableBalanceByDenom({address:source,denom:'ualpha'})).balance;
    if (coin?.denom !== 'ualpha' || typeof coin.amount !== 'string' || !/^(0|[1-9][0-9]{0,77})$/.test(coin.amount)
        || BigInt(coin.amount) >= (1n << 256n) || BigInt(coin.amount) < BigInt(intent.amount)) {
      throw new Error('Insufficient spendable Alpha for the requested transfer');
    }
  }
  const spend = message ?? {typeUrl:'/structs.structs.MsgPlayerSend',payload:{fromAddress:source,toAddress:destination,
    amount:[{denom:'ualpha',amount:intent.amount}]}};
  const collects = collection?.messages.length > 0;
  return {
    protocol,
    ...(collects ? {messages:[...collection.messages, spend], fee:{...FEE,gas:STRUCTS_FREE_GAS}} : {message:spend}),
    transfer:{ownerId:intent.ownerId,source,destination,denom:'ualpha',amount:intent.amount,height:rpc.height,
      ...(collection ? {funding:collection.funding} : {})},
  };
}
