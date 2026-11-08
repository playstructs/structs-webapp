import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fromHex, toBech32} from '@cosmjs/encoding';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import {BaseAccount} from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import {QueryAccountResponse} from 'cosmjs-types/cosmos/auth/v1beta1/query';
import {QuerySpendableBalanceByDenomRequest, QuerySpendableBalanceByDenomResponse} from 'cosmjs-types/cosmos/bank/v1beta1/query';
import {SimulateRequest, SimulateResponse} from 'cosmjs-types/cosmos/tx/v1beta1/service';
import {AuthInfo, TxBody, TxRaw} from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import * as Structs from '../../src/js/ts/structs.structs/types/structs/structs/query';
import {objectType, planetStatus, techPowerGeneration} from '../../src/js/ts/structs.structs/types/structs/structs/keys';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {SigningSubmission, SigningDeferredError} from '../../src/js/managers/SigningSubmission';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {SigningTransaction, TX_STATUS} from '../../src/js/models/SigningTransaction';
import {AlphaManager} from '../../src/js/managers/AlphaManager';
import {readGeneratorSnapshot} from '../../src/js/managers/GeneratorSnapshot';
import {generatorPreview} from '../../src/js/util/GeneratorState';
import {GuildAPI} from '../../src/js/api/GuildAPI';
import {generatorIntent} from '../../src/js/util/GeneratorIntent';
import {generatorCommit} from '../../src/js/util/GeneratorCompletion';
import {submissionBytes} from '../../src/js/util/SignedSubmission';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {STRUCTS_FREE_GAS} from '../../src/js/constants/Fee';
import {PLAYER_TYPES} from '../../src/js/constants/PlayerTypes';
import {TEST_MNEMONIC} from './helpers';

