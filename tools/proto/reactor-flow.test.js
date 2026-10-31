import assert from 'node:assert/strict';
import fs from 'node:fs';
import {setTimeout as pause} from 'node:timers/promises';
import {toBech32} from '@cosmjs/encoding';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import * as Structs from '../../src/js/ts/structs.structs/types/structs/structs/query';
import * as Staking from 'cosmjs-types/cosmos/staking/v1beta1/query';
import {QuerySpendableBalanceByDenomRequest, QuerySpendableBalanceByDenomResponse} from 'cosmjs-types/cosmos/bank/v1beta1/query';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {SigningTransaction, TX_STATUS} from '../../src/js/models/SigningTransaction';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {SigningClientManager} from '../../src/js/managers/SigningClientManager';
import {AlphaManager} from '../../src/js/managers/AlphaManager';
import {ManageAlphaViewModel} from '../../src/js/view_models/guild/ManageAlphaViewModel';
import {ReactorViewModel} from '../../src/js/view_models/guild/ReactorViewModel';
import {MenuPage} from '../../src/js/framework/MenuPage';
import {MenuPageRouter} from '../../src/js/framework/MenuPageRouter';
import {reactorState, reactorPreview, reactorOwnerPower, alphaDecimal} from '../../src/js/util/ReactorState';
import {readReactorSnapshot} from '../../src/js/managers/ReactorSnapshot';
import {reactorCommit, reactorRefreshReady} from '../../src/js/util/ReactorCompletion';
import {signedSubmission} from '../../src/js/util/SignedSubmission';
import {NumberFormatter} from '../../src/js/util/NumberFormatter';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {EVENTS} from '../../src/js/constants/Events';
import {GuildAPI} from '../../src/js/api/GuildAPI';

const address = n=>toBech32('structs',new Uint8Array(20).fill(n));
const validator = toBech32('structsvaloper',new Uint8Array(20).fill(8));
const clone = value=>JSON.parse(JSON.stringify(value));
const meta = (height='3353000') => {
  const protocol = BigInt(height)<3353000n?CHAIN.LEGACY_PROTOCOL:CHAIN.PROTOCOL;
  return {chain_id:CHAIN.ID,height,indexed_height:height,observed_tip:height,api_contract:CHAIN.API_CONTRACT,
    activation_height:CHAIN.UPGRADE_HEIGHT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,protocol,observed_protocol:protocol,
    data_ready:true,transaction_ready:true,required_models:['inventory'],models:{inventory:{ready:true,height}},inventory_authority:'current-claims-v1'};
};
const context = () => ({ownerId:'1-1',guildId:'0-1',reactorId:'3-1',validator,source:address(1),
  protocol:CHAIN.PROTOCOL,height:'3353000',funds:'2999999',minimum:'0',commission:'0.5',ratio:1n,maxEntries:7});
const indexed = () => ({owner_id:'1-1',player_id:'1-1',destination_id:'3-1',validator,vault_address:address(1),snapshot_meta:meta(),
  fuel_p:'4000000',defusing_p:'0',power_p:'4000000',owner_power_p:'2000000',preview_commission:'0.5',
  positions_meta:{height:'3353000',complete:true,power_ready:true},positions:[
    {address:address(2),is_vault:false,owner_id:'1-1',validator,native_ready:true,power_ready:true,unbonding_entries:0,
      fuel_p:'3000000',power_p:'3000000',owner_power_p:'1500000',commission:'0.5'},
    {address:address(1),is_vault:true,owner_id:'1-1',validator,native_ready:true,power_ready:true,unbonding_entries:0,
      fuel_p:'1000000',power_p:'1000000',owner_power_p:'500000',commission:'0.5'}]});
const player = () => ({id:'1-1',alpha:'2',spendable_alpha_p:'2999999',funds_meta:{height:'3353000',ready:true},snapshot_meta:meta()});

