import assert from 'node:assert/strict';
import {sha256} from 'js-sha256';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {TaskManager} from '../../src/js/managers/TaskManager';
import {TaskStateFactory} from '../../src/js/factories/TaskStateFactory';
import {TaskProcess} from '../../src/js/models/TaskProcess';
import {TX_STATUS} from '../../src/js/models/SigningTransaction';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {signedSubmission} from '../../src/js/util/SignedSubmission';
import {workMessageIdentity, workSubmissionMatches, workSubmissionCommit} from '../../src/js/util/WorkSubmission';
import {TEST_MNEMONIC} from './helpers';

let actor,registry,offline;
const factory=new TaskStateFactory(),height=3353000;
function state(type='BUILD',anchor=height-10,rules=height) {
  const result=type==='RAID' ? factory.initRaidTask('9-1','2-1',anchor,'2') : factory.initStructTask('5-1',type,anchor,'2');
  result.rules_height=String(rules);result.setBlockCheckpoint(height+20);
  return result;
}
function finish(work) {
  for(let nonce=0;;nonce++) {
    const message=work.prefix+nonce,hash=sha256(message);
    if(hash.startsWith('0')) {work.setResult(String(nonce),message,hash,1);return work;}
  }
}
function fixture() {
  const values=new Map(),control={signed:0,sent:0,lost:false,found:false,code:0,quota:false};
  globalThis.localStorage={get length(){return values.size;},key:i=>[...values.keys()][i]??null,
    getItem:k=>values.get(k)??null,setItem:(k,v)=>{if(control.quota)throw new Error('Quota exceeded');values.set(k,v);},removeItem:k=>values.delete(k)};
  globalThis.window=new EventTarget();globalThis.setInterval=()=>0;
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(name,options,run)=>run({name})}}});
  const game={currentBlockHeight:height,signingAccount:actor,signingClient:offline,keyPlayers:{player:{id:'1-1'}},isSessionCurrent:()=>true};
  const submission={prepare:async tx=>{
    control.signed++;
    const messages=[{typeUrl:tx.intent.typeUrl,value:{...tx.intent.payload,creator:actor.address}}];
    const fee={gas:'20000000',amount:[{denom:'ualpha',amount:'0'}]};
    const raw=await offline.sign(actor.address,messages,fee,'',{chainId:CHAIN.ID,accountNumber:1,sequence:control.signed});
    return signedSubmission(raw,{messages,registry,fee,accountAddress:actor.address,accountNumber:1,sequence:control.signed,
      context:{chainId:CHAIN.ID,protocol:CHAIN.PROTOCOL,observedHeight:String(game.currentBlockHeight),timeoutHeight:'0'}});
  },assertSendable:()=>{},send:async tx=>{
    control.sent++;if(control.lost)throw new Error('Reply lost');
    return {stage:'check_tx',code:control.code,transactionHash:tx.submission.hash,chainId:CHAIN.ID,height:String(game.currentBlockHeight)};
  },find:async tx=>control.found ? {stage:'committed',code:control.code,chainId:CHAIN.ID,
    transactionHash:tx.submission.hash,blockHash:'A'.repeat(64),height:String(game.currentBlockHeight)} : null};
  const create=()=>{
    const signing={registry,queue:new SigningQueueManager(game,{registry,wsUrl:'ws://proof-fixture',submission})};
    const tasks=new TaskManager(game,{},signing,factory);
    return {signing,tasks};
  };
  return {control,game,create,...create()};
}
function candidate(f,work=finish(state())) {f.tasks.processes[work.getPID()]=new TaskProcess(work);return work;}
const tick=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};