const address = n => toBech32('structs',new Uint8Array(20).fill(n));
const baseIntent = () => ({kind:'generator_fund',version:1,ownerId:'1-1',structId:'5-1',amount:'3000000'});
let signer, registry, offline;
function fixture(height=3353000) {
  const control = {height,permissions:'32',actor:'1-1',signed:0,simulated:0,gas:4000000n,funds:'5000000',
    fundsReady:true,provisioned:true,owner:'1-1',online:true,destroyed:false,locationType:objectType.planet,
    locationId:'2-1',generation:techPowerGeneration.smallGenerator,rate:'2',planetStatus:planetStatus.active,
    queryError:null,lateHeight:null,requests:[],mutateIndexed:data=>data,mutateResponse:(method,data)=>data};
  const meta = () => {
    const h=String(control.height),protocol=control.height<3353000?CHAIN.LEGACY_PROTOCOL:CHAIN.PROTOCOL;
    return {chain_id:CHAIN.ID,height:h,indexed_height:h,observed_tip:h,api_contract:CHAIN.API_CONTRACT,
      activation_height:CHAIN.UPGRADE_HEIGHT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,protocol,observed_protocol:protocol,
      data_ready:true,transaction_ready:true,required_models:['inventory'],models:{inventory:{ready:true,height:h}},inventory_authority:'current-claims-v1'};
  };
  const manager = {registry,connectionEpoch:1,gameState:{signingAccount:signer,signingClient:{sign:async(...args)=>{
    control.signed++;control.signedHeight=String(control.height);
    const raw=await offline.sign(...args);if(control.lateHeight)control.height=control.lateHeight;return raw;
  }},guildAPI:{getPlayer:async()=>control.mutateIndexed({id:'1-1',vault_address:address(1),primary_address:address(2),
    alpha:'5',spendable_alpha_p:control.funds,snapshot_meta:meta(),
    funds_meta:{ready:control.fundsReady,height:String(control.height),provisioned:control.provisioned}})}}};
  const encode = (method,codec,data) => codec.encode(codec.fromPartial(control.mutateResponse(method,data))).finish();
  const request = async(service,method,bytes) => {
    control.requests.push([service,method]);
    if (method===control.queryError) throw new Error('Native query unavailable');
    if(service==='cosmos.auth.v1beta1.Query') return encode(method,QueryAccountResponse,{account:{typeUrl:'/cosmos.auth.v1beta1.BaseAccount',
      value:BaseAccount.encode(BaseAccount.fromPartial({address:signer.address,accountNumber:1n,sequence:2n})).finish()}});
    if(service==='structs.structs.Query') {
      if(method==='Address') {
        assert.equal(Structs.QueryGetAddressRequest.decode(bytes).address,signer.address);
        return encode(method,Structs.QueryAddressResponse,{address:signer.address,playerId:control.actor,permissions:control.permissions,proofNonce:'0'});
      }
      if(method==='Player') {
        const {id}=Structs.QueryGetPlayerRequest.decode(bytes);
        return encode(method,Structs.QueryGetPlayerResponse,{Player:{id,primaryAddress:address(2),fleetId:'9-1'}});
      }
      if(method==='Struct') {
        assert.equal(Structs.QueryGetStructRequest.decode(bytes).id,'5-1');
        return encode(method,Structs.QueryGetStructResponse,{Struct:{id:'5-1',owner:control.owner,type:'20',locationId:control.locationId,locationType:control.locationType},
          structAttributes:{isOnline:control.online,isDestroyed:control.destroyed}});
      }
      if(method==='StructType') return encode(method,Structs.QueryGetStructTypeResponse,{StructType:{id:'20',powerGeneration:control.generation,generatingRate:control.rate}});
      if(method==='Fleet') {
        assert.equal(Structs.QueryGetFleetRequest.decode(bytes).id,'9-1');
        return encode(method,Structs.QueryGetFleetResponse,{Fleet:{id:'9-1',owner:control.owner,locationId:'2-1',locationType:objectType.planet}});
      }
      if(method==='Planet') {
        assert.equal(Structs.QueryGetPlanetRequest.decode(bytes).id,'2-1');
        return encode(method,Structs.QueryGetPlanetResponse,{Planet:{id:'2-1',status:control.planetStatus}});
      }
      if(method==='Vault') return encode(method,Structs.QueryVaultResponse,{ownerId:'1-1',address:address(1),provisioned:control.provisioned});
    }
    if(service==='cosmos.bank.v1beta1.Query') {
      assert.deepEqual(QuerySpendableBalanceByDenomRequest.decode(bytes),{address:address(control.height<3353000?2:1),denom:'ualpha'});
      return encode(method,QuerySpendableBalanceByDenomResponse,{balance:{denom:'ualpha',amount:control.funds}});
    }
    if(service==='cosmos.tx.v1beta1.Service') {
      control.simulationBytes=SimulateRequest.decode(bytes).txBytes;
      assert.equal(TxBody.decode(TxRaw.decode(control.simulationBytes).bodyBytes).messages.length,1);control.simulated++;
      return SimulateResponse.encode(SimulateResponse.fromPartial({gasInfo:{gasUsed:control.gas}})).finish();
    }
    throw new Error(`Unexpected query ${service}/${method}`);
  };
  manager.chainQuery={closed:false,status:async()=>({chainId:CHAIN.ID,height:String(control.height)}),readSnapshot:async(read,options={})=>{
    const h=options.height;
    if(h===undefined) {
      // Only the signer's latest sequence is read unpinned.
      const latestRequest=async(service,...args)=>{
        assert.equal(service,'cosmos.auth.v1beta1.Query');
        return control.latestSequence===undefined?request(service,...args):QueryAccountResponse.encode({account:{typeUrl:'/cosmos.auth.v1beta1.BaseAccount',
          value:BaseAccount.encode(BaseAccount.fromPartial({address:signer.address,accountNumber:1n,sequence:control.latestSequence})).finish()}}).finish();
      };
      return {chainId:CHAIN.ID,height:String(control.height),observedHeight:String(control.height),
        data:await read({chainId:CHAIN.ID,height:String(control.height),request:latestRequest})};
    }
    const pinnedRequest=(service,...args)=>{
      assert.equal(h,service==='cosmos.tx.v1beta1.Service'?control.signedHeight:String(control.height));
      return request(service,...args);
    };
    return {chainId:CHAIN.ID,height:h,observedHeight:String(control.height),data:await read({chainId:CHAIN.ID,height:h,request:pinnedRequest})};
  }};
  const tx=SigningTransaction.create({intent:baseIntent(),isAction:false,retryLimit:0,accountAddress:signer.address,enqueuedAtBlock:height});
  return {control,manager,tx,meta,submission:new SigningSubmission(manager)};
}

