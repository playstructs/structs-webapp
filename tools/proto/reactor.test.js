import assert from 'node:assert/strict';
import fs from 'node:fs';
import {toBech32} from '@cosmjs/encoding';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import {BaseAccount} from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import {QueryAccountResponse} from 'cosmjs-types/cosmos/auth/v1beta1/query';
import {QuerySpendableBalanceByDenomResponse} from 'cosmjs-types/cosmos/bank/v1beta1/query';
import * as Staking from 'cosmjs-types/cosmos/staking/v1beta1/query';
import {SimulateRequest, SimulateResponse} from 'cosmjs-types/cosmos/tx/v1beta1/service';
import {TxBody, TxRaw} from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import * as Structs from '../../src/js/ts/structs.structs/types/structs/structs/query';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {SigningSubmission, SigningDeferredError} from '../../src/js/managers/SigningSubmission';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {SigningTransaction} from '../../src/js/models/SigningTransaction';
import {reactorIntent} from '../../src/js/util/ReactorIntent';
import {submissionBytes} from '../../src/js/util/SignedSubmission';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {REACTOR_TRANSACTION} from '../../src/js/constants/ReactorTransactions';

const address = n => toBech32('structs',new Uint8Array(20).fill(n));
const validator = toBech32('structsvaloper',new Uint8Array(20).fill(8));
const baseIntent = () => ({kind:'reactor_change',version:1,ownerId:'1-1',guildId:'0-1',reactorId:'3-1',direction:'defuse',amount:'3000000'});
let signer, registry, offline;
function fixture(height=3353000) {
  const control = {height,permissions:'128',guild:'0-1',reactor:'3-1',gas:4000000n,signed:0,simulated:0,
    funds:'5000000',complete:true,fundsReady:true,provisioned:true,maxEntries:7,requests:[],reassigned:new Set(),
    candidates:[address(3),address(1),address(2)],balances:new Map([[address(1),'1000000'],[address(2),'1500000'],[address(3),'2000000']]),
    pending:new Map(),pagination:null,repeatCursor:false,endlessPages:false,lateHeight:null,
    shares:'2000000000000000000000000',queryError:null,mutateDelegations:rows=>rows,mutateIndexed:data=>data};
  const meta = () => {
    const h=String(control.height),protocol=control.height<3353000?CHAIN.LEGACY_PROTOCOL:CHAIN.PROTOCOL;
    return {chain_id:CHAIN.ID,height:h,indexed_height:h,observed_tip:h,api_contract:CHAIN.API_CONTRACT,
      activation_height:CHAIN.UPGRADE_HEIGHT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,protocol,observed_protocol:protocol,
      data_ready:true,transaction_ready:true,required_models:['inventory'],models:{inventory:{ready:true,height:h}},inventory_authority:'current-claims-v1'};
  };
  const indexed = () => control.mutateIndexed({owner_id:'1-1',player_id:'1-1',destination_id:'3-1',validator,vault_address:address(1),snapshot_meta:meta(),
    positions_meta:{complete:control.complete,height:String(control.height)},
    positions:control.candidates.map(a=>({address:a,is_vault:a===address(1),owner_id:'1-1',validator,native_ready:true}))});
  const manager = {registry,connectionEpoch:1,gameState:{signingAccount:signer,signingClient:{sign:async(...args)=>{
    control.signed++;control.signedHeight=String(control.height);
    const raw=await offline.sign(...args);if(control.lateHeight)control.height=control.lateHeight;return raw;
  }},guildAPI:{getInfusionByPlayerId:async()=>indexed(),getPlayer:async()=>({id:'1-1',vault_address:address(1),snapshot_meta:meta(),
    funds_meta:{ready:control.fundsReady,height:String(control.height)}})}}};
  const request = async(service,method,bytes) => {
    control.requests.push([service,method]);
    if (method===control.queryError) throw new Error('Native query unavailable');
    if(service==='cosmos.auth.v1beta1.Query') return QueryAccountResponse.encode({account:{typeUrl:'/cosmos.auth.v1beta1.BaseAccount',
      value:BaseAccount.encode(BaseAccount.fromPartial({address:signer.address,accountNumber:1n,sequence:2n})).finish()}}).finish();
    if(service==='structs.structs.Query') {
      if(method==='Address') {
        const {address:a}=Structs.QueryGetAddressRequest.decode(bytes);
        return Structs.QueryAddressResponse.encode({address:a,playerId:control.reassigned.has(a)?'1-9':'1-1',permissions:control.permissions,proofNonce:'0'}).finish();
      }
      if(method==='Player')return Structs.QueryGetPlayerResponse.encode(Structs.QueryGetPlayerResponse.fromPartial({Player:{id:'1-1',guildId:control.guild,primaryAddress:address(2)}})).finish();
      if(method==='Guild')return Structs.QueryGetGuildResponse.encode(Structs.QueryGetGuildResponse.fromPartial({Guild:{id:'0-1',primaryReactorId:control.reactor}})).finish();
      if(method==='Reactor')return Structs.QueryGetReactorResponse.encode(Structs.QueryGetReactorResponse.fromPartial({Reactor:{id:'3-1',validator}})).finish();
      if(method==='Vault')return Structs.QueryVaultResponse.encode({ownerId:'1-1',address:address(1),provisioned:control.provisioned}).finish();
    }
    if(service==='cosmos.bank.v1beta1.Query')return QuerySpendableBalanceByDenomResponse.encode({balance:{denom:'ualpha',amount:control.funds}}).finish();
    if(service==='cosmos.staking.v1beta1.Query') {
      if(method==='Params')return Staking.QueryParamsResponse.encode(Staking.QueryParamsResponse.fromPartial({params:{bondDenom:'ualpha',maxEntries:control.maxEntries}})).finish();
      if(method==='DelegatorDelegations') {
        const req=Staking.QueryDelegatorDelegationsRequest.decode(bytes);assert.equal(req.pagination.limit,100n);assert.equal(req.pagination.offset,0n);
        const empty=control.pagination===req.delegatorAddr&&(!req.pagination.key.length||control.repeatCursor||control.endlessPages);
        const amount=control.balances.get(req.delegatorAddr)??'0';
        const rows=control.mutateDelegations(empty||amount==='0'?[]:[{delegation:{delegatorAddress:req.delegatorAddr,validatorAddress:validator,shares:control.shares},balance:{denom:'ualpha',amount}}]);
        return Staking.QueryDelegatorDelegationsResponse.encode(Staking.QueryDelegatorDelegationsResponse.fromPartial({delegationResponses:rows,
          pagination:{nextKey:empty?new Uint8Array([control.endlessPages?(req.pagination.key[0]??0)+1:7]):new Uint8Array(),total:0n}})).finish();
      }
      if(method==='DelegatorUnbondingDelegations') {
        const req=Staking.QueryDelegatorUnbondingDelegationsRequest.decode(bytes);
        const count=control.pending.get(req.delegatorAddr)??0;
        const rows=count?[{delegatorAddress:req.delegatorAddr,validatorAddress:validator,
          entries:Array.from({length:count},()=>({balance:'0',initialBalance:'0',unbondingOnHoldRefCount:1n}))}]:[];
        return Staking.QueryDelegatorUnbondingDelegationsResponse.encode(Staking.QueryDelegatorUnbondingDelegationsResponse.fromPartial({unbondingResponses:rows,
          pagination:{nextKey:new Uint8Array(),total:0n}})).finish();
      }
    }
    if(service==='cosmos.tx.v1beta1.Service') {
      const req=SimulateRequest.decode(bytes);const body=TxBody.decode(TxRaw.decode(req.txBytes).bodyBytes);
      assert.ok(body.messages.length>0);control.simulated++;
      return SimulateResponse.encode(SimulateResponse.fromPartial({gasInfo:{gasUsed:control.gas}})).finish();
    }
    throw new Error(`Unexpected query ${service}/${method}`);
  };
  manager.chainQuery={closed:false,status:async()=>({chainId:CHAIN.ID,height:String(control.height)}),readSnapshot:async(read,options={})=>{
    const h=options.height;
    const pinnedRequest=(service,...args)=>{
      assert.equal(h,service==='cosmos.tx.v1beta1.Service'?control.signedHeight:String(control.height),
        'Native preparation and simulation use the selected boundary');
      return request(service,...args);
    };
    return {chainId:CHAIN.ID,height:h,observedHeight:String(control.height),data:await read({chainId:CHAIN.ID,height:h,request:pinnedRequest})};
  }};
  const tx=SigningTransaction.create({intent:baseIntent(),isAction:false,retryLimit:0,accountAddress:signer.address,enqueuedAtBlock:height});
  return {control,manager,tx,submission:new SigningSubmission(manager)};
}

