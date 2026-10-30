import assert from 'node:assert/strict';
import {SessionAuthorityManager} from '../../src/js/managers/SessionAuthorityManager';
import {TransactionJournal} from '../../src/js/managers/TransactionJournal';
import {PLAYER_TYPES} from '../../src/js/constants/PlayerTypes';
import {EVENTS} from '../../src/js/constants/Events';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import * as Structs from '../../src/js/ts/structs.structs/types/structs/structs/query';

const memory=new Map();
globalThis.localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key),
  key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
globalThis.window=new EventTarget();window.location={hostname:'localhost',reload(){}};
globalThis.document=new EventTarget();document.visibilityState='visible';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const pending=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
function fixture(){
  const state={persistenceEnabled:true,currentBlockHeight:3353001,signingAccount:{address:'fixture-address'},
    keyPlayers:{[PLAYER_TYPES.PLAYER]:{id:'1-1'}},isSessionCurrent:()=>true};
  const control={owner:'1-1',height:'3353001',reads:0,revoked:0,delay:null,fail:false};
  const query={closed:false,readSnapshot:async read=>{
    control.reads++;
    const owner=control.owner,height=control.height;
    const data=await read({chainId:CHAIN.ID,height,request:async(service,method,bytes)=>{
      assert.equal(service,'structs.structs.Query');assert.equal(method,'Address');
      const {address}=Structs.QueryGetAddressRequest.decode(bytes);
      if(control.fail)throw new Error('offline');
      return Structs.QueryAddressResponse.encode(Structs.QueryAddressResponse.fromPartial({address,playerId:owner,permissions:'0',proofNonce:'1'})).finish();
    }});
    if(control.delay)await control.delay.promise;
    return {height,data};
  }};
  const signer={chainQuery:query};
  const manager=new SessionAuthorityManager(state,signer,()=>{control.revoked++;},{pollMs:20});
  return {state,control,signer,manager};
}
async function authorityTests(){
  const f=fixture();f.manager.start();await f.manager.request();
  assert.equal(f.control.revoked,0,'permission loss without ownership loss does not erase a key');
  f.control.fail=true;await f.manager.request();assert.equal(f.control.revoked,0,'an outage is not revocation');
  f.control.fail=false;f.control.owner='';f.control.height='3353000';await f.manager.request();
  assert.equal(f.control.revoked,0,'older native state cannot close a newer indexed session');
  f.control.height='3353001';window.dispatchEvent(new Event('focus'));await f.manager.request();
  assert.equal(f.control.revoked,1);assert.equal(f.manager.session,null);
  const lost=fixture();lost.manager.start();await lost.manager.request();lost.control.owner='';
  await new Promise(resolve=>setTimeout(resolve,45));assert.equal(lost.control.revoked,1,'polling recovers a missing notification');
  lost.manager.stop();
  const late=fixture();late.control.owner='';late.control.delay=pending();late.manager.start();
  const reading=late.manager.request();assert.equal(late.manager.request(),reading,'overlapping reads coalesce');
  late.state.signingAccount={address:'replacement-address'};late.control.delay.resolve();await reading;
  assert.equal(late.control.revoked,0,'late response cannot erase a replacement session');late.manager.stop();
  const connection=fixture();connection.control.owner='';connection.control.delay=pending();connection.manager.start();
  const old=connection.manager.request();connection.signer.chainQuery={};connection.control.delay.resolve();await old;
  assert.equal(connection.control.revoked,0);connection.manager.stop();
  const hidden=fixture();document.visibilityState='hidden';hidden.manager.start();await hidden.manager.request();
  assert.equal(hidden.control.reads,0);document.visibilityState='visible';document.dispatchEvent(new Event('visibilitychange'));
  await hidden.manager.request();assert.equal(hidden.control.reads,1);hidden.manager.stop();
  const reconnect=fixture();reconnect.manager.start();await reconnect.manager.request();reconnect.control.owner='1-2';
  window.dispatchEvent(new Event(EVENTS.GRASS_CONNECTED));await reconnect.manager.request();assert.equal(reconnect.control.revoked,1);
}
async function localSessionTests(){
  const {GameState}=require('../../src/js/models/GameState');
  const {AuthManager}=require('../../src/js/managers/AuthManager');
  const {DeviceRegistrationStore}=require('../../src/js/managers/DeviceRegistrationStore');
  const {MenuPage}=require('../../src/js/framework/MenuPage');
  const {PlayerAddressRevokedListener}=require('../../src/js/grass_listeners/PlayerAddressRevokedListener');
  const state=new GameState();state.mnemonic='private fixture';state.wallet={};state.signingAccount={address:'fixture-address'};
  state.keyPlayers[PLAYER_TYPES.PLAYER].id='1-1';state.alphaRefresh={stop(){}};
  state.save();assert.ok(localStorage.getItem('gameState'));
  const deriving=pending();const loading=new GameState();loading.walletManager={createWallet:()=>deriving.promise};
  const load=loading.load();
  const auth=Object.create(AuthManager.prototype);auth.gameState=state;let stopped=0,reloaded=0;
  auth.signingClientManager={stopForLogout(){stopped++;}};
  auth.guildAPI={logout(){throw new Error('Another tab must not clear a newer server session');}};
  MenuPage.router={goto(){}};MenuPage.open=()=>{};window.location.reload=()=>{reloaded++;};
  localStorage.setItem('signingJournal:public','keep');
  const registration=new DeviceRegistrationStore('activation','0-1','1-1','11111111-1111-4111-8111-111111111111');
  TransactionJournal.clearSession();const boundary=localStorage.getItem(TransactionJournal.SESSION_CLOSED_KEY);
  assert.throws(()=>registration.write({mnemonic:'late private key'}),/session was closed/);
  assert.throws(()=>registration.markActive(),/session was closed/);
  state.save();assert.equal(localStorage.getItem('gameState'),null,'save before the storage event cannot resurrect a key');
  await auth.handleSessionClosed({key:TransactionJournal.SESSION_CLOSED_KEY});
  assert.equal(stopped,1);assert.equal(reloaded,1);assert.equal(state.signingAccount,null);assert.equal(state.wallet,null);
  assert.equal(state.mnemonic,null);assert.equal(state.pubkey,null);assert.equal(state.persistenceEnabled,false);
  assert.equal(localStorage.getItem(TransactionJournal.SESSION_CLOSED_KEY),boundary,'another tab must not publish a logout loop');
  assert.equal(localStorage.getItem('signingJournal:public'),'keep');
  deriving.resolve({getAccountsWithPrivkeys:async()=>[{address:'obsolete'}]});await load;
  assert.equal(loading.mnemonic,null);assert.equal(loading.pubkey,null);
  assert.equal(loading.signingAccount,null);assert.equal(loading.wallet,null,'late wallet derivation cannot restore a closed session');
  TransactionJournal.clearSession();assert.ok(Number(localStorage.getItem(TransactionJournal.SESSION_CLOSED_KEY))>Number(boundary));
  const setItem=localStorage.setItem;let full=true;
  localStorage.setItem=(key,value)=>{
    if(key===TransactionJournal.SESSION_CLOSED_KEY && full){full=false;throw new Error('QuotaExceeded');}
    setItem(key,value);
  };
  localStorage.setItem('gameState','private');TransactionJournal.clearSession();
  assert.equal(localStorage.getItem('gameState'),null,'a full store must still erase private state');
  localStorage.setItem=setItem;
  // A notification can request proof but cannot navigate or erase the wallet.
  const fresh=new GameState();fresh.signingAccount={address:'fixture-address'};fresh.thisGuild={id:'0-1'};
  fresh.keyPlayers[PLAYER_TYPES.PLAYER].id='1-1';let requested=0;
  const listener=new PlayerAddressRevokedListener(fresh,{},'fixture-address',{request(height){assert.equal(height,'3353002');requested++;}});
  MenuPage.router.goto=()=>{throw new Error('Unverified notification navigated');};
  listener.handler({category:'player_address',subject:'structs.player.0-1.1-1',status:'revoked',address:'fixture-address',block_height:'3353002'});
  assert.equal(requested,1);assert.equal(fresh.signingAccount.address,'fixture-address');
}
(async()=>{await authorityTests();await localSessionTests();console.log('Session ownership, lost notifications, stale responses and cross-tab private-key erasure passed.');})().catch(error=>{console.error(error);process.exitCode=1;});