function indexedGenerator(f) {
  return {struct_id:'5-1',source_address:address(f.control.height<3353000?2:1),snapshot_meta:f.meta(),
    positions_ready:true,fuel_p:'13000000',power_p:'20000000',source_exists:true,source_fuel_p:'2000000',
    source_power_p:'6000000',source_ratio_p:'3',source_commission:'0',source_generator_disabled:false,source_recorded_owner_id:'1-1'};
}

async function previewTests() {
  const f=fixture(),indexed=indexedGenerator(f);
  const read = (row,owner='1-1') => f.manager.chainQuery.readSnapshot(
    rpc=>readGeneratorSnapshot(rpc,row,owner,'5-1',signer.address),{height:String(f.control.height)});
  const {data:state}=await read(indexed);
  assert.equal(f.control.signed,0);assert.equal(state.maxAlpha,'5');
  assert.equal(generatorPreview(state,0n),20000n,'Initial watts come from stored milliwatts, including deferred/disabled positions');
  assert.equal(generatorPreview(state,1n),20000n,'Funding re-prices only the vault position from its old rate');
  assert.equal(generatorPreview(state,3n),24000n);
  assert.throws(()=>generatorPreview(state,6n),/available funds/);
  const disabled={...indexed,power_p:'14000000',source_power_p:'0',source_generator_disabled:true};
  const disabledState=(await read(disabled)).data;
  assert.equal(generatorPreview(disabledState,0n),14000n);assert.equal(generatorPreview(disabledState,3n),24000n);
  const missing={...indexed,source_exists:false,source_fuel_p:null,source_power_p:null,source_ratio_p:null,
    source_commission:null,source_generator_disabled:null,source_recorded_owner_id:null};
  f.control.provisioned=false;
  assert.equal(generatorPreview((await read(missing)).data,3n),26000n,'Explicit same-height absence permits first funding of a prefunded vault');
  await assert.rejects(()=>read({...missing,source_fuel_p:'0'}),/Absent/);
  const large={...indexed,fuel_p:'9007199267740993',power_p:'9007199274740993'};
  assert.equal(generatorPreview((await read(large)).data,3n),9007199278740n);
  for (const patch of [{positions_ready:false},{source_address:address(9)},{struct_id:'5-9'},
      {source_power_p:'6000001'},{source_fuel_p:2000000},{source_generator_disabled:true},{source_commission:'1.1'},
      {source_fuel_p:'18446744073709551615'},{source_power_p:'20000001',source_ratio_p:'0'}]) {
    await assert.rejects(()=>read({...indexed,...patch}));
  }
  const stale={...indexed,snapshot_meta:{...indexed.snapshot_meta,height:'3352999',indexed_height:'3352999'}};
  await assert.rejects(()=>read(stale));
  await assert.rejects(()=>read(indexed,'1-9'));
  f.control.funds=((1n<<255n)-1n).toString();
  const maximum=(await read(indexed)).data;
  assert.equal(BigInt(maximum.maxAlpha),(18446744073709551615n/2n-2000000n)/1000000n);
  assert.ok(Number.isSafeInteger(Number(maximum.maxAlpha)),'The native bound fits the existing whole-unit input');
  const poisonedRate={...indexed,source_fuel_p:'18446744073709551615',fuel_p:'18446744073709551615',source_ratio_p:'0',source_power_p:'0',power_p:'0'};
  assert.equal((await read(poisonedRate)).data.maxAlpha,'0','A new nominal rate cannot overflow existing fuel');
  f.control.height=3352999;
  assert.equal((await read(indexedGenerator(f))).data.source,address(2));

  const api=new GuildAPI(),abort=new AbortController();let url,options,data=large;
  api.ajax.get=async(u,o)=>{url=u;options=o;return {success:true,errors:[],data,meta:large.snapshot_meta};};
  const returned=await api.getGeneratorSnapshot('5-1',address(1),{signal:abort.signal,timeoutMs:5000});
  assert.equal(returned.power_p,large.power_p);assert.equal(returned.snapshot_meta,large.snapshot_meta);
  assert.equal(new URL(url,'https://fixture.invalid').searchParams.get('address'),address(1));
  assert.equal(options.signal,abort.signal);assert.equal(options.timeoutMs,5000);
  data=null;assert.equal(await api.getGeneratorSnapshot('5-1',address(1)),null);
  api.ajax.get=async()=>({success:false,errors:{authentication_error:'Login required'},data:null});
  await assert.rejects(()=>api.getGeneratorSnapshot('5-1',address(1)));
}

