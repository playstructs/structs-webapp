import assert from 'node:assert/strict';
import {setTimeout as pause} from 'node:timers/promises';
import {toBech32} from '@cosmjs/encoding';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {SigningClientManager} from '../../src/js/managers/SigningClientManager';
import {AlphaManager} from '../../src/js/managers/AlphaManager';
import {AccountConfirmTransfer} from '../../src/js/view_models/account/AccountConfirmTransfer';
import {AccountTransferAmountViewModel} from '../../src/js/view_models/account/AccountTransferAmountViewModel';
import {MenuPage} from '../../src/js/framework/MenuPage';
import {MenuPageRouter} from '../../src/js/framework/MenuPageRouter';
import {JsonAjaxer} from '../../src/js/framework/JsonAjaxer';
import {TX_STATUS} from '../../src/js/models/SigningTransaction';
import {transferSourceQuery, transferSourceRow, waitForTransferSource} from '../../src/js/util/TransferCompletion';
import {transferLimit} from '../../src/js/util/TransferLimit';
import {signedSubmission} from '../../src/js/util/SignedSubmission';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {FEE} from '../../src/js/constants/Fee';

const address = n => toBech32('structs', new Uint8Array(20).fill(n));
const recipient = {id:'1-2',address:address(3),username:'Recipient',tag:'TAG'};
const snapshot = (height='3353000') => {
  const protocol = BigInt(height) < 3353000n ? CHAIN.LEGACY_PROTOCOL : CHAIN.PROTOCOL;
  return {chain_id:CHAIN.ID,height,indexed_height:height,observed_tip:height,
    api_contract:CHAIN.API_CONTRACT,activation_height:CHAIN.UPGRADE_HEIGHT,
    cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,protocol,observed_protocol:protocol,
    data_ready:true,transaction_ready:true,inventory_authority:'current-claims-v1',
    required_models:['inventory'],models:{inventory:{ready:true,height}}};
};
const player = () => ({id:'1-1',alpha:'100000',spendable_alpha_p:'2999999',
  snapshot_meta:snapshot(),funds_meta:{ready:true,height:'3353000'}});
let registry, signer, signed;

function storage() {
  const saved = new Map();
  return {getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key),
    key:i=>[...saved.keys()][i],get length(){return saved.size;}};
}

function ledger(tx) {
  const source = transferSourceQuery(tx);
  return {meta:{...snapshot(),transfer_source:{ready:true,reason:null,required_height:source.block_height}},data:{
    id:'9007199254740994',...source,tx_index:Number(source.tx_index),action:'sent',direction:'debit',
    time:'2026-10-29 22:38:04.286225+00'}};
}

function flow() {
  globalThis.localStorage = storage();
  globalThis.window = new EventTarget();
  const control = {sends:0,lookups:0,committed:true,reject:false,lookup:null};
  const state = {currentBlockHeight:3353000,signingAccount:signer,signingClient:{},transferAmount:1,
    keyPlayers:{player:{id:'1-1',player:{alpha:'999'}}},setTransferAmount(value){this.transferAmount=value;}};
  const committed = {stage:'committed',code:0,transactionHash:signed.hash,chainId:CHAIN.ID,
    height:'3353000',txIndex:7,blockHash:'A'.repeat(64),blockTime:'2026-10-29T22:38:04.286225999Z'};
  const queue = new SigningQueueManager(state,{registry,wsUrl:'fixture',submission:{
    prepare:async()=>signed,
    send:async()=>{control.sends++;return {stage:'check_tx',code:control.reject?7:0,transactionHash:signed.hash};},
    find:async()=>control.committed?committed:null,
  }});
  const manager = Object.assign(Object.create(SigningClientManager.prototype),{queue});
  const api = {getTransferSource:async(owner,query,options)=>{
    control.lookups++;assert.equal(owner,'1-1');assert.equal(query.address,address(1));
    assert.equal(query.counterparty,address(4));assert.equal(query.block_time,committed.blockTime);
    assert.equal(options.timeoutMs,5000);
    return control.lookup ? control.lookup(query,options) : ledger([...queue.completed.values()][0]);
  }};
  const router = new MenuPageRouter();
  const routes = [];
  router.registerController({name:'Account',recipient(){},confirmTransfer(options){routes.push(['confirmTransfer',options]);},
    transaction(options){routes.push(['transaction',options]);},index(){routes.push(['index']);},recipientSearch(){routes.push(['recipientSearch']);}});
  router.registerController({name:'Generic',menuWaiting(options){routes.push(['menuWaiting',options]);}});
  MenuPage.router = router;
  router.goto('Account','recipient',recipient);
  router.goto('Account','confirmTransfer',recipient);
  routes.length = 0;
  const alpha = new AlphaManager(state,manager);
  const view = new AccountConfirmTransfer(state,api,alpha,recipient);
  return {control,state,queue,api,router,routes,view,alpha};
}

