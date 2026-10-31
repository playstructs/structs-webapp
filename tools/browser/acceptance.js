// Development-only screen fixture. Never included in the production entries.
// API/native outcomes are controlled; the DOM, views, queue, signing and storage
// are real. The adapter below cannot connect to or broadcast on a chain.
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import {toBech32} from '@cosmjs/encoding';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {GameState} from '../../src/js/models/GameState';
import {Player} from '../../src/js/models/Player';
import {Guild} from '../../src/js/models/Guild';
import {AccountController} from '../../src/js/controllers/AccountController';
import {GenericController} from '../../src/js/controllers/GenericController';
import {MenuPage} from '../../src/js/framework/MenuPage';
import {SigningClientManager} from '../../src/js/managers/SigningClientManager';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {AlphaManager} from '../../src/js/managers/AlphaManager';
import {PermissionManager} from '../../src/js/managers/PermissionManager';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {FEE} from '../../src/js/constants/Fee';
import {signedSubmission} from '../../src/js/util/SignedSubmission';
import {transferSourceQuery, transferSourceRow} from '../../src/js/util/TransferCompletion';

const address=n=>toBech32('structs',new Uint8Array(20).fill(n));
const source=address(1),recipientVault=address(4);
const recipient={id:'1-2',address:address(3),username:'Recipient',tag:'TEST',guild_name:'Fixture Guild',alpha:'7'};
const countersKey='browser-acceptance-counters';
const input=new URLSearchParams(location.search),caseId=input.get('case');
if(location.hostname!=='127.0.0.1' || !caseId || !/^[a-z0-9-]+$/.test(caseId)) throw new Error('Use a named case on the disposable localhost fixture');
if(localStorage.getItem('browser-acceptance-case')!==caseId) {
  // This dedicated origin contains only test data. Reloading the same case
  // preserves every queue/journal record and exercises real browser recovery.
  localStorage.clear();localStorage.setItem('browser-acceptance-case',caseId);
}
const counters=JSON.parse(localStorage.getItem(countersKey)||'{"signed":0,"sends":0}');
const count=name=>{counters[name]++;localStorage.setItem(countersKey,JSON.stringify(counters));};
const control=async()=>{
  const response=await fetch('/js/acceptance-control.json',{cache:'no-store'});
  if(!response.ok)throw new Error('Fixture controls unavailable');
  return response.json();
};
const meta=(height='3353000',ready=true)=>({chain_id:CHAIN.ID,height,indexed_height:height,observed_tip:height,
  api_contract:CHAIN.API_CONTRACT,activation_height:CHAIN.UPGRADE_HEIGHT,cache_epoch:`${CHAIN.API_CONTRACT}:${CHAIN.PROTOCOL}`,
  protocol:CHAIN.PROTOCOL,observed_protocol:CHAIN.PROTOCOL,data_ready:ready,transaction_ready:ready,
  inventory_authority:'current-claims-v1',required_models:['inventory'],models:{inventory:{ready,height}}});
const wallet=await DirectSecp256k1HdWallet.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',{prefix:'structs'});
const [actor]=await wallet.getAccounts(),registry=new Registry([...defaultRegistryTypes,...msgTypes]);
const offline=await SigningStargateClient.offline(wallet,{registry});
const state=new GameState();
Object.assign(state,{currentBlockHeight:3353000,signingAccount:actor,signingClient:offline,
  thisGuild:Object.assign(new Guild(),{id:'0-1',name:'Fixture Guild',primary_reactor_id:'3-1',reactor_ratio:1000})});
const player=ready=>Object.assign(new Player(),{id:'1-1',username:'Browser Fixture',guild_id:'0-1',tag:'TEST',primary_address:actor.address,
  alpha:'2.999999',spendable_alpha_p:'2999999',load:1000,structs_load:0,capacity:7000,connection_capacity:0,
  vault_address:source,funds_meta:{ready,height:'3353000',provisioned:true},snapshot_meta:meta('3353000',ready)});
