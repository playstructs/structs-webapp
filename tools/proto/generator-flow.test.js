import assert from 'node:assert/strict';
import {setTimeout as pause} from 'node:timers/promises';
import {toBech32} from '@cosmjs/encoding';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {SigningTransaction, TX_STATUS} from '../../src/js/models/SigningTransaction';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {SigningClientManager} from '../../src/js/managers/SigningClientManager';
import {AlphaManager} from '../../src/js/managers/AlphaManager';
import {ConsumeAlphaOffcanvas} from '../../src/js/view_models/components/offcanvas/ConsumeAlphaOffcanvas';
import {ActionBarComponent} from '../../src/js/view_models/components/hud/ActionBarComponent';
import {HUDViewModel} from '../../src/js/view_models/HUDViewModel';
import {MenuPage} from '../../src/js/framework/MenuPage';
import {SUIOffcanvas} from '../../src/js/sui/SUIOffcanvas';
import {ActionBarLock} from '../../src/js/models/ActionBarLock';
import {StructFactory} from '../../src/js/factories/StructFactory';
import {GuildAPI} from '../../src/js/api/GuildAPI';
import {StructListener} from '../../src/js/grass_listeners/StructListener';
import {generatorState} from '../../src/js/util/GeneratorState';
import {generatorCommit, generatorRefreshReady} from '../../src/js/util/GeneratorCompletion';
import {generatorReceipt} from '../../src/js/util/GeneratorReceipt';
import {signedSubmission} from '../../src/js/util/SignedSubmission';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {EVENTS} from '../../src/js/constants/Events';

const address = n=>toBech32('structs',new Uint8Array(20).fill(n));
const clone = value=>JSON.parse(JSON.stringify(value));
const meta = (height='3353000') => {
  const protocol = BigInt(height)<3353000n?CHAIN.LEGACY_PROTOCOL:CHAIN.PROTOCOL;
  return {chain_id:CHAIN.ID,height,indexed_height:height,observed_tip:height,api_contract:CHAIN.API_CONTRACT,
    activation_height:CHAIN.UPGRADE_HEIGHT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,protocol,observed_protocol:protocol,
    data_ready:true,transaction_ready:true,required_models:['inventory'],models:{inventory:{ready:true,height}},inventory_authority:'current-claims-v1'};
};
const context = (height='3353000') => ({ownerId:'1-1',structId:'5-1',planetId:'2-1',source:address(BigInt(height)<3353000n?2:1),
  protocol:meta(height).protocol,height,funds:'5000000',rate:'2'});
const indexed = (height='3353000',source=context(height).source) => ({struct_id:'5-1',source_address:source,snapshot_meta:meta(height),
  positions_ready:true,fuel_p:'13000000',power_p:'20000000',source_exists:true,source_fuel_p:'2000000',source_power_p:'6000000',
  source_ratio_p:'3',source_commission:'0',source_generator_disabled:false,source_recorded_owner_id:'1-1'});
const result = (height='3353000',source=context(height).source) => ({data:indexed(height,source),meta:meta(height)});
const player = (height='3353000') => ({id:'1-1',alpha:'5',primary_address:address(2),vault_address:address(1),spendable_alpha_p:'5000000',
  funds_meta:{height,ready:true,provisioned:true},snapshot_meta:meta(height)});
const intent = () => ({kind:'generator_fund',version:1,ownerId:'1-1',structId:'5-1',amount:'3000000'});
const receipt = (height,amount='3000000') => ({ownerId:'1-1',primaryAddress:address(2),source:context(height).source,amount});
let registry, signer, offline;