async function postgresVaultSnapshot() {
  const body=JSON.parse(fs.readFileSync(process.env.STRUCTS_REACTOR_VAULT_FIXTURE || 'tools/proto/reactor-unprovisioned-api.json','utf8'));
  const api=new GuildAPI();api.ajax.get=async()=>body;
  const indexed=await api.getInfusionByPlayerId(body.data.player_id);
  const rpc={chainId:CHAIN.ID,height:body.meta.height,request:async(service,method,bytes)=>{
    if(service==='structs.structs.Query') {
      if(method==='Player')return Structs.QueryGetPlayerResponse.encode(Structs.QueryGetPlayerResponse.fromPartial({Player:{id:indexed.player_id,guildId:'0-991087',primaryAddress:indexed.positions[1].address}})).finish();
      if(method==='Guild')return Structs.QueryGetGuildResponse.encode(Structs.QueryGetGuildResponse.fromPartial({Guild:{id:'0-991087',primaryReactorId:indexed.destination_id,joinInfusionMinimum:'0'}})).finish();
      if(method==='Reactor')return Structs.QueryGetReactorResponse.encode(Structs.QueryGetReactorResponse.fromPartial({Reactor:{id:indexed.destination_id,validator:indexed.validator,defaultCommission:'500000000000000000'}})).finish();
      if(method==='Vault')return Structs.QueryVaultResponse.encode({ownerId:indexed.player_id,address:indexed.vault_address,provisioned:false}).finish();
    }
    if(service==='cosmos.staking.v1beta1.Query') {
      if(method==='Validator')return Staking.QueryValidatorResponse.encode(Staking.QueryValidatorResponse.fromPartial({validator:{operatorAddress:indexed.validator,jailed:false,status:3}})).finish();
      if(method==='Params')return Staking.QueryParamsResponse.encode(Staking.QueryParamsResponse.fromPartial({params:{bondDenom:'ualpha',maxEntries:7}})).finish();
    }
    if(service==='cosmos.bank.v1beta1.Query') {
      assert.equal(QuerySpendableBalanceByDenomRequest.decode(bytes).address,indexed.vault_address);
      return QuerySpendableBalanceByDenomResponse.encode({balance:{denom:'ualpha',amount:'5000000'}}).finish();
    }
    throw new Error(`Unexpected unprovisioned query ${service}/${method}`);
  }};
  const state=await readReactorSnapshot(rpc,indexed,indexed.player_id,'0-991087','1000');
  assert.equal(indexed.positions_meta.vault_provisioned,false);
  assert.equal(state.fuel,18014398509481988n);assert.equal(state.maxAlpha,18014398514n);
  assert.equal(state.positions[0].isVault,true);assert.equal(state.positions[0].fuel,9007199254740995n);
  assert.equal(state.ownerPower,1n,'Stored applied power is distinct from native stake');
  assert.equal(reactorPreview(state,state.initialAlpha+1n),4503599627870n);
  console.log('Captured restricted-role PostgreSQL/PHP unprovisioned-vault response passed the actual API factory and native reactor preview adapter.');
}
const intent = direction => ({kind:'reactor_change',version:1,ownerId:'1-1',guildId:'0-1',reactorId:'3-1',direction,amount:'2000000'});
let registry, signer, offline;

async function signedChange(change) {
  const tx = SigningTransaction.create({intent:change,isAction:false,retryLimit:0,accountAddress:signer.address,enqueuedAtBlock:3353000});
  const legs = change.direction==='defuse' ? [{address:address(1),isVault:true,amount:'1000000'},{address:address(2),isVault:false,amount:'1000000'}]
    : [{address:address(1),isVault:true,amount:change.amount}];
  tx.messages = legs.map(leg=>({typeUrl:change.direction==='defuse'?'/structs.structs.MsgReactorDefuse':'/structs.structs.MsgReactorInfuse',
    payload:{ownerId:leg.isVault?'1-1':'',delegatorAddress:leg.isVault?'':leg.address,validatorAddress:validator,amount:{denom:'ualpha',amount:leg.amount}}}));
  const messages = tx.toCosmosMsgs(registry), fee={amount:[{denom:'ualpha',amount:'0'}],gas:'20000000'};
  const raw = await offline.sign(signer.address,messages,fee,'',{accountNumber:1,sequence:2,chainId:CHAIN.ID},0n);
  tx.submission = {...await signedSubmission(raw,{messages,registry,fee,accountAddress:signer.address,accountNumber:1,sequence:2,
    context:{chainId:CHAIN.ID,protocol:CHAIN.PROTOCOL,indexedHeight:'3353000',observedHeight:'3353000',timeoutHeight:'0'}}),
    reactor:{...context(),direction:change.direction,amount:change.amount,legs}};
  // Persisted submission context contains only the primitive fields preparation emits.
  delete tx.submission.reactor.ratio;
  tx.status=TX_STATUS.SUCCEEDED;
  tx.response={stage:'committed',code:0,chainId:CHAIN.ID,height:'3353000',txIndex:1,blockHash:'A'.repeat(64),transactionHash:tx.submission.hash};
  return tx;
}

