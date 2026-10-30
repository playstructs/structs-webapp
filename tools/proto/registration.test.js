import assert from 'node:assert/strict';
import {stringToPath} from '@cosmjs/crypto';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import {toHex} from '@cosmjs/encoding';
import {BaseAccount} from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import {QueryAccountResponse} from 'cosmjs-types/cosmos/auth/v1beta1/query';
import {SimulateRequest, SimulateResponse} from 'cosmjs-types/cosmos/tx/v1beta1/service';
import {AuthInfo, TxBody, TxRaw} from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import * as Structs from '../../src/js/ts/structs.structs/types/structs/structs/query';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {TransactionJournal} from '../../src/js/managers/TransactionJournal';
import {PLAYER_TYPES} from '../../src/js/constants/PlayerTypes';
import {TX_STATUS} from '../../src/js/models/SigningTransaction';
import {SigningSubmission} from '../../src/js/managers/SigningSubmission';
import {SigningClientManager} from '../../src/js/managers/SigningClientManager';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {SigningTransaction} from '../../src/js/models/SigningTransaction';
import {WalletManager} from '../../src/js/managers/WalletManager';
import {registrationIntent} from '../../src/js/util/RegistrationIntent';
import {registrationProofContext, registrationProofMessage, pendingRegistrationProof} from '../../src/js/util/RegistrationProof';
import {submissionBytes} from '../../src/js/util/SignedSubmission';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {STRUCTS_FREE_GAS} from '../../src/js/constants/Fee';

const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
let account, signerAccount, registry, offline;
async function fixture(height = '3353000', nonce = '9007199254740993') {
  const protocol = BigInt(height) < BigInt(CHAIN.UPGRADE_HEIGHT) ? CHAIN.LEGACY_PROTOCOL : CHAIN.PROTOCOL;
  const proof = registrationProofContext({chain_id:CHAIN.ID,protocol,source_height:height,player_id:'1-1',
    address:account.address,registered_player_id:'',proof_nonce:protocol === CHAIN.PROTOCOL ? nonce : null,
    timeout_height:protocol === CHAIN.PROTOCOL ? '0' : '3352999'});
  const signature = await new WalletManager().createSignatureForProxyMessage(registrationProofMessage(proof),account.privkey);
  const intent = registrationIntent({kind:'address_register',version:1,ownerId:'1-1',address:account.address,
    pubkey:toHex(account.pubkey),signature,permissions:'255',proof});
  // A second derivation is the existing device approving this new key.
  const control = {height,nonce,permissions:'255',owner:'1-1',targetOwner:'',signed:0,simulated:0,gas:1000000n};
  const signer = signerAccount.address;
  const meta = () => ({chain_id:CHAIN.ID,height:control.height,indexed_height:control.height,observed_tip:control.height,
    activation_height:CHAIN.UPGRADE_HEIGHT,api_contract:CHAIN.API_CONTRACT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,
    protocol,observed_protocol:protocol,data_ready:true,transaction_ready:true,required_models:[],models:{},inventory_authority:'current-claims-v1'});
  const manager = {registry,connectionEpoch:1,gameState:{signingAccount:{address:signer},guildAPI:{getBlockSnapshot:async()=>({meta:meta()})}}};
  const encode = (type, value) => type.encode(type.fromPartial(value)).finish();
  const request = async (service,method,bytes) => {
    if (service === 'cosmos.auth.v1beta1.Query') return encode(QueryAccountResponse,{account:{typeUrl:'/cosmos.auth.v1beta1.BaseAccount',
      value:encode(BaseAccount,{address:signer,accountNumber:1n,sequence:2n})}});
    if (service === 'structs.structs.Query' && method === 'Address') {
      const {address} = Structs.QueryGetAddressRequest.decode(bytes);
      assert.ok([signer,account.address].includes(address));
      return encode(Structs.QueryAddressResponse,{address,playerId:address === signer ? control.owner : control.targetOwner,
        permissions:address === signer ? control.permissions : '0',proofNonce:control.nonce});
    }
    if (service === 'structs.structs.Query' && method === 'Player') return encode(Structs.QueryGetPlayerResponse,{Player:{id:'1-1'}});
    if (service === 'cosmos.tx.v1beta1.Service' && method === 'Simulate') {
      control.simulated++;control.bytes=SimulateRequest.decode(bytes).txBytes;
      return encode(SimulateResponse,{gasInfo:{gasUsed:control.gas}});
    }
    throw new Error(`Unexpected query ${service}/${method}`);
  };
  manager.gameState.signingClient = {sign:async(...args)=>{control.signed++;return offline.sign(...args);}};
  manager.chainQuery = {closed:false,status:async()=>({chainId:CHAIN.ID,height:control.height}),
    readSnapshot:async(read,options={})=>{
      const pinned = options.height ?? control.height;
      return {chainId:CHAIN.ID,height:pinned,observedHeight:control.height,
        data:await read({chainId:CHAIN.ID,height:pinned,request})};
    }};
  const tx = SigningTransaction.create({intent,isAction:false,retryLimit:0,accountAddress:signer,enqueuedAtBlock:Number(height)});
  return {control,tx,manager,submission:new SigningSubmission(manager)};
}

