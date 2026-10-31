import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient,defaultRegistryTypes} from '@cosmjs/stargate';
import {fromHex} from '@cosmjs/encoding';
import {Comet38Client} from '@cosmjs/tendermint-rpc';
import {TxRaw,TxBody} from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import {BaseAccount} from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import {QueryAccountResponse} from 'cosmjs-types/cosmos/auth/v1beta1/query';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {SIGNING_QUEUE} from '../../src/js/constants/SigningQueueConstants';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {SigningSubmission} from '../../src/js/managers/SigningSubmission';
import {TransactionJournal} from '../../src/js/managers/TransactionJournal';
import {SigningTransaction,TX_STATUS} from '../../src/js/models/SigningTransaction';
import {RpcResponseError,OwnedRpcClient} from '../../src/js/api/OwnedRpcClient';
import {ChainQueryClient} from '../../src/js/api/ChainQueryClient';
import {transactionHash,submissionBytes} from '../../src/js/util/SignedSubmission';
import {protocolAtHeight} from '../../src/js/util/ChainProtocol';

const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
class Storage {
  constructor(){this.values=new Map();this.fail=()=>false;}
  get length(){return this.values.size;}
  key(index){return [...this.values.keys()][index]??null;}
  getItem(key){return this.values.get(key)??null;}
  setItem(key,value){if(this.fail(key,value))throw new Error('fixture quota');this.values.set(key,value);}
  removeItem(key){this.values.delete(key);}
}
function locks(){
  const held=new Set();
  return {request:async(name,options,callback)=>{
    if(held.has(name))return callback(null);
    held.add(name);try{return await callback({name});}finally{held.delete(name);}
  }};
}
function meta(height){
  const protocol=protocolAtHeight(CHAIN.ID,String(height));
  return {height:String(height),indexed_height:String(height),observed_tip:String(height),chain_id:CHAIN.ID,
    protocol,observed_protocol:protocol,activation_height:CHAIN.UPGRADE_HEIGHT,api_contract:CHAIN.API_CONTRACT,
    cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,inventory_authority:protocol===CHAIN.PROTOCOL?'current-claims-v1':'ledger',
    data_ready:true,transaction_ready:true,required_models:[],models:{}};
}
let wallet,account,registry;
async function fixture(storage=new Storage()){
  globalThis.window=new EventTarget();
  globalThis.localStorage=storage;
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:locks()}});
  const control={height:3352998,sequence:7,accountNumber:1,mode:'accept',sends:0,signs:0,results:new Map(),bytes:new Map(),signGate:null,wrongBlock:false};
  const offline=await SigningStargateClient.offline(wallet,{registry});
  const originalSign=offline.sign.bind(offline);
  offline.sign=async(...args)=>{control.signs++;if(control.signGate)await control.signGate.promise;return originalSign(...args);};
  const state={signingAccount:account,signingClient:offline,currentBlockHeight:3352998,
    guildAPI:{getBlockSnapshot:async()=>({success:true,data:{height:control.height},meta:meta(control.height)})}};
  const manager={registry,gameState:state,connectionEpoch:1};
  const journal=new TransactionJournal(account.address);
  manager.chainQuery={closed:false,status:async()=>({chainId:CHAIN.ID,height:String(control.height)}),
    readSnapshot:async read=>({chainId:CHAIN.ID,height:String(control.height),observedHeight:String(control.height),data:await read({
      chainId:CHAIN.ID,height:String(control.height),request:async(service,method)=>{
        if (control.accountError) throw new Error('Account query unavailable');
        assert.equal(service,'cosmos.auth.v1beta1.Query');assert.equal(method,'Account');
        return QueryAccountResponse.encode(QueryAccountResponse.fromPartial({account:{typeUrl:'/cosmos.auth.v1beta1.BaseAccount',
          value:BaseAccount.encode(BaseAccount.fromPartial({address:account.address,accountNumber:BigInt(control.accountNumber),sequence:BigInt(control.sequence)})).finish()}})).finish();
      },
    })}),
    cometClient:{
      broadcastTxSync:async({tx})=>{
        const hash=transactionHash(tx);control.sends++;control.bytes.set(hash,tx);
        const saved=journal.read().find(record=>record.transaction.submission?.hash===hash);
        assert.equal(saved?.phase,'broadcasting','send requires durable identity and send marker');
        assert.equal(saved.transaction.submission.bytes,Buffer.from(tx).toString('base64'));
        if(control.mode==='throw')throw new Error('reply lost after submission');
        if(control.mode==='commit')control.results.set(hash,{height:control.height+1,code:0});
        if(control.mode==='deliver_reject')control.results.set(hash,{height:control.height+1,code:9});
        if(control.results.has(hash))control.height++;
        return {code:control.mode==='reject'?9:0,hash:fromHex(hash),codespace:'fixture_check',log:'fixture'};
      },
      tx:async({hash})=>{
        const key=Buffer.from(hash).toString('hex').toUpperCase();
        const result=control.results.get(key);
        if(!result)throw new RpcResponseError({code:-32603,message:'Internal error',data:`tx (${key}) not found`});
        return {hash,tx:control.bytes.get(key),height:result.height,index:0,result:{code:result.code,codespace:'fixture_deliver',data:new Uint8Array(),log:'fixture'}};
      },
      commit:async height=>({commit:{height,blockId:{hash:new Uint8Array(32)}},header:{height,chainId:control.wrongBlock?'wrong':CHAIN.ID,
        time:new Date('2026-10-29T00:00:00.123Z')}}),
    }};
  const submission=new SigningSubmission(manager);
  const makeQueue=()=>new SigningQueueManager(state,{registry,wsUrl:'ws://fixture',submission});
  const queue=makeQueue();queue.loadPersistedState();
  const enqueue=(target=queue)=>target.enqueueImmediate('/structs.structs.MsgPlayerSend',{
    fromAddress:account.address,toAddress:account.address,amount:[{denom:'ualpha',amount:'1'}],
  },{retryLimit:100});
  const tick=async(target=queue)=>{state.currentBlockHeight++;await target.transactOnBlock();};
  const commit=(hash,code=0)=>{control.height=3353000;control.results.set(hash,{height:3352999,code});};
  return {storage,control,state,manager,submission,journal,queue,makeQueue,enqueue,tick,commit};
}

