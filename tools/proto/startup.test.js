import assert from 'node:assert/strict';
import {StartupRecovery, startupReads} from '../../src/js/managers/StartupRecovery';
import {AuthenticationError} from '../../src/js/errors/AuthenticationError';
import {JsonAjaxer} from '../../src/js/framework/JsonAjaxer';
import {GuildAPI} from '../../src/js/api/GuildAPI';

globalThis.window=new EventTarget();
window.location={hostname:'localhost'};
const memory=new Map();
globalThis.localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
globalThis.CustomEvent=class extends Event { constructor(name,options={}) {super(name);this.detail=options.detail;} };
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const pending=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};

async function recoveryTests() {
  let current=true,attempts=0;
  const recovery=new StartupRecovery(()=>current,{retryMs:2,maxRetryMs:5}),first=pending();
  const result=recovery.run(async()=>{attempts++;if(attempts===1)return first.promise;return 'ready';});
  for(let i=0;i<20;i++)window.dispatchEvent(new Event('online'));
  assert.equal(attempts,1,'resume events cannot overlap an in-flight step');
  first.reject(new Error('offline'));
  assert.equal(await result,'ready');assert.equal(attempts,2);
  await assert.rejects(recovery.run(()=>{throw new AuthenticationError('rejected',401);}),AuthenticationError);
  memory.set('gameState','saved private fixture');memory.set('signingJournal:fixture','original bytes');
  current=false;window.dispatchEvent(new Event('storage'));
  await assert.rejects(recovery.run(()=>{throw new Error('must not run');}),{name:'AbortError'});
  assert.equal(memory.get('gameState'),'saved private fixture');
  assert.equal(memory.get('signingJournal:fixture'),'original bytes');

  const cancelled=new StartupRecovery(()=>true,{retryMs:10000});
  const waiting=cancelled.run(()=>Promise.reject(new Error('unavailable')));await tick();cancelled.stop();
  await assert.rejects(waiting,{name:'AbortError'});

  const sibling=pending();let settled=false;
  const group=startupReads([()=>{throw new Error('first failed');},()=>sibling.promise]);
  group.catch(()=>{settled=true;});await tick();assert.equal(settled,false);
  sibling.resolve('complete');await assert.rejects(group,/first failed/);
  const finished=new StartupRecovery(()=>true);finished.finish();
  assert.equal(finished.signal.aborted,false,'successful setup does not cancel a later planet-arrival callback');
  finished.stop();
  const cachedPage=new StartupRecovery(()=>true),pagehide=new Event('pagehide');
  pagehide.persisted=true;window.dispatchEvent(pagehide);
  assert.equal(cachedPage.signal.aborted,false,'back-forward caching must not strand an unfinished startup');
  window.dispatchEvent(new Event('pagehide'));assert.equal(cachedPage.signal.aborted,true);
}

async function transportTests() {
  const api=new GuildAPI();let calls=0,relogins=0;
  api.setReauthenticator(async()=>{relogins++;await api.login({});return true;});
  globalThis.fetch=async()=>{calls++;return {status:401};};
  await assert.rejects(api.login({}),AuthenticationError);
  assert.equal(calls,1);assert.equal(relogins,0,'login never invokes its own recovery hook');
  await assert.rejects(api.ajax.get('/protected'),AuthenticationError);
  assert.equal(calls,3);assert.equal(relogins,1,'one protected read has one bounded failed recovery');
  assert.equal(api.sessionRecovery,null);
  const ajax=new JsonAjaxer();
  globalThis.fetch=async()=>({status:503,json:async()=>({success:false})});
  await assert.rejects(ajax.get('/unavailable'),error=>error.status===503);
  let aborted=false;
  globalThis.fetch=(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>{aborted=true;reject(signal.reason);},{once:true}));
  await assert.rejects(ajax.get('/hung',{timeoutMs:5}),{name:'AbortError'});assert.ok(aborted);
}