async function activationTests(base) {
  const {AuthManager}=require('../../src/js/managers/AuthManager');
  const row={code:'ZZZQQ',address:base.address,player_id:base.ownerId,pubkey:base.pubkey,signature:base.signature,
    permissions:255,proof_chain_id:base.proof.chain_id,proof_protocol:base.proof.protocol,
    proof_nonce:base.proof.proof_nonce,proof_height:base.proof.source_height,proof_timeout_height:base.proof.timeout_height};
  const notification={...row,proof_nonce:Number(row.proof_nonce)};
  for (const status of [TX_STATUS.DROPPED,TX_STATUS.CANCELLED,TX_STATUS.SUCCEEDED]) {
    let deleted=0,resolveTx,queued=0;
    const manager=Object.create(AuthManager.prototype);
    manager.gameState={keyPlayers:{[PLAYER_TYPES.PLAYER]:{id:base.ownerId}}};
    manager.grassManager={registerListener:()=>{}};
    manager.guildAPI={getPendingAddressByCode:async()=>row,setPendingAddressPermissions:async()=>({success:true}),
      deleteActivationCode:async()=>{deleted++;}};
    manager.signingClientManager={queueMsgAddressRegister:async(...args)=>{
      assert.equal(args[5].proofContext.proof_nonce,'9007199254740993');queued++;
      return new Promise(resolve=>{resolveTx=resolve;});
    }};
    const result=manager.activateDevice(notification);
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(queued,1);assert.equal(deleted,0,'Uncertain sends must retain the activation code');
    resolveTx({status});assert.equal(await result,status===TX_STATUS.SUCCEEDED);
    assert.equal(deleted,status===TX_STATUS.SUCCEEDED?1:0,'Only confirmed success consumes the code');
  }
}