async function mathAndNativeSnapshot() {
  assert.equal(reactorOwnerPower(1n,'0.5'),1n);assert.equal(reactorOwnerPower(3n,'0.5'),1n);
  assert.equal(reactorOwnerPower(999n,'0'),999n);assert.equal(reactorOwnerPower(999n,'1'),0n);
  assert.equal(alphaDecimal(3500001n),'3.500001');
  const formatter = new NumberFormatter();
  assert.equal(formatter.formatExact('999999999999999999999'),'999E');
  assert.equal(formatter.formatExact('9007199254740993'),'9P');
  const data=indexed(),state=reactorState(data,context());
  assert.equal(state.initialAlpha,4n);assert.equal(state.maxAlpha,6n);
  assert.equal(reactorPreview(state,4n),2000n);assert.equal(reactorPreview(state,5n),2500n);
  assert.equal(reactorPreview(state,2n),1000n);
  const gated=reactorState(data,{...context(),ratio:0n});
  assert.equal(reactorPreview(gated,4n),2000n,'Current applied power remains authoritative');
  assert.equal(reactorPreview(gated,5n),1500n,'Only the changed vault gets the live zero ratio');
  assert.equal(reactorPreview(reactorState(data,{...context(),commission:'0'}),5n),3500n);
  assert.equal(reactorPreview(reactorState(data,{...context(),commission:'1'}),5n),1500n);
  const held=indexed();held.positions[1].unbonding_entries=7;
  assert.equal(reactorPreview(reactorState(held,context()),2n),1000n);
  held.positions[0].unbonding_entries=7;
  assert.throws(()=>reactorPreview(reactorState(held,context()),3n),/cover/);
  const empty=indexed();Object.assign(empty.positions[1],{fuel_p:'0',power_p:'0',owner_power_p:'0',commission:null,recorded_owner_id:null,stored_fuel_p:null});
  empty.fuel_p='3000000';empty.owner_power_p='1500000';empty.power_p='3000000';
  assert.equal(reactorPreview(reactorState(empty,context()),4n),2000n,'A proved absent vault infusion can receive its first deposit');
  for (const patch of [{fuel_p:null},{owner_power_p:'2000001'},{positions_meta:{height:'3353001',complete:true,power_ready:true}}]) {
    assert.throws(()=>reactorState({...indexed(),...patch},context()));
  }
  assert.throws(()=>reactorPreview(state,7n),/spendable/);
  const large=indexed();
  large.positions=Array.from({length:1000},(_,i)=>{
    const bytes=new Uint8Array(20);new DataView(bytes.buffer).setUint32(16,i+10000);
    return {...large.positions[0],address:i?toBech32('structs',bytes):address(1),is_vault:i===0,
      fuel_p:'9007199254740993000',power_p:'9007199254740993000',owner_power_p:'4503599627370496500'};
  });
  large.fuel_p='9007199254740993000000';large.owner_power_p='4503599627370496500000';
  const largeState=reactorState(large,context());
  assert.equal(largeState.initialAlpha,9007199254740993n);assert.equal(largeState.maxAlpha,9007199254740995n);
  assert.equal(reactorPreview(largeState,largeState.initialAlpha),4503599627370496500n);
  const control={jailed:false,status:3,funds:'2999999',guild:'0-1',validator,wrongDenom:false};
  const rpc={chainId:CHAIN.ID,height:'3353000',request:async(service,method,bytes)=>{
    if(service==='structs.structs.Query') {
      if(method==='Player') return Structs.QueryGetPlayerResponse.encode(Structs.QueryGetPlayerResponse.fromPartial({Player:{id:'1-1',guildId:control.guild,primaryAddress:address(2)}})).finish();
      if(method==='Guild') return Structs.QueryGetGuildResponse.encode(Structs.QueryGetGuildResponse.fromPartial({Guild:{id:'0-1',primaryReactorId:'3-1',joinInfusionMinimum:'3500001'}})).finish();
      if(method==='Reactor') return Structs.QueryGetReactorResponse.encode(Structs.QueryGetReactorResponse.fromPartial({Reactor:{id:'3-1',validator:control.validator,defaultCommission:'500000000000000000'}})).finish();
      if(method==='Vault') return Structs.QueryVaultResponse.encode({ownerId:'1-1',address:address(1),provisioned:true}).finish();
    }
    if(service==='cosmos.staking.v1beta1.Query') {
      if(method==='Validator') return Staking.QueryValidatorResponse.encode(Staking.QueryValidatorResponse.fromPartial({validator:{operatorAddress:validator,jailed:control.jailed,status:control.status}})).finish();
      if(method==='Params') return Staking.QueryParamsResponse.encode(Staking.QueryParamsResponse.fromPartial({params:{bondDenom:'ualpha',maxEntries:7}})).finish();
      if(method==='DelegatorDelegations') return Staking.QueryDelegatorDelegationsResponse.encode(Staking.QueryDelegatorDelegationsResponse.fromPartial({delegationResponses:[{
        delegation:{delegatorAddress:address(2),validatorAddress:validator,shares:'2000000000000000000000000'},balance:{denom:'ualpha',amount:'2000000'}}],pagination:{nextKey:new Uint8Array()}})).finish();
      if(method==='DelegatorUnbondingDelegations') return Staking.QueryDelegatorUnbondingDelegationsResponse.encode(Staking.QueryDelegatorUnbondingDelegationsResponse.fromPartial({unbondingResponses:[],pagination:{nextKey:new Uint8Array()}})).finish();
    }
    if(service==='cosmos.bank.v1beta1.Query') {
      const req=QuerySpendableBalanceByDenomRequest.decode(bytes);assert.equal(req.address,rpc.height==='3353000'?address(1):address(2));
      return QuerySpendableBalanceByDenomResponse.encode({balance:{denom:control.wrongDenom?'other':'ualpha',amount:control.funds}}).finish();
    }
    throw new Error(`Unexpected ${service}/${method}`);
  }};
  const native=await readReactorSnapshot(rpc,indexed(),'1-1','0-1','1000');
  assert.equal(native.funds,2999999n);assert.equal(native.minimum,3500001n);assert.equal(native.ratio,1n);
  control.jailed=true;assert.equal((await readReactorSnapshot(rpc,indexed(),'1-1','0-1','1000')).ratio,0n);
  control.jailed=false;control.status=2;assert.equal((await readReactorSnapshot(rpc,indexed(),'1-1','0-1','1000')).ratio,0n);
  control.status=3;control.guild='0-2';await assert.rejects(()=>readReactorSnapshot(rpc,indexed(),'1-1','0-1','1000'),/membership/);
  control.guild='0-1';control.wrongDenom=true;await assert.rejects(()=>readReactorSnapshot(rpc,indexed(),'1-1','0-1','1000'),/funding/);
  control.wrongDenom=false;rpc.height='3352999';
  const legacy={player_id:'1-1',address:address(2),destination_id:'3-1',fuel_p:'2000000',power_p:'2000000',position_commission:'0.5',snapshot_meta:meta('3352999')};
  const old=await readReactorSnapshot(rpc,legacy,'1-1','0-1','1000');
  assert.equal(old.source,address(2));assert.equal(old.ownerPower,1000000n);assert.equal(old.positions[0].available,2000000n);
  const stateForRead={signingAccount:signer,thisGuild:{id:'0-1',reactor_ratio:'1000'},keyPlayers:{player:{id:'1-1'}}};
  let switchAccount=false;
  const manager={chainQuery:{closed:false,readSnapshot:async(read,options)=>{
    assert.equal(options.height,'3352999');const data=await read(rpc);
    if(switchAccount)stateForRead.signingAccount={address:address(9)};
    return {chainId:CHAIN.ID,height:rpc.height,observedHeight:rpc.height,data};
  }}};
  const alpha=new AlphaManager(stateForRead,manager);
  assert.equal((await alpha.getReactorState(legacy,new AbortController().signal)).source,address(2));
  switchAccount=true;await assert.rejects(()=>alpha.getReactorState(legacy,new AbortController().signal),/context changed/);
  assert.throws(()=>alpha.convertAlphaToUAlpha(Number.MAX_SAFE_INTEGER+1),/not exact/);
}