async function loginTests() {
  const {AuthManager}=require('../../src/js/managers/AuthManager');
  const {DestroyedStructManager}=require('../../src/js/managers/DestroyedStructManager');
  const {PLAYER_TYPES}=require('../../src/js/constants/PlayerTypes');
  const counters={login:0,connect:0,metadata:0,catalog:0,explore:0};
  const owner={id:'1-1',player:null,setId(id){this.id=id;},setPlayer(player){this.player=player;},
    setLastActionBlockHeight(){},setFleet(){},setStructs(){},setPlanet(){},setPlanetShieldInfo(){}};
  const state={signingAccount:{address:'fixture-address'},thisGuild:{id:'0-1'},currentBlockHeight:3353001,
    isSessionCurrent:()=>true,keyPlayers:{[PLAYER_TYPES.PLAYER]:owner},signupRequest:{},
    alphaRefresh:{stop(){},start(){}},setStructTypes(){},setPlanetPlanetRaidInfo(){},setRaidPlanetRaidInfo(){},
    alphaBaseMap:{render(){}},raidMap:{render(){}}};
  let planet='2-1';
  const auth=Object.create(AuthManager.prototype);
  Object.assign(auth,{gameState:state,buildLoginRequest:async()=>({}),
    guildAPI:{login:async()=>{counters.login++;return {success:true};},getPlayer:async()=>({planet_id:planet,fleet_id:'9-1'}),
      getPlayerLastActionBlockHeight:async()=>0,getStructTypes:async()=>{if(++counters.catalog===1)throw new Error('catalog offline');return [];},
      getFleetByPlayerId:async()=>({}),getStructsByPlayerId:async()=>[],getPlanet:async()=>({}),getPlanetaryShieldInfo:async()=>({}),
      getActivePlanetRaidByPlanetId:async()=>({}),getActivePlanetRaidByFleetId:async()=>({})},
    signingClientManager:{initSigningClient:async()=>{counters.connect++;}},
    playerAddressManager:{addPlayerAddressMeta:async()=>{counters.metadata++;}},grassManager:{registerListener(){}},
    destroyedStructManager:{init(){}},sessionAuthority:{start(){}},workRefresh:{start(){}},
    raidManager:{initPlanetRaider:async()=>true,initRaidEnemy:async()=>true},
    mapManager:{configureAlphaBaseMap(){},configureRaidMap(){},showActiveMap(){}},
    taskManager:{restoreTasksFromDB:async()=>true},structManager:{},
    planetManager:{findNewPlanet:async()=>{counters.explore++;throw new Error('uncertain submission');}}});
  const recovery=new StartupRecovery(()=>true,{retryMs:1,maxRetryMs:2});
  assert.equal(await auth.login('1-1',recovery.signal,operation=>recovery.run(operation)),true);
  assert.deepEqual(counters,{login:1,connect:1,metadata:1,catalog:2,explore:0});
  planet='';
  await assert.rejects(auth.login('1-1',recovery.signal,operation=>recovery.run(operation)),/uncertain submission/);
  assert.equal(counters.explore,1,'startup never retries a transaction submission');
  recovery.stop();
  const destroyed=new DestroyedStructManager({},{});let sweeps=0;
  destroyed.sweep=()=>{sweeps++;};destroyed.init();destroyed.init();
  const {EVENTS}=require('../../src/js/constants/Events');window.dispatchEvent(new Event(EVENTS.BLOCK_HEIGHT_CHANGED));
  assert.equal(sweeps,1,'reinitialization does not duplicate global listeners');
}

async function raidTests() {
  const {RaidManager}=require('../../src/js/managers/RaidManager');
  const {PLAYER_TYPES}=require('../../src/js/constants/PlayerTypes');
  const enemy={id:'1-2',planetRaidInfo:{planet_id:'2-2',isRaidActive:()=>true}};
  const owner={id:'1-1',planetRaidInfo:{planet_id:'2-1',isRaidActive:()=>true}};
  const state={keyPlayers:{[PLAYER_TYPES.PLAYER]:owner,[PLAYER_TYPES.RAID_ENEMY]:enemy,[PLAYER_TYPES.PLANET_RAIDER]:enemy}};
  const slow=pending();let loaded=false,calls=0;
  const api={getPlayer:async()=>{calls++;throw new AuthenticationError('expired',401);},
    getPlayerLastActionBlockHeight:()=>slow.promise,getPlanet:async()=>({}),
    getPlanetaryShieldInfo:async()=>({}),getFleetByPlayerId:async()=>({}),getStructsByPlayerId:async()=>[]};
  const raids=new RaidManager(state,api,{registerListener(){}},{},{});
  const attempt=raids.initRaidEnemy(()=>{},false);attempt.catch(()=>{loaded=true;});
  await tick();assert.equal(loaded,false,'raid retry must await every sibling read');
  slow.resolve(0);await assert.rejects(attempt,AuthenticationError);
  assert.equal(calls,1,'startup owns raid retries and sees rejected authentication');
  await assert.rejects(raids.initPlanetRaider(()=>{},false),AuthenticationError);
  assert.equal(calls,2,'planet raider also propagates the first failed attempt');
}

async function connectionTests() {
  const {SigningClientManager}=require('../../src/js/managers/SigningClientManager');
  const manager=new SigningClientManager({wallet:{},signingAccount:{address:'fixture-address'},msSinceLastBlock:()=>0});
  let connects=0;
  const connecting=pending();
  manager.queue.loadPersistedState=()=>{};manager.queue.reconcilePending=async()=>{};
  manager.connect=async()=>{connects++;await connecting.promise;};
  const init=manager.initSigningClient();
  assert.equal(await manager.resumeCheck(true),false);
  assert.equal(connects,1,'resume cannot overlap first connection');
  connecting.resolve();await init;
  const probe=pending();manager.isAlive=()=>probe.promise;
  const check=manager.checkConnection(true);
  manager.connectionEpoch++;probe.resolve(false);
  assert.equal(await check,false);assert.equal(connects,1,'an old probe cannot replace a newer connection');
  manager.stopForLogout();assert.equal(await manager.resumeCheck(true),false);
  assert.equal(connects,1,'logout does not reconnect from focus or polling');
}

(async()=>{await recoveryTests();await transportTests();await loginTests();await raidTests();await connectionTests();console.log('Startup: bounded retries, no overlapping reads/connections or recursive login, session cancellation, preserved keys and single submission passed.');})()
  .catch(error=>{console.error(error);process.exitCode=1;});
