import {prepareDeviceChange} from "./DeviceChangePreparation";
import {accountFromAny} from "@cosmjs/stargate";
import {fromHex, toBase64, toHex} from "@cosmjs/encoding";
import {toRfc3339WithNanoseconds} from "@cosmjs/tendermint-rpc";
import {QueryClientImpl as AuthQueryClient} from "cosmjs-types/cosmos/auth/v1beta1/query";
import {TxMsgData} from "cosmjs-types/cosmos/base/abci/v1beta1/abci";
import {ServiceClientImpl as TxService} from "cosmjs-types/cosmos/tx/v1beta1/service";
import {AuthInfo, TxBody, TxRaw} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {prepareTransfer} from "./TransferPreparation";
import {prepareReactor} from "./ReactorPreparation";
import {prepareRegistration} from "./RegistrationPreparation";
import {prepareGenerator} from "./GeneratorPreparation";
import {prepareGameplay} from "./GameplayPreparation";
import {CHAIN} from "../constants/ChainConstants";
import {FEE} from "../constants/Fee";
import {exactQueryHeight, protocolAtHeight, validateSigningSnapshot} from "../util/ChainProtocol";
import {signedSubmission, submissionBytes, transactionHash} from "../util/SignedSubmission";
import {generatorReceipt} from "../util/GeneratorReceipt";
import {RpcResponseError} from "../api/OwnedRpcClient";

export class SigningDeferredError extends Error {}

/**
 * Network operations are separate from queue/journal mutation. Never retries sends.
 */
export class SigningSubmission {

  /**
   * @param {SigningQueueManager} manager
   */
  constructor(manager) {
    this.manager = manager;
  }

