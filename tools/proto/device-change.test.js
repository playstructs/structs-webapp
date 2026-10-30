import assert from 'node:assert/strict';
import {stringToPath} from '@cosmjs/crypto';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import {BaseAccount} from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import {QueryAccountResponse} from 'cosmjs-types/cosmos/auth/v1beta1/query';
import {SimulateRequest, SimulateResponse} from 'cosmjs-types/cosmos/tx/v1beta1/service';
import {AuthInfo, TxBody, TxRaw} from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import * as Structs from '../../src/js/ts/structs.structs/types/structs/structs/query';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {SigningTransaction, TX_STATUS} from '../../src/js/models/SigningTransaction';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {TransactionJournal} from '../../src/js/managers/TransactionJournal';
import {SigningSubmission} from '../../src/js/managers/SigningSubmission';
import {selectedDevicePermissions, deviceChangeIntent} from '../../src/js/util/DeviceChangeIntent';
import {readDeviceContext} from '../../src/js/managers/DeviceChangePreparation';
import {deviceChangeCommit, deviceChangeRefreshReady, waitForDeviceChange} from '../../src/js/util/DeviceChangeCompletion';
import {submissionBytes} from '../../src/js/util/SignedSubmission';
import {PERMISSIONS} from '../../src/js/constants/Permissions';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {STRUCTS_FREE_GAS} from '../../src/js/constants/Fee';