async function main() {
  // Public fixture wallet only; no RPC or broadcast is used by this suite.
  const wallet=await DirectSecp256k1HdWallet.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',{prefix:'structs'});
  [signer]=await wallet.getAccounts();registry=new Registry([...defaultRegistryTypes,...msgTypes]);
  const offline=await SigningStargateClient.offline(wallet,{registry});
  const messages=[{typeUrl:'/structs.structs.MsgVaultSend',value:{creator:signer.address,
    ownerId:'1-1',recipientOwnerId:'1-2',amount:[{denom:'ualpha',amount:'1000000'}]}}];
  const context={chainId:CHAIN.ID,protocol:CHAIN.PROTOCOL,timeoutHeight:'0'};
  const raw=await offline.sign(signer.address,messages,FEE,'',{chainId:CHAIN.ID,accountNumber:1,sequence:0},0n);
  signed={...await signedSubmission(raw,{messages,registry,fee:FEE,accountAddress:signer.address,accountNumber:1,sequence:0,context}),
    transfer:{ownerId:'1-1',source:address(1),destination:address(4),denom:'ualpha',amount:'1000000',height:'3353000'}};
  Object.defineProperty(globalThis.navigator,'locks',{configurable:true,value:{request:async(name,options,run)=>run({})}});

  const success=flow();
  const complete=success.view.transfer();
  await success.view.transfer(); // Rapid repeat from the same rendered control.
  assert.equal(success.queue.immediateQueue.length,1);
  const intent=success.queue.immediateQueue[0].intent;
  assert.equal(intent.recipientId,'1-2');assert.equal(intent.recipientAddress,recipient.address);
  await success.queue.transactOnBlock();await complete;
  assert.equal(success.control.sends,1);assert.equal(success.control.lookups,1);
  assert.equal(success.router.currentPage,'transaction');
  assert.equal(success.router.currentOptions.txId,'9007199254740994');
  const tx=[...success.queue.completed.values()][0];
  const query=transferSourceQuery(tx);
  assert.equal(transferSourceRow(ledger(tx),query).id,'9007199254740994');
  for(const patch of [{amount_p:'1000001'},{tx_index:8},{address:address(9)},{counterparty:address(8)},
      {block_height:'3353001'},{direction:'credit'},{id:9007199254740994},{chain_id:'other'}]) {
    const result=ledger(tx);Object.assign(result.data,patch);assert.equal(transferSourceRow(result,query),null);
  }
  for(const reason of ['not_found','not_indexed','ambiguous','indexed_state_unavailable']) {
    const result=ledger(tx);result.meta.transfer_source={ready:false,reason,required_height:'3353000'};
    assert.equal(transferSourceRow(result,query),null);
  }
  const stale=ledger(tx);stale.meta.models.inventory.height='3352999';assert.equal(transferSourceRow(stale,query),null);
  for(const mutate of [copy=>copy.response.code=7,copy=>copy.response.transactionHash='B'.repeat(64),
      copy=>copy.submission.transfer.amount='2000000',copy=>copy.intent.recipientId='1-3',
      copy=>copy.response.height='3352999',copy=>copy.accountAddress=address(9)]) {
    const copy=JSON.parse(JSON.stringify(tx));mutate(copy);assert.throws(()=>transferSourceQuery(copy));
  }

  for (const height of ['3352999','3353000']) {
    const legacy = height === '3352999';
    const source = legacy ? address(2) : address(1);
    const context = {chainId:CHAIN.ID,protocol:legacy?CHAIN.LEGACY_PROTOCOL:CHAIN.PROTOCOL,timeoutHeight:legacy?'3352999':'0'};
    const messages = [{typeUrl:'/structs.structs.MsgPlayerSend',value:{creator:signer.address,
      fromAddress:source,toAddress:recipient.address,amount:[{denom:'ualpha',amount:'1000000'}]}}];
    const raw = await offline.sign(signer.address,messages,FEE,'',{chainId:CHAIN.ID,accountNumber:1,sequence:0},BigInt(context.timeoutHeight));
    const copy = JSON.parse(JSON.stringify(tx));
    copy.intent.recipientId = legacy ? recipient.id : null;
    copy.submission = {...await signedSubmission(raw,{messages,registry,fee:FEE,accountAddress:signer.address,accountNumber:1,sequence:0,context}),
      transfer:{...signed.transfer,source,destination:recipient.address,height}};
    copy.response.transactionHash = copy.submission.hash;copy.response.height = height;
    const query = transferSourceQuery(copy);
    assert.equal(query.address,source);assert.equal(query.counterparty,recipient.address);
    assert.equal(transferSourceRow(ledger(copy),query).id,'9007199254740994','Pre-H inclusion may finish indexing after H');
  }

  const rejected=flow();rejected.control.reject=true;
  const rejection=rejected.view.transfer();rejected.state.transferAmount=9;
  await rejected.queue.transactOnBlock();await rejection;
  assert.equal(rejected.control.lookups,0);assert.equal(rejected.state.transferAmount,1);
  assert.equal(rejected.router.currentPage,'confirmTransfer');assert.deepEqual(rejected.router.currentOptions,recipient);
  rejected.router.back();assert.equal(rejected.router.currentPage,'recipient','Back must not restore an orphan waiting screen');

  const unsent=flow();unsent.queue.submission.prepare=async()=>{throw new Error('Insufficient spendable funds fixture');};
  const refusal=unsent.view.transfer();await unsent.queue.transactOnBlock();await refusal;
  assert.equal(unsent.control.sends,0);assert.equal(unsent.control.lookups,0);
  assert.equal(unsent.router.currentPage,'confirmTransfer');assert.equal(unsent.state.transferAmount,1);

  const unknown=flow();unknown.control.committed=false;
  const pending=unknown.view.transfer();await unknown.queue.transactOnBlock();
  assert.equal(unknown.control.lookups,0);assert.equal(unknown.router.currentPage,'menuWaiting');
  assert.equal(unknown.queue.settlementWaiters.size,1);
  unknown.router.goto('Account','index');await pending;
  assert.equal(unknown.queue.settlementWaiters.size,0,'Navigation removes only the observer');
  assert.equal(unknown.queue.unresolved.size,1);
  await assert.rejects(()=>unknown.alpha.transferAlpha(recipient.address,1,recipient.id),/existing submission/);
  const reloaded=new SigningQueueManager(unknown.state,{registry,wsUrl:'fixture',submission:unknown.queue.submission});
  reloaded.loadPersistedState();assert.equal(reloaded.unresolved.size,1);
  assert.throws(()=>reloaded.enqueueTransfer(intent),/existing submission/);
  unknown.control.committed=true;await reloaded.reconcilePending();
  assert.equal(unknown.control.sends,1);assert.equal(reloaded.completed.size,1);
  assert.equal(unknown.router.currentPage,'index','Late recovery must not navigate a departed screen');

  const delayed=flow();let respond;
  delayed.control.lookup=()=>new Promise(resolve=>{respond=resolve;});
  const waiting=delayed.view.transfer();await delayed.queue.transactOnBlock();await pause(0);
  assert.equal(delayed.router.currentPage,'menuWaiting');
  delayed.router.goto('Account','index');
  respond(ledger([...delayed.queue.completed.values()][0]));await waiting;
  assert.equal(delayed.router.currentPage,'index');

  // Indexed evidence can arrive without any GRASS notification. Reads alone retry.
  let lookups=0;
  const controller=new AbortController();
  const indexed=await waitForTransferSource({getTransferSource:async()=>{
    lookups++;return lookups===1?{data:null,meta:{transfer_source:{ready:false,reason:'not_indexed'}}}:ledger(tx);
  }},tx,controller.signal);
  assert.equal(lookups,2);assert.equal(indexed.id,'9007199254740994');
  const abortPoll=new AbortController();
  const polling=waitForTransferSource({getTransferSource:async()=>({data:null})},tx,abortPoll.signal);
  await pause(0);abortPoll.abort();await assert.rejects(polling,{name:'AbortError'});

  const p=player();assert.equal(transferLimit(p,'1-1',3353000),2,'Use vault spendability, not retained wealth/display alpha');
  p.spendable_alpha_p='9007199254740993';assert.equal(transferLimit(p,'1-1',3353000),99);
  p.spendable_alpha_p='999999';assert.equal(transferLimit(p,'1-1',3353000),0);
  p.funds_meta.ready=false;assert.throws(()=>transferLimit(p,'1-1',3353000));
  const legacy={id:'1-1',alpha:'7.9',snapshot_meta:snapshot('3352999')};
  assert.equal(transferLimit(legacy,'1-1',3352999),7);
  assert.throws(()=>transferLimit(legacy,'1-1',3353000));
  assert.throws(()=>transferLimit({...player(),spendable_alpha_p:2},'1-1',3353000));

  // Real view handlers with a minimal DOM: refresh, input validation and detached response.
  function element() {
    const target=new EventTarget();
    return Object.assign(target,{value:'0',disabled:false,classList:{add(){},remove(){}},click(){this.dispatchEvent(new Event('click'));}});
  }
  const amountFlow=flow();const input=element(),next=element();
  input.previousElementSibling=element();input.nextElementSibling=element();
  globalThis.document={getElementById:id=>id==='transferAmountInput'?input:next};
  const originalInit=MenuPage.sui.inputStepper.autoInitAll;
  MenuPage.sui.inputStepper.autoInitAll=()=>{};
  let ready;
  const amount=new AccountTransferAmountViewModel(amountFlow.state,{getPlayer:()=>new Promise(resolve=>{ready=resolve;})});
  amount.initPageCode();assert.equal(input.disabled,true);next.click();assert.notEqual(amountFlow.router.currentPage,'recipientSearch');
  ready(player());await pause(0);assert.equal(input.max,2);assert.equal(input.disabled,false);
  input.value='3';next.click();assert.notEqual(amountFlow.router.currentPage,'recipientSearch');
  input.value='2';input.dispatchEvent(new Event('input'));assert.equal(next.disabled,false);
  next.click();assert.equal(amountFlow.state.transferAmount,2);assert.equal(amountFlow.router.currentPage,'recipientSearch');
  const late=new AccountTransferAmountViewModel(amountFlow.state,{getPlayer:()=>new Promise(resolve=>{ready=resolve;})});
  late.initPageCode();amountFlow.router.goto('Account','index');ready(player());await pause(0);
  assert.equal(input.disabled,true,'A detached response must not reactivate controls');
  MenuPage.sui.inputStepper.autoInitAll=originalInit;

  const cancelled=flow();const id=cancelled.queue.enqueueTransfer(intent);
  const a=new AbortController();const waiter=cancelled.queue.whenSettled(id,a.signal);
  const second=cancelled.queue.whenSettled(id);a.abort();await assert.rejects(waiter,{name:'AbortError'});
  assert.equal(cancelled.queue.settlementWaiters.get(id).size,1);
  assert.equal(await cancelled.queue.cancelQueueItem(id),true);
  assert.equal((await second).status,TX_STATUS.CANCELLED);assert.equal(cancelled.queue.settlementWaiters.size,0);
  const failedSave=flow();globalThis.localStorage.setItem=()=>{throw new Error('quota fixture');};
  await assert.rejects(()=>failedSave.alpha.transferAlpha(recipient.address,1,recipient.id),/persisted/);
  assert.equal(failedSave.queue.immediateQueue.length,0);assert.equal(failedSave.control.sends,0);

  const ajax=new JsonAjaxer();let aborted=false;
  globalThis.fetch=(url,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>{
    aborted=true;reject(options.signal.reason);
  },{once:true}));
  await assert.rejects(()=>ajax.get('fixture',{timeoutMs:10}),{name:'AbortError'});assert.equal(aborted,true);
  let calls=0,reauth;
  globalThis.fetch=async()=>{calls++;return {status:401};};
  ajax.onUnauthorized=()=>new Promise(resolve=>{reauth=resolve;});
  const authController=new AbortController();const auth=ajax.get('fixture',{signal:authController.signal});
  await pause(0);authController.abort();await assert.rejects(auth,{name:'AbortError'});reauth(true);await pause(0);
  assert.equal(calls,1,'A departed read must not retry after reauthentication');
  const timeoutAuth=ajax.get('fixture',{timeoutMs:10});
  await assert.rejects(timeoutAuth,{name:'AbortError'});reauth(true);await pause(0);
  assert.equal(calls,2,'A hung shared login does not extend the read deadline');
  console.log('Transfer flow passed: real Alpha/queue/view integration, exact committed lookup, rejection preservation/back navigation, duplicate/unknown/reload safety, abort cleanup, indexed catch-up, ready exact bounds and read deadlines. No live broadcast.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