  /**
   * Read current chain state, sign the transaction and verify the wallet's output.
   *
   * @param {SigningTransaction} tx
   * @param {function} assertActive throws once this preparation is no longer wanted
   * @return {Promise<object>} the signed submission
   */
  async prepare(tx, assertActive = () => {}) {
    const manager = this.manager;
    const query = manager.chainQuery;
    const client = manager.gameState.signingClient;
    const epoch = manager.connectionEpoch;
    const check = () => {
      assertActive();
      if (
        !query
        || query.closed
        || manager.chainQuery !== query
        || manager.gameState.signingClient !== client
        || tx.accountAddress !== manager.gameState.signingAccount?.address
      ) {
        throw new SigningDeferredError('Signing connection changed');
      }
    };
    check();
    const isRegistration = tx.intent?.kind === 'address_register';
    const isDeviceChange = tx.intent?.kind === 'device_change';
    const isEconomic = ['alpha_transfer', 'reactor_change', 'generator_fund'].includes(tx.intent?.kind);
    const isReactor = tx.intent?.kind === 'reactor_change';
    const isGenerator = tx.intent?.kind === 'generator_fund';
    const isGameplay = tx.intent?.kind === 'gameplay';
    const prepareIntent = {
      gameplay: prepareGameplay,
      device_change: prepareDeviceChange,
      address_register: prepareRegistration,
      alpha_transfer: prepareTransfer,
      reactor_change: prepareReactor,
      generator_fund: prepareGenerator,
    }[tx.intent?.kind];
    if (tx.intent && !prepareIntent) throw new Error('Unsupported transaction intent');
    const isWithdrawal = isReactor && tx.intent.direction === 'defuse';
    const data = isEconomic
      ? await manager.gameState.guildAPI[isWithdrawal ? 'getInfusionByPlayerId' : 'getPlayer'](tx.intent.ownerId)
      : null;
    const response = data ? {meta: data.snapshot_meta} : await manager.gameState.guildAPI.getBlockSnapshot();
    check();
    const accountSnapshot = await query.readSnapshot(async rpc => {
      if (isGameplay) {
        try {
          validateSigningSnapshot(response.meta, {chainId: rpc.chainId, height: rpc.height});
        } catch (error) {
          throw new SigningDeferredError(error.message);
        }
      }
      if (isEconomic) {
        try {
          validateSigningSnapshot(response.meta, {chainId: rpc.chainId, height: rpc.height}, ['inventory']);
        } catch (error) {
          throw new SigningDeferredError(error.message);
        }
        if (response.meta.protocol === CHAIN.PROTOCOL && !isWithdrawal && data.funds_meta?.ready !== true) {
          throw new SigningDeferredError('Indexed vault spendability is not ready');
        }
        if (response.meta.protocol === CHAIN.PROTOCOL && isWithdrawal && data.positions_meta?.complete !== true) {
          throw new SigningDeferredError('Indexed reactor positions are not ready');
        }
      }
      const authResponse = await new AuthQueryClient(rpc).Account({address: tx.accountAddress});
      if (!authResponse.account) throw new Error('Signing account unavailable');
      const account = accountFromAny(authResponse.account);
      const prepared = tx.intent ? await prepareIntent(rpc, tx, data) : null;
      return {account, prepared};
    }, isReactor || isGenerator ? {height: response.meta?.height} : {});
    check();
    if (isReactor || isGenerator) {
      // The pinned read signs with the indexed height's sequence. If the signer
      // has committed since then, wait for the index instead of signing stale.
      const latest = await query.readSnapshot(async rpc => {
        const authResponse = await new AuthQueryClient(rpc).Account({address: tx.accountAddress});
        if (!authResponse.account) throw new Error('Signing account unavailable');
        return accountFromAny(authResponse.account).sequence;
      });
      check();
      if (latest.data !== accountSnapshot.data.account.sequence) {
        throw new SigningDeferredError('Indexed snapshot predates the signing account sequence');
      }
    }
    let context;
    try {
      context = validateSigningSnapshot(
        response.meta,
        {chainId: accountSnapshot.chainId, height: accountSnapshot.observedHeight},
        isEconomic ? ['inventory'] : []
      );
    } catch (error) {
      throw new SigningDeferredError(error.message);
    }
    // Post-H actions must be rebuilt/revalidated by their protocol-aware caller.
    // An old primary-address payload is not made vault-aware by new codecs.
    if (tx.intent) {
      if (accountSnapshot.data.prepared.protocol !== context.protocol) {
        throw new SigningDeferredError('Protocol changed while preparing intent');
      }
      tx.message = accountSnapshot.data.prepared.message ?? null;
      tx.messages = accountSnapshot.data.prepared.messages ?? null;
      tx.intentProtocol = context.protocol;
    } else if (
      (tx.intentProtocol && tx.intentProtocol !== context.protocol)
      || (context.protocol === CHAIN.PROTOCOL && tx.intentProtocol !== CHAIN.PROTOCOL)
    ) {
      // Final, not deferred: a deferred refusal returns to the head of its lane
      // and would block every later transaction there until it expires.
      throw new Error('Queued intent requires current-protocol preparation');
    }
    const account = accountSnapshot.data.account;
    if (
      account.address !== tx.accountAddress
      || !Number.isSafeInteger(account.accountNumber)
      || !Number.isSafeInteger(account.sequence)
      || account.accountNumber < 0
      || account.sequence < 0
    ) {
      throw new Error('Unsupported signing account identity');
    }
    const messages = tx.toCosmosMsgs(manager.registry);
    const fee = accountSnapshot.data.prepared?.fee ?? FEE;
    const raw = await client.sign(tx.accountAddress, messages, fee, '', {
      accountNumber: account.accountNumber,
      sequence: account.sequence,
      chainId: context.chainId,
    }, BigInt(context.timeoutHeight));
    check();
    const submission = await signedSubmission(raw, {
      messages,
      registry: manager.registry,
      fee,
      accountAddress: tx.accountAddress,
      accountNumber: account.accountNumber,
      sequence: account.sequence,
      context,
    });
    check();
    if (tx.intent) {
      const simulation = await query.readSnapshot(
        rpc => new TxService(rpc).Simulate({txBytes: submissionBytes(submission)}),
        {height: accountSnapshot.height}
      );
      check();
      if (!simulation.data.gasInfo || simulation.data.gasInfo.gasUsed > BigInt(fee.gas)) {
        throw new Error('Intent exceeds the transaction gas limit');
      }
    }
    const current = await query.status();
    check();
    if (protocolAtHeight(current.chainId, current.height) !== context.protocol) {
      throw new SigningDeferredError('Protocol changed while signing');
    }
    if (BigInt(current.height) > BigInt(context.timeoutHeight)) {
      throw new SigningDeferredError('Transaction expired during preparation');
    }
    return {
      ...submission,
      connectionEpoch: epoch,
      ...(tx.intent
        ? (isGameplay ? {gameplay: accountSnapshot.data.prepared.gameplay}
          : isDeviceChange ? {deviceChange: accountSnapshot.data.prepared.deviceChange}
          : isRegistration ? {registration: accountSnapshot.data.prepared.registration}
          : isReactor ? {reactor: accountSnapshot.data.prepared.reactor}
          : isGenerator ? {generator: accountSnapshot.data.prepared.generator}
          : {transfer: accountSnapshot.data.prepared.transfer})
        : {}),
    };
  }