const mnemonic='abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
let actor,target,registry,offline;
const meta=(height='3353000')=>{
  const protocol=BigInt(height)<3353000n?CHAIN.LEGACY_PROTOCOL:CHAIN.PROTOCOL;
  return {chain_id:CHAIN.ID,height,indexed_height:height,observed_tip:height,activation_height:CHAIN.UPGRADE_HEIGHT,
    api_contract:CHAIN.API_CONTRACT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,protocol,observed_protocol:protocol,
    data_ready:true,transaction_ready:true,required_models:[],models:{},inventory_authority:'current-claims-v1'};
};
async function fixture(operation='permissions',height='3353000') {
  const control={height,actorOwner:'1-1',targetOwner:'1-1',actorMask:String(PERMISSIONS.ALL),targetMask:String(PERMISSIONS.ALL),
    primary:actor.address,nonce:'9007199254740993',signed:0,simulated:0,gas:1000n};
  const protocol=meta(height).protocol;
  const intent=deviceChangeIntent({kind:'device_change',version:1,ownerId:'1-1',address:target.address,operation,
    permissions:operation==='permissions'?selectedDevicePermissions(control.targetMask,false,false):null,
    expectedPermissions:operation==='permissions'?control.targetMask:null,
    context:{chain_id:CHAIN.ID,protocol,source_height:height,proof_nonce:protocol===CHAIN.PROTOCOL?control.nonce:null}});
  const encode=(type,value)=>type.encode(type.fromPartial(value)).finish();
  const request=async(service,method,bytes)=>{
    if(service==='cosmos.auth.v1beta1.Query')return encode(QueryAccountResponse,{account:{typeUrl:'/cosmos.auth.v1beta1.BaseAccount',
      value:encode(BaseAccount,{address:actor.address,accountNumber:1n,sequence:2n})}});
    if(service==='structs.structs.Query' && method==='Address'){
      const {address}=Structs.QueryGetAddressRequest.decode(bytes);assert.ok([actor.address,target.address].includes(address));
      return encode(Structs.QueryAddressResponse,{address,playerId:address===actor.address?control.actorOwner:control.targetOwner,
        permissions:address===actor.address?control.actorMask:control.targetMask,proofNonce:control.nonce});
    }
    if(service==='structs.structs.Query' && method==='Player') return encode(Structs.QueryGetPlayerResponse,{Player:{id:'1-1',primaryAddress:control.primary}});
    if(service==='cosmos.tx.v1beta1.Service' && method==='Simulate'){
      control.simulated++;control.bytes=SimulateRequest.decode(bytes).txBytes;
      return encode(SimulateResponse,{gasInfo:{gasUsed:control.gas}});
    }
    throw new Error(`Unexpected unscoped query ${service}/${method}`);
  };
  const manager={registry,connectionEpoch:1,gameState:{currentBlockHeight:Number(height),signingAccount:actor,
    guildAPI:{getBlockSnapshot:async()=>({meta:meta(control.height)}),getPlayer:()=>{throw new Error('Device changes do not require inventory');}}}};
  manager.gameState.signingClient={sign:async(...args)=>{control.signed++;return offline.sign(...args);}};
  manager.chainQuery={closed:false,status:async()=>({chainId:CHAIN.ID,height:control.height}),readSnapshot:async(read,options={})=>{
    const h=options.height??control.height;
    return {chainId:CHAIN.ID,height:h,observedHeight:control.height,data:await read({chainId:CHAIN.ID,height:h,request})};
  }};
  const tx=SigningTransaction.create({intent,accountAddress:actor.address,isAction:false,retryLimit:0,enqueuedAtBlock:Number(height)});
  return {manager,control,tx,submission:new SigningSubmission(manager)};
}
function response(tx,{owner='1-1',permissions=tx.intent.permissions??'0',height='3353001',nonce=tx.intent.context.proof_nonce}={}){
  return {meta:meta(height),data:{indexed:{address:target.address,player_id:owner||'1-1',guild_id:'0-1',status:owner?'approved':'revoked',permissions},
    chain:{address:target.address,player_id:'1-1',registered_player_id:owner,permissions,chain_id:CHAIN.ID,
      source_height:height,protocol:meta(height).protocol,proof_nonce:nonce,timeout_height:'0'}}};
}
async function sign(f){
  f.tx.submission=await f.submission.prepare(f.tx);f.tx.status=TX_STATUS.SUCCEEDED;
  f.tx.response={stage:'committed',code:0,chainId:CHAIN.ID,height:f.control.height,transactionHash:f.tx.submission.hash,blockHash:'A'.repeat(64)};
  return f.tx;
}
async function flowTests(memory) {
  const {AuthManager}=require('../../src/js/managers/AuthManager');
  const {MenuPage}=require('../../src/js/framework/MenuPage');
  const {MenuPageRouter}=require('../../src/js/framework/MenuPageRouter');
  const {PLAYER_TYPES}=require('../../src/js/constants/PlayerTypes');
  const held=new Set();
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(name,_options,run)=>{
    if(held.has(name))return run(null);
    held.add(name);try{return await run({name});}finally{held.delete(name);}
  }}}});
  const tick=()=>new Promise(resolve=>setImmediate(resolve));
  function auth(f) {
    const a=Object.create(AuthManager.prototype);
    a.gameState=f.manager.gameState;
    a.gameState.keyPlayers={[PLAYER_TYPES.PLAYER]:{id:'1-1',player:{primary_address:actor.address},clearFunds(){}}};
    a.gameState.persistenceEnabled=true;
    a.gameState.alphaRefresh={stop(){}};
    a.signingClientManager=f.manager;
    a.signingClientManager.queue=new SigningQueueManager(a.gameState,{registry,wsUrl:'device-flow'});
    a.guildAPI={getDeviceState:async()=>response(f.tx,{owner:f.tx.intent.operation==='revoke'?'':'1-1'})};
    return a;
  }
  const signal=new AbortController().signal;
  for(const operation of ['permissions','revoke']) {
    memory.clear();const f=await fixture(operation),a=auth(f),q=a.signingClientManager.queue;
    q.whenSettled=async id=>{
      f.tx=q.getTransaction(id);await sign(f);new TransactionJournal(actor.address).write(f.tx,'settled');return f.tx;
    };
    assert.equal(await a.changeDevice(target.address,operation,f.tx.intent.permissions,f.tx.intent.expectedPermissions,signal),true);
    assert.equal(localStorage.getItem(a.deviceActionKey(target.address)),null);
    assert.equal(f.control.signed,1);
  }
  // A lost observer/pointer cannot turn a send-marked transaction into a replacement.
  memory.clear();const f=await fixture(),a=auth(f);await sign(f);f.tx.status=TX_STATUS.UNKNOWN;
  new TransactionJournal(actor.address).write(f.tx,'unknown');
  a.signingClientManager.chainQuery.readSnapshot=()=>{throw new Error('Must recover the saved transaction');};
  const nav=new AbortController();const pending=a.changeDevice(target.address,'permissions',f.tx.intent.permissions,f.tx.intent.expectedPermissions,nav.signal);
  await tick();nav.abort();await assert.rejects(()=>pending,error=>error.name==='AbortError');
  const saved=JSON.parse(localStorage.getItem(a.deviceActionKey(target.address)));
  assert.equal(saved.id,f.tx.id);assert.equal(f.control.signed,1);
  const again=auth(f);
  await assert.rejects(()=>again.changeDevice(target.address,'permissions','0',f.tx.intent.expectedPermissions,signal),/existing device action/);
  // Inclusion arriving in another tab is adopted, even with the old observer gone.
  f.tx.status=TX_STATUS.SUCCEEDED;new TransactionJournal(actor.address).write(f.tx,'settled');
  assert.equal(await again.changeDevice(target.address,'permissions',f.tx.intent.permissions,f.tx.intent.expectedPermissions,signal),true);
  assert.equal(f.control.signed,1);
  // A definitively failed action permits a fresh explicit retry, retaining its selected grant.
  memory.clear();const fail=await fixture(),failedAuth=auth(fail),fq=failedAuth.signingClientManager.queue;
  fq.whenSettled=async id=>{const tx=fq.getTransaction(id);tx.status=TX_STATUS.DROPPED;
    new TransactionJournal(actor.address).write(tx,'settled');return tx;};
  assert.equal(await failedAuth.changeDevice(target.address,'permissions',fail.tx.intent.permissions,fail.tx.intent.expectedPermissions,signal),false);
  assert.equal(localStorage.getItem(failedAuth.deviceActionKey(target.address)),null);
  fq.whenSettled=async id=>{fail.tx=fq.getTransaction(id);await sign(fail);new TransactionJournal(actor.address).write(fail.tx,'settled');return fail.tx;};
  assert.equal(await failedAuth.changeDevice(target.address,'permissions',fail.tx.intent.permissions,fail.tx.intent.expectedPermissions,signal),true);
  // Self logout without Delete never creates a chain transaction, and remote work does not use this fallback.
  for(const owner of ['1-1','']) {
    memory.clear();const local=await fixture('revoke'),l=auth(local);local.control.actorMask='1';local.control.actorOwner=owner;
    let loggedOut=0;l.logout=async()=>{loggedOut++;};l.changeDevice=()=>{throw new Error('Local logout must not enqueue');};
    assert.equal(await l.revokeAddress(actor.address,signal),true);assert.equal(loggedOut,1);
  }
  memory.clear();const remote=await fixture('revoke'),r=auth(remote);remote.control.actorMask='1';let remoteAttempts=0;
  r.logout=()=>{throw new Error('Remote revocation cannot log this browser out');};r.changeDevice=async()=>{remoteAttempts++;return false;};
  assert.equal(await r.revokeAddress(target.address,signal),false);assert.equal(remoteAttempts,1);
  // Local key erasure cannot depend on an HTTP logout response; a tutorial never erases it.
  memory.clear();const out=auth(await fixture());let resolveLogout,reloaded=0,stopped=0;
  out.gameState.mnemonic='private fixture';out.gameState.wallet={};out.gameState.pubkey='fixture';
  out.signingClientManager.stopForLogout=()=>{stopped++;};
  localStorage.setItem('gameState','private fixture');localStorage.setItem('deviceRegistration:private','private fixture');
  localStorage.setItem('signingJournal:retained','public evidence');
  MenuPage.router={goto(){}};MenuPage.open=()=>{};window.location={reload(){reloaded++;}};
  out.guildAPI.logout=({timeoutMs})=>{assert.equal(timeoutMs,5000);return new Promise((_resolve,reject)=>{resolveLogout=reject;});};
  const loggingOut=out.logout();assert.equal(out.logout(),loggingOut);
  assert.equal(localStorage.getItem('gameState'),null);assert.equal(localStorage.getItem('deviceRegistration:private'),null);
  assert.equal(localStorage.getItem('signingJournal:retained'),'public evidence');assert.equal(out.gameState.mnemonic,null);
  assert.equal(out.gameState.signingAccount,null);assert.equal(out.gameState.persistenceEnabled,false);assert.equal(stopped,1);
  await tick();resolveLogout(new Error('HTTP logout unavailable'));await loggingOut;assert.equal(reloaded,1);
  localStorage.setItem('gameState','real player');const tutorial=auth(await fixture());tutorial.gameState.persistenceEnabled=false;
  tutorial.signingClientManager.stopForLogout=()=>{throw new Error('Tutorial cannot end the real session');};
  tutorial.logout();assert.equal(localStorage.getItem('gameState'),'real player');

  const {AccountDeviceViewModel}=require('../../src/js/view_models/account/AccountDeviceViewModel');
  const {LogoutAssetsWarningViewModel}=require('../../src/js/view_models/logout/LogoutAssetsWarningViewModel');
  const {LogoutPermissionsWarningViewModel}=require('../../src/js/view_models/logout/LogoutPermissionsWarningViewModel');
  const {ConfirmTemplate}=require('../../src/js/view_models/templates/ConfirmTemplate');
  const elements=new Map();globalThis.document={getElementById:id=>{
    if(!elements.has(id))elements.set(id,new EventTarget());return elements.get(id);
  }};
  function page(){
    elements.clear();const router=MenuPage.router=new MenuPageRouter();
    router.registerController({name:'Account',devices(){},manageDevice(){}});
    router.registerController({name:'Generic',menuWaiting(){}});
    router.registerController({name:'Auth',logout(){},logoutAssetsWarning(){},logoutPermissionsWarning(){}});
    router.goto('Account','devices');return router;
  }
  for(const outcome of [true,false,'reject','navigate']) {
    const router=page();const a=auth(await fixture());let settle,calls=0;
    const device={address:target.address,permissions:String(PERMISSIONS.ALL),alpha:'0'};
    a.setDevicePermissions=(address,desired,expected)=>{calls++;assert.equal(address,target.address);assert.equal(expected,String(PERMISSIONS.ALL));
      assert.equal(desired,selectedDevicePermissions(expected,false,true));
      return new Promise((resolve,reject)=>{settle=outcome==='reject'?()=>reject(new Error('Refused')):()=>resolve(outcome===true);});};
    const v=new AccountDeviceViewModel(a.gameState,{}, {},device,a);v.playerAddressDetails=device;v.initPageCode();
    document.getElementById(v.manageDevicesCheckboxId).checked=false;document.getElementById(v.transferAssetsCheckboxId).checked=true;
    document.getElementById(v.saveDeviceChangesBtnId).dispatchEvent(new Event('click'));
    document.getElementById(v.saveDeviceChangesBtnId).dispatchEvent(new Event('click'));assert.equal(calls,1);
    assert.equal(router.currentPage,'menuWaiting');if(outcome==='navigate')router.goto('Account','devices');
    settle();await tick();assert.equal(router.currentPage,outcome===true||outcome==='navigate'?'devices':'manageDevice');
  }
  for(const outcome of ['missing','reject','navigate']) {
    const router=page();router.goto('Account','manageDevice');const a=auth(await fixture());let complete;
    const device={address:target.address,permissions:String(PERMISSIONS.ALL)};
    const api={getPlayerAddress:()=>new Promise((resolve,reject)=>{complete=outcome==='reject'?()=>reject(new Error('Read failed')):()=>resolve(null);})};
    // Reuse one pending read for a current device, as the actual view does.
    device.address=actor.address;
    const view=new AccountDeviceViewModel(a.gameState,api,{},device,a);view.render();
    if(outcome==='navigate')router.goto('Auth','logout');
    complete();await tick();assert.equal(router.currentPage,outcome==='navigate'?'logout':'devices');
  }
  // Existing self-logout control skips the asset migration warning when it cannot revoke.
  let router=page();const l=auth(await fixture());l.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.primary_address=target.address;
  const self={address:actor.address,permissions:'1',alpha:'100'};
  const v=new AccountDeviceViewModel(l.gameState,{}, {},self,l);v.playerAddressDetails=self;v.canEditPermissions=false;v.initPageCode();
  document.getElementById(v.deviceLogoutBtnId).dispatchEvent(new Event('click'));
  assert.equal(router.currentController,'Auth');assert.equal(router.currentPage,'logout');assert.deepEqual(router.currentOptions,{});
  // Warning navigation preserves the selected device; only the approved wording changes.
  router=page();let rendered;const originalRender=ConfirmTemplate.prototype.render;
  ConfirmTemplate.prototype.render=function(){rendered=this;this.initPageCode();};
  try{
    const device={address:target.address,alpha:'12',isOnlyManagingDevice:true};
    new LogoutAssetsWarningViewModel(a.gameState,device).render();
    assert.match(rendered.messageBody1HTML,/swept to your/);assert.match(rendered.messageBody1HTML,/>Player Account\.</);
    document.getElementById(rendered.confirmBtn2Id).dispatchEvent(new Event('click'));
    assert.equal(router.currentPage,'logoutPermissionsWarning');assert.equal(router.currentOptions,device);
    elements.clear();new LogoutPermissionsWarningViewModel(a.gameState,device).render();
    document.getElementById(rendered.confirmBtn1Id).dispatchEvent(new Event('click'));
    assert.equal(router.currentPage,'logout');assert.equal(router.currentOptions,device);
  }finally{ConfirmTemplate.prototype.render=originalRender;}
}