async function main() {
  const wallet=await DirectSecp256k1HdWallet.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',{prefix:'structs'});
  [signer]=await wallet.getAccounts();registry=new Registry([...defaultRegistryTypes,...msgTypes]);offline=await SigningStargateClient.offline(wallet,{registry});
  for(const patch of [{amount:'0'},{amount:'1'},{amount:1000000},{amount:(1n<<256n).toString()},{direction:'migrate'},
      {ownerId:'0-1'},{reactorId:'3-0'},{guildId:'0-18446744073709551616'},{extra:1}]) assert.throws(()=>reactorIntent({...baseIntent(),...patch}));
  const f=fixture();f.control.candidates.push(address(2)); // Duplicate cannot mint another position.
  const signed=await f.submission.prepare(f.tx);
  assert.equal(f.control.signed,1);assert.equal(f.control.simulated,1);
  assert.equal(signed.reactor.legs[0].address,address(1));
  assert.deepEqual(signed.reactor.legs.slice(1).map(p=>p.address),[address(2),address(3)].sort());
  assert.equal(signed.reactor.legs.reduce((n,p)=>n+BigInt(p.amount),0n),3000000n);
  const body=TxBody.decode(TxRaw.decode(submissionBytes(signed)).bodyBytes);
  assert.equal(body.messages.length,signed.reactor.legs.length);assert.equal(body.timeoutHeight,3353060n);
  for(let i=0;i<body.messages.length;i++) {
    const message=registry.decode(body.messages[i]);
    assert.equal(message.creator,signer.address);assert.equal(message.validatorAddress,validator);
    assert.equal(message.ownerId,i===0?'1-1':'');assert.equal(message.delegatorAddress,i===0?'':signed.reactor.legs[i].address);
    assert.equal(message.amount.amount,signed.reactor.legs[i].amount);
  }
  if (process.env.STRUCTS_REACTOR_FIXTURE) fs.writeFileSync(process.env.STRUCTS_REACTOR_FIXTURE,JSON.stringify({
    release:'96cea3a322c406b46ca1feb880dc4497ebd9353f',signed_tx:signed.bytes,account_number:signed.accountNumber,
    messages:body.messages.map((wire,i)=>({type_url:wire.typeUrl,expected:{creator:signer.address,
      validatorAddress:validator,ownerId:i===0?'1-1':'',delegatorAddress:i===0?'':signed.reactor.legs[i].address,
      amount:{denom:'ualpha',amount:signed.reactor.legs[i].amount}}}))
  },null,2)+'\n');
  assert.throws(()=>f.tx.toCosmosMsg(registry),/together/);
  const restored=SigningTransaction.fromJSON(JSON.parse(JSON.stringify(f.tx.toJSON())));
  assert.deepEqual(restored.toCosmosMsgs(registry),f.tx.toCosmosMsgs(registry));

  for(const direction of ['infuse','defuse']) {
    const old=fixture(3352999);old.tx.intent=reactorIntent({...baseIntent(),direction,amount:'1000000'});
    old.control.permissions=direction==='infuse'?'32':'128';
    const before=await old.submission.prepare(old.tx);
    assert.equal(before.protocol,CHAIN.LEGACY_PROTOCOL);assert.equal(before.reactor.legs[0].address,address(2));
    assert.equal(old.tx.messages[0].payload.ownerId,'');assert.equal(old.tx.messages.length,1);
  }
  const deposit=fixture();deposit.control.permissions='32';deposit.control.provisioned=false;
  deposit.tx.intent=reactorIntent({...baseIntent(),direction:'infuse'});
  const infused=await deposit.submission.prepare(deposit.tx);
  assert.equal(infused.reactor.legs[0].address,address(1));assert.equal(deposit.tx.messages[0].payload.ownerId,'1-1');
  assert.equal(deposit.tx.messages[0].typeUrl,'/structs.structs.MsgReactorInfuse');
  const emptyVault=fixture();emptyVault.control.balances.set(address(1),'0');
  const retained=await emptyVault.submission.prepare(emptyVault.tx);
  assert.equal(retained.reactor.legs.every(p=>!p.isVault),true);
  const queueFull=fixture();queueFull.control.pending.set(address(1),7);
  assert.equal((await queueFull.submission.prepare(queueFull.tx)).reactor.legs.every(p=>!p.isVault),true,'Held zero entries still consume every slot');
  const changedOwner=fixture();changedOwner.tx.intent=reactorIntent({...baseIntent(),amount:'2000000'});
  changedOwner.control.reassigned.add(address(2));
  assert.equal((await changedOwner.submission.prepare(changedOwner.tx)).reactor.legs.some(p=>p.address===address(2)),false);
  for(const patch of [{permissions:'2'},{permissions:'16'},{permissions:'18446744073709551616'},
      {guild:'0-9'},{reactor:'3-9'},{maxEntries:0}]) {
    const bad=fixture();Object.assign(bad.control,patch);await assert.rejects(()=>bad.submission.prepare(bad.tx));assert.equal(bad.control.signed,0);
  }
  const unprovisioned=fixture();unprovisioned.control.provisioned=false;unprovisioned.control.balances.delete(address(1));
  const retainedOnly=await unprovisioned.submission.prepare(unprovisioned.tx);
  assert.equal(retainedOnly.reactor.legs.every(leg=>!leg.isVault),true,'A verified empty unprovisioned vault does not block retained withdrawals');
  assert.equal(retainedOnly.reactor.legs.reduce((total,leg)=>total+BigInt(leg.amount),0n),3000000n);
  const insufficient=fixture();insufficient.control.balances.clear();
  await assert.rejects(()=>insufficient.submission.prepare(insufficient.tx),/complete withdrawal/);assert.equal(insufficient.control.signed,0);
  const unready=fixture();unready.control.complete=false;
  await assert.rejects(()=>unready.submission.prepare(unready.tx),SigningDeferredError);assert.equal(unready.control.signed,0);
  const gas=fixture();gas.control.gas=BigInt(REACTOR_TRANSACTION.GAS)+1n;
  await assert.rejects(()=>gas.submission.prepare(gas.tx),/gas limit/);
  const paged=fixture();paged.control.pagination=address(1);await paged.submission.prepare(paged.tx);
  const repeat=fixture();repeat.control.pagination=address(1);repeat.control.repeatCursor=true;
  await assert.rejects(()=>repeat.submission.prepare(repeat.tx),/repeated a cursor/);assert.equal(repeat.control.signed,0);
  const endless=fixture();endless.control.pagination=address(1);endless.control.endlessPages=true;
  await assert.rejects(()=>endless.submission.prepare(endless.tx),/page limit/);assert.equal(endless.control.signed,0);
  for (const queryError of ['DelegatorDelegations','DelegatorUnbondingDelegations']) {
    const unavailable=fixture();unavailable.control.queryError=queryError;
    await assert.rejects(()=>unavailable.submission.prepare(unavailable.tx),/Native query unavailable/);
    assert.equal(unavailable.control.signed,0,'RPC failure cannot become an absent position');
  }
  for (const shares of ['0','-1','1.5',(1n<<320n).toString()]) {
    const invalid=fixture();invalid.control.shares=shares;
    await assert.rejects(()=>invalid.submission.prepare(invalid.tx));assert.equal(invalid.control.signed,0);
  }
  for (const mutateDelegations of [rows=>[...rows,...rows],rows=>rows.map(row=>({...row,delegation:{...row.delegation,delegatorAddress:address(9)}})),
      rows=>rows.map(row=>({...row,balance:{denom:'uother',amount:'9000000'}}))]) {
    const invalid=fixture();invalid.control.mutateDelegations=mutateDelegations;
    await assert.rejects(()=>invalid.submission.prepare(invalid.tx),/identity/);assert.equal(invalid.control.signed,0);
  }
  for (const mutateIndexed of [data=>({...data,destination_id:'3-9'}),data=>({...data,vault_address:address(9)}),
      data=>({...data,positions_meta:{...data.positions_meta,height:'3353001'}}),
      data=>({...data,positions:data.positions.map(row=>({...row,is_vault:true}))}),
      data=>({...data,positions:data.positions.filter(row=>!row.is_vault)})]) {
    const invalid=fixture();invalid.control.mutateIndexed=mutateIndexed;
    await assert.rejects(()=>invalid.submission.prepare(invalid.tx));assert.equal(invalid.control.signed,0);
  }
  const fractional=fixture();fractional.control.balances=new Map([[address(1),'499999'],[address(2),'2500001']]);
  const portions=(await fractional.submission.prepare(fractional.tx)).reactor.legs;
  assert.deepEqual(portions.map(p=>p.amount),['499999','2500001'],'Each leg keeps raw native precision');
  const large=fixture();large.tx.intent=reactorIntent({...baseIntent(),amount:'9007199254740993000000'});
  large.control.balances.set(address(1),large.tx.intent.amount);
  assert.equal((await large.submission.prepare(large.tx)).reactor.legs[0].amount,large.tx.intent.amount);
  const oversized=fixture();oversized.control.candidates=Array.from({length:18},(_,i)=>address(i+1));oversized.control.balances.clear();
  oversized.control.balances.set(oversized.control.candidates.filter(a=>a!==address(1)).sort().at(-1),'9000000');
  await assert.rejects(()=>oversized.submission.prepare(oversized.tx),/bounded position/);assert.equal(oversized.control.signed,0);
  const crossing=fixture(3352999);crossing.tx.intent=reactorIntent({...baseIntent(),amount:'1000000'});crossing.control.lateHeight=3353000;
  await assert.rejects(()=>crossing.submission.prepare(crossing.tx),SigningDeferredError);
  crossing.control.lateHeight=null;crossing.control.signed=0;crossing.control.simulated=0;
  assert.equal((await crossing.submission.prepare(crossing.tx)).protocol,CHAIN.PROTOCOL);

  const saved=new Map();globalThis.localStorage={getItem:key=>saved.get(key)??null,setItem:(key,v)=>saved.set(key,v),get length(){return saved.size;},key:i=>[...saved.keys()][i]};
  globalThis.window=new EventTarget();Object.defineProperty(globalThis.navigator,'locks',{configurable:true,value:{request:async(n,o,run)=>run({})}});
  const durable=fixture();let sends=0;
  const submit={prepare:tx=>durable.submission.prepare(tx),send:async tx=>{sends++;return {stage:'check_tx',code:0,transactionHash:tx.submission.hash};},find:async()=>null};
  const state={...durable.manager.gameState,currentBlockHeight:3353000};
  const queue=new SigningQueueManager(state,{registry,wsUrl:'reactor-fixture',submission:submit});
  const id=queue.enqueueReactor(baseIntent());await queue.transactOnBlock();assert.equal(sends,1);
  assert.equal(queue.unresolved.get(id).messages.length,3);
  const reload=new SigningQueueManager(state,{registry,wsUrl:'reactor-fixture',submission:submit});reload.loadPersistedState();
  assert.equal(reload.unresolved.get(id).messages.length,3);
  await reload.reconcilePending();assert.equal(sends,1,'An unknown atomic group is never repartitioned or resent');
  assert.throws(()=>reload.enqueueReactor(baseIntent()),/existing submission/);
  console.log('Reactor intent suite passed: actual generated queries/offline atomic signing, vault-first/deterministic retained legs, own-key permissions, native queue eligibility, complete pages, exact amounts, gas bound, pre-H routes and unknown group recovery. No chain broadcast.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