  /**
   * Called before the send marker is written, so a refused send stays provably unsent.
   *
   * @param {SigningTransaction} tx
   */
  assertSendable(tx) {
    const query = this.manager.chainQuery;
    if (
      !query
      || query.closed
      || tx.submission.connectionEpoch !== this.manager.connectionEpoch
      || tx.accountAddress !== this.manager.gameState.signingAccount?.address
    ) {
      throw new SigningDeferredError('Signing connection changed before send');
    }
  }

  /**
   * Broadcast the signed bytes once.
   *
   * @param {SigningTransaction} tx
   * @return {Promise<object>} the CheckTx response
   */
  async send(tx) {
    const bytes = submissionBytes(tx.submission);
    this.assertSendable(tx);
    const query = this.manager.chainQuery;
    const result = await query.cometClient.broadcastTxSync({tx: bytes});
    if (toHex(result.hash).toUpperCase() !== tx.submission.hash || !Number.isInteger(result.code) || result.code < 0) {
      throw new Error('Broadcast response identity is invalid');
    }
    return {
      code: result.code,
      transactionHash: tx.submission.hash,
      chainId: CHAIN.ID,
      codespace: result.codespace ?? '',
      rawLog: result.log ?? '',
      stage: 'check_tx',
    };
  }

  /**
   * Look the submission up on chain, falling back to expiry proof when it is not found.
   *
   * @param {SigningTransaction} tx
   * @return {Promise<object|null>} the committed response, or null while unresolved
   */
  async find(tx) {
    submissionBytes(tx.submission);
    const query = this.manager.chainQuery;
    if (!query || query.closed) throw new Error('Chain reconciliation unavailable');
    await query.status();
    let result;
    try {
      result = await query.cometClient.tx({hash: fromHex(tx.submission.hash), prove: false});
    } catch (error) {
      if (
        error instanceof RpcResponseError
        && error.code === -32603
        && typeof error.data === 'string'
        && error.data.toUpperCase() === `TX (${tx.submission.hash}) NOT FOUND`
      ) {
        return this.findExpired(tx, query);
      }
      throw error;
    }
    const height = exactQueryHeight(result.height);
    if (
      toHex(result.hash).toUpperCase() !== tx.submission.hash
      || transactionHash(result.tx) !== tx.submission.hash
      || toBase64(result.tx) !== tx.submission.bytes
      || !Number.isSafeInteger(result.index)
      || result.index < 0
      || !Number.isInteger(result.result.code)
      || result.result.code < 0
    ) {
      throw new Error('Committed transaction identity is invalid');
    }
    // A header/commit supplies the source timestamp without downloading every
    // other transaction in a potentially large block. Index comes from tx RPC.
    const block = await query.cometClient.commit(Number(height));
    const current = await query.status();
    if (
      query !== this.manager.chainQuery
      || query.closed
      || BigInt(current.height) < BigInt(height)
      || block.header.chainId !== CHAIN.ID
      || exactQueryHeight(block.header.height) !== height
      || exactQueryHeight(block.commit.height) !== height
      || block.commit.blockId.hash.length !== 32
    ) {
      throw new Error('Committed transaction block identity is invalid');
    }
    return {
      code: result.result.code,
      transactionHash: tx.submission.hash,
      chainId: CHAIN.ID,
      height,
      txIndex: result.index,
      blockHash: toHex(block.commit.blockId.hash).toUpperCase(),
      blockTime: toRfc3339WithNanoseconds(block.header.time),
      codespace: result.result.codespace ?? '',
      rawLog: result.result.log ?? '',
      stage: 'committed',
      ...(tx.intent?.kind === 'generator_fund' && result.result.code === 0
        ? {generatorReceipt: generatorReceipt(result.result.events, protocolAtHeight(CHAIN.ID, height))}
        : {}),
      msgResponses: TxMsgData.decode(result.result.data ?? new Uint8Array()).msgResponses,
    };
  }