async function identityTests() {
  for(const type of ['BUILD','MINE','REFINE','RAID']) {
    const f=fixture(),work=candidate(f,finish(state(type)));
    f.tasks.submitCompletedProof(work);const tx=f.signing.queue.findWorkSubmission(work);
    assert.ok(tx);assert.equal(workSubmissionMatches(tx,work,registry),true);
    assert.equal(workSubmissionMatches(tx,state(type,height-9),registry),false);
    if(type==='RAID'){const other=state(type);other.target_id='2-2';assert.equal(workSubmissionMatches(tx,other,registry),false);}
    await f.signing.queue.transactOnBlock();assert.equal(tx.status,TX_STATUS.UNKNOWN);
    const signed=JSON.parse(JSON.stringify(tx));signed.intent.payload.proof='f'.repeat(64);
    assert.equal(workSubmissionMatches(signed,work,registry),true,'Signed bytes outrank mutable saved intent');
    signed.submission.hash='B'.repeat(64);assert.throws(()=>workSubmissionMatches(signed,work,registry),/hash mismatch/);
    f.tasks.closeSession();await tick();
  }
  const f=fixture(),bad=state();bad.prefix='changed';candidate(f,finish(bad));f.tasks.submitCompletedProof(bad);
  assert.equal(f.signing.queue.immediateQueue.length,0,'Worker prefix cannot redefine proof identity');
  assert.ok(f.tasks.processes[bad.getPID()]);f.tasks.closeSession();
  console.log('All four proof identities bind the original anchor/target, signed bytes and creator.');
}
async function recoveryTests() {
  const f=fixture(),work=candidate(f);f.control.lost=true;
  f.tasks.submitCompletedProof(work);f.tasks.submitCompletedProof(work);
  assert.equal(f.signing.queue.immediateQueue.length,1);assert.equal(f.tasks.proofObservers.size,1);
  const tx=f.signing.queue.findWorkSubmission(work);await f.signing.queue.transactOnBlock();
  assert.equal(tx.status,TX_STATUS.UNKNOWN);const originalBytes=tx.submission.bytes;
  f.tasks.closeSession();await tick();
  const reload=f.create();reload.signing.queue.loadPersistedState();reload.tasks.spawn(state());
  assert.equal(Object.keys(reload.tasks.processes).length,0,'A pending proof owns the work after reload');
  assert.equal(reload.tasks.proofObservers.size,1);
  await reload.signing.queue.transactOnBlock();await reload.signing.queue.transactOnBlock();
  assert.equal(f.control.signed,1);assert.equal(f.control.sent,1);
  assert.equal(reload.signing.queue.findWorkSubmission(work).submission.bytes,originalBytes);
  f.game.currentBlockHeight++;f.control.found=true;
  await reload.signing.queue.transactOnBlock();await tick();
  const committed=reload.signing.queue.findWorkSubmission(work);
  assert.equal(committed.status,TX_STATUS.SUCCEEDED);assert.equal(workSubmissionCommit(committed,work,registry),String(height+1));
  assert.equal(reload.tasks.workHeightFloor,BigInt(height+1));
  reload.tasks.spawn(state());assert.equal(Object.keys(reload.tasks.processes).length,0,'Stale work cannot rehash a committed completion');
  const bad={...committed,response:{...committed.response,transactionHash:'B'.repeat(64)}};
  assert.throws(()=>workSubmissionCommit(bad,work,registry),/committed evidence/);
  reload.tasks.closeSession();await tick();
  console.log('Double completion, lost reply, reload and delayed inclusion preserve one signed transaction.');
}
async function retryTests() {
  const f=fixture(),work=candidate(f);f.control.code=7;
  f.tasks.submitCompletedProof(work);await f.signing.queue.transactOnBlock();await tick();
  assert.equal(f.signing.queue.findWorkSubmission(work).status,TX_STATUS.DROPPED);
  assert.equal(Object.keys(f.tasks.processes).length,0);assert.equal(f.tasks.workHeightFloor,BigInt(height+1));
  f.tasks.spawn(state());assert.equal(Object.keys(f.tasks.processes).length,0,'Same indexed snapshot cannot retry a rejected proof');
  f.game.currentBlockHeight++;f.tasks.spawn(state('BUILD',height-10,height+1));
  assert.equal(Object.keys(f.tasks.processes).length,1,'A newer ready snapshot can restart work');
  const next=f.tasks.processes['5-1'].state;finish(next);f.control.code=0;f.control.found=true;
  f.tasks.submitCompletedProof(next);await f.signing.queue.transactOnBlock();await tick();
  assert.equal(f.control.signed,2);assert.equal(f.control.sent,2);assert.equal(f.signing.queue.findWorkSubmission(next).status,TX_STATUS.SUCCEEDED);
  f.tasks.closeSession();

  const quota=fixture(),held=candidate(quota);quota.control.quota=true;quota.tasks.submitCompletedProof(held);
  assert.equal(quota.signing.queue.immediateQueue.length,0);assert.equal(quota.tasks.processes['5-1'].state,held);
  quota.control.quota=false;quota.tasks.retryCompletedProofs();assert.equal(quota.signing.queue.immediateQueue.length,1);
  quota.tasks.closeSession();await tick();

  const pressure=fixture(),older=candidate(pressure);pressure.control.lost=true;
  pressure.tasks.submitCompletedProof(older);await pressure.signing.queue.transactOnBlock();
  const newer=finish(state('BUILD',height-5,height));pressure.tasks.spawn(newer);
  pressure.tasks.submitCompletedProof(newer);assert.equal(pressure.signing.queue.immediateQueue.length,0);
  assert.equal(pressure.tasks.processes['5-1'].state,newer,'A new candidate waits behind uncertain account evidence');
  pressure.control.found=true;pressure.game.currentBlockHeight++;await pressure.signing.queue.transactOnBlock();await tick();
  assert.equal(pressure.tasks.processes['5-1'].state,newer,'Settling old work cannot remove a newer anchor');
  pressure.tasks.retryCompletedProofs();assert.equal(pressure.signing.queue.immediateQueue.length,1);
  pressure.tasks.closeSession();await tick();
  console.log('Definitive failures require newer work; quota/unknown pressure retains candidates without duplicate sends.');
}
async function logoutTests() {
  const f=fixture(),work=candidate(f);f.tasks.submitCompletedProof(work);await f.signing.queue.transactOnBlock();
  assert.equal(f.signing.queue.settlementWaiters.size,1);f.tasks.closeSession();await tick();
  assert.equal(f.signing.queue.settlementWaiters.size,0);f.control.found=true;f.game.currentBlockHeight++;
  await f.signing.queue.transactOnBlock();await tick();
  assert.equal(f.tasks.workHeightFloor,0n);assert.equal(f.tasks.proofRetryNeeded,false);
  f.tasks.submitCompletedProof(work);assert.equal(f.signing.queue.immediateQueue.length,0,'A closed task cannot enqueue a late completion');
  console.log('Logout cancels task observers without deleting signed recovery evidence.');
}
async function removalTests() {
  const f=fixture(),work=candidate(f);f.tasks.submitCompletedProof(work);await f.signing.queue.transactOnBlock();
  const tx=f.signing.queue.findWorkSubmission(work);
  f.tasks.isWorkCurrent=()=>true;
  f.tasks.fetchWork=async()=>[];
  f.tasks.isPlayerPlanetRaided=()=>false;
  await f.tasks.fetchAndSpawnOutstandingWork();
  assert.equal(Object.keys(f.tasks.processes).length,0,'Authoritative empty work removes a completed candidate outside the task lanes');
  assert.equal(f.signing.queue.findWorkSubmission(work).id,tx.id,'Removing work preserves its durable transaction');
  f.tasks.closeSession();await tick();
  console.log('Authoritative work removal stops completed candidates without erasing queued or signed records.');
}
(async()=>{
  const wallet=await DirectSecp256k1HdWallet.fromMnemonic(TEST_MNEMONIC,{prefix:'structs'});
  [actor]=await wallet.getAccounts();registry=new Registry([...defaultRegistryTypes,...msgTypes]);
  offline=await SigningStargateClient.offline(wallet,{registry});
  await identityTests();await recoveryTests();await retryTests();await logoutTests();await removalTests();
})().then(()=>{process.exitCode=0;},error=>{console.error(error);process.exitCode=1;});