function storage() {
  const saved=new Map();return {getItem:key=>saved.get(key)??null,setItem:(key,v)=>saved.set(key,v),removeItem:key=>saved.delete(key),get length(){return saved.size;},key:i=>[...saved.keys()][i]};
}
function dom() {
  const elements=new Map();
  const element=id=>{
    if(!elements.has(id)) {
      const classes=new Set();const handlers={};
      elements.set(id,{innerText:'',innerHTML:'',disabled:false,handlers,
        addEventListener:(name,fn)=>(handlers[name]??=[]).push(fn),
        classList:{add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name),
          toggle:(name,on)=>on?classes.add(name):classes.delete(name)}});
    }
    return elements.get(id);
  };
  globalThis.document={getElementById:element,querySelector:element};
  return element;
}
async function flow() {
  globalThis.localStorage=storage();globalThis.window=new EventTarget();
  Object.defineProperty(globalThis.navigator,'locks',{configurable:true,value:{request:async(n,o,run)=>run({})}});
  const element=dom(),control={sends:0,committed:true,reject:false,reads:0,sets:0,ready:true};
  const state={currentBlockHeight:3353000,signingAccount:signer,signingClient:{},thisGuild:{id:'0-1',reactor_ratio:'1000'},
    keyPlayers:{player:{id:'1-1',player:{alpha:'999999'},setPlayer(p){control.sets++;this.player=p;}}}};
  const api={getInfusionByPlayerId:async(owner,options)=>{
    assert.equal(owner,'1-1');assert.equal(options.timeoutMs,5000);control.reads++;
    const data=indexed();data.positions_meta.complete=control.ready;return data;
  },getPlayer:async(owner,options)=>{assert.equal(owner,'1-1');assert.equal(options.timeoutMs,16000);return player();}};
  const submit={prepare:async tx=>(await signedChange(tx.intent)).submission,
    send:async tx=>{control.sends++;return {stage:'check_tx',code:control.reject?9:0,transactionHash:tx.submission.hash};},
    find:async tx=>control.committed?{stage:'committed',code:0,chainId:CHAIN.ID,height:'3353000',txIndex:1,blockHash:'A'.repeat(64),transactionHash:tx.submission.hash}:null};
  const queue=new SigningQueueManager(state,{registry,wsUrl:'reactor-flow-fixture',submission:submit});
  const manager=Object.assign(Object.create(SigningClientManager.prototype),{queue});
  const alpha=new AlphaManager(state,manager);
  alpha.getReactorState=async(data,signal)=>{signal.throwIfAborted();return reactorState(data,context());};
  const router=new MenuPageRouter();MenuPage.router=router;
  for(const method of ['enablePageTemplate','setPageTemplateHeaderBtn','hideAndClearDialoguePanel']) MenuPage[method]=()=>{};
  MenuPage.setPageTemplateContent=html=>{control.html=html;};
  let view;
  router.registerController({name:'Guild',reactor(){},manageAlpha(data){view=new ManageAlphaViewModel(state,api,alpha,data);view.render();}});
  router.registerController({name:'Generic',menuWaiting(){}});
  router.goto('Guild','reactor');router.goto('Guild','manageAlpha',indexed());await pause(10);
  assert.equal(view.ready,true);assert.equal(view.infusedAlpha,4n);assert.equal(view.getMaxAlphaToInfuse(),6n,'Cached wealth never sets the funding limit');
  const click=id=>{for(const fn of element(id).handlers.click??[]) fn({preventDefault(){}});};
  return {state,api,alpha,queue,submit,control,router,element,click,get view(){return view;}};
}

