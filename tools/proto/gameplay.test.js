import assert from 'node:assert/strict';
import fs from 'node:fs';
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
import {SigningClientManager} from '../../src/js/managers/SigningClientManager';
import {TransactionJournal} from '../../src/js/managers/TransactionJournal';
import {SigningSubmission, SigningDeferredError} from '../../src/js/managers/SigningSubmission';
import {GAMEPLAY_PERMISSIONS, gameplayIntent} from '../../src/js/util/GameplayIntent';
import {submissionBytes} from '../../src/js/util/SignedSubmission';
import {PERMISSIONS} from '../../src/js/constants/Permissions';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {STRUCTS_FREE_GAS} from '../../src/js/constants/Fee';

const max='18446744073709551615', prefix='/structs.structs.Msg';
const cases=[
  ['FleetMove',['9-1','2-2'],true,0],
  ['PlanetExplore',['1-1','New World'],true,0],
  ['PlanetRaidComplete',['9-1','0'.repeat(64),'123'],false,null],
  ['PlayerUpdateName',['1-1','Explorer'],false,null],
  ['StructActivate',['5-1',3],true,3],
  ['StructAttack',['5-1',['5-2','5-3'],'primary',4],true,4],
  ['StructBuildCancel',['5-1'],false,null],
  ['StructBuildComplete',['5-1','0'.repeat(64),'123'],false,null],
  ['StructBuildInitiate',['1-1',max,'land',max,5],true,5],
  ['StructDeactivate',['5-1'],true,0],
  ['StructDefenseClear',['5-1',2],true,2],
  ['StructDefenseSet',['5-1','5-2',2],true,2],
  ['StructMove',['5-1','planet','land',max,3],true,3],
  ['StructOreMinerComplete',['5-1','0'.repeat(64),'123'],false,null],
  ['StructOreRefineryComplete',['5-1','0'.repeat(64),'123'],false,null],
  ['StructStealthActivate',['5-1',3],true,3],
  ['StructStealthDeactivate',['5-1',3],true,3],
];
let actor, registry, offline;
function storage() {
  const values=new Map();
  return {get length(){return values.size;},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(k)??null,
    setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
}
function fixture(height='3353000') {
  globalThis.localStorage=storage();globalThis.window=new EventTarget();
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(name,options,read)=>read({name})}}});
  const control={height,owner:'1-1',mask:String(PERMISSIONS.ALL),signed:0,simulated:0,sends:0,gas:1000n,ready:true};
  const meta=()=>{
    const protocol=BigInt(control.height)<3353000n?CHAIN.LEGACY_PROTOCOL:CHAIN.PROTOCOL;
    return {chain_id:CHAIN.ID,height:control.height,indexed_height:control.height,observed_tip:control.height,
      activation_height:CHAIN.UPGRADE_HEIGHT,api_contract:CHAIN.API_CONTRACT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,
      protocol,observed_protocol:protocol,data_ready:control.ready,transaction_ready:control.ready,
      required_models:[],models:{},inventory_authority:'current-claims-v1'};
  };
  const encode=(type,value)=>type.encode(type.fromPartial(value)).finish();
  const request=async(service,method,bytes)=>{
    if(control.unavailable===method)throw new Error('Native query unavailable');
    if(service==='cosmos.auth.v1beta1.Query' && method==='Account')return encode(QueryAccountResponse,{account:{typeUrl:'/cosmos.auth.v1beta1.BaseAccount',
      value:encode(BaseAccount,{address:actor.address,accountNumber:1n,sequence:2n})}});
    if(service==='structs.structs.Query' && method==='Address') {
      assert.equal(Structs.QueryGetAddressRequest.decode(bytes).address,actor.address);
      return encode(Structs.QueryAddressResponse,{address:control.address??actor.address,playerId:control.owner,permissions:control.mask});
    }
    if(service==='cosmos.tx.v1beta1.Service' && method==='Simulate'){
      control.simulated++;control.bytes=SimulateRequest.decode(bytes).txBytes;
      if(control.reject)throw new Error(control.reject);
      return encode(SimulateResponse,{gasInfo:{gasUsed:control.gas}});
    }
    throw new Error(`Unexpected query ${service}/${method}`);
  };
  const player={id:'1-1',confirmedLastActionLoaded:true,confirmedLastActionBlockHeight:Number(height)-10,
    lastActionBlockHeight:0,setOptimisticLastActionBlockHeight(h){this.lastActionBlockHeight=h;}};
  const manager=Object.create(SigningClientManager.prototype);
  Object.assign(manager,{registry,connectionEpoch:1,gameState:{keyPlayers:{player},currentBlockHeight:Number(height),signingAccount:actor,
    guildAPI:{getBlockSnapshot:async()=>({meta:meta()})}}});
  manager.gameState.signingClient={sign:async(...args)=>{control.signed++;return offline.sign(...args);}};
  manager.chainQuery={closed:false,status:async()=>({chainId:CHAIN.ID,height:control.height}),readSnapshot:async(read,options={})=>{
    const h=options.height??control.height;
    if(options.height)assert.equal(h,height,'Simulation must use the authority/account height');
    return {chainId:CHAIN.ID,height:h,observedHeight:control.height,data:await read({chainId:CHAIN.ID,height:h,request})};
  },cometClient:{broadcastTxSync:async()=>{control.sends++;throw new Error('Reply lost after send');}}};
  const submission=new SigningSubmission(manager);
  const makeQueue=()=>new SigningQueueManager(manager.gameState,{registry,wsUrl:'ws://fixture',submission});
  manager.queue=makeQueue();
  return {manager,control,submission,makeQueue};
}
async function build(f,scenario) {
  const original=f.manager.queue.whenSettled;
  f.manager.queue.whenSettled=async id=>f.manager.queue.getTransaction(id);
  try {return await f.manager['queueMsg'+scenario[0]](...scenario[1]);}
  finally {f.manager.queue.whenSettled=original;}
}
async function builders() {
  assert.deepEqual(cases.map(([name])=>prefix+name).sort(),Object.keys(GAMEPLAY_PERMISSIONS).sort());
  for(const height of ['3352999','3353000'])for(const scenario of cases){
    const f=fixture(height),tx=await build(f,scenario);
    assert.equal(tx.intent.kind,'gameplay');assert.equal(tx.intent.typeUrl,prefix+scenario[0]);
    assert.equal(tx.isAction,scenario[2]);assert.equal(tx.chargeCost,scenario[3]);
    if(tx.chargeCost>0)assert.equal(f.manager.gameState.keyPlayers.player.lastActionBlockHeight,Number(height));
    const restored=SigningTransaction.fromJSON(JSON.parse(JSON.stringify(tx)));
    assert.deepEqual(restored.intent,tx.intent);
    const result=await f.submission.prepare(restored),raw=TxRaw.decode(submissionBytes(result)),body=TxBody.decode(raw.bodyBytes);
    assert.equal(body.messages.length,1);assert.equal(body.messages[0].typeUrl,tx.intent.typeUrl);
    assert.equal(body.timeoutHeight,height==='3352999'?3352999n:0n);
    assert.equal(AuthInfo.decode(raw.authInfoBytes).fee.gasLimit,BigInt(STRUCTS_FREE_GAS));
    assert.equal(result.gameplay.ownerId,'1-1');assert.equal(result.transfer,undefined);
    assert.equal(f.control.signed,1);assert.equal(f.control.simulated,1);assert.equal(f.control.sends,0);
    assert.deepEqual(submissionBytes(result),f.control.bytes);
    const decoded=registry.decode(body.messages[0]);assert.equal(decoded.creator,actor.address);
    if(scenario[0]==='StructBuildInitiate'){
      assert.equal(decoded.structTypeId,max);assert.equal(decoded.slot,max);
      if(height==='3353000' && process.env.STRUCTS_GAMEPLAY_FIXTURE)fs.writeFileSync(process.env.STRUCTS_GAMEPLAY_FIXTURE,JSON.stringify({
        release:'96cea3a322c406b46ca1feb880dc4497ebd9353f',signed_tx:result.bytes,account_number:result.accountNumber,
        timeout_height:result.timeoutHeight,messages:[{type_url:tx.intent.typeUrl,expected:registry.lookupType(tx.intent.typeUrl).toJSON(decoded)}],
      },null,2)+'\n');
    }
  }
  console.log('All 17 existing gameplay builders preserve lanes/charge, exact payloads, pre-H timeout and post-H signed simulation.');
}
async function refusals() {
  for(const scenario of cases.filter(([name])=>GAMEPLAY_PERMISSIONS[prefix+name]!==null)){
    const f=fixture(),tx=await build(f,scenario);f.control.mask=String(PERMISSIONS.ALL^GAMEPLAY_PERMISSIONS[tx.intent.typeUrl]);
    await assert.rejects(()=>f.submission.prepare(tx),/gameplay permission/);assert.equal(f.control.signed,0);
  }
  for(const patch of [{owner:''},{owner:'1-9'},{address:'changed'}]){
    const f=fixture(),tx=await build(f,cases[0]);Object.assign(f.control,patch);
    await assert.rejects(()=>f.submission.prepare(tx),/authority changed/);assert.equal(f.control.signed,0);
  }
  for(const method of ['Account','Address','Simulate']){
    const f=fixture(),tx=await build(f,cases[0]);f.control.unavailable=method;
    await assert.rejects(()=>f.submission.prepare(tx),/unavailable/);assert.equal(f.control.sends,0);
  }
  for(const failure of ['stale proof anchor','destroyed struct','insufficient charge','target permission denied']){
    const f=fixture(),tx=await build(f,cases[7]);f.control.reject=failure;
    await assert.rejects(()=>f.submission.prepare(tx),new RegExp(failure));assert.equal(f.control.simulated,1);assert.equal(f.control.sends,0);
  }
  const unready=fixture(),tx=await build(unready,cases[0]);unready.control.ready=false;
  await assert.rejects(()=>unready.submission.prepare(tx),SigningDeferredError);assert.equal(unready.control.signed,0);
  const gas=fixture(),gasTx=await build(gas,cases[0]);gas.control.gas=BigInt(STRUCTS_FREE_GAS)+1n;
  await assert.rejects(()=>gas.submission.prepare(gasTx),/gas limit/);
  const crossed=fixture('3352999'),crossedTx=await build(crossed,cases[0]);
  crossed.manager.gameState.signingClient.sign=async(...args)=>{
    crossed.control.signed++;const raw=await offline.sign(...args);crossed.control.height='3353000';return raw;
  };
  await assert.rejects(()=>crossed.submission.prepare(crossedTx),/Protocol changed while signing/);
  assert.equal(crossed.control.sends,0);
  const switched=fixture(),switchedTx=await build(switched,cases[0]);
  switched.manager.gameState.signingClient.sign=async(...args)=>{
    const raw=await offline.sign(...args);switched.manager.gameState.signingAccount={address:'other'};return raw;
  };
  await assert.rejects(()=>switched.submission.prepare(switchedTx),/Signing connection changed/);
  assert.equal(switched.control.simulated,0);assert.equal(switched.control.sends,0);
  const dynamic=fixture(),nameTx=await build(dynamic,cases[3]);dynamic.control.mask='0';dynamic.control.reject='native UGC permission denied';
  await assert.rejects(()=>dynamic.submission.prepare(nameTx),/UGC permission/);assert.equal(dynamic.control.simulated,1);
  assert.throws(()=>gameplayIntent({...tx.intent,typeUrl:'/structs.structs.MsgPlayerSend'}),/Invalid gameplay/);
  assert.throws(()=>gameplayIntent({...tx.intent,payload:{...tx.intent.payload,creator:actor.address}}),/signer/);
  assert.throws(()=>gameplayIntent({...tx.intent,payload:{...tx.intent.payload,ownerId:'1-9'}}),/Unknown field/);
  const attack=fixture(),targets=['5-2'],attackTx=await build(attack,['StructAttack',['5-1',targets,'primary',0],true,0]);
  targets.push('5-9');assert.deepEqual(attackTx.intent.payload.targetStructId,['5-2']);
  assert.throws(()=>attackTx.intent.payload.targetStructId.push('5-9'));
  console.log('Authority/permission, unready index, failed native reads/simulation, gas ceiling and immutable selection refusals passed.');
}
async function queueRecovery() {
  const f=fixture(),first=await build(f,cases[4]),second=await build(f,cases[11]);
  const player=f.manager.gameState.keyPlayers.player;
  player.confirmedLastActionBlockHeight=f.manager.gameState.currentBlockHeight;
  await f.manager.queue.transactOnBlock();assert.equal(f.control.signed,0,'Action lane retains its charge gate');
  player.confirmedLastActionBlockHeight-=10;
  await f.manager.queue.transactOnBlock();
  assert.equal(first.status,TX_STATUS.UNKNOWN);assert.equal(second.status,TX_STATUS.QUEUED);assert.equal(f.control.sends,1);
  const journal=new TransactionJournal(actor.address).read();assert.equal(journal[0].phase,'unknown');
  const restored=f.makeQueue();restored.loadPersistedState();
  await restored.transactOnBlock();await restored.transactOnBlock();
  assert.equal(f.control.signed,1);assert.equal(f.control.sends,1);assert.equal(restored.getTransaction(first.id).status,TX_STATUS.UNKNOWN);
  assert.throws(()=>restored.enqueueGameplayImmediate(prefix+'StructBuildCancel',{structId:'5-1'}),/existing submission/);
  const blocked=fixture(),id=blocked.manager.queue.enqueueImmediate(prefix+'StructActivate',{structId:'5-1'});
  await blocked.manager.queue.transactOnBlock();assert.equal(blocked.manager.queue.getTransaction(id).status,TX_STATUS.QUEUED);
  assert.equal(blocked.control.signed,0,'An old generic payload is not silently promoted to reviewed intent');
  const prepared=fixture(),preparedTx=await build(prepared,cases[7]);
  preparedTx.submission=await prepared.submission.prepare(preparedTx);preparedTx.status=TX_STATUS.PREPARING;
  new TransactionJournal(actor.address).write(preparedTx,'prepared');
  prepared.control.mask='0';const reload=prepared.makeQueue();reload.loadPersistedState();
  await reload.transactOnBlock();assert.equal(reload.getTransaction(preparedTx.id).status,TX_STATUS.DROPPED);
  assert.equal(prepared.control.signed,1);assert.equal(prepared.control.sends,0,'Unsent recovered proof must recheck current authority');
  console.log('Real queue preserves action charge/order, uncertain bytes across reload and the unreviewed legacy-payload hold.');
}
async function main() {
  const wallet=await DirectSecp256k1HdWallet.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',{prefix:'structs'});
  [actor]=await wallet.getAccounts();registry=new Registry([...defaultRegistryTypes,...msgTypes]);
  offline=await SigningStargateClient.offline(wallet,{registry});
  await builders();await refusals();await queueRecovery();
}
main().catch(error=>{console.error(error);process.exitCode=1;});