async function acceptedReload(){
  const f=await fixture();const id=f.enqueue();let settled=false;
  f.queue.whenSettled(id).then(()=>{settled=true;});
  await f.tick();assert.equal(f.control.sends,1);assert.equal(f.control.signs,1);assert.equal(settled,false);
  const tx=f.queue.getTransaction(id);assert.equal(tx.status,TX_STATUS.UNKNOWN);
  const body=TxBody.decode(TxRaw.decode(submissionBytes(tx.submission)).bodyBytes);
  assert.equal(body.timeoutHeight,3352999n);assert.equal(tx.submission.sequence,'7');assert.equal(tx.submission.accountNumber,'1');
  if(process.env.STRUCTS_SUBMISSION_FIXTURE)fs.writeFileSync(process.env.STRUCTS_SUBMISSION_FIXTURE,JSON.stringify({
    release:'96cea3a322c406b46ca1feb880dc4497ebd9353f',signed_tx:tx.submission.bytes,
    account_number:tx.submission.accountNumber,timeout_height:tx.submission.timeoutHeight,
    messages:[{type_url:tx.message.typeUrl,expected:registry.lookupType(tx.message.typeUrl).toJSON(tx.toCosmosMsg(registry).value)}],
  },null,2)+'\n');
  assert.throws(()=>f.enqueue(),/existing submission/);
  assert.equal(await f.queue.cancelQueueItem(id),false);
  const reloaded=f.makeQueue();reloaded.loadPersistedState();
  assert.equal(reloaded.getTransaction(id).status,TX_STATUS.UNKNOWN);
  const wait1=reloaded.whenSettled(id),wait2=reloaded.whenSettled(id);
  f.commit(tx.submission.hash);await reloaded.reconcilePending(); // No GRASS block event is needed to recover inclusion.
  const [one,two]=await Promise.all([wait1,wait2]);
  assert.equal(one.status,TX_STATUS.SUCCEEDED);assert.equal(two.id,id);assert.equal(one.response.height,'3352999');
  assert.equal(one.response.txIndex,0);assert.equal(one.response.blockTime,'2026-10-29T00:00:00.123000000Z');
  assert.equal(f.control.sends,1);assert.equal(f.control.signs,1);
  const third=f.makeQueue();third.loadPersistedState();await f.tick(third);
  assert.equal((await third.whenSettled(id)).status,TX_STATUS.SUCCEEDED);assert.equal(f.control.sends,1);
  console.log('Accepted/reload/delayed pre-H inclusion: signed H-1 body, exact identity, block correlation, persistent terminal result and multiple waiters passed.');
}

