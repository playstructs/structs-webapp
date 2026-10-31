import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {sha256} from 'js-sha256';
import {integerWorkDifficulty, workDifficultyAtHeight, workUint64} from '../../src/js/util/WorkDifficulty';
import {TaskStateFactory} from '../../src/js/factories/TaskStateFactory';
import {TaskProcess} from '../../src/js/models/TaskProcess';
import {TASK} from '../../src/js/constants/TaskConstants';
import {TASK_STATUS} from '../../src/js/constants/TaskStatus';
import {TASK_TYPES} from '../../src/js/constants/TaskTypes';
import {EVENTS} from '../../src/js/constants/Events';

// Fixed consensus vectors from structsd v0.22.0 (96cea3a), work_difficulty_test.go.
const vectors = [[0,25,64],[1,25,64],[5,0,64],[5,1,64],[2,25,51],[5,25,33],
  [12,25,16],[24,25,2],[25,25,1],[26,25,1],[100000,25,1],[3,27,43],
  [5,125,43],[25,125,22],[3,2187,55],[243,2187,19],[25,15625,43],[625,15625,22],
  [5,1953125,57],[78125,1953125,15],[2,1953125,61],[1000000,1953125,4]];
for (const [age,range,want] of vectors) assert.equal(integerWorkDifficulty(age,range),want,`${age}/${range}`);
assert.equal(integerWorkDifficulty('9007199254740992','9007199254740993'),2);
assert.equal(integerWorkDifficulty('18446744073709551614','18446744073709551615'),2);
assert.equal(integerWorkDifficulty('18446744073709551615','18446744073709551615'),1);
for (const invalid of [null,undefined,-1,1.5,Number.MAX_SAFE_INTEGER+1,'01','1e3','-1','18446744073709551616']) {
  assert.throws(()=>workUint64(invalid));
}
assert.equal(workDifficultyAtHeight('3352997','27','3353000'),43);
assert.equal(workDifficultyAtHeight('1','18446744073709551615','18446744073709551615'),2);
assert.equal(workDifficultyAtHeight('3353001','25','3353000'),64);

const factory = new TaskStateFactory();
function task(range='25', height='3353001') {
  const state = factory.initStructTask('5-1',TASK_TYPES.BUILD,'3353000',range);
  state.nonce_start=0;state.nonce_current=0;
  state.setBlockCheckpoint(height);
  return state;
}
const state = task();
state.block_checkpoint_time = new Date(0);
assert.equal(state.getCurrentDifficulty(),64,'elapsed wall time cannot advance proof eligibility');
state.setBlockCheckpoint('3353025');
let nonce=0, hash;
do {hash=sha256(state.getMessage(++nonce));} while(!hash.startsWith('0') && nonce<10000);
assert.ok(hash.startsWith('0'));
state.setResult(nonce,state.getMessage(nonce),hash,64);
assert.equal(state.checkResultHashDifficulty(),true);
assert.equal(state.result_difficulty,hash.match(/^0*/)[0].length,'ignore asserted difficulty');
state.result_nonce+='tampered';
assert.equal(state.checkResultHashDifficulty(),false,'proof must match its exact input');
state.result_nonce=String(nonce);
state.result_hash='0'.repeat(64);
assert.equal(state.checkResultHashDifficulty(),false,'an invented zero hash is not a proof');
state.setBlockCheckpoint('3353001');
assert.equal(state.block_checkpoint,'3353025','late blocks cannot move observation backwards');