async function main(){
  const wallet=await DirectSecp256k1HdWallet.fromMnemonic(mnemonic,{prefix:'structs'});
  [actor]=await wallet.getAccounts();
  [target]=await(await DirectSecp256k1HdWallet.fromMnemonic(mnemonic,{prefix:'structs',hdPaths:[stringToPath("m/44'/118'/0'/0/1")]})).getAccounts();
  registry=new Registry([...defaultRegistryTypes,...msgTypes]);offline=await SigningStargateClient.offline(wallet,{registry});
  for(const manage of [true,false])for(const assets of [true,false]){
    const source=((1n<<63n)|BigInt(PERMISSIONS.ALL)).toString();
    const result=BigInt(selectedDevicePermissions(source,manage,assets));
    assert.equal((result&240n)===240n,assets);assert.equal((result&14n)===14n,manage);
    assert.equal(result&(1n<<63n),1n<<63n,'Unrepresented uint64 bits survive checkbox changes');
    assert.equal(result&BigInt(PERMISSIONS.PLAY),1n);
  }
  assert.throws(()=>selectedDevicePermissions(9007199254740992,false,false));
  const f=await fixture(),tx=await sign(f);
  assert.equal(f.control.signed,1);assert.equal(f.control.simulated,1);assert.deepEqual(submissionBytes(tx.submission),f.control.bytes);
  const raw=TxRaw.decode(submissionBytes(tx.submission)),body=TxBody.decode(raw.bodyBytes),message=registry.decode(body.messages[0]);
  assert.equal(message.address,target.address);assert.equal(message.permissions,tx.intent.permissions);assert.equal(message.creator,actor.address);
  assert.equal(AuthInfo.decode(raw.authInfoBytes).fee.gasLimit,BigInt(STRUCTS_FREE_GAS));
  assert.equal(deviceChangeRefreshReady(response(tx),deviceChangeCommit(tx)),true);
  assert.equal(deviceChangeRefreshReady(response(tx,{permissions:'0'}),deviceChangeCommit(tx)),true,'Show a later consistent change after our verified commit');
  const disagreement=response(tx);disagreement.data.indexed.permissions='255';
  assert.equal(deviceChangeRefreshReady(disagreement,deviceChangeCommit(tx)),false);
  for(const patch of [{actorMask:'1'},{actorOwner:'1-2'},{targetOwner:'1-2'},{nonce:'9007199254740994'},
    {targetMask:'255'},{primary:target.address}]){
    const f=await fixture();Object.assign(f.control,patch);await assert.rejects(()=>f.submission.prepare(f.tx));assert.equal(f.control.signed,0);
  }
  const high=await fixture();high.control.actorMask='18446744073709551615';high.control.targetMask='18446744073709551615';
  high.tx.intent=deviceChangeIntent({...high.tx.intent,expectedPermissions:high.control.targetMask,permissions:selectedDevicePermissions(high.control.targetMask,false,true)});
  assert.equal(registry.decode(TxBody.decode(TxRaw.decode(submissionBytes((await sign(high)).submission)).bodyBytes).messages[0]).permissions,high.tx.intent.permissions);
  for(const operation of ['permissions','revoke']){
    const legacy=await fixture(operation,'3352999');await sign(legacy);
    assert.equal(TxBody.decode(TxRaw.decode(submissionBytes(legacy.tx.submission)).bodyBytes).timeoutHeight,3352999n);
    const crossed=await fixture(operation,'3352999');crossed.control.height='3353000';await assert.rejects(()=>crossed.submission.prepare(crossed.tx));
  }
  const revoke=await fixture('revoke');revoke.control.actorMask='8';revoke.control.targetMask='0';
  await sign(revoke);const revoked=deviceChangeCommit(revoke.tx);
  assert.equal(deviceChangeRefreshReady(response(revoke.tx,{owner:''}),revoked),true,'Revocation preserves the registration nonce');
  assert.equal(deviceChangeRefreshReady(response(revoke.tx),revoked),false,'Old same-owner association is not revocation');
  assert.equal(deviceChangeRefreshReady(response(revoke.tx,{nonce:'9007199254740994'}),revoked),true,'Later re-registration is a new address lifetime');
  for(const patch of [{actorMask:'0'},{primary:target.address}]){
    const f=await fixture('revoke');Object.assign(f.control,patch);await assert.rejects(()=>f.submission.prepare(f.tx));assert.equal(f.control.signed,0);
  }
  const gas=await fixture();gas.control.gas=BigInt(STRUCTS_FREE_GAS)+1n;await assert.rejects(()=>gas.submission.prepare(gas.tx),/gas limit/);
  for(const patch of [{status:TX_STATUS.UNKNOWN},{response:{...tx.response,code:9}},{response:{...tx.response,transactionHash:'F'.repeat(64)}}]){
    assert.throws(()=>deviceChangeCommit({...tx,...patch}));
  }
  const original=await fixture();
  const context=await original.manager.chainQuery.readSnapshot(rpc=>readDeviceContext(rpc,'1-1',target.address));
  assert.deepEqual(context.data,original.tx.intent.context);
  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k),
    key:i=>[...memory.keys()][i],get length(){return memory.size;}};globalThis.window=new EventTarget();
  tx.status=TX_STATUS.UNKNOWN;new TransactionJournal(actor.address).write(tx,'unknown');
  const queue=new SigningQueueManager(f.manager.gameState,{registry,wsUrl:'device-test'});
  assert.equal(queue.findPendingDeviceChange('1-1',target.address).id,tx.id);
  assert.throws(()=>queue.enqueueDeviceChange(tx.intent),/existing submission/);
  const abort=new AbortController();
  await assert.rejects(()=>waitForDeviceChange({getDeviceState:async()=>{abort.abort();return response(tx);}},revoked,abort.signal),error=>error.name==='AbortError');
  await flowTests(memory);
  console.log('Device changes passed: exact native authority, old/new grant ceiling, primary protection, retained bits, H expiry, signed simulation, durable uncertainty and nonce-preserving revocation. No chain broadcast.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