async function main() {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic,{prefix:'structs'});
  [account] = await wallet.getAccountsWithPrivkeys();
  registry = new Registry([...defaultRegistryTypes,...msgTypes]);
  const approvingWallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic,{prefix:'structs',
    hdPaths:[stringToPath("m/44'/118'/0'/0/1")]});
  [signerAccount] = await approvingWallet.getAccounts();
  offline = await SigningStargateClient.offline(approvingWallet,{registry});
  for (const nonce of ['0','1','9007199254740993','18446744073709551615']) {
    const f = await fixture('3353000',nonce);
    const signed = await f.submission.prepare(f.tx);
    assert.equal(signed.registration.proof.proof_nonce,nonce);
    assert.equal(f.control.signed,1);assert.equal(f.control.simulated,1);
    assert.deepEqual(submissionBytes(signed),f.control.bytes);
    const raw = TxRaw.decode(submissionBytes(signed)), body = TxBody.decode(raw.bodyBytes);
    const message = registry.decode(body.messages[0]);
    assert.equal(message.permissions,'255');assert.equal(message.proofSignature,f.tx.intent.signature);
    assert.equal(message.creator,signerAccount.address);assert.equal(message.nonce,undefined,'Nonce belongs in consent, never an invented message field');
    assert.equal(body.timeoutHeight,0n);assert.equal(AuthInfo.decode(raw.authInfoBytes).fee.gasLimit,BigInt(STRUCTS_FREE_GAS));
    const restored = SigningTransaction.fromJSON(JSON.parse(JSON.stringify(f.tx.toJSON())));
    assert.deepEqual(restored.intent,f.tx.intent);
  }
  const legacy = await fixture('3352999');legacy.control.targetOwner='1-0';
  const signed = await legacy.submission.prepare(legacy.tx);
  assert.equal(TxBody.decode(TxRaw.decode(submissionBytes(signed)).bodyBytes).timeoutHeight,3352999n);
  assert.equal(registrationProofMessage(legacy.tx.intent.proof),`PLAYER1-1ADDRESS${account.address}`);
  for (const patch of [{nonce:'9007199254740994'},{permissions:'2'},{owner:'1-2'},{targetOwner:'1-1'},{targetOwner:'1-2'}]) {
    const f=await fixture();Object.assign(f.control,patch);
    await assert.rejects(()=>f.submission.prepare(f.tx));assert.equal(f.control.signed,0);
  }
  const crossed=await fixture('3352999');crossed.control.height='3353000';
  await assert.rejects(()=>crossed.submission.prepare(crossed.tx));assert.equal(crossed.control.signed,0);
  const base=(await fixture()).tx.intent;
  for (const patch of [{proof_nonce:9007199254740992},{proof_nonce:'01'},{proof_nonce:'18446744073709551616'},
      {chain_id:'wrong-chain'},{timeout_height:'3353000'},{registered_player_id:'1-1'},{source_height:3353000}]) {
    assert.throws(()=>registrationProofContext({...base.proof,...patch}));
  }
  assert.throws(()=>pendingRegistrationProof({}),/context/,'Legacy pending rows need new consent');
  const bad=await fixture();bad.tx.intent=registrationIntent({...bad.tx.intent,signature:'a'.repeat(128)});
  await assert.rejects(()=>bad.submission.prepare(bad.tx));assert.equal(bad.control.signed,0);
  const gas=await fixture();gas.control.gas=BigInt(STRUCTS_FREE_GAS)+1n;
  await assert.rejects(()=>gas.submission.prepare(gas.tx),/gas limit/);

  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),
    removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i],get length(){return memory.size;}};
  globalThis.window=new EventTarget();
  const f=await fixture(),queue=new SigningQueueManager({...f.manager.gameState,currentBlockHeight:3353000},{registry,wsUrl:'ws://registration'});
  queue.whenSettled=async id=>queue.getTransaction(id);
  const manager=Object.create(SigningClientManager.prototype);manager.queue=queue;
  const tx=await manager.queueMsgAddressRegister(base.ownerId,base.address,base.pubkey,base.signature,'255',{proofContext:base.proof});
  assert.deepEqual(tx.intent,base);assert.equal(tx.message,null,'Resolve the saved consent before generating bytes');
  await assert.rejects(()=>manager.queueMsgAddressRegister(base.ownerId,base.address,base.pubkey,base.signature,9007199254740992,{proofContext:base.proof}));
  tx.submission=await f.submission.prepare(tx);tx.status=TX_STATUS.UNKNOWN;
  new TransactionJournal(signerAccount.address).write(tx,'unknown');
  const restoredQueue=new SigningQueueManager({...f.manager.gameState,currentBlockHeight:3353000},{registry,wsUrl:'ws://registration'});
  restoredQueue.loadPersistedState();
  assert.equal(restoredQueue.getTransaction(tx.id).status,TX_STATUS.UNKNOWN);
  assert.deepEqual(restoredQueue.getTransaction(tx.id).intent,base);
  assert.throws(()=>restoredQueue.enqueueRegistration(base),/existing submission/,'An uncertain registration never becomes a replacement');
  await activationTests(base);
  console.log('Registration proofs, exact nonces, permission ceiling, protocol expiry, real signatures/simulation and queued consent passed.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