async function managerPreviewTests() {
  for (const height of [3352999,3353000]) {
    const f=fixture(height),state=f.manager.gameState,abort=new AbortController();
    state.currentBlockHeight=height;state.keyPlayers={[PLAYER_TYPES.PLAYER]:{id:'1-1'}};
    const alpha=new AlphaManager(state,f.manager);
    const fetch=async(id,source,options)=>{
      assert.equal(id,'5-1');assert.equal(source,address(height<3353000?2:1));
      assert.equal(options.signal,abort.signal);assert.equal(options.timeoutMs,5000);
      return indexedGenerator(f);
    };
    state.guildAPI.getGeneratorSnapshot=fetch;
    const current=await alpha.getGeneratorState('5-1',abort.signal);
    assert.equal(current.source,address(height<3353000?2:1));assert.equal(current.maxAlpha,'5');
    assert.equal(f.control.signed,0);
    const reads=f.control.requests.length;
    state.guildAPI.getGeneratorSnapshot=async()=>null;
    await assert.rejects(()=>alpha.getGeneratorState('5-1',abort.signal),/snapshot unavailable/);
    assert.equal(f.control.requests.length,reads,'A removed target never falls back to a latest-height native query');
    state.guildAPI.getGeneratorSnapshot=async(...args)=>{
      const row=await fetch(...args);state.keyPlayers[PLAYER_TYPES.PLAYER]={id:'1-1'};return row;
    };
    await assert.rejects(()=>alpha.getGeneratorState('5-1',abort.signal),/context changed/);
    state.guildAPI.getGeneratorSnapshot=fetch;
    f.control.queryError='Struct';
    await assert.rejects(()=>alpha.getGeneratorState('5-1',abort.signal),/Native query unavailable/);
    f.control.queryError=null;
    if(height<3353000) {
      state.guildAPI.getGeneratorSnapshot=async(...args)=>{
        const row=await fetch(...args);state.currentBlockHeight=3353000;return row;
      };
      await assert.rejects(()=>alpha.getGeneratorState('5-1',abort.signal));
    }
    abort.abort();
    await assert.rejects(()=>alpha.getGeneratorState('5-1',abort.signal),{name:'AbortError'});
  }
}

async function receiptTests() {
  for (const height of [3352999,3353000]) {
    const f=fixture(height);f.tx.submission=await f.submission.prepare(f.tx);
    const detail={playerId:'1-1',primaryAddress:address(2),vaultAddress:height<3353000?'':address(1),amount:'3000000'};
    const event=()=>({type:'structs.structs.EventAlphaInfuse',attributes:[{key:'eventAlphaInfuseDetail',value:JSON.stringify(detail)}]});
    let events=[event()],code=0;
    f.manager.chainQuery.cometClient={
      tx:async()=>({hash:fromHex(f.tx.submission.hash),tx:submissionBytes(f.tx.submission),height,index:0,
        result:{code,events,data:new Uint8Array()}}),
      commit:async()=>({commit:{height,blockId:{hash:new Uint8Array(32)}},
        header:{height,chainId:CHAIN.ID,time:new Date('2026-10-30T00:00:00.123Z')}}),
    };
    f.tx.response=await f.submission.find(f.tx);f.tx.status=TX_STATUS.SUCCEEDED;
    assert.deepEqual(generatorCommit(f.tx),{ownerId:'1-1',structId:'5-1',source:address(height<3353000?2:1),height:String(height)});
    const restored=SigningTransaction.fromJSON(JSON.parse(JSON.stringify(f.tx.toJSON())));
    assert.deepEqual(generatorCommit(restored),generatorCommit(f.tx),'The real RPC receipt survives journal serialization');
    for (const malformed of [[],[event(),event()],[{...event(),attributes:[]}],
        [{...event(),attributes:[{key:'eventAlphaInfuseDetail',value:'not JSON'}]}]]) {
      events=malformed;await assert.rejects(()=>f.submission.find(f.tx));
    }
    events=[];code=9;
    const failed=await f.submission.find(f.tx);
    assert.equal(failed.code,9);assert.equal(failed.generatorReceipt,undefined,'Rejected transactions need no success receipt');
    code=0;detail.playerId='1-2';events=[event()];f.tx.response=await f.submission.find(f.tx);
    assert.throws(()=>generatorCommit(f.tx),/funding differs/,'An implicit source/owner change cannot masquerade as the chosen burn');
  }
}