// Run the actual production worker bundle with a deterministic message queue. A batch
// returns control to this host before the next message; an infinite loop fails.
const source=fs.readFileSync(process.env.STRUCTS_WORKER_TEST_BUNDLE,'utf8');
function workerHarness() {
  const messages=[], timers=new Map();let timerId=0;
  const context={onmessage:null,console,Date,TextEncoder,TextDecoder,
    postMessage(value){messages.push(structuredClone(value));},
    setTimeout(fn){timers.set(++timerId,fn);return timerId;},
    clearTimeout(id){timers.delete(id);}};
  context.MessageChannel = class {
    constructor() {
      this.port1 = {onmessage:null};
      this.port2 = {postMessage:() => timers.set(++timerId, () => this.port1.onmessage({data:null}))};
    }
  };
  context.self=context;
  vm.createContext(context);
  vm.runInContext(source,context,{timeout:1000});
  return {messages,timers,
    send(kind,state,revision,version=TASK.WORKER_VERSION){context.onmessage({data:{version,revision,kind,state:structuredClone(state)}});},
    step(){const [id,fn]=timers.entries().next().value??[];assert.ok(fn,'scheduled batch');timers.delete(id);fn();}};
}
{
  const h=workerHarness(), s=task();s.status=TASK_STATUS.STARTING;
  h.send('start',s,1);h.step();
  assert.equal(h.messages.at(-1).state.status,TASK_STATUS.WAITING);
  assert.equal(h.timers.size,0,'waiting requires observed height, not a wall-clock timer');
  s.setBlockCheckpoint('3353025');h.send('update',s,2);h.step();
  const result=factory.make(h.messages.at(-1).state);
  assert.equal(result.status,TASK_STATUS.COMPLETED);
  assert.equal(result.checkResultHashDifficulty(),true);
  assert.equal(result.block_start,'3353000');
  const count=h.messages.length;
  h.send('update',s,1);h.send('update',s,3,'old-worker');
  assert.equal(h.messages.length,count,'obsolete protocol/revision is refused');
  // A harder range at the same anchor invalidates the candidate without losing it.
  s.difficulty_target='1953125';h.send('update',s,3);h.step();
  assert.equal(h.messages.at(-1).state.status,TASK_STATUS.WAITING);
  assert.equal(h.messages.at(-1).state.result_hash,result.result_hash);
  s.difficulty_target='25';h.send('update',s,4);h.step();
  assert.equal(h.messages.at(-1).state.status,TASK_STATUS.COMPLETED);
  assert.equal(h.messages.at(-1).state.result_hash,result.result_hash);
}
{
  const h=workerHarness(), s=task('1953125');s.status=TASK_STATUS.RUNNING;
  h.send('start',s,1);h.step();
  assert.equal(h.timers.size,1,'forced high-difficulty hashing yields for control messages');
  s.setBlockCheckpoint('3353002');h.send('update',s,2);
  assert.equal(h.messages.at(-1).state.iterations,TASK.HASH_BATCH_SIZE);
  assert.equal(h.messages.at(-1).state.nonce_current,TASK.HASH_BATCH_SIZE);
  assert.equal(h.messages.at(-1).revision,2);
  s.difficulty_target='2';h.send('update',s,3);h.step();
  const result=factory.make(h.messages.at(-1).state);
  assert.equal(result.checkResultHashDifficulty(),true);
  assert.ok(result.nonce_current>TASK.HASH_BATCH_SIZE,'range update continues existing nonce search');
}
{
  const h=workerHarness(), s=task('27','3352999');
  s.block_start='3352997';s.prefix='5-1BUILD3352997NONCE';s.status=TASK_STATUS.STARTING;
  h.send('start',s,1);h.step();s.setBlockCheckpoint('3353000');h.send('update',s,2);h.step();
  const current=factory.make(h.messages.at(-1).state);
  assert.equal(current.getCurrentDifficulty(),43);
  assert.equal(current.block_start,'3352997','crossing H preserves the original work anchor');
}

