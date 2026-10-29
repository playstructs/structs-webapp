import {accountFromAny} from "@cosmjs/stargate";
import {fromHex, toBase64, toHex} from "@cosmjs/encoding";
import {toRfc3339WithNanoseconds} from "@cosmjs/tendermint-rpc";
import {QueryClientImpl as AuthQueryClient} from "cosmjs-types/cosmos/auth/v1beta1/query";
import {TxMsgData} from "cosmjs-types/cosmos/base/abci/v1beta1/abci";
import {CHAIN} from "../constants/ChainConstants";
import {FEE} from "../constants/Fee";
import {exactQueryHeight, protocolAtHeight, validateSigningSnapshot} from "../util/ChainProtocol";
import {signedSubmission, submissionBytes, transactionHash} from "../util/SignedSubmission";
import {RpcResponseError} from "../api/OwnedRpcClient";

export class SigningDeferredError extends Error {}

/** Network operations are separate from queue/journal mutation. Never retries sends. */
export class SigningSubmission {
  constructor(manager) { this.manager = manager; }

  async prepare(tx, assertActive = () => {}) {
    const manager = this.manager;
    const query = manager.chainQuery;
    const client = manager.gameState.signingClient;
    const epoch = manager.connectionEpoch;
    const check = () => {
      assertActive();
      if (!query || query.closed || manager.chainQuery!==query || manager.gameState.signingClient!==client
          || tx.accountAddress!==manager.gameState.signingAccount?.address) throw new SigningDeferredError('Signing connection changed');
    };
    check();
    const response = await manager.gameState.guildAPI.getBlockSnapshot();
    check();
    const accountSnapshot = await query.readSnapshot(async rpc=>{
      const response = await new AuthQueryClient(rpc).Account({address:tx.accountAddress});
      if (!response.account) throw new Error('Signing account unavailable');
      return accountFromAny(response.account);
    });
    check();
    let context;
    try {
      context = validateSigningSnapshot(response.meta,{chainId:accountSnapshot.chainId,height:accountSnapshot.observedHeight});
    } catch (error) { throw new SigningDeferredError(error.message); }
    // Post-H actions must be rebuilt/revalidated by their protocol-aware caller.
    // An old primary-address payload is not made vault-aware by new codecs.
    if ((tx.intentProtocol && tx.intentProtocol!==context.protocol)
        || (context.protocol===CHAIN.PROTOCOL && tx.intentProtocol!==CHAIN.PROTOCOL)) {
      throw new SigningDeferredError('Queued intent requires current-protocol preparation');
    }
    const account = accountSnapshot.data;
    if (account.address!==tx.accountAddress || !Number.isSafeInteger(account.accountNumber)
        || !Number.isSafeInteger(account.sequence) || account.accountNumber<0 || account.sequence<0) {
      throw new Error('Unsupported signing account identity');
    }
    const messages = [tx.toCosmosMsg(manager.registry)];
    const raw = await client.sign(tx.accountAddress,messages,FEE,'',{
      accountNumber:account.accountNumber,sequence:account.sequence,chainId:context.chainId,
    },BigInt(context.timeoutHeight));
    check();
    const submission = await signedSubmission(raw,{messages,registry:manager.registry,fee:FEE,
      accountAddress:tx.accountAddress,accountNumber:account.accountNumber,sequence:account.sequence,context});
    check();
    const current = await query.status();
    check();
    if (protocolAtHeight(current.chainId,current.height)!==context.protocol) throw new SigningDeferredError('Protocol changed while signing');
    return {...submission,connectionEpoch:epoch};
  }

  async send(tx) {
    const bytes = submissionBytes(tx.submission);
    const query = this.manager.chainQuery;
    if (!query || query.closed || tx.submission.connectionEpoch!==this.manager.connectionEpoch
        || tx.accountAddress!==this.manager.gameState.signingAccount?.address) throw new Error('Signing connection changed before send');
    const result = await query.cometClient.broadcastTxSync({tx:bytes});
    if (toHex(result.hash).toUpperCase()!==tx.submission.hash || !Number.isInteger(result.code) || result.code<0) {
      throw new Error('Broadcast response identity is invalid');
    }
    return {code:result.code,transactionHash:tx.submission.hash,chainId:CHAIN.ID,
      rawLog:result.log ?? '',stage:'check_tx'};
  }

  async find(tx) {
    submissionBytes(tx.submission);
    const query = this.manager.chainQuery;
    if (!query || query.closed) throw new Error('Chain reconciliation unavailable');
    await query.status();
    let result;
    try { result = await query.cometClient.tx({hash:fromHex(tx.submission.hash),prove:false}); }
    catch (error) {
      if (error instanceof RpcResponseError && error.code===-32603 && typeof error.data==='string'
          && error.data.toUpperCase()===`TX (${tx.submission.hash}) NOT FOUND`) return null;
      throw error;
    }
    const height = exactQueryHeight(result.height);
    if (toHex(result.hash).toUpperCase()!==tx.submission.hash || transactionHash(result.tx)!==tx.submission.hash
        || toBase64(result.tx)!==tx.submission.bytes || !Number.isSafeInteger(result.index) || result.index<0
        || !Number.isInteger(result.result.code) || result.result.code<0) throw new Error('Committed transaction identity is invalid');
    // A header/commit supplies the source timestamp without downloading every
    // other transaction in a potentially large block. Index comes from tx RPC.
    const block = await query.cometClient.commit(Number(height));
    const current = await query.status();
    if (query!==this.manager.chainQuery || query.closed || BigInt(current.height)<BigInt(height)
        || block.header.chainId!==CHAIN.ID || exactQueryHeight(block.header.height)!==height
        || exactQueryHeight(block.commit.height)!==height || block.commit.blockId.hash.length!==32) {
      throw new Error('Committed transaction block identity is invalid');
    }
    return {code:result.result.code,transactionHash:tx.submission.hash,chainId:CHAIN.ID,
      height,txIndex:result.index,blockHash:toHex(block.commit.blockId.hash).toUpperCase(),
      blockTime:toRfc3339WithNanoseconds(block.header.time),rawLog:result.result.log ?? '',stage:'committed',
      msgResponses:TxMsgData.decode(result.result.data ?? new Uint8Array()).msgResponses};
  }
}
