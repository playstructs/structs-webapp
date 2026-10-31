import assert from 'node:assert/strict';
import {GuildAPI} from '../../src/js/api/GuildAPI';
import {GameState} from '../../src/js/models/GameState';
import {StructTypeCollection} from '../../src/js/models/StructTypeCollection';
import {TaskManager} from '../../src/js/managers/TaskManager';
import {WorkRefreshManager} from '../../src/js/managers/WorkRefreshManager';
import {TaskStateFactory} from '../../src/js/factories/TaskStateFactory';
import {StructTypeFactory} from '../../src/js/factories/StructTypeFactory';
import {SimulatedGuildAPI} from '../../src/js/tutorial/SimulatedGuildAPI';
import {SimulatedSigningClientManager} from '../../src/js/tutorial/SimulatedSigningClientManager';
import {TUTORIAL_STRUCT_TYPES} from '../../src/js/tutorial/TutorialStructTypes';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {EVENTS} from '../../src/js/constants/Events';
import {TX_STATUS} from '../../src/js/models/SigningTransaction';

const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
let timers,intervals,nextTimer=1;
function globals(){
  globalThis.window=new EventTarget();globalThis.document=Object.assign(new EventTarget(),{visibilityState:'visible'});
  window.location={hostname:'fixture'};
  const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
  timers=new Map();intervals=new Map();
  globalThis.setTimeout=(callback,ms)=>{const id=nextTimer++;timers.set(id,{callback,ms});return id;};
  globalThis.clearTimeout=id=>timers.delete(id);
  globalThis.setInterval=(callback,ms)=>{const id=nextTimer++;intervals.set(id,{callback,ms});return id;};
  globalThis.clearInterval=id=>intervals.delete(id);
}
function meta(height='3353000',models=[]){
  const protocol=BigInt(height)<3353000n?CHAIN.LEGACY_PROTOCOL:CHAIN.PROTOCOL;
  return {height,indexed_height:height,observed_tip:height,chain_id:CHAIN.ID,activation_height:CHAIN.UPGRADE_HEIGHT,
    protocol,observed_protocol:protocol,api_contract:CHAIN.API_CONTRACT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,
    inventory_authority:'current-claims-v1',data_ready:true,transaction_ready:true,required_models:models,
    models:Object.fromEntries(models.map(name=>[name,{height,ready:true}]))};
}
const row=(id='5-1',category='MINE')=>({object_id:id,player_id:'1-1',category,target_id:id,block_start:'3352900',difficulty_target:'10'});
function fixture(){
  globals();
  const state=Object.assign(Object.create(GameState.prototype),{persistenceEnabled:true,sessionBoundary:null,
    signingAccount:{address:'fixture'},currentBlockHeight:3353000,structTypes:new StructTypeCollection(),
    keyPlayers:{player:{id:'1-1',planetRaidInfo:{isRaidActive:()=>false}}}});
  const api=new GuildAPI(),control={rows:[row()],workMeta:meta('3353000',['work']),catalogMeta:meta(),
    types:structuredClone(TUTORIAL_STRUCT_TYPES),workReads:0,catalogReads:0};
  api.ajax={get:async url=>{
    if(url.endsWith('/struct/type')){control.catalogReads++;if(control.catalogGate)return control.catalogGate.promise;
      return {success:true,errors:[],data:structuredClone(control.types),meta:structuredClone(control.catalogMeta)};}
    control.workReads++;if(control.workGate)return control.workGate.promise;
    return {success:true,errors:[],data:structuredClone(control.rows),meta:structuredClone(control.workMeta)};
  }};
  const tasks=new TaskManager(state,api,{},new TaskStateFactory());
  tasks.spawned=[];tasks.stopped=[];
  tasks.spawn=task=>{tasks.spawned.push(task);};
  tasks.terminate=id=>{tasks.stopped.push(id);delete tasks.processes[id];};
  return {state,api,control,tasks};
}
async function catalogTests(){
  const f=fixture();localStorage.setItem('getStructTypes',JSON.stringify({timestamp:Date.now(),value:[{build_charge:99}]}));
  const [types,shared]=await Promise.all([f.api.getStructTypes(),f.api.getStructTypes()]);
  assert.equal(f.control.catalogReads,1);assert.equal(types,shared);assert.equal(types.snapshot_meta.height,'3353000');
  assert.equal(f.state.setStructTypes(types),true);const existing=f.state.structTypes.getStructTypeById(1);
  f.control.types[0].build_charge=1;f.control.catalogMeta=meta('3353001');
  assert.equal(f.state.setStructTypes(await f.api.getStructTypes()),true);assert.equal(f.control.catalogReads,2);
  assert.equal(f.state.structTypes.getStructTypeById(1),existing,'Open cards keep a current type object');assert.equal(existing.build_charge,1);
  f.control.catalogMeta=meta();f.control.types[0].build_charge=99;
  assert.equal(f.state.setStructTypes(await f.api.getStructTypes()),false);assert.equal(existing.build_charge,1);
  f.control.catalogMeta=meta('3353001');assert.equal(f.state.setStructTypes(await f.api.getStructTypes()),false,'Same-height conflict cannot replace current types');
  f.control.catalogMeta=meta('3353002');f.control.types[1].build_difficulty=null;
  assert.throws(()=>f.state.setStructTypes(new StructTypeFactory().parseList(f.control.types))); // Missing metadata is also refused.
  const malformed=await f.api.getStructTypes();assert.throws(()=>f.state.setStructTypes(malformed),/exact uint64/);
  assert.equal(existing.build_charge,1,'Whole catalog validates before updating retained objects');
  const unavailable=fixture();unavailable.control.catalogMeta.data_ready=false;
  await assert.rejects(()=>unavailable.api.getStructTypes());
  const crossed=fixture();crossed.control.catalogMeta=meta('3352999');
  await assert.rejects(async()=>crossed.state.setStructTypes(await crossed.api.getStructTypes()));
  const catchingUp=fixture();catchingUp.control.catalogMeta.transaction_ready=false;
  assert.equal(catchingUp.state.setStructTypes(await catchingUp.api.getStructTypes()),true,'Complete read data need not claim signing readiness');
  console.log('Catalog snapshot identity, legacy cache bypass, coalesced reads, atomic replacement and retained references passed.');
}
async function workTests(){
  const f=fixture();await f.tasks.spawnOutstandingWork();assert.equal(f.tasks.spawned.length,1);
  f.tasks.processes['5-1']={state:{task_type:'MINE'}};
  f.control.rows=[];f.control.workMeta.data_ready=false;
  assert.equal(await f.tasks.spawnOutstandingWork(),false);assert.deepEqual(f.tasks.stopped,[],'Unknown empty list cannot stop active work');
  f.control.workMeta=meta('3352999',['work']);assert.equal(await f.tasks.spawnOutstandingWork(),false);
  f.control.workMeta=meta('3353001',['work']);assert.equal(await f.tasks.spawnOutstandingWork(),true);assert.deepEqual(f.tasks.stopped,['5-1']);
  f.control.rows=[row()];f.control.workMeta=meta('3353000',['work']);assert.equal(await f.tasks.spawnOutstandingWork(),false);
  f.control.workMeta=meta('3353001',['work']);assert.equal(await f.tasks.spawnOutstandingWork(),false,'Same-height inconsistent work cannot return');
  f.control.workMeta=meta('3353002',['work']);assert.equal(await f.tasks.spawnOutstandingWork(),true);
  const noModel=fixture();noModel.control.workMeta.models.work.ready=false;await assert.rejects(()=>noModel.api.getWorkByPlayerId('1-1'));
  for(const rows of [[{...row(),player_id:'1-9'}],[row(),row()],[{...row(),block_start:9007199254740992}],[{...row(),category:'UNKNOWN'}]]){
    const bad=fixture();bad.control.rows=rows;await assert.rejects(()=>bad.api.getWorkByPlayerId('1-1'));
  }
  for(const change of ['owner','account','logout']){
    const late=fixture();late.control.workGate=deferred();const read=late.tasks.spawnOutstandingWork();
    if(change==='owner')late.state.keyPlayers.player.id='1-2';
    else if(change==='account')late.state.signingAccount.address='changed';
    else late.tasks.closeSession();
    late.control.workGate.resolve({success:true,errors:[],data:[row()],meta:meta('3353000',['work'])});
    assert.equal(await read,false);assert.deepEqual(late.tasks.spawned,[]);
  }
  const hint=fixture();hint.tasks.processes['5-1']={state:{task_type:'MINE'}};hint.state.currentBlockHeight=3353002;
  await hint.tasks.refreshOreTasks('MINE','3353002');assert.deepEqual(hint.tasks.stopped,[]);assert.deepEqual(hint.tasks.spawned,[]);
  hint.control.workMeta=meta('3353002',['work']);hint.control.rows[0].block_start='3353002';
  await hint.tasks.spawnOutstandingWork();assert.equal(hint.tasks.spawned[0].block_start,'3353002');
  await hint.tasks.refreshOreTasks('MINE','0');assert.deepEqual(hint.tasks.stopped,[],'A delayed zero hint cannot clear a newer native work clock');
  hint.control.workMeta=meta('3353003',['work']);hint.control.rows[0].block_start='0';
  await hint.tasks.refreshOreTasks('MINE','0');assert.deepEqual(hint.tasks.stopped,['5-1'],'An authoritative exact-zero clock stops work');
  const ordered=fixture();ordered.control.rows=[row('5-1'),row('5-2')];await ordered.tasks.fetchWork();
  ordered.control.rows.reverse();await ordered.tasks.fetchWork(); // SQL ties can change list order without changing state.
  console.log('Work readiness, exact values, empty/older/conflicting responses, clock catch-up and session fencing passed.');
}
async function refreshTests(){
  const f=fixture();const manager=new WorkRefreshManager(f.state,f.api,f.tasks,{pollMs:100,retryMs:5,maxRetryMs:20});
  manager.start();await manager.request();assert.equal(f.control.catalogReads,1);assert.equal(f.control.workReads,1);
  window.dispatchEvent(new Event(EVENTS.GRASS_CONNECTED));await manager.request();assert.equal(f.control.catalogReads,2);
  document.visibilityState='hidden';await manager.request();assert.equal(f.control.catalogReads,2);
  document.visibilityState='visible';document.dispatchEvent(new Event('visibilitychange'));await manager.request();assert.equal(f.control.catalogReads,3);
  f.control.workMeta.data_ready=false;await manager.request();assert.equal(timers.get(manager.session.timer).ms,5);
  await manager.request();assert.equal(timers.get(manager.session.timer).ms,10);
  f.control.workMeta.data_ready=true;await manager.request();assert.equal(manager.session.retry,5);
  f.control.catalogGate=deferred();const read=manager.request();manager.stop();
  f.control.catalogGate.resolve({success:true,errors:[],data:f.control.types,meta:meta('3353009')});await read;
  assert.equal(f.state.structTypes.snapshot_meta.height,'3353000');
  assert.equal(timers.size,0);assert.equal([...intervals.values()].filter(item=>item.ms===100).length,0);
  const boundary=fixture();boundary.state.currentBlockHeight=3352999;boundary.control.catalogMeta=meta('3352999');boundary.control.workMeta=meta('3352999',['work']);
  const monitor=new WorkRefreshManager(boundary.state,boundary.api,boundary.tasks);monitor.start();await monitor.request();
  boundary.state.currentBlockHeight=3353000;boundary.control.catalogMeta=meta();boundary.control.workMeta=meta('3353000',['work']);
  window.dispatchEvent(new Event(EVENTS.BLOCK_HEIGHT_CHANGED));await monitor.request();
  assert.equal(boundary.state.structTypes.snapshot_meta.protocol,CHAIN.PROTOCOL);monitor.stop();
  console.log('Visible polling, reconnect, activation boundary, bounded retry and cancellation of late refresh passed.');
}
async function tutorialTests(){
  globals();const api=new SimulatedGuildAPI({structTypes:new StructTypeFactory().parseList(TUTORIAL_STRUCT_TYPES)});
  assert.equal(api.simulated,true);assert.equal((await api.getStructTypes()).length,TUTORIAL_STRUCT_TYPES.length);
  // Release migrations change these fields without resetting other type data.
  assert.ok(TUTORIAL_STRUCT_TYPES.every(type=>type.build_charge===1));
  assert.equal(TUTORIAL_STRUCT_TYPES.find(type=>type.id===14).build_difficulty,10);
  const state={persistenceEnabled:false,currentBlockHeight:1000,keyPlayers:{player:{id:'1-1'}},actionBarLock:{clear:()=>{}},
    signingAccount:{address:'tutorial'},guildAPI:api};
  localStorage.setItem('gameState','private persisted fixture');
  const signing=new SimulatedSigningClientManager(state,{});
  for(const [name,args] of [['PlayerUpdateName',['1-1','test']],['StructBuildComplete',['5-1','0'.repeat(64),'1']],
    ['PlanetExplore',['1-1']],['StructStealthActivate',['5-1',0]]]){
    const result=await signing['queueMsg'+name](...args);assert.equal(result.status,TX_STATUS.DROPPED);
  }
  assert.equal(localStorage.getItem('gameState'),'private persisted fixture');
  assert.equal(signing.queue.immediateQueue.length+signing.queue.actionQueue.length,0);
  console.log('Unimplemented tutorial gameplay paths remain local and cannot enqueue real transactions.');
}
async function timeoutTests(){
  globals();const api=new GuildAPI(),originalFetch=globalThis.fetch;
  globalThis.fetch=(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}));
  try {
    for(const read of [()=>api.getStructTypes(),()=>api.getWorkByPlayerId('1-1')]) {
      const pending=read();
      const timeout=[...timers.values()].find(timer=>timer.ms===15000);
      assert.ok(timeout,'Snapshot requests have a bounded deadline');timeout.callback();
      await assert.rejects(()=>pending,/abort/i);
      assert.equal(api.structTypesRequest,null,'A timed-out shared catalog request releases the next refresh');
      assert.equal(timers.size,0);
    }
  } finally {globalThis.fetch=originalFetch;}
  console.log('Hung catalog/work requests abort and release subsequent refreshes.');
}
(async()=>{await catalogTests();await workTests();await refreshTests();await tutorialTests();await timeoutTests();})().then(()=>{process.exitCode=0;},error=>{console.error(error);process.exitCode=1;});