async function failureAndUnknown(){
  for(const mode of ['reject','deliver_reject']){
    const f=await fixture();f.control.mode=mode;const id=f.enqueue();await f.tick();
    const result=await f.queue.whenSettled(id);assert.equal(result.status,TX_STATUS.DROPPED);
    assert.equal(result.response.codespace,mode==='reject'?'fixture_check':'fixture_deliver');
    const reload=f.makeQueue();reload.loadPersistedState();
    assert.equal((await reload.whenSettled(id)).response.codespace,result.response.codespace);
    await f.tick();assert.equal(f.control.sends,1);assert.equal(f.control.signs,1);
  }
  const f=await fixture();f.control.mode='throw';const id=f.enqueue();await f.tick();
  const tx=f.queue.getTransaction(id);assert.equal(tx.status,TX_STATUS.UNKNOWN);
  const snapshot=JSON.parse(f.storage.getItem(f.queue.getStorageKey()));snapshot.savedAt=1;
  snapshot.unresolved.forEach(tx=>{tx.createdAt=1;});
  f.storage.setItem(f.queue.getStorageKey(),JSON.stringify(snapshot));
  const reload=f.makeQueue();reload.loadPersistedState();f.control.height=3353000;f.control.sequence=8;await f.tick(reload);await f.tick(reload);
  assert.equal(f.control.sends,1);assert.equal(f.control.signs,1);assert.equal(reload.getTransaction(id).status,TX_STATUS.UNKNOWN);
  f.commit(tx.submission.hash);f.control.wrongBlock=true;await f.tick(reload);
  assert.equal(reload.getTransaction(id).status,TX_STATUS.UNKNOWN);
  f.control.wrongBlock=false;await f.tick(reload);assert.equal(reload.getTransaction(id).status,TX_STATUS.SUCCEEDED);
  console.log('CheckTx rejection, committed rejection, transport loss, old unresolved records and wrong-block refusal passed; retryLimit never resends.');
}