state.keyPlayers.player.id='1-1';
state.keyPlayers.player.setPlayer(player(true),state.currentBlockHeight);
const signing=Object.assign(Object.create(SigningClientManager.prototype),{gameState:state,registry});
signing.queue=new SigningQueueManager(state,{registry,wsUrl:'browser-acceptance',submission:{
  prepare:async tx=>{
    const current=await control();
    if(current.prepareFailure)throw new Error('Fixture preparation rejected');
    if(tx.intent?.kind!=='alpha_transfer')throw new Error('Fixture cannot sign this operation');
    const intent=tx.intent,selected=!!intent.recipientId;
    const messages=[selected ? {typeUrl:'/structs.structs.MsgVaultSend',value:{creator:actor.address,ownerId:intent.ownerId,
      recipientOwnerId:intent.recipientId,amount:[{denom:'ualpha',amount:intent.amount}]}}
      : {typeUrl:'/structs.structs.MsgPlayerSend',value:{creator:actor.address,fromAddress:source,toAddress:intent.recipientAddress,
        amount:[{denom:'ualpha',amount:intent.amount}]}}];
    count('signed');
    const raw=await offline.sign(actor.address,messages,FEE,'',{chainId:CHAIN.ID,accountNumber:1,sequence:counters.signed},0n);
    const signed=await signedSubmission(raw,{messages,registry,fee:FEE,accountAddress:actor.address,accountNumber:1,sequence:counters.signed,
      context:{chainId:CHAIN.ID,protocol:CHAIN.PROTOCOL,timeoutHeight:'0',observedHeight:String(state.currentBlockHeight)}});
    console.info('[acceptance-signing]',JSON.stringify({typeUrl:messages[0].typeUrl,value:messages[0].value,hash:signed.hash}));
    return {...signed,transfer:{ownerId:'1-1',source,destination:selected?recipientVault:intent.recipientAddress,
      denom:'ualpha',amount:intent.amount,height:String(state.currentBlockHeight)}};
  },assertSendable:()=>{},send:async tx=>{
    count('sends');const current=await control();
    if(current.outcome==='unknown')throw new Error('Fixture lost send reply');
    return {stage:'check_tx',code:current.outcome==='reject'?7:0,transactionHash:tx.submission.hash};
  },find:async tx=>{
    const current=await control();if(current.outcome!=='success')return null;
    return {stage:'committed',code:0,chainId:CHAIN.ID,height:'3353000',txIndex:7,
      blockHash:'A'.repeat(64),blockTime:'2026-10-30T21:00:00.123456789Z',transactionHash:tx.submission.hash};
  }}});
signing.queue.loadPersistedState();
const ledger=tx=>{
  const query=transferSourceQuery(tx);
  return {id:'9007199254740994',...query,tx_index:Number(query.tx_index),action:'sent',direction:'debit',
    time:'2026-10-30 21:00:00.123456+00',amount:'1',counterparty_player_id:tx.intent.recipientId,
    counterparty_username:tx.intent.recipientId?recipient.username:null};
};
const api={
  getPlayer:async()=>player((await control()).fundsReady!==false),
  getGuildFilterList:async()=>[state.thisGuild],
  transferSearch:async request=>request.search_string.startsWith('structs1')?[{address:request.search_string}]:[recipient],
  getPlayerAddressCount:async()=>2,
  getTransferSource:async(owner,query)=>{
    const current=await control(),tx=[...signing.queue.completed.values()].find(tx=>tx.status==='succeeded');
    const result={meta:{...meta(),transfer_source:{ready:current.indexReady!==false,
      reason:current.indexReady===false?'not_indexed':null,required_height:query.block_height}},
      data:current.indexReady===false?null:ledger(tx)};
    if(current.indexReady!==false && !transferSourceRow(result,query))throw new Error('Fixture ledger does not match its signed transfer');
    return result;
  },
  getTransaction:async()=>{
    const current=await control();
    if(current.transactionDelayMs)await new Promise(resolve=>setTimeout(resolve,current.transactionDelayMs));
    return ledger([...signing.queue.completed.values()].find(tx=>tx.status==='succeeded'));
  },
  getTransactions:async()=>[...signing.queue.completed.values()].filter(tx=>tx.status==='succeeded').map(ledger),
  countTransactions:async()=>[...signing.queue.completed.values()].filter(tx=>tx.status==='succeeded').length,
};
state.guildAPI=api;
const alpha=new AlphaManager(state,signing);
MenuPage.gameState=state;MenuPage.mapManager={showActiveMap(){}};MenuPage.initListeners();
MenuPage.router.registerController(new AccountController(state,api,{},new PermissionManager(),alpha,{},signing));
MenuPage.router.registerController(new GenericController(state));
MenuPage.router.registerController({name:'Fleet',index:()=>MenuPage.router.goto('Account','index')});
MenuPage.router.registerController({name:'Guild',index:()=>MenuPage.router.goto('Account','index')});
MenuPage.router.goto('Account',input.get('screen')==='confirm'?'confirmTransfer':'transferAmount',recipient);
if(input.get('screen')==='confirm') {
  state.setTransferAmount(1);MenuPage.router.goto('Account','confirmTransfer',recipient,{replace:true});
}
MenuPage.open();
MenuPage.hideLoadingScreen();
let previous='';
setInterval(async()=>{
  await signing.queue.transactOnBlock();
  const evidence=JSON.stringify({caseId,page:MenuPage.router.currentPage,amount:state.transferAmount,...counters,
    queued:signing.queue.immediateQueue.length,unresolved:signing.queue.unresolved.size,completed:signing.queue.completed.size,
    ids:[...signing.queue.unresolved.keys(),...signing.queue.completed.keys()]});
  if(evidence!==previous){console.info('[acceptance-state]',evidence);previous=evidence;}
},250);