// Host-side worker generations/revisions keep a late worker from completing a replacement.
globalThis.window=new EventTarget();
globalThis.CustomEvent=class extends Event {constructor(name){super(name);}};
const workers=[];
globalThis.Worker=class {
  constructor(url){this.url=url;this.messages=[];workers.push(this);}
  postMessage(value){this.messages.push(structuredClone(value));}
  terminate(){this.terminated=true;}
};
let received=0;
window.addEventListener(EVENTS.TASK_WORKER_CHANGED,()=>received++);
const taskProcess = new TaskProcess(task('25','3353025'));
taskProcess.start();const first=workers.at(-1), firstRequest=first.messages.at(-1);
assert.match(String(first.url),/workers\/TaskWorker.*\.js$/);
const reply=(worker,request,state=request.state)=>worker.onmessage({data:{version:TASK.WORKER_VERSION,revision:request.revision,state}});
taskProcess.setBlockCheckpoint('3353026');
reply(first,firstRequest);assert.equal(received,0);
reply(first,first.messages.at(-1));assert.equal(received,1);
taskProcess.state.nonce_current=456;
const changed=task('125','3353026');taskProcess.replaceState(changed);
assert.equal(taskProcess.state.nonce_current,456);
assert.equal(taskProcess.state.block_start,'3353000');
assert.equal(first.terminated,undefined,'same-work range change updates the worker in place');
changed.rules_height='3353026';taskProcess.replaceState(changed);
const delayed=task('1953125','3353026');delayed.rules_height='3353000';
taskProcess.replaceState(delayed);
assert.equal(taskProcess.state.difficulty_target,'125','older snapshot cannot replace a newer rule');
delayed.rules_height=null;taskProcess.replaceState(delayed);
assert.equal(taskProcess.state.difficulty_target,'125','unversioned hint cannot replace a versioned rule');
const oldAnchor=factory.initStructTask('5-1',TASK_TYPES.BUILD,'3352999','25');oldAnchor.setBlockCheckpoint('3353026');
taskProcess.replaceState(oldAnchor);
assert.equal(taskProcess.state.block_start,'3353000','late work response cannot restore an older anchor');
taskProcess.pause(300,0);reply(first,first.messages.at(-1));assert.equal(received,1);
taskProcess.start();const second=workers.at(-1);
reply(first,first.messages.at(-1));assert.equal(received,1);
reply(second,second.messages.at(-1));assert.equal(received,2);
const moved=factory.initStructTask('5-1',TASK_TYPES.BUILD,'3353020','25');moved.setBlockCheckpoint('3353026');
taskProcess.state.status=TASK_STATUS.WAITING;taskProcess.replaceState(moved);
assert.equal(second.terminated,true,'changed anchor replaces even a waiting worker');
assert.equal(taskProcess.state.block_start,'3353020');
const incompatible=workers.at(-1);
incompatible.onmessage({data:[taskProcess.state]});
assert.equal(incompatible.terminated,true,'old cached worker fails closed');
assert.equal(taskProcess.state.status,TASK_STATUS.TERMINATED);

// Exercise the existing ore reconciliation cases under the exact-string contract.
globalThis.setInterval=()=>0;
const {TaskManagerOreTest}=require('../../src/js/tests/TaskManagerOreTest');
const {DTest}=require('../../src/js/framework/DTestFramework');
const suite=new TaskManagerOreTest();
for(const value of Object.values(suite)) if(value instanceof DTest) {
  globalThis.window=new EventTarget();
  assert.equal(value.run(),true,value.testName);
}
const tm=TaskManagerOreTest.makeTaskManager();
TaskManagerOreTest.givenRunningTask(tm,'5-1',TASK_TYPES.MINE,900);
tm.syncOreTasks(TASK_TYPES.MINE,[{...TaskManagerOreTest.makeWork('5-1',TASK_TYPES.MINE,900),difficulty_target:'125'}]);
assert.equal(tm.spawned.length,1,'same anchor with changed difficulty reaches the process');
assert.equal(tm.spawned[0].block_start,'900');
console.log('Work consensus vectors, actual worker control loop, proof validation, host generation guards and ore reconciliation passed.');

async function workAPI() {
  const {GuildAPI}=require('../../src/js/api/GuildAPI');
  const api=new GuildAPI(), meta={height:'3353000',indexed_height:'3353000',observed_tip:'3353000',
    chain_id:'structstestnet-111',activation_height:'3353000',protocol:'v0.22.0',observed_protocol:'v0.22.0',
    api_contract:'structs-api-v022-1',cache_epoch:'structs-api-v022-1:v0.22.0',inventory_authority:'current-claims-v1',
    data_ready:true,transaction_ready:true,required_models:['work'],models:{work:{height:'3353000',ready:true}}};
  let rows=[];
  api.ajax={get:async()=>({success:true,errors:[],data:rows,meta})};
  const empty=await api.getWorkByPlayerId('1-1');
  assert.equal(empty.length,0);assert.equal(empty.snapshot_meta,meta);
  rows=[{object_id:'5-1',player_id:'1-1',category:TASK_TYPES.BUILD,block_start:'9007199254740993',difficulty_target:'18446744073709551615'}];
  const work=await api.getWorkByPlayerId('1-1');
  assert.equal(work[0].snapshot_meta,meta);
  assert.equal(factory.initTaskFromWork(work[0]).block_start,'9007199254740993');
  assert.equal(factory.initTaskFromWork(work[0]).difficulty_target,'18446744073709551615');
  console.log('Work API preserves snapshot metadata for empty lists and exact uint64 inputs.');
}
workAPI().then(()=>{process.exitCode=0;},error=>{console.error(error);process.exitCode=1;});