async function expiredSubmissionRecovery() {
  const f = await fixture();
  f.control.height = 3353000;
  f.state.currentBlockHeight = f.control.height;
  f.control.mode = 'throw';
  const enqueue = queue => queue.enqueueImmediate('/structs.structs.MsgPlayerSend', {
    fromAddress: account.address,
    toAddress: account.address,
    amount: [{denom: 'ualpha', amount: '1'}],
  }, {intentProtocol: CHAIN.PROTOCOL});
  const id = enqueue(f.queue);
  await f.tick();
  const tx = f.queue.getTransaction(id);
  assert.equal(tx.submission.timeoutHeight, '3353060');
  assert.equal(TxBody.decode(TxRaw.decode(submissionBytes(tx.submission)).bodyBytes).timeoutHeight, 3353060n);

  const reload = f.makeQueue();
  reload.loadPersistedState();
  f.control.height = 3353060;
  await reload.reconcilePending();
  assert.equal(reload.getTransaction(id).status, TX_STATUS.UNKNOWN, 'The expiry block still permits inclusion');
  f.control.height++;

  f.control.accountError = true;
  await reload.reconcilePending();
  assert.equal(reload.getTransaction(id).status, TX_STATUS.UNKNOWN, 'Unavailable evidence is not non-execution');
  f.control.accountError = false;
  f.control.sequence = 8;
  await reload.reconcilePending();
  assert.equal(reload.getTransaction(id).status, TX_STATUS.UNKNOWN, 'An advanced sequence could hide committed execution');
  f.control.sequence = 7;
  f.control.accountNumber = 2;
  await reload.reconcilePending();
  assert.equal(reload.getTransaction(id).status, TX_STATUS.UNKNOWN, 'A different account lifetime cannot prove absence');
  f.control.accountNumber = 1;
  await reload.reconcilePending();

  const result = await reload.whenSettled(id);
  assert.equal(result.status, TX_STATUS.DROPPED);
  assert.equal(result.response.stage, 'expired');
  assert.equal(result.response.verifiedHeight, '3353061');
  assert.equal(result.submission.hash, tx.submission.hash);
  assert.equal(result.error, 'Transaction expired without execution');
  assert.equal(f.control.sends, 1);
  assert.equal(f.control.signs, 1);
  assert.ok(enqueue(reload), 'A new explicit intent is permitted after proven non-execution');

  const settled = f.makeQueue();
  settled.loadPersistedState();
  assert.equal(settled.getTransaction(id).response.stage, 'expired', 'The expiry proof and original signed identity survive reload');

  const included = await fixture();
  const includedId = included.enqueue();
  await included.tick();
  const includedTx = included.queue.getTransaction(includedId);
  included.commit(includedTx.submission.hash);
  await included.queue.reconcilePending();
  assert.equal(included.queue.getTransaction(includedId).status, TX_STATUS.SUCCEEDED, 'Committed inclusion wins over expiry');
  console.log('Expired submission recovery passed: signed finite lifetime, expiry boundary, durable proof, missing/conflicting evidence refusal, no resend and new explicit intent.');
}

async function storageAndPrepared(){
  for(const phase of ['prepared','broadcasting']){
    const f=await fixture();const id=f.enqueue();
    f.storage.fail=(key,value)=>key.startsWith('signingJournal:') && JSON.parse(value).phase===phase;
    await f.tick();assert.equal(f.control.sends,0);assert.equal(f.queue.getTransaction(id).status,TX_STATUS.DROPPED);
  }
  {
    const f=await fixture();const id=f.enqueue();f.control.mode='reject';
    f.storage.fail=(key,value)=>key.startsWith('signingJournal:') && ['settled','unknown'].includes(JSON.parse(value).phase);
    await f.tick();assert.equal(f.control.sends,1);assert.equal(f.queue.getTransaction(id).status,TX_STATUS.UNKNOWN);
    f.storage.fail=()=>false;await f.tick();assert.equal(f.queue.getTransaction(id).status,TX_STATUS.DROPPED);
    assert.equal(f.control.sends,1);
  }
  {
    const f=await fixture();const id=f.enqueue();const tx=f.queue.getTransaction(id);
    tx.submission=await f.submission.prepare(tx);tx.status=TX_STATUS.PREPARING;f.journal.write(tx,'prepared');
    const reload=f.makeQueue();reload.loadPersistedState();assert.equal(reload.unresolved.size,0);
    f.control.mode='commit';await f.tick(reload);
    assert.equal(f.control.signs,2);assert.equal(f.control.sends,1);assert.equal(reload.getTransaction(id).status,TX_STATUS.SUCCEEDED);
  }
  {
    const f=await fixture();const id=f.enqueue();const tx=f.queue.getTransaction(id);
    tx.submission=await f.submission.prepare(tx);tx.status=TX_STATUS.UNKNOWN;f.journal.write(tx,'broadcasting');
    const reload=f.makeQueue();reload.loadPersistedState();await f.tick(reload);
    assert.equal(f.control.signs,1);assert.equal(f.control.sends,0);assert.equal(reload.getTransaction(id).status,TX_STATUS.UNKNOWN);
  }
  console.log('Persistence boundaries passed: no send without both durable writes; known prepared-only intent revalidates; send-marked crash never replays; terminal persistence can recover.');
}

