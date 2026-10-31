import assert from 'node:assert/strict';
import {toBech32} from '@cosmjs/encoding';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import {BaseAccount} from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import {QueryAccountResponse} from 'cosmjs-types/cosmos/auth/v1beta1/query';
import {QuerySpendableBalanceByDenomRequest, QuerySpendableBalanceByDenomResponse} from 'cosmjs-types/cosmos/bank/v1beta1/query';
import {SimulateRequest, SimulateResponse} from 'cosmjs-types/cosmos/tx/v1beta1/service';
import {TxBody, TxRaw} from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import * as StructsQuery from '../../src/js/ts/structs.structs/types/structs/structs/query';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {SigningSubmission, SigningDeferredError} from '../../src/js/managers/SigningSubmission';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {SigningTransaction} from '../../src/js/models/SigningTransaction';
import {transferIntent} from '../../src/js/util/TransferIntent';
import {submissionBytes} from '../../src/js/util/SignedSubmission';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {TEST_MNEMONIC} from './helpers';

const address = n=>toBech32('structs',new Uint8Array(20).fill(n));
const intent = ()=>({kind:'alpha_transfer',version:1,ownerId:'1-1',recipientId:'1-2',recipientAddress:address(3),amount:'1000000'});
let signer,offline,registry;
function fixture(height=3353000) {
  const control={height,permissions:'16',owner:'1-1',balance:'5000000',recipient:'1-2',provisioned:true,
    recipientProvisioned:false,gas:20000n,simulate:0,reads:[],signed:0,lateHeight:null};
  const protocol=()=>control.height<3353000 ? CHAIN.LEGACY_PROTOCOL : CHAIN.PROTOCOL;
  const meta=()=>({chain_id:CHAIN.ID,height:String(control.height),indexed_height:String(control.height),observed_tip:String(control.height),
    activation_height:CHAIN.UPGRADE_HEIGHT,api_contract:CHAIN.API_CONTRACT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol()}`,
    protocol:protocol(),observed_protocol:protocol(),data_ready:true,transaction_ready:true,inventory_authority:'current-claims-v1',
    required_models:['inventory'],models:{inventory:{height:String(control.height),ready:true}}});
  const manager={registry,connectionEpoch:1,gameState:{signingAccount:signer,
    signingClient:{sign:async(...args)=>{control.signed++;const raw=await offline.sign(...args);if(control.lateHeight)control.height=control.lateHeight;return raw;}},
    guildAPI:{getPlayer:async id=>({id,vault_address:address(1),snapshot_meta:meta(),funds_meta:{ready:true,height:String(control.height)}})}}};
  const request=async(service,method,bytes)=>{
    control.reads.push([service,method]);
    if(service==='cosmos.auth.v1beta1.Query')return QueryAccountResponse.encode({account:{typeUrl:'/cosmos.auth.v1beta1.BaseAccount',
      value:BaseAccount.encode(BaseAccount.fromPartial({address:signer.address,accountNumber:1n,sequence:7n})).finish()}}).finish();
    if(service==='structs.structs.Query') {
      if(method==='Address') {
        const {address:requested}=StructsQuery.QueryGetAddressRequest.decode(bytes);
        return StructsQuery.QueryAddressResponse.encode({address:requested,playerId:requested===signer.address?control.owner:control.recipient,
          permissions:control.permissions,proofNonce:'9007199254740993'}).finish();
      }
      if(method==='Player')return StructsQuery.QueryGetPlayerResponse.encode(StructsQuery.QueryGetPlayerResponse.fromPartial({Player:{id:'1-1',primaryAddress:address(2)}})).finish();
      if(method==='Vault') {
        const {ownerId}=StructsQuery.QueryVaultRequest.decode(bytes);
        return StructsQuery.QueryVaultResponse.encode({ownerId:ownerId==='1-1'?'1-1':control.recipient,address:ownerId==='1-1'?address(1):address(4),
          provisioned:ownerId==='1-1'?control.provisioned:control.recipientProvisioned}).finish();
      }
    }
    if(service==='cosmos.bank.v1beta1.Query') {
      const requested=QuerySpendableBalanceByDenomRequest.decode(bytes);
      assert.equal(requested.address,control.height<3353000?address(2):address(1));
      return QuerySpendableBalanceByDenomResponse.encode({balance:{denom:'ualpha',amount:control.balance}}).finish();
    }
    if(service==='cosmos.tx.v1beta1.Service') {
      const simulated=SimulateRequest.decode(bytes);
      assert.equal(TxRaw.decode(simulated.txBytes).signatures.length,1);
      control.simulate++;
      return SimulateResponse.encode(SimulateResponse.fromPartial({gasInfo:{gasUsed:control.gas}})).finish();
    }
    throw new Error(`Unexpected query ${service}/${method}`);
  };
  manager.chainQuery={closed:false,status:async()=>({chainId:CHAIN.ID,height:String(control.height)}),
    readSnapshot:async(read,options={})=>{const selected=options.height??String(control.height);
      return {chainId:CHAIN.ID,height:selected,observedHeight:String(control.height),data:await read({chainId:CHAIN.ID,height:selected,request})};}};
  const tx=SigningTransaction.create({intent:intent(),isAction:false,retryLimit:0,accountAddress:signer.address,enqueuedAtBlock:height});
  return {control,manager,tx,submission:new SigningSubmission(manager)};
}

async function main() {
  const wallet=await DirectSecp256k1HdWallet.fromMnemonic(TEST_MNEMONIC,{prefix:'structs'});
  [signer]=await wallet.getAccounts();registry=new Registry([...defaultRegistryTypes,...msgTypes]);
  offline=await SigningStargateClient.offline(wallet,{registry});
  for(const changed of [{amount:'0'},{amount:'100000000'},{amount:'1000001'},{amount:1000000},{recipientId:'1-0'},{recipientAddress:'invalid'},{extra:'x'}]) {
    assert.throws(()=>transferIntent({...intent(),...changed}));
  }
  for(const height of [3352999,3353000]) {
    const f=fixture(height);const signed=await f.submission.prepare(f.tx);
    const body=TxBody.decode(TxRaw.decode(submissionBytes(signed)).bodyBytes);
    assert.equal(body.timeoutHeight,height<3353000?3352999n:BigInt(height)+60n);
    assert.equal(body.messages[0].typeUrl,height<3353000?'/structs.structs.MsgPlayerSend':'/structs.structs.MsgVaultSend');
    assert.equal(signed.transfer.source,height<3353000?address(2):address(1));
    assert.equal(signed.transfer.destination,height<3353000?address(3):address(4));
    assert.equal(f.control.simulate,1);assert.equal(f.control.signed,1);
    const restored=SigningTransaction.fromJSON(JSON.parse(JSON.stringify(f.tx.toJSON())));
    assert.deepEqual(restored.intent,intent());
  }
  const literal=fixture();literal.tx.intent=transferIntent({...intent(),recipientId:null});
  assert.equal((await literal.submission.prepare(literal.tx)).transfer.destination,address(3));
  assert.equal(literal.tx.message.typeUrl,'/structs.structs.MsgPlayerSend');
  const self=fixture();self.tx.intent=transferIntent({...intent(),recipientId:'1-1'});
  const selfSigned=await self.submission.prepare(self.tx);
  assert.equal(selfSigned.transfer.source,selfSigned.transfer.destination);
  for(const changed of [{permissions:'2'},{permissions:'18446744073709551616'},{owner:'1-7'},{balance:'999999'},{balance:'NaN'},{recipient:'1-9'}]) {
    const f=fixture();Object.assign(f.control,changed);
    await assert.rejects(()=>f.submission.prepare(f.tx));assert.equal(f.control.signed,0);
  }
  const unprovisioned=fixture();unprovisioned.control.provisioned=false;
  assert.equal((await unprovisioned.submission.prepare(unprovisioned.tx)).transfer.source,address(1),'VaultSend can provision prefunded source/recipient');
  unprovisioned.tx.intent=transferIntent({...intent(),recipientId:null});
  await assert.rejects(()=>unprovisioned.submission.prepare(unprovisioned.tx),/provisioned/);
  const gas=fixture();gas.control.gas=500001n;await assert.rejects(()=>gas.submission.prepare(gas.tx),/gas limit/);
  for(const unavailable of ['funds','model']) {
    const f=fixture();const getPlayer=f.manager.gameState.guildAPI.getPlayer;
    f.manager.gameState.guildAPI.getPlayer=async id=>{const player=await getPlayer(id);
      if(unavailable==='funds')player.funds_meta.ready=false;else player.snapshot_meta.models.inventory.ready=false;return player;};
    await assert.rejects(()=>f.submission.prepare(f.tx),SigningDeferredError);assert.equal(f.control.signed,0);
  }
  const crossing=fixture(3352999);crossing.control.lateHeight=3353000;
  await assert.rejects(()=>crossing.submission.prepare(crossing.tx),SigningDeferredError);
  crossing.control.lateHeight=null;
  assert.equal((await crossing.submission.prepare(crossing.tx)).protocol,CHAIN.PROTOCOL,'Known unsent intent rebuilds after H');
  const saved=new Map();globalThis.localStorage={getItem:key=>saved.get(key)??null,setItem:(key,v)=>saved.set(key,v),get length(){return saved.size;},key:i=>[...saved.keys()][i]};
  globalThis.window=new EventTarget();
  const state={signingAccount:signer,currentBlockHeight:3352999};
  const queue=new SigningQueueManager(state,{registry,wsUrl:'fixture'});
  const id=queue.enqueueTransfer(intent());assert.equal(queue.getTransaction(id).message,null);
  const reload=new SigningQueueManager(state,{registry,wsUrl:'fixture'});reload.loadPersistedState();
  assert.deepEqual(reload.getTransaction(id).intent,intent());assert.equal(reload.getTransaction(id).message,null);
  console.log('Transfer preparation passed: persisted intent, exact live authority/spendability, secondary signer, selected/literal/self routing, unprovisioned vaults, signed simulation, gas bound and unsent H rebuild. No broadcast.');
}
main().then(()=>{process.exitCode=0;},error=>{console.error(error);process.exitCode=1;});