async function reactorDisplayRefresh() {
  globalThis.window=new EventTarget();
  const element=dom();
  Object.assign(document,{visibilityState:'visible',addEventListener:()=>{}});
  const state={currentBlockHeight:3353001,signingAccount:signer,thisGuild:{id:'0-1'},keyPlayers:{player:{id:'1-1'}}};
  let next=indexed(),reads=0,release;
  const api={getGuild:async()=>({id:'0-1',primary_reactor_id:'3-1'}),getInfusionByPlayerId:async()=>{reads++;return next;}};
  const view=new ReactorViewModel(state,api),controller=new AbortController();
  await view.fetchPageData(controller.signal);
  view.startRefresh(controller.signal,{pollMs:100000,coalesceMs:1,retryMs:5,maxRetryMs:10});
  const changed=()=>{const event=new Event(EVENTS.ALPHA_COUNT_CHANGED);event.playerType='player';window.dispatchEvent(event);};
  next=new Promise(resolve=>{release=resolve;});changed();await pause(5);
  for(let i=0;i<20;i++)changed();
  assert.equal(reads,2,'external changes coalesce without overlapping reads');
  const updated={...indexed(),fuel_p:'9000000',snapshot_meta:meta('3353001')};next=updated;release(updated);await pause(10);
  assert.equal(element('guild-profile-alpha-infused-value').textContent,'9');
  assert.equal(view.canManage(),true);
  api.getInfusionByPlayerId=async()=>{throw new Error('temporary API outage');};changed();await pause(5);
  assert.equal(view.canManage(),false);assert.equal(element(view.manageAlphaBtnId).classList.contains('sui-mod-disabled'),true);
  api.getInfusionByPlayerId=async()=>updated;await pause(20);
  assert.equal(view.canManage(),true);assert.equal(element(view.manageAlphaBtnId).classList.contains('sui-mod-disabled'),false);
  api.getInfusionByPlayerId=async()=>indexed();
  await assert.rejects(view.fetchPageData(controller.signal),/moved backwards/);
  assert.equal(view.infusion.fuel_p,'9000000');
  api.getInfusionByPlayerId=()=>new Promise(resolve=>{release=resolve;});
  changed();await pause(5);state.signingAccount={address:address(9)};
  release({...updated,fuel_p:'7000000'});await pause(5);
  assert.equal(element('guild-profile-alpha-infused-value').textContent,'9','late prior-account reads cannot update the screen');
  controller.abort();let afterClose=0;api.getInfusionByPlayerId=async()=>{afterClose++;return updated;};
  changed();window.dispatchEvent(new Event('focus'));await pause(5);assert.equal(afterClose,0);
}