async function legacyAndEpoch(){
  // Main could save a timed-out send back into a lane, or quarantine its entire
  // stale snapshot. Neither label proves that the network never received it.
  for (const version of [2, 3]) {
    for (const evidence of [{attempts: 1}, {broadcastAtBlock: 3352998}]) {
      const f = await fixture();
      const id = f.enqueue();
      const saved = JSON.parse(f.storage.getItem(f.queue.getStorageKey()));
      saved.version = version;
      Object.assign(saved.immediateQueue[0], evidence, {createdAt: 1});
      f.storage.setItem(f.queue.getStorageKey(), JSON.stringify(saved));
      const reload = f.makeQueue();
      reload.loadPersistedState();
      await f.tick(reload);
      assert.equal(reload.getTransaction(id).status, TX_STATUS.UNKNOWN,
        'A legacy retry must not become an expired unsigned intent');
      assert.equal(f.control.sends, 0);
      assert.equal(f.control.signs, 0);
      assert.throws(() => f.enqueue(reload), /existing submission/);
      assert.equal(f.journal.read()[0].phase, 'unknown');
    }
  }
  for (const kind of ['in-flight', 'retry', 'malformed']) {
    const f = await fixture();
    f.enqueue();
    const key = f.queue.getStorageKey();
    const saved = JSON.parse(f.storage.getItem(key));
    saved.version = 2;
    if (kind === 'in-flight') {
      saved.inFlight = saved.immediateQueue.shift();
      saved.inFlight.status = 'in_flight';
    } else {
      saved.immediateQueue[0].attempts = 1;
    }
    const raw = kind === 'malformed' ? '{broken' : JSON.stringify(saved);
    f.storage.setItem(key + '.corrupt', raw);
    f.storage.removeItem(key);
    const reload = f.makeQueue();
    reload.loadPersistedState();
    await f.tick(reload);
    assert.ok(reload.recoveryError, 'Ambiguous quarantine must block signing');
    assert.equal(f.storage.getItem(key + '.corrupt'), raw);
    assert.equal(f.storage.getItem(key), null, 'Do not overwrite the absent active snapshot');
    assert.equal(f.control.sends, 0);
    assert.equal(f.control.signs, 0);
    assert.throws(() => f.enqueue(reload), /existing submission/);
  }
  {
    const f = await fixture();
    f.enqueue();
    const key = f.queue.getStorageKey();
    const saved = JSON.parse(f.storage.getItem(key));
    saved.version = 2;
    saved.immediateQueue[0].createdAt = 1;
    const raw = JSON.stringify(saved);
    f.storage.setItem(key + '.corrupt', raw);
    f.storage.removeItem(key);
    const reload = f.makeQueue();
    reload.loadPersistedState();
    assert.equal(reload.recoveryError, null, 'An old unsent quarantine is not a broadcast');
    assert.equal(reload.immediateQueue.length, 0, 'Do not replay abandoned unsigned work');
    assert.equal(f.storage.getItem(key + '.corrupt'), raw);
    assert.equal(f.control.sends, 0);
    assert.equal(f.control.signs, 0);
  }
  {
    const f=await fixture();const id=f.enqueue();const saved=JSON.parse(f.storage.getItem(f.queue.getStorageKey()));
    saved.version=2;saved.savedAt=1;saved.inFlight=JSON.parse(JSON.stringify(saved.immediateQueue[0]));saved.inFlight.status='in_flight';
    saved.inFlight.message.typeUrl='/structs.structs.RemovedMessage';saved.inFlight.createdAt=1;
    f.storage.setItem(f.queue.getStorageKey(),JSON.stringify(saved));
    const reload=f.makeQueue();reload.loadPersistedState();await f.tick(reload);
    assert.equal(reload.getTransaction(id).status,TX_STATUS.UNKNOWN);assert.equal(f.control.sends,0);assert.equal(f.control.signs,0);
    assert.equal(f.journal.read()[0].phase,'unknown');assert.throws(()=>f.enqueue(reload),/existing submission/);
  }
  for(const raw of ['{broken',JSON.stringify({version:999,immediateQueue:[],actionQueue:[]})]){
    const f=await fixture();f.storage.setItem(f.queue.getStorageKey(),raw);
    const reload=f.makeQueue();reload.loadPersistedState();await f.tick(reload);
    assert.ok(reload.recoveryError);assert.equal(f.storage.getItem(f.queue.getStorageKey()),raw);assert.equal(f.control.sends,0);
  }
  {
    const f=await fixture();const id=f.enqueue();f.control.height=3353000;await f.tick();
    assert.equal(f.queue.getTransaction(id).status,TX_STATUS.QUEUED);assert.equal(f.control.signs,0);assert.equal(f.control.sends,0);
  }
  {
    const f=await fixture();const id=f.enqueue();f.control.mode='throw';await f.tick();
    const record=f.journal.read()[0];record.transaction.submission.hash='A'.repeat(64);
    f.storage.setItem(f.journal.prefix+id,JSON.stringify(record));
    const reload=f.makeQueue();reload.loadPersistedState();await f.tick(reload);
    assert.equal(f.control.sends,1);assert.equal(reload.getTransaction(id).status,TX_STATUS.UNKNOWN);
  }
  console.log('Legacy unknown/no-codec records, stale evidence, corrupt/versioned stores, tampered bytes and old intents after H remain protected.');
}