  /**
   * Prove an expired send cannot have executed. A missing transaction lookup or
   * a passed timeout alone is insufficient: a node can lose its transaction
   * index. Successful ante handling consumes the signing account's sequence,
   * including when later message execution fails. The same account and unchanged
   * sequence at a height after expiry therefore prove no message execution.
   *
   * An advanced sequence proves this signed transaction cannot execute again,
   * but leaves its historical outcome unknown. Release the signing reservation
   * without reporting a failure. Unavailable or conflicting evidence stays held.
   *
   * @param {SigningTransaction} tx
   * @param {ChainQueryClient} query
   * @return {Promise<object|null>}
   */
  async findExpired(tx, query) {
    const submission = tx.submission;
    const raw = TxRaw.decode(submissionBytes(submission));
    const body = TxBody.decode(raw.bodyBytes);
    const auth = AuthInfo.decode(raw.authInfoBytes);
    if (
      body.timeoutHeight.toString() !== submission.timeoutHeight
      || auth.signerInfos.length !== 1
      || auth.signerInfos[0].sequence.toString() !== submission.sequence
    ) {
      throw new Error('Signed expiry context does not match the transaction');
    }

    const current = await query.status();
    if (BigInt(current.height) < BigInt(submission.observedHeight)) return null;

    const snapshot = await query.readSnapshot(async rpc => {
      if (BigInt(rpc.height) < BigInt(submission.observedHeight)) return null;
      const response = await new AuthQueryClient(rpc).Account({address: tx.accountAddress});
      if (!response.account) throw new Error('Signing account unavailable during expiry recovery');
      const account = accountFromAny(response.account);
      if (
        account.address !== tx.accountAddress
        || !Number.isSafeInteger(account.accountNumber)
        || !Number.isSafeInteger(account.sequence)
      ) {
        throw new Error('Unsupported signing account during expiry recovery');
      }
      if (String(account.accountNumber) !== submission.accountNumber) return null;
      if (
        tx.response?.stage === 'sequence_consumed'
        && (
          BigInt(rpc.height) < BigInt(tx.response.verifiedHeight)
          || BigInt(account.sequence) < BigInt(tx.response.currentSequence)
        )
      ) {
        return null;
      }
      if (BigInt(account.sequence) > BigInt(submission.sequence)) {
        return {stage: 'sequence_consumed', currentSequence: String(account.sequence)};
      }
      if (
        String(account.sequence) !== submission.sequence
        || body.timeoutHeight === 0n
        || BigInt(rpc.height) <= body.timeoutHeight
      ) {
        return null;
      }
      return {stage: 'expired'};
    });
    if (query !== this.manager.chainQuery || query.closed) {
      throw new Error('Chain connection changed during expiry recovery');
    }
    if (!snapshot.data) return null;

    return {
      ...snapshot.data,
      code: null,
      chainId: submission.chainId,
      transactionHash: submission.hash,
      timeoutHeight: submission.timeoutHeight,
      verifiedHeight: snapshot.height,
      accountNumber: submission.accountNumber,
      sequence: submission.sequence,
    };
  }
}