async function signedBurn(change=intent(),height='3353000') {
  const tx = SigningTransaction.create({intent:change,isAction:false,retryLimit:0,accountAddress:signer.address,enqueuedAtBlock:Number(height)});
  tx.message={typeUrl:'/structs.structs.MsgStructGeneratorInfuse',payload:{structId:change.structId,infuseAmount:`${change.amount}ualpha`}};
  const messages=tx.toCosmosMsgs(registry),fee={amount:[{denom:'ualpha',amount:'0'}],gas:'20000000'};
  const timeoutHeight=BigInt(height)<3353000n?'3352999':'0';
  const raw=await offline.sign(signer.address,messages,fee,'',{accountNumber:1,sequence:2,chainId:CHAIN.ID},BigInt(timeoutHeight));
  tx.submission={...await signedSubmission(raw,{messages,registry,fee,accountAddress:signer.address,accountNumber:1,sequence:2,
    context:{chainId:CHAIN.ID,protocol:meta(height).protocol,indexedHeight:height,observedHeight:height,timeoutHeight}}),
    generator:{...context(height),typeId:'20',amount:change.amount}};
  tx.status=TX_STATUS.SUCCEEDED;
  tx.response={stage:'committed',code:0,chainId:CHAIN.ID,height,txIndex:1,blockHash:'A'.repeat(64),transactionHash:tx.submission.hash,
    generatorReceipt:receipt(height,change.amount)};
  return tx;
}

function storage() {
  const saved=new Map();return {getItem:key=>saved.get(key)??null,setItem:(key,v)=>saved.set(key,v),removeItem:key=>saved.delete(key),get length(){return saved.size;},key:i=>[...saved.keys()][i]};
}
class Element extends EventTarget {
  constructor() {
    super();const classes=new Set();this.value='0';this.max='0';this.min='0';this.disabled=false;this.innerHTML='';this.innerText='';
    this.classList={add:(...names)=>names.forEach(n=>classes.add(n)),remove:(...names)=>names.forEach(n=>classes.delete(n)),
      contains:name=>classes.has(name),toggle:(name,on)=>on?classes.add(name):classes.delete(name)};
  }
}
function dom() {
  const elements=new Map();
  const element=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
  const document=new EventTarget();document.getElementById=element;document.querySelector=element;
  globalThis.document=document;
  const input=element('consumeAlphaAmountInput');input.previousElementSibling=element('decrease');input.nextElementSibling=element('increase');
  const offcanvas=new SUIOffcanvas();offcanvas.offcanvasElm=new Element();offcanvas.offcanvasElm.querySelector=element;
  offcanvas.offcanvasElm.contains=()=>false;
  MenuPage.sui.offcanvas=offcanvas;
  return {element,offcanvas};
}
async function until(predicate,message) {
  const stop=Date.now()+5000;
  while(!predicate()) {if(Date.now()>stop)throw new Error(message);await pause(10);}
}

async function flow(height='3353000') {
  globalThis.localStorage=storage();globalThis.window=new EventTarget();
  Object.defineProperty(globalThis.navigator,'locks',{configurable:true,value:{request:async(n,o,run)=>run({})}});
  const {element,offcanvas}=dom();
  const control={height,sends:0,committed:true,reject:false,ready:true,reads:0,sets:0,previewReads:0,funds:'5000000',readError:null,lateRead:null};
  const structure={id:'5-1',owner:'1-1',fuel:99};
  const state={currentBlockHeight:Number(height),signingAccount:signer,signingClient:{disconnect(){}},actionBarLock:new ActionBarLock(),
    keyPlayers:{player:{id:'1-1',player:player(height),structs:{'5-1':structure},setPlayer(p){control.sets++;this.player=p;}}}};
  const api={getGeneratorSnapshotResult:async(id,source,options)=>{
    assert.equal(id,'5-1');assert.equal(options.timeoutMs,5000);control.reads++;
    if(control.lateRead)await control.lateRead;
    const response=result(control.height,source);response.data.positions_ready=control.ready;return response;
  },getPlayer:async(owner,options)=>{assert.equal(owner,'1-1');assert.equal(options.timeoutMs,16000);return player(control.height);}};
  state.guildAPI=api;
  const submit={prepare:async tx=>(await signedBurn(tx.intent,control.height)).submission,
    assertSendable:()=>{},send:async tx=>{control.sends++;return {stage:'check_tx',code:control.reject?9:0,transactionHash:tx.submission.hash};},
    find:async tx=>control.committed?{stage:'committed',code:0,chainId:CHAIN.ID,height:control.height,txIndex:1,blockHash:'A'.repeat(64),
      transactionHash:tx.submission.hash,generatorReceipt:receipt(control.height,tx.intent.amount)}:null};
  const queue=new SigningQueueManager(state,{registry,wsUrl:'generator-flow-fixture',submission:submit});
  const manager=Object.assign(Object.create(SigningClientManager.prototype),{queue,gameState:state,sessionController:new AbortController(),connectionEpoch:1});
  const alpha=new AlphaManager(state,manager);
  alpha.getGeneratorState=async(id,signal)=>{
    assert.equal(id,'5-1');signal.throwIfAborted();control.previewReads++;
    if(control.readError)throw control.readError;
    return generatorState(indexed(control.height),{...context(control.height),funds:control.funds});
  };
  HUDViewModel.gameState=state;HUDViewModel.signingClientManager=manager;HUDViewModel.refreshActionBar=()=>{};
  for(const key of ['topLeftStatusBar','topRightStatusBarAlphaBase','topRightStatusBarRaid','bottomLeftActionBar','bottomRightActionBarAlphaBase','bottomRightActionBarRaid']) {
    HUDViewModel[key]={initPageCode(){}};
  }
  HUDViewModel.initPageCode();
  const view=new ConsumeAlphaOffcanvas(state,alpha,structure,{});view.render();await until(()=>view.state,'initial snapshot');
  const setAmount=value=>{element('consumeAlphaAmountInput').value=value;element('consumeAlphaAmountInput').dispatchEvent(new Event('input'));};
  const close=()=>{offcanvas.close();state.actionBarLock.clear();manager.sessionController.abort();};
  return {state,control,api,alpha,manager,queue,submit,view,element,offcanvas,setAmount,close};
}