async function overlappingTabs(){
  const f=await fixture();const id=f.enqueue();const second=f.makeQueue();second.loadPersistedState();
  const gate=deferred();f.control.signGate=gate;
  const running=f.tick();
  while(f.control.signs===0)await new Promise(resolve=>setTimeout(resolve,0));
  await f.tick(second);assert.equal(f.control.signs,1);assert.equal(f.control.sends,0);
  gate.resolve();await running;assert.equal(f.control.sends,1);
  await f.tick(second);assert.equal(f.control.signs,1);assert.equal(f.control.sends,1);
  const tx=f.queue.getTransaction(id);f.commit(tx.submission.hash);await f.tick(second);await f.tick();
  assert.equal(f.control.sends,1);assert.equal(f.queue.getTransaction(id).status,TX_STATUS.SUCCEEDED);
  const unsupported=await fixture();unsupported.enqueue();Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
  await unsupported.tick();assert.equal(unsupported.control.signs,0);assert.equal(unsupported.control.sends,0);
  console.log('Shared account lock and journal prevent overlapping-tab replay; unavailable exclusive storage never signs.');
}

async function malformedWalletAndRetention(){
  {
    const f=await fixture();const sign=f.state.signingClient.sign.bind(f.state.signingClient);
    f.state.signingClient.sign=async(...args)=>{const raw=await sign(...args);raw.signatures[0][0]^=1;return raw;};
    const id=f.enqueue();await f.tick();assert.equal(f.control.sends,0);assert.equal(f.queue.getTransaction(id).status,TX_STATUS.DROPPED);
  }
  {
    const f=await fixture();const id=f.enqueue();const tx=f.queue.getTransaction(id);
    // More than the history target in one unsent-intent lifetime must retain
    // all tombstones: another tab may still have one of these old queue entries.
    tx.status=TX_STATUS.DROPPED;
    for(let i=0;i<105;i++)f.journal.write(SigningTransaction.fromJSON({...tx.toJSON(),id:`history-${i}`}),'settled');
    assert.equal(f.journal.read().length,105);
    const pending=SigningTransaction.fromJSON({...tx.toJSON(),id:'old-unknown',status:TX_STATUS.UNKNOWN,createdAt:1});
    f.journal.write(pending,'unknown');
    const old=f.journal.read().find(record=>record.transaction.id==='history-0');old.updatedAt=1;
    f.storage.setItem(f.journal.prefix+'history-0',JSON.stringify(old));
    f.journal.write(SigningTransaction.fromJSON({...tx.toJSON(),id:'new-completed'}),'settled');
    assert.ok(f.journal.read().some(record=>record.transaction.id==='old-unknown'));
    assert.ok(!f.journal.read().some(record=>record.transaction.id==='history-0'));
  }
  console.log('Malformed wallet signatures cannot send; recent terminal tombstones and old unknown evidence survive history pruning.');
}