async function main() {
  await postgresVaultSnapshot();
  const wallet=await DirectSecp256k1HdWallet.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',{prefix:'structs'});
  [signer]=await wallet.getAccounts();registry=new Registry([...defaultRegistryTypes,...msgTypes]);offline=await SigningStargateClient.offline(wallet,{registry});
  await mathAndNativeSnapshot();
  await reactorDisplayRefresh();
  for(const direction of ['infuse','defuse']) {
    const tx=await signedChange(intent(direction));const committed=reactorCommit(tx);
    assert.equal(committed.height,'3353000');assert.equal(reactorRefreshReady(indexed(),player(),committed,3353000),true);
    for(const mutate of [copy=>copy.submission.reactor.legs[0].amount='2',copy=>copy.response.code=7,
      copy=>copy.response.transactionHash='0'.repeat(64),copy=>copy.submission.reactor.ownerId='1-9',copy=>copy.submission.reactor.legs.reverse()]) {
      if(direction==='infuse' && mutate.toString().includes('reverse')) continue;
      const copy=clone(tx.toJSON());mutate(copy);assert.throws(()=>reactorCommit(copy));
    }
    const missing=indexed();missing.positions_meta.complete=false;
    assert.equal(reactorRefreshReady(missing,player(),committed,3353000),false);
    const malformed=indexed();malformed.fuel_p=null;
    assert.equal(reactorRefreshReady(malformed,player(),committed,3353000),false);
    const lagging=player();lagging.snapshot_meta=meta('3352999');
    assert.equal(reactorRefreshReady(indexed(),lagging,committed,3353000),false);
    const rounded=indexed();rounded.fuel_p='2000002';rounded.defusing_p='1999998';
    assert.equal(reactorRefreshReady(rounded,player(),committed,3353000),true,'Readiness never assumes requested delta equals native result');
  }
  const success=await flow();success.click('manage-alpha-subtract');success.click('manage-alpha-subtract');
  assert.equal(success.view.alphaToInfuse,2n);assert.equal(success.element('manage-alpha-energy-value').innerHTML,'1k');
  const pending=success.view.save();success.view.save();await success.queue.transactOnBlock();await pending;
  assert.equal(success.control.sends,1);assert.equal(success.router.currentPage,'reactor');assert.equal(success.control.sets,1);

  const rejected=await flow();rejected.control.reject=true;rejected.view.alphaToInfuse=2n;
  const rejectedWait=rejected.view.save();await rejected.queue.transactOnBlock();await rejectedWait;await pause(10);
  assert.equal(rejected.router.currentPage,'manageAlpha');assert.equal(rejected.router.lastPage,'reactor');assert.equal(rejected.view.ready,true);
  rejected.router.goto('Guild','reactor');

  const unknown=await flow();unknown.control.committed=false;unknown.view.alphaToInfuse=2n;
  const unknownWait=unknown.view.save();await unknown.queue.transactOnBlock();assert.equal(unknown.router.currentPage,'menuWaiting');
  const restored=new SigningQueueManager(unknown.state,{registry,wsUrl:'reactor-flow-fixture',submission:unknown.submit});restored.loadPersistedState();
  await restored.reconcilePending();assert.equal(unknown.control.sends,1);assert.equal(restored.unresolved.size,1);
  unknown.router.goto('Guild','reactor');await unknownWait;unknown.control.committed=true;await restored.reconcilePending();
  assert.equal(unknown.control.sets,0,'A departed observer cannot apply state or navigate');assert.equal(unknown.control.sends,1);

  const delayed=await flow();delayed.control.ready=false;delayed.view.alphaToInfuse=2n;
  const delayedWait=delayed.view.save();await delayed.queue.transactOnBlock();await pause(10);
  assert.equal(delayed.router.currentPage,'menuWaiting');assert.equal(delayed.control.sets,0);
  delayed.router.goto('Guild','reactor');await delayedWait;

  const minimum=await flow();minimum.view.state.minimum=3500000n;minimum.view.postToggleRender();
  assert.equal(minimum.element('manage-alpha-subtract').disabled,true);
  minimum.view.ready=false;minimum.view.postToggleRender();assert.equal(minimum.element('manage-alpha-add').disabled,true);
  minimum.router.goto('Guild','reactor');

  const detached=await flow();let release;
  detached.alpha.getReactorState=()=>new Promise(resolve=>{release=resolve;});
  detached.router.goto('Guild','manageAlpha',indexed());await pause(10);
  const abandoned=detached.view;
  detached.router.goto('Guild','reactor');release(reactorState(indexed(),context()));await pause(10);
  assert.equal(abandoned.ready,false,'Late native reads never populate a departed view');

  const notificationLag=await flow();notificationLag.state.currentBlockHeight=3352999;
  assert.equal(notificationLag.view.canTarget(5n),true,'Verified post-H data outranks delayed block notifications');
  notificationLag.router.goto('Guild','reactor');

  const activation=await flow();activation.state.currentBlockHeight=3352999;
  Object.assign(activation.view.state,{height:'3352999',protocol:CHAIN.LEGACY_PROTOCOL});
  activation.view.systemModal.show();activation.state.currentBlockHeight=3353000;
  window.dispatchEvent(new Event(EVENTS.BLOCK_HEIGHT_CHANGED));
  assert.equal(activation.view.ready,false);
  assert.equal(activation.element('system-modal').classList.contains('hidden'),true);
  assert.equal(activation.element('manage-alpha-add').disabled,true);
  await pause(10);
  assert.equal(activation.view.ready,true);assert.equal(activation.view.state.protocol,CHAIN.PROTOCOL);
  activation.router.goto('Guild','reactor');

  const display=new ReactorViewModel({thisGuild:{id:'0-1'}},{});display.infusion={power_p:'9007199254740993000',preview_commission:'0.999999999999999999'};
  assert.equal(display.rawDisplay('power_p',1000n),'9P');assert.equal(display.commissionDisplay(),'99%');
  display.infusion.power_p=null;assert.equal(display.rawDisplay('power_p',1000n),'');
  console.log('Reactor controls passed: exact native preview context, per-position rounding/health, vault limits, real Alpha/queue/view signing flow, whole-group committed correlation, rejection, unknown/reload, missed notifications, delayed indexing and navigation cleanup. No chain broadcast.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