async function main() {
  const wallet=await DirectSecp256k1HdWallet.fromMnemonic(TEST_MNEMONIC,{prefix:'structs'});
  [signer]=await wallet.getAccounts();registry=new Registry([...defaultRegistryTypes,...msgTypes]);offline=await SigningStargateClient.offline(wallet,{registry});
  for(const patch of [{amount:'0'},{amount:'1'},{amount:1000000},{amount:'18446744073710000000'},
      {ownerId:'0-1'},{structId:'5-0'},{structId:'5-18446744073709551616'},{source:address(2)},{version:2}]) {
    assert.throws(()=>generatorIntent({...baseIntent(),...patch}));
  }
  const f=fixture();f.control.provisioned=false;
  const signed=await f.submission.prepare(f.tx);
  assert.equal(f.control.signed,1);assert.equal(f.control.simulated,1);
  assert.equal(signed.generator.source,address(1));assert.equal(signed.generator.amount,'3000000');
  assert.deepEqual(submissionBytes(signed),f.control.simulationBytes,'Simulate the exact signed transaction before any broadcast');
  const raw=TxRaw.decode(submissionBytes(signed)),body=TxBody.decode(raw.bodyBytes),auth=AuthInfo.decode(raw.authInfoBytes);
  assert.equal(body.messages.length,1);assert.equal(body.timeoutHeight,3353060n);
  assert.deepEqual(auth.fee.amount,[{denom:'ualpha',amount:'0'}]);assert.equal(auth.fee.gasLimit,BigInt(STRUCTS_FREE_GAS));
  const expected={creator:signer.address,structId:'5-1',infuseAmount:'3000000ualpha'};
  assert.deepEqual(registry.decode(body.messages[0]),expected,'The release schema has no source/owner selector');
  const restored=SigningTransaction.fromJSON(JSON.parse(JSON.stringify(f.tx.toJSON())));
  assert.deepEqual(restored.intent,baseIntent());assert.deepEqual(restored.toCosmosMsgs(registry),f.tx.toCosmosMsgs(registry));
  if (process.env.STRUCTS_GENERATOR_FIXTURE) fs.writeFileSync(process.env.STRUCTS_GENERATOR_FIXTURE,JSON.stringify({
    release:'96cea3a322c406b46ca1feb880dc4497ebd9353f',signed_tx:signed.bytes,account_number:signed.accountNumber,
    messages:[{type_url:body.messages[0].typeUrl,expected}]
  },null,2)+'\n');
  const old=fixture(3352999),legacy=await old.submission.prepare(old.tx);
  assert.equal(legacy.protocol,CHAIN.LEGACY_PROTOCOL);assert.equal(legacy.generator.source,address(2));
  assert.equal(TxBody.decode(TxRaw.decode(submissionBytes(legacy)).bodyBytes).timeoutHeight,3352999n);
  assert.equal(old.control.requests.some(([,method])=>method==='Vault'),false);
  for (const owner of ['1-1','1-9']) {
    const fleet=fixture();Object.assign(fleet.control,{owner,locationType:objectType.fleet,locationId:'9-1'});
    assert.equal((await fleet.submission.prepare(fleet.tx)).generator.planetId,'2-1');
    assert.equal(fleet.control.requests.filter(([,m])=>m==='Player').length,owner==='1-1'?1:2,'Load a different target owner without replacing the signer');
  }
  for (const generation of [techPowerGeneration.mediumGenerator,techPowerGeneration.largeGenerator]) {
    const other=fixture();Object.assign(other.control,{owner:'1-9',generation});await other.submission.prepare(other.tx);
  }
  for (const patch of [{permissions:'2'},{permissions:'16'},{actor:'1-9'},{online:false},{destroyed:true},
      {generation:0},{planetStatus:planetStatus.complete},{funds:'2999999'},{rate:'18446744073709551615'},
      {locationType:objectType.fleet,locationId:'9-9'}]) {
    const bad=fixture();Object.assign(bad.control,patch);await assert.rejects(()=>bad.submission.prepare(bad.tx));assert.equal(bad.control.signed,0);
  }
  for (const [method,change] of [
    ['Address',data=>({...data,address:address(9)})],['Player',data=>({...data,Player:{...data.Player,id:'1-9'}})],
    ['Struct',data=>({...data,Struct:{...data.Struct,id:'5-9'}})],['StructType',data=>({...data,StructType:{...data.StructType,id:'21'}})],
    ['Planet',data=>({...data,Planet:{...data.Planet,id:'2-9'}})],['Vault',data=>({...data,ownerId:'1-9'})],
    ['SpendableBalanceByDenom',data=>({balance:{...data.balance,denom:'uother'}})]]) {
    const bad=fixture();bad.control.mutateResponse=(name,data)=>name===method?change(data):data;
    await assert.rejects(()=>bad.submission.prepare(bad.tx));assert.equal(bad.control.signed,0);
  }
  for (const change of [data=>({...data,id:'1-9'}),data=>({...data,vault_address:address(9)}),
      data=>({...data,funds_meta:{...data.funds_meta,height:'3353001'}})]) {
    const bad=fixture();bad.control.mutateIndexed=change;await assert.rejects(()=>bad.submission.prepare(bad.tx));assert.equal(bad.control.signed,0);
  }
  const unready=fixture();unready.control.fundsReady=false;
  await assert.rejects(()=>unready.submission.prepare(unready.tx),SigningDeferredError);assert.equal(unready.control.signed,0);
  const large=fixture();large.tx.intent=generatorIntent({...baseIntent(),amount:'9007199255000000'});large.control.funds=large.tx.intent.amount;
  assert.equal((await large.submission.prepare(large.tx)).generator.amount,'9007199255000000');
  const gas=fixture();gas.control.gas=BigInt(STRUCTS_FREE_GAS)+1n;await assert.rejects(()=>gas.submission.prepare(gas.tx),/gas limit/);
  for (const queryError of ['Vault','Struct','Planet','SpendableBalanceByDenom','Simulate']) {
    const missing=fixture();missing.control.queryError=queryError;
    await assert.rejects(()=>missing.submission.prepare(missing.tx),/Native query unavailable/);
    assert.equal(missing.control.signed,queryError==='Simulate'?1:0,'Query failures cannot become guessed zero balances or positions');
  }
  const crossing=fixture(3352999);crossing.control.lateHeight=3353000;
  await assert.rejects(()=>crossing.submission.prepare(crossing.tx),SigningDeferredError);
  crossing.control.lateHeight=null;
  assert.equal((await crossing.submission.prepare(crossing.tx)).generator.source,address(1));

  await previewTests();
  await managerPreviewTests();
  await receiptTests();

  const saved=new Map();globalThis.localStorage={getItem:key=>saved.get(key)??null,setItem:(key,v)=>saved.set(key,v),get length(){return saved.size;},key:i=>[...saved.keys()][i]};
  globalThis.window=new EventTarget();Object.defineProperty(globalThis.navigator,'locks',{configurable:true,value:{request:async(n,o,run)=>run({})}});
  const durable=fixture();let sends=0;
  const submit={prepare:tx=>durable.submission.prepare(tx),assertSendable:()=>{},send:async tx=>{sends++;return {stage:'check_tx',code:0,transactionHash:tx.submission.hash};},find:async()=>null};
  const state={...durable.manager.gameState,currentBlockHeight:3353000};
  const queue=new SigningQueueManager(state,{registry,wsUrl:'generator-fixture',submission:submit});
  const id=queue.enqueueGenerator(baseIntent());await queue.transactOnBlock();assert.equal(sends,1);
  const hash=queue.unresolved.get(id).submission.hash;
  const reload=new SigningQueueManager(state,{registry,wsUrl:'generator-fixture',submission:submit});reload.loadPersistedState();
  assert.deepEqual(reload.unresolved.get(id).intent,baseIntent());assert.equal(reload.unresolved.get(id).submission.hash,hash);
  await reload.reconcilePending();assert.equal(sends,1,'An unknown burn is never replaced or resent');
  assert.throws(()=>reload.enqueueGenerator(baseIntent()),/existing submission/);
  console.log('Generator suite passed: exact generated queries/offline signing, vault/legacy sources, own-key authority, full amount, zero-fee gas cap, signed simulation, H expiry, unknown/reload recovery, same-height applied power and source-only preview. No chain broadcast.');
}
main().then(()=>{process.exitCode=0;},error=>{console.error(error);process.exitCode=1;});