async function actualDeadlines(){
  const signingTimeout=SIGNING_QUEUE.BROADCAST_TIMEOUT_MS,networkTimeout=SIGNING_QUEUE.RECONCILE_TIMEOUT_MS;
  try{
    SIGNING_QUEUE.BROADCAST_TIMEOUT_MS=25;
    const f=await fixture();const gate=deferred();f.control.signGate=gate;const id=f.enqueue();
    await f.tick();assert.equal(f.queue.getTransaction(id).status,TX_STATUS.DROPPED);assert.equal(f.control.sends,0);
    gate.resolve();await new Promise(resolve=>setTimeout(resolve,30));assert.equal(f.control.sends,0);
    SIGNING_QUEUE.BROADCAST_TIMEOUT_MS=signingTimeout;
    SIGNING_QUEUE.RECONCILE_TIMEOUT_MS=25;
    const uncertain=await fixture();const unknownId=uncertain.enqueue();
    uncertain.manager.chainQuery.cometClient.broadcastTxSync=async({tx})=>{
      uncertain.control.sends++;uncertain.control.bytes.set(transactionHash(tx),tx);return new Promise(()=>{});
    };
    await uncertain.tick();assert.equal(uncertain.queue.getTransaction(unknownId).status,TX_STATUS.UNKNOWN);
    const reload=uncertain.makeQueue();reload.loadPersistedState();await uncertain.tick(reload);
    assert.equal(uncertain.control.sends,1);assert.equal(uncertain.control.signs,1);
  }finally{
    SIGNING_QUEUE.BROADCAST_TIMEOUT_MS=signingTimeout;SIGNING_QUEUE.RECONCILE_TIMEOUT_MS=networkTimeout;
  }
  console.log('Actual promise deadlines passed: late wallet signatures never send; network timeout and reload never replace a submission.');
}

async function logoutRecovery(){
  {
    const f=await fixture();const id=f.enqueue();await f.tick();const hash=f.queue.getTransaction(id).submission.hash;
    f.storage.setItem('gameState',JSON.stringify({mnemonic:'fixture secret'}));f.storage.setItem('getStructTypes','cache');
    TransactionJournal.clearSession();
    assert.equal(f.storage.getItem('gameState'),null);assert.equal(f.storage.getItem('getStructTypes'),null);
    assert.equal(f.journal.read()[0].phase,'accepted');assert.ok(f.storage.getItem(f.queue.getStorageKey()));
    const reload=f.makeQueue();reload.loadPersistedState();f.commit(hash);await reload.reconcilePending();
    assert.equal(reload.getTransaction(id).status,TX_STATUS.SUCCEEDED);assert.equal(f.control.sends,1);
  }
  {
    const f=await fixture();const id=f.enqueue();TransactionJournal.clearSession();
    const reload=f.makeQueue();reload.loadPersistedState();await f.tick(reload);
    assert.equal(reload.getTransaction(id).status,TX_STATUS.DROPPED);assert.equal(f.control.signs,0);assert.equal(f.control.sends,0);
  }
  {
    const f=await fixture();const gate=deferred();f.control.signGate=gate;const id=f.enqueue();const signing=f.tick();
    while(f.control.signs===0)await new Promise(resolve=>setTimeout(resolve,0));
    f.queue.suspended=true;TransactionJournal.clearSession();gate.resolve();await signing;
    assert.equal(f.control.sends,0);assert.equal(f.queue.getTransaction(id).status,TX_STATUS.DROPPED);
  }
  console.log('Logout removes wallet/cache data, retains unresolved evidence, cancels old unsigned intents and prevents late wallet output from sending.');
}

async function liveRecovery(){
  if(!process.env.STRUCTS_RECOVERY_FIXTURE)return;
  const existing=JSON.parse(fs.readFileSync(process.env.STRUCTS_RECOVERY_FIXTURE,'utf8'));
  const rpc=new OwnedRpcClient('ws://127.0.0.1:26657');
  const query=new ChainQueryClient(await Comet38Client.create(rpc));
  try{
    const result=await new SigningSubmission({chainQuery:query}).find({submission:existing});
    assert.equal(result.transactionHash,existing.hash);assert.equal(result.height,existing.height);assert.equal(result.stage,'committed');
    console.log('Read-only recovery of existing public transaction passed:',JSON.stringify(result));
  }finally{query.disconnect();}
}