async function main() {
  const wallet=await DirectSecp256k1HdWallet.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',{prefix:'structs'});
  [signer]=await wallet.getAccounts();registry=new Registry([...defaultRegistryTypes,...msgTypes]);offline=await SigningStargateClient.offline(wallet,{registry});
  for(const height of ['3352999','3353000']) {
    const tx=await signedBurn(intent(),height),committed=generatorCommit(tx);
    assert.equal(generatorRefreshReady(result('3353000',committed.source),player(),committed,3353000),true,'Refresh can cross H after a pre-H inclusion');
    assert.equal(generatorRefreshReady({data:null,meta:meta()},player(),committed,3353000),true,'Ready absence after removal is not an endless wait');
    for(const mutate of [copy=>copy.response.code=7,copy=>copy.response.transactionHash='0'.repeat(64),
      copy=>copy.submission.generator.ownerId='1-9',copy=>copy.intent.amount='4000000',copy=>copy.intent.structId='5-9',
      copy=>copy.accountAddress=address(9),copy=>copy.response.height='3352998',copy=>delete copy.response.generatorReceipt,
      copy=>copy.response.generatorReceipt.ownerId='1-9',copy=>copy.response.generatorReceipt.source=address(9),
      copy=>copy.response.generatorReceipt.amount='4000000']) {
      const copy=clone(tx.toJSON());mutate(copy);assert.throws(()=>generatorCommit(copy));
    }
    const noPower=result('3353000',committed.source);noPower.data.power_p=null;
    assert.equal(generatorRefreshReady(noPower,player(),committed,3353000),false);
    const wrong=result('3353000',committed.source);wrong.data.source_address=address(9);
    assert.equal(generatorRefreshReady(wrong,player(),committed,3353000),false);
    const unknown=result('3353000',committed.source);unknown.data.positions_ready=false;
    assert.equal(generatorRefreshReady(unknown,player(),committed,3353000),false);
    const lag=result('3352998',committed.source);assert.equal(generatorRefreshReady(lag,player(),committed,3353000),false);
  }

  const details={playerId:'1-1',primaryAddress:address(2),amount:'3000000',vaultAddress:address(1)};
  const event={type:'structs.structs.EventAlphaInfuse',attributes:[{key:'eventAlphaInfuseDetail',value:JSON.stringify(details)}]};
  assert.deepEqual(generatorReceipt([event],CHAIN.PROTOCOL),receipt('3353000'));
  assert.deepEqual(generatorReceipt([{...event,attributes:[{key:'eventAlphaInfuseDetail',value:JSON.stringify({...details,vaultAddress:undefined})}]}],CHAIN.LEGACY_PROTOCOL),receipt('3352999'));
  for(const events of [[],[event,event],[{...event,attributes:[...event.attributes,...event.attributes]}],
      [{...event,attributes:[{key:'eventAlphaInfuseDetail',value:JSON.stringify({...details,amount:3000000})}]}]]) {
    assert.throws(()=>generatorReceipt(events,CHAIN.PROTOCOL));
  }

  const ok=await flow();try {
    assert.equal(ok.element('projectedSupply-value').innerText,'20k');
    ok.setAmount('3');assert.equal(ok.element('projectedSupply-value').innerText,'24k');
    await ok.view.submit();assert.equal(ok.offcanvas.signal.aborted,true);assert.equal(ok.state.actionBarLock.isLocked(),true);
    assert.equal(ok.queue.immediateQueue.length,1);assert.equal(ok.queue.immediateQueue[0].intent.amount,'3000000');
    await ok.view.submit();assert.equal(ok.queue.immediateQueue.length,1,'Detached/duplicate clicks cannot enqueue twice');
    await ok.queue.transactOnBlock();await ok.queue.reconcilePending();await ok.view.operation;
    assert.equal(ok.control.sends,1);assert.equal(ok.control.sets,1);assert.equal(ok.state.actionBarLock.isLocked(),false);
    assert.equal(ok.state.keyPlayers.player.structs['5-1'].fuel,'13');assert.equal(ok.state.keyPlayers.player.structs['5-1'].generator_power,'20000');
  } finally {ok.close();}

  const changed=await flow();try {
    changed.setAmount('4');changed.control.funds='2000000';await changed.view.submit();
    assert.equal(changed.element('consumeAlphaAmountInput').value,'4','A lower fresh balance never silently shrinks the chosen burn');
    assert.equal(changed.element('consumeAlphaBtn').disabled,true);assert.equal(changed.queue.immediateQueue.length,0);
    assert.equal(changed.offcanvas.signal.aborted,false);assert.equal(changed.state.actionBarLock.isLocked(),false);
    changed.setAmount('1e2');assert.equal(changed.element('consumeAlphaAmountInput').value,'1e2');assert.equal(changed.element('consumeAlphaBtn').disabled,true);
  } finally {changed.close();}

  for(const reason of ['Generator is offline','Generator is destroyed','Planet is complete']) {
    const stale=await flow();try {
      stale.setAmount('3');stale.control.readError=new Error(reason);await stale.view.submit();
      assert.equal(stale.queue.immediateQueue.length,0);assert.equal(stale.element('consumeAlphaAmountInput').value,'3');
      assert.equal(stale.state.actionBarLock.isLocked(),false);
    } finally {stale.close();}
  }

  const failed=await flow();try {
    failed.control.reject=true;failed.setAmount('3');await failed.view.submit();
    window.dispatchEvent(Object.assign(new Event(EVENTS.SIGNING_TRANSACTION_SETTLED),{id:'unrelated',status:TX_STATUS.DROPPED}));
    assert.equal(failed.state.actionBarLock.isLocked(),true,'An unrelated terminal event cannot release a managed operation');
    const listener=new StructListener(failed.state,failed.api,{getStructById:()=>null,refreshStruct:async()=>null});
    const status={category:'struct_status',subject:'fixture',detail:{struct_id:'5-9',status_old:0,status:0}};
    listener.handleStructStatus('fixture',status);await pause(0);
    assert.equal(failed.state.actionBarLock.isLocked(),true,'A real struct-status listener cannot settle a managed operation');
    await failed.queue.transactOnBlock();await failed.view.operation;
    assert.equal(failed.state.actionBarLock.isLocked(),false);assert.equal(failed.control.reads,0);
    failed.state.actionBarLock.lock();listener.handleStructStatus('fixture',status);await pause(0);
    assert.equal(failed.state.actionBarLock.isLocked(),false,'Existing notification-driven actions retain their completion path');
  } finally {failed.close();}

  const lagging=await flow();try {
    lagging.control.ready=false;lagging.setAmount('3');await lagging.view.submit();
    await lagging.queue.transactOnBlock();await lagging.queue.reconcilePending();
    await until(()=>lagging.control.reads===1,'indexed read');assert.equal(lagging.state.actionBarLock.isLocked(),true);
    window.dispatchEvent(Object.assign(new Event(EVENTS.RENDER_STRUCT),{struct:{id:'5-1',fuel:999}}));
    assert.equal(lagging.state.actionBarLock.isLocked(),true,'A fuel-related event is not completion evidence');
    lagging.control.ready=true;await lagging.view.operation;assert.equal(lagging.control.sends,1);
  } finally {lagging.close();}

  const departed=await flow();try {
    let release;departed.control.lateRead=new Promise(resolve=>release=resolve);
    departed.setAmount('3');await departed.view.submit();await departed.queue.transactOnBlock();await departed.queue.reconcilePending();
    await until(()=>departed.control.reads===1,'delayed indexed read');
    departed.state.actionBarLock.clear();const newer=departed.state.actionBarLock.lock({completionManaged:true});
    release();await departed.view.operation;
    assert.equal(departed.control.sets,0);assert.equal(departed.state.actionBarLock.isLocked(),true);assert.equal(newer.aborted,false);
  } finally {departed.close();}

  const unknown=await flow();try {
    unknown.control.committed=false;unknown.setAmount('3');await unknown.view.submit();await unknown.queue.transactOnBlock();
    assert.equal(unknown.state.actionBarLock.isLocked(),true);assert.equal(unknown.control.reads,0);
    unknown.manager.stopForLogout();await unknown.view.operation;assert.equal(unknown.queue.settlementWaiters.size,0);
    const reload=new SigningQueueManager(unknown.state,{registry,wsUrl:'generator-flow-fixture',submission:unknown.submit});reload.loadPersistedState();
    await reload.reconcilePending();assert.equal(unknown.control.sends,1);assert.throws(()=>reload.enqueueGenerator(intent()),/existing submission/);
  } finally {unknown.close();}

  const boundary=await flow('3352999');try {
    boundary.setAmount('3');boundary.control.height='3353000';boundary.state.currentBlockHeight=3353000;
    window.dispatchEvent(new Event(EVENTS.BLOCK_HEIGHT_CHANGED));assert.equal(boundary.element('consumeAlphaBtn').disabled,true);
    await boundary.view.refresh();assert.equal(boundary.element('consumeAlphaAmountInput').value,'3');
    assert.equal(boundary.view.state.source,address(1));
    let release;boundary.alpha.getGeneratorState=()=>new Promise(resolve=>release=resolve);
    boundary.view.invalidate();const reading=boundary.view.refresh();const previousRelease=release;boundary.offcanvas.close();
    const newer=new ConsumeAlphaOffcanvas(boundary.state,boundary.alpha,{id:'5-2'},{});newer.render();
    previousRelease(generatorState(indexed(),context()));await reading;
    assert.equal(boundary.view.signal.aborted,true);assert.equal(newer.state,null,'A late read cannot initialize a replaced panel');
    boundary.offcanvas.close();release(generatorState(indexed(),context()));await newer.refreshPromise;
  } finally {boundary.close();}

  const factory=new StructFactory();
  const structured=factory.make({id:'5-1',fuel:'999',defending_struct_ids:'[]',generator_positions_ready:true,
    generator_fuel_p:'9007199254740993000000',generator_power_p:'9007199254740993000'},meta());
  assert.equal(structured.fuel,'9007199254740993');assert.equal(structured.generator_power,'9007199254740993');
  const icons=ActionBarComponent.prototype.buildPowerGeneratorPropertyIcons.call({}, {...structured,isOnline:()=>true},{hasPowerGeneration:()=>true,generating_rate:999});
  assert.ok(icons[0].includes('data-energy="9007199254740993"'),'The existing HUD tooltip uses stored power, not current-rate multiplication');
  const unavailable=factory.make({id:'5-1',fuel:'999',defending_struct_ids:'[]',generator_positions_ready:false,generator_fuel_p:null,generator_power_p:null},meta());
  assert.equal(unavailable.fuel,null);assert.equal(unavailable.generator_power,null);
  const api=new GuildAPI();api.ajax.get=async()=>({success:true,errors:[],data:null,meta:meta()});
  assert.equal((await api.getGeneratorSnapshotResult('5-1',address(1))).meta.height,'3353000');
  assert.equal(await api.getGeneratorSnapshot('5-1',address(1)),null);
  console.log('Generator control/completion passed: exact unchanged preview/HUD values, fresh full-amount recheck, stale targets, managed action lifetime, signed identity, index delay, unrelated events, late navigation, H transition, logout and unknown/reload recovery. Controlled responses; no chain broadcast.');
}
main().then(()=>{process.exitCode=0;},error=>{console.error(error);process.exitCode=1;});