async function accountHandoff(){
  const replacement={address:'replacement-device',pubkey:new Uint8Array([2])};
  {
    const f=await fixture();const id=f.enqueue();await f.tick();
    const hash=f.queue.getTransaction(id).submission.hash, oldKey=f.queue.getStorageKey();
    const observer=assert.rejects(f.queue.whenSettled(id),/Signing account changed/);
    const {AuthManager}=require('../../src/js/managers/AuthManager');
    const auth=Object.create(AuthManager.prototype);auth.gameState=f.state;
    auth.walletManager={createWallet:async()=>({getAccountsWithPrivkeys:async()=>[replacement]}),bytesToHex:()=> '02'};
    let stopped=0;
    auth.signingClientManager={queue:f.queue,stopForLogout(){stopped++;f.queue.suspended=true;f.state.signingClient=null;}};
    await auth.initWallet('public fixture replacement');await observer;
    assert.equal(stopped,1);assert.equal(f.state.signingAccount.address,replacement.address);
    f.queue.loadPersistedState();f.queue.suspended=false;
    assert.equal(f.queue.getTransaction(id),null,'old evidence is not attached to the new account');
    const next=f.queue.enqueueImmediate('/structs.structs.MsgPlayerSend',
      {fromAddress:replacement.address,toAddress:account.address,amount:[{denom:'ualpha',amount:'1'}]});
    assert.equal(f.queue.getTransaction(next).accountAddress,replacement.address,'new device can enqueue without reload');
    assert.equal(JSON.parse(f.storage.getItem(oldKey)).unresolved[0].id,id);
    assert.equal(f.journal.read()[0].transaction.submission.hash,hash);
    await f.queue.releaseAccount();f.state.signingAccount=account;
    f.state.signingClient={};f.queue.loadPersistedState();f.queue.suspended=false;
    f.commit(hash);await f.queue.reconcilePending();
    assert.equal(f.queue.getTransaction(id).status,TX_STATUS.SUCCEEDED);
    assert.equal(f.control.sends,1,'returning to the previous account only reconciles its original send');
    assert.equal(f.queue.getTransaction(next),null);
  }
  {
    const f=await fixture();const gate=deferred();f.control.signGate=gate;f.enqueue();
    const signing=f.tick();while(f.control.signs===0)await new Promise(resolve=>setImmediate(resolve));
    let released=false;const handoff=f.queue.releaseAccount().then(()=>{released=true;});
    await new Promise(resolve=>setImmediate(resolve));assert.equal(released,false);
    gate.resolve();await Promise.all([signing,handoff]);
    assert.equal(f.control.sends,0,'late old-wallet signatures cannot send during handoff');
    assert.equal(f.journal.read()[0].phase,'settled');
  }
  {
    const f=await fixture();const id=f.enqueue();const key=f.queue.getStorageKey();
    f.storage.fail=k=>k===key;
    await assert.rejects(f.queue.releaseAccount(),/could not be saved/);
    assert.equal(f.queue.getTransaction(id).id,id,'failed persistence does not detach the old queue');
    assert.equal(f.queue.suspended,true);
    f.storage.fail=()=>false;await f.queue.releaseAccount();
    f.queue.loadPersistedState();assert.equal(f.queue.getTransaction(id).status,TX_STATUS.QUEUED);
  }
  console.log('Account handoff preserves scoped evidence, drains in-flight work and enables the new device without reload.');
}

async function main(){
  wallet=await DirectSecp256k1HdWallet.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',{prefix:'structs'});
  [account]=await wallet.getAccounts();registry=new Registry([...defaultRegistryTypes,...msgTypes]);
  await acceptedReload();await failureAndUnknown();await expiredSubmissionRecovery();await storageAndPrepared();await legacyAndEpoch();await overlappingTabs();
  await malformedWalletAndRetention();await actualDeadlines();await logoutRecovery();await accountHandoff();await liveRecovery();
  console.log('Durable signing suite passed. Submission responses are fixtures; optional live recovery is read-only. No transaction broadcast to a chain.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
