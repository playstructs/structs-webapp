import assert from 'node:assert/strict';
import {stringToPath} from '@cosmjs/crypto';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import {toHex} from '@cosmjs/encoding';
import {BaseAccount} from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import {QueryAccountResponse} from 'cosmjs-types/cosmos/auth/v1beta1/query';
import {SimulateRequest, SimulateResponse} from 'cosmjs-types/cosmos/tx/v1beta1/service';
import {AuthInfo, TxBody, TxRaw} from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import * as Structs from '../../src/js/ts/structs.structs/types/structs/structs/query';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {TransactionJournal} from '../../src/js/managers/TransactionJournal';
import {PLAYER_TYPES} from '../../src/js/constants/PlayerTypes';
import {TX_STATUS} from '../../src/js/models/SigningTransaction';
import {SigningSubmission} from '../../src/js/managers/SigningSubmission';
import {SigningClientManager} from '../../src/js/managers/SigningClientManager';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {SigningTransaction} from '../../src/js/models/SigningTransaction';
import {WalletManager} from '../../src/js/managers/WalletManager';
import {registrationIntent} from '../../src/js/util/RegistrationIntent';
import {registrationProofContext, registrationProofMessage, pendingRegistrationProof} from '../../src/js/util/RegistrationProof';
import {submissionBytes} from '../../src/js/util/SignedSubmission';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {STRUCTS_FREE_GAS} from '../../src/js/constants/Fee';
import {DeviceRegistrationStore} from '../../src/js/managers/DeviceRegistrationStore';
import {registrationAssociation, registrationCommit, waitForRegistration} from '../../src/js/util/RegistrationCompletion';

const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
let account, signerAccount, registry, offline;
async function fixture(height = '3353000', nonce = '9007199254740993') {
  const protocol = BigInt(height) < BigInt(CHAIN.UPGRADE_HEIGHT) ? CHAIN.LEGACY_PROTOCOL : CHAIN.PROTOCOL;
  const proof = registrationProofContext({chain_id:CHAIN.ID,protocol,source_height:height,player_id:'1-1',
    address:account.address,registered_player_id:'',proof_nonce:protocol === CHAIN.PROTOCOL ? nonce : null,
    timeout_height:protocol === CHAIN.PROTOCOL ? '0' : '3352999'});
  const signature = await new WalletManager().createSignatureForProxyMessage(registrationProofMessage(proof),account.privkey);
  const intent = registrationIntent({kind:'address_register',version:1,ownerId:'1-1',address:account.address,
    pubkey:toHex(account.pubkey),signature,permissions:'255',proof});
  // A second derivation is the existing device approving this new key.
  const control = {height,nonce,permissions:'255',owner:'1-1',targetOwner:'',signed:0,simulated:0,gas:1000000n};
  const signer = signerAccount.address;
  const meta = () => ({chain_id:CHAIN.ID,height:control.height,indexed_height:control.height,observed_tip:control.height,
    activation_height:CHAIN.UPGRADE_HEIGHT,api_contract:CHAIN.API_CONTRACT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,
    protocol,observed_protocol:protocol,data_ready:true,transaction_ready:true,required_models:[],models:{},inventory_authority:'current-claims-v1'});
  const manager = {registry,connectionEpoch:1,gameState:{signingAccount:{address:signer},guildAPI:{getBlockSnapshot:async()=>({meta:meta()})}}};
  const encode = (type, value) => type.encode(type.fromPartial(value)).finish();
  const request = async (service,method,bytes) => {
    if (service === 'cosmos.auth.v1beta1.Query') return encode(QueryAccountResponse,{account:{typeUrl:'/cosmos.auth.v1beta1.BaseAccount',
      value:encode(BaseAccount,{address:signer,accountNumber:1n,sequence:2n})}});
    if (service === 'structs.structs.Query' && method === 'Address') {
      const {address} = Structs.QueryGetAddressRequest.decode(bytes);
      assert.ok([signer,account.address].includes(address));
      return encode(Structs.QueryAddressResponse,{address,playerId:address === signer ? control.owner : control.targetOwner,
        permissions:address === signer ? control.permissions : '0',proofNonce:control.nonce});
    }
    if (service === 'structs.structs.Query' && method === 'Player') return encode(Structs.QueryGetPlayerResponse,{Player:{id:'1-1'}});
    if (service === 'cosmos.tx.v1beta1.Service' && method === 'Simulate') {
      control.simulated++;control.bytes=SimulateRequest.decode(bytes).txBytes;
      return encode(SimulateResponse,{gasInfo:{gasUsed:control.gas}});
    }
    throw new Error(`Unexpected query ${service}/${method}`);
  };
  manager.gameState.signingClient = {sign:async(...args)=>{control.signed++;return offline.sign(...args);}};
  manager.chainQuery = {closed:false,status:async()=>({chainId:CHAIN.ID,height:control.height}),
    readSnapshot:async(read,options={})=>{
      const pinned = options.height ?? control.height;
      return {chainId:CHAIN.ID,height:pinned,observedHeight:control.height,
        data:await read({chainId:CHAIN.ID,height:pinned,request})};
    }};
  const tx = SigningTransaction.create({intent,isAction:false,retryLimit:0,accountAddress:signer,enqueuedAtBlock:Number(height)});
  return {control,tx,manager,submission:new SigningSubmission(manager)};
}

const activationId='11111111-1111-4111-8111-111111111111';
function pendingRow(base) {
  return {code:'ZZZQQ',activation_id:activationId,address:base.address,player_id:base.ownerId,pubkey:base.pubkey,signature:base.signature,
    permissions:255,proof_chain_id:base.proof.chain_id,proof_protocol:base.proof.protocol,
    proof_nonce:base.proof.proof_nonce,proof_height:base.proof.source_height,proof_timeout_height:base.proof.timeout_height};
}
function association(base, height='3353001') {
  return {data:{indexed:{address:base.address,player_id:base.ownerId,guild_id:'0-1',status:'approved'},
    chain:{...base.proof,source_height:height,registered_player_id:base.ownerId,proof_nonce:(BigInt(base.proof.proof_nonce)+1n).toString()}},
    meta:{chain_id:CHAIN.ID,height,indexed_height:height,observed_tip:height,activation_height:CHAIN.UPGRADE_HEIGHT,
      api_contract:CHAIN.API_CONTRACT,cache_epoch:`${CHAIN.API_CONTRACT}:${CHAIN.PROTOCOL}`,protocol:CHAIN.PROTOCOL,
      observed_protocol:CHAIN.PROTOCOL,data_ready:true,transaction_ready:true,required_models:[],models:{},inventory_authority:'current-claims-v1'}};
}
function committed(tx) {
  tx.status=TX_STATUS.SUCCEEDED;
  tx.response={stage:'committed',code:0,chainId:CHAIN.ID,transactionHash:tx.submission.hash,height:'3353001',blockHash:'A'.repeat(64)};
  return tx;
}
function authFixture(base) {
  const {AuthManager}=require('../../src/js/managers/AuthManager');
  const manager=Object.create(AuthManager.prototype);
  manager.gameState={thisGuild:{id:'0-1'},keyPlayers:{[PLAYER_TYPES.PLAYER]:{id:base.ownerId}},
    signingAccount:signerAccount,currentBlockHeight:3353000};
  manager.signingClientManager={queue:new SigningQueueManager(manager.gameState,{registry,wsUrl:'ws://activation'}),initSigningClient:async()=>{}};
  manager.walletManager=new WalletManager();
  manager.walletManager.createMnemonic=()=>mnemonic;
  manager.initWallet=async value=>{manager.gameState.signingAccount=value==='recovery fixture' ? signerAccount : account;};
  manager.permissionManager={getDefaultPlayerPermissions:()=>255,getManageDevicesPermissions:()=>0};
  manager.reauthenticate=async()=>true;
  manager.guildAPI={getPlayerIdByAddressAndGuild:async()=>base.ownerId,getAddressRegistrationProof:async()=>base.proof,
    buildAddressRegisterMessage:(_player,_address,proof)=>registrationProofMessage(proof),getRegistrationStatus:async()=>association(base)};
  return manager;
}
async function activationTests(base, memory) {
  const row=pendingRow(base),signal=new AbortController().signal;
  for (const status of [TX_STATUS.DROPPED,TX_STATUS.CANCELLED,TX_STATUS.SUCCEEDED]) {
    memory.clear();
    let deleted=0,resolveTx;
    const manager=authFixture(base),queue=manager.signingClientManager.queue;
    Object.assign(manager.guildAPI,{getPendingAddressByCode:async(code,id)=>{assert.equal(id,activationId);return row;},
      setPendingAddressPermissions:async request=>{assert.equal(request.activation_id,activationId);return {success:true};},
      deleteActivationCode:async()=>{deleted++;},getPlayerAddressCount:async()=>2});
    queue.whenSettled=()=>new Promise(resolve=>{resolveTx=resolve;});
    const result=manager.activateDevice({...row,proof_nonce:Number(row.proof_nonce)},signal);
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(queue.immediateQueue.length,1);assert.equal(deleted,0);
    const tx=queue.immediateQueue[0];
    assert.equal(tx.intent.proof.proof_nonce,'9007199254740993','Approval refetches exact consent, not a rounded notification');
    tx.submission=await (await fixture()).submission.prepare(tx);
    tx.status=status;
    if (status===TX_STATUS.SUCCEEDED) committed(tx);
    resolveTx(tx);assert.equal(await result,status===TX_STATUS.SUCCEEDED);
    assert.equal(deleted,status===TX_STATUS.SUCCEEDED?1:0,'Only confirmed success consumes the issued instance');
  }

  memory.clear();
  const f=await fixture(), tx=f.tx;
  tx.submission=await f.submission.prepare(tx);committed(tx);
  assert.equal(registrationCommit(tx).address,base.address);
  for (const patch of [{status:TX_STATUS.UNKNOWN},{response:{...tx.response,transactionHash:'F'.repeat(64)}},
    {response:{...tx.response,code:5}},{response:{...tx.response,height:'3352999'}}]) {
    assert.throws(()=>registrationCommit({...tx,...patch}));
  }
  const expected={...registrationCommit(tx),guildId:'0-1'};
  assert.equal(registrationAssociation(association(base),expected),true);
  for (const modify of [r=>r.data.indexed.player_id='1-2',r=>r.data.indexed.guild_id='0-2',r=>r.data.indexed.status='pending',
    r=>r.data.chain.registered_player_id='',r=>r.data.chain.proof_nonce=base.proof.proof_nonce,
    r=>r.meta.height='3353000',r=>r.meta.transaction_ready=false,r=>r.meta.cache_epoch='old',r=>r.data.chain.chain_id='other']) {
    const response=association(base);modify(response);assert.equal(registrationAssociation(response,expected),false);
  }
  for (const owner of ['', '1-2']) {
    const response=association(base);response.data.chain.registered_player_id=owner;
    await assert.rejects(()=>waitForRegistration({getRegistrationStatus:async()=>response},expected,signal),/no longer usable/);
  }
  const observer=new AbortController();
  const waiting=waitForRegistration({getRegistrationStatus:async()=>{observer.abort();return association(base);}},expected,observer.signal);
  await assert.rejects(waiting,error=>error.name==='AbortError');

  // A result committed in another tab must be observable immediately, not just
  // returned as an ID which whenSettled cannot find in this tab's queue.
  const manager=authFixture(base),queue=manager.signingClientManager.queue;
  queue.loadPersistedState();
  new TransactionJournal(signerAccount.address).write(tx,'settled');
  assert.equal(queue.findRegistration(base.ownerId,base.address).id,tx.id);
  assert.equal((await queue.whenSettled(tx.id,signal)).status,TX_STATUS.SUCCEEDED);
  const saved={code:row.code,activation_id:activationId,pending:row};
  assert.equal((await manager.waitForPendingDevice(saved,signal)).address,base.address,'Committed approval survives deleted pending row');
  manager.guildAPI.getPendingAddressByCode=()=>{throw new Error('A settled journal must not depend on the pending row');};
  manager.guildAPI.deleteActivationCode=async()=>{};
  manager.guildAPI.getPlayerAddressCount=async()=>2;
  assert.equal(await manager.activateDevice(row,signal),true);

  // Corrupt public evidence cannot be silently ignored in favor of a new key.
  localStorage.setItem(new TransactionJournal(signerAccount.address).prefix+'broken','not-json');
  assert.throws(()=>queue.findRegistration(base.ownerId,base.address));
}

async function deviceRecoveryTests(base,memory) {
  memory.clear();
  const held=new Set();
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(name,_options,run)=>{
    if (held.has(name)) return run(null);
    held.add(name);try{return await run({name});}finally{held.delete(name);}
  }}}});
  window.navigator={userAgent:'fixture'};
  const signal=new AbortController().signal,info={code:'ZZZQQ',activation_id:activationId,player_id:base.ownerId};
  let generated=0,posts=0;
  const manager=authFixture(base);
  manager.walletManager.createMnemonic=()=>{generated++;return mnemonic;};
  manager.guildAPI.addPendingAddress=async request=>{
    posts++;assert.equal(request.activation_id,activationId);assert.equal(request.address,base.address);
    throw new Error('Lost POST response');
  };
  await assert.rejects(()=>manager.addNewDevice(info,signal),/Lost POST/);
  assert.equal(generated,1);assert.equal(posts,1);
  const store=new DeviceRegistrationStore('activation','0-1',base.ownerId,activationId),record=store.read();
  assert.equal(record.submitted,true);assert.equal(record.accepted,undefined);
  assert.equal(DeviceRegistrationStore.active('0-1').record.address,base.address);
  assert.throws(()=>store.write({...record,address:signerAccount.address}),/cannot be replaced/);
  assert.throws(()=>new DeviceRegistrationStore('activation','0-1',base.ownerId,'ZZZQQ'),/instance/);
  await store.exclusive(async()=>assert.rejects(()=>store.exclusive(()=>{}),/already being prepared/));

  // Reuse the stored key; native+indexed success wins over a lost POST response.
  const reloaded=authFixture(base);reloaded.gameState.signingAccount=account;
  reloaded.walletManager.createMnemonic=()=>{throw new Error('Reload cannot create a different device');};
  reloaded.guildAPI.addPendingAddress=()=>{throw new Error('Committed registration cannot be resubmitted');};
  await reloaded.waitForDeviceActivation(info,signal);
  assert.equal(store.read().accepted,true);
  let logins=0,saves=0;
  reloaded.login=async()=>{logins++;return true;};reloaded.gameState.save=()=>{saves++;};
  assert.equal(await reloaded.completeDeviceActivation(info,signal),true);
  assert.equal(logins,1);assert.equal(saves,1);assert.equal(store.read(),null);assert.equal(DeviceRegistrationStore.active('0-1'),null);

  // If nothing committed, retry precisely the same pending HTTP request.
  memory.clear();const retry=authFixture(base);let firstRequest;
  retry.guildAPI.addPendingAddress=async request=>{firstRequest=JSON.parse(JSON.stringify(request));throw new Error('Lost response');};
  await assert.rejects(()=>retry.addNewDevice(info,signal),/Lost response/);
  retry.guildAPI.getRegistrationStatus=async()=>{const r=association(base);r.data.chain.registered_player_id='';r.data.indexed=null;return r;};
  retry.guildAPI.addPendingAddress=async request=>{assert.deepEqual(JSON.parse(JSON.stringify(request)),firstRequest);return {success:true};};
  assert.equal(await retry.addNewDevice(info,signal),true);

  // An explicit recovery attempt after reload reuses an uncertain signed tx and
  // the saved private key, even if the private txId write had been interrupted.
  memory.clear();const recover=authFixture(base),abort=new AbortController();
  let proofReads=0;
  recover.guildAPI.getAddressRegistrationProof=async()=>{proofReads++;return base.proof;};
  const pending=recover.loginWithMnemonic('recovery fixture',abort.signal);
  const rejected=assert.rejects(pending,error=>error.name==='AbortError');
  for (let i=0;i<100 && !recover.signingClientManager.queue.immediateQueue.length;i++) await new Promise(resolve=>setTimeout(resolve,5));
  const tx=recover.signingClientManager.queue.immediateQueue[0];assert.ok(tx);
  tx.submission=await (await fixture()).submission.prepare(tx);tx.status=TX_STATUS.UNKNOWN;
  new TransactionJournal(signerAccount.address).write(tx,'unknown');
  abort.abort();await rejected;
  const recoveryStore=new DeviceRegistrationStore('recovery','0-1',base.ownerId,signerAccount.address);
  const before=recoveryStore.read();delete before.txId;recoveryStore.write(before);
  const second=authFixture(base);
  second.walletManager.createMnemonic=()=>{throw new Error('Recovery reload replaced its key');};
  second.guildAPI.getAddressRegistrationProof=()=>{throw new Error('Uncertain recovery must not request fresh consent');};
  second.completeMnemonicLogin=async(_player,key)=>{assert.equal(key,mnemonic);return true;};
  committed(tx);new TransactionJournal(signerAccount.address).write(tx,'settled');
  assert.equal(await second.loginWithMnemonic('recovery fixture',signal),true);
  assert.equal(proofReads,1);assert.equal(recoveryStore.read(),null);
}

async function navigationTests() {
  const {MenuPage}=require('../../src/js/framework/MenuPage');
  const {MenuPageRouter}=require('../../src/js/framework/MenuPageRouter');
  const {AccountActivatingDeviceViewModel}=require('../../src/js/view_models/account/AccountActivatingDeviceViewModel');
  const {ActivatingDeviceViewModel}=require('../../src/js/view_models/login/ActivatingDeviceViewModel');
  const {ActivateDeviceVerifyViewModel}=require('../../src/js/view_models/login/ActivateDeviceVerifyViewModel');
  const {RecoverAccountStartViewModel}=require('../../src/js/view_models/login/RecoverAccountStartViewModel');
  const {AuthManager}=require('../../src/js/managers/AuthManager');
  const tick=()=>new Promise(resolve=>setImmediate(resolve));
  function page() {
    const router=MenuPage.router=new MenuPageRouter();
    router.registerController({name:'Account',index(){},activatingDevice(){},deviceActivationComplete(){},deviceActivationCancelled(){}});
    router.registerController({name:'Auth',loginActivateDevice(){},loginActivateDeviceComplete(){},loginActivateDeviceCancelled(){},
      loginActivateDeviceWaitingForApproval(){},loginRecoverAccountSuccess(){},loginRecoverAccountFail(){}});
    router.registerController({name:'Generic',menuWaiting(){}});
    router.goto('Auth','loginActivateDevice');
    return router;
  }
  const elements=new Map();
  globalThis.document={getElementById:id=>{
    if (!elements.has(id)) {const element=new EventTarget();element.value='fixture mnemonic';element.classList={contains:()=>false};elements.set(id,element);}
    return elements.get(id);
  }};
  for (const [View,method,controller,success,failure] of [
    [AccountActivatingDeviceViewModel,'activateDevice','Account','deviceActivationComplete','deviceActivationCancelled'],
    [ActivatingDeviceViewModel,'completeDeviceActivation','Auth','loginActivateDeviceComplete','loginActivateDeviceCancelled']]) {
    for (const result of [true,false]) {
      const router=page();let resolve;
      const view=new View({}, {[method]:()=>new Promise(r=>resolve=r)},{});
      view.initPageCode();assert.equal(router.currentPage,'loginActivateDevice');
      resolve(result);await tick();assert.equal(router.currentController,controller);assert.equal(router.currentPage,result?success:failure);
    }
    const router=page();let resolve;
    new View({}, {[method]:()=>new Promise(r=>resolve=r)},{}).initPageCode();
    router.goto('Account','index');resolve(true);await tick();assert.equal(router.currentPage,'index','Late completion cannot move another page');
  }
  elements.clear();const router=page();let resolve,submits=0;
  const verify=new ActivateDeviceVerifyViewModel({addNewDevice:()=>{submits++;return new Promise(r=>resolve=r);}},{activation_id:activationId});
  verify.initPageCode();
  document.getElementById('yes-btn').dispatchEvent(new Event('click'));
  document.getElementById('yes-btn').dispatchEvent(new Event('click'));
  assert.equal(submits,1);resolve(true);await tick();assert.equal(router.currentPage,'loginActivateDeviceWaitingForApproval');
  for (const success of [true,false]) {
    elements.clear();const router=page();
    new RecoverAccountStartViewModel({}, {loginWithMnemonic:async(_key,signal)=>{assert.equal(signal.aborted,false);return success;}}).initPageCode();
    document.getElementById('submit-btn').dispatchEvent(new Event('click'));await tick();
    assert.equal(router.currentPage,success?'loginRecoverAccountSuccess':'loginRecoverAccountFail');
  }

  // Slow wallet derivation from a departed screen cannot overwrite the current
  // signer (or the wallet object it was derived from).
  const manager=Object.create(AuthManager.prototype);manager.gameState={signingAccount:signerAccount};
  manager.signingClientManager={stopForLogout(){},queue:{releaseAccount:async()=>{}}};
  let oldResolve;
  manager.walletManager={createWallet:async key=>key==='old' ? new Promise(r=>oldResolve=r) : {getAccountsWithPrivkeys:async()=>[account]},bytesToHex:toHex};
  const old=manager.initWallet('old');const oldRejected=assert.rejects(old,/superseded/);
  await manager.initWallet('new');oldResolve({getAccountsWithPrivkeys:async()=>[signerAccount]});await oldRejected;
  assert.equal(manager.gameState.signingAccount.address,account.address);
  const abort=new AbortController();abort.abort();
  await assert.rejects(()=>manager.initWallet('new',abort.signal),error=>error.name==='AbortError');
  assert.equal(manager.gameState.signingAccount.address,account.address);

  let release;
  manager.gameState.signingAccount=signerAccount;
  manager.signingClientManager.queue.releaseAccount=()=>new Promise(resolve=>{release=resolve;});
  const departed=new AbortController(),changing=manager.initWallet('new',departed.signal);
  const cancelled=assert.rejects(changing,error=>error.name==='AbortError');
  await tick();departed.abort();release();await cancelled;
  assert.equal(manager.gameState.signingAccount.address,signerAccount.address,'departing during queue drain cannot install a new wallet');
}

async function main() {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic,{prefix:'structs'});
  [account] = await wallet.getAccountsWithPrivkeys();
  registry = new Registry([...defaultRegistryTypes,...msgTypes]);
  const approvingWallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic,{prefix:'structs',
    hdPaths:[stringToPath("m/44'/118'/0'/0/1")]});
  [signerAccount] = await approvingWallet.getAccounts();
  offline = await SigningStargateClient.offline(approvingWallet,{registry});
  for (const nonce of ['0','1','9007199254740993','18446744073709551615']) {
    const f = await fixture('3353000',nonce);
    const signed = await f.submission.prepare(f.tx);
    assert.equal(signed.registration.proof.proof_nonce,nonce);
    assert.equal(f.control.signed,1);assert.equal(f.control.simulated,1);
    assert.deepEqual(submissionBytes(signed),f.control.bytes);
    const raw = TxRaw.decode(submissionBytes(signed)), body = TxBody.decode(raw.bodyBytes);
    const message = registry.decode(body.messages[0]);
    assert.equal(message.permissions,'255');assert.equal(message.proofSignature,f.tx.intent.signature);
    assert.equal(message.creator,signerAccount.address);assert.equal(message.nonce,undefined,'Nonce belongs in consent, never an invented message field');
    assert.equal(body.timeoutHeight,0n);assert.equal(AuthInfo.decode(raw.authInfoBytes).fee.gasLimit,BigInt(STRUCTS_FREE_GAS));
    const restored = SigningTransaction.fromJSON(JSON.parse(JSON.stringify(f.tx.toJSON())));
    assert.deepEqual(restored.intent,f.tx.intent);
  }
  const legacy = await fixture('3352999');legacy.control.targetOwner='1-0';
  const signed = await legacy.submission.prepare(legacy.tx);
  assert.equal(TxBody.decode(TxRaw.decode(submissionBytes(signed)).bodyBytes).timeoutHeight,3352999n);
  assert.equal(registrationProofMessage(legacy.tx.intent.proof),`PLAYER1-1ADDRESS${account.address}`);
  for (const patch of [{nonce:'9007199254740994'},{permissions:'2'},{owner:'1-2'},{targetOwner:'1-1'},{targetOwner:'1-2'}]) {
    const f=await fixture();Object.assign(f.control,patch);
    await assert.rejects(()=>f.submission.prepare(f.tx));assert.equal(f.control.signed,0);
  }
  const crossed=await fixture('3352999');crossed.control.height='3353000';
  await assert.rejects(()=>crossed.submission.prepare(crossed.tx));assert.equal(crossed.control.signed,0);
  const base=(await fixture()).tx.intent;
  for (const patch of [{proof_nonce:9007199254740992},{proof_nonce:'01'},{proof_nonce:'18446744073709551616'},
      {chain_id:'wrong-chain'},{timeout_height:'3353000'},{registered_player_id:'1-1'},{source_height:3353000}]) {
    assert.throws(()=>registrationProofContext({...base.proof,...patch}));
  }
  assert.throws(()=>pendingRegistrationProof({}),/context/,'Legacy pending rows need new consent');
  const bad=await fixture();bad.tx.intent=registrationIntent({...bad.tx.intent,signature:'a'.repeat(128)});
  await assert.rejects(()=>bad.submission.prepare(bad.tx));assert.equal(bad.control.signed,0);
  const gas=await fixture();gas.control.gas=BigInt(STRUCTS_FREE_GAS)+1n;
  await assert.rejects(()=>gas.submission.prepare(gas.tx),/gas limit/);

  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),
    removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i],get length(){return memory.size;}};
  globalThis.window=new EventTarget();
  const f=await fixture(),queue=new SigningQueueManager({...f.manager.gameState,currentBlockHeight:3353000},{registry,wsUrl:'ws://registration'});
  queue.whenSettled=async id=>queue.getTransaction(id);
  const manager=Object.create(SigningClientManager.prototype);manager.queue=queue;
  const tx=await manager.queueMsgAddressRegister(base.ownerId,base.address,base.pubkey,base.signature,'255',{proofContext:base.proof});
  assert.deepEqual(tx.intent,base);assert.equal(tx.message,null,'Resolve the saved consent before generating bytes');
  await assert.rejects(()=>manager.queueMsgAddressRegister(base.ownerId,base.address,base.pubkey,base.signature,9007199254740992,{proofContext:base.proof}));
  tx.submission=await f.submission.prepare(tx);tx.status=TX_STATUS.UNKNOWN;
  new TransactionJournal(signerAccount.address).write(tx,'unknown');
  const restoredQueue=new SigningQueueManager({...f.manager.gameState,currentBlockHeight:3353000},{registry,wsUrl:'ws://registration'});
  restoredQueue.loadPersistedState();
  assert.equal(restoredQueue.getTransaction(tx.id).status,TX_STATUS.UNKNOWN);
  assert.deepEqual(restoredQueue.getTransaction(tx.id).intent,base);
  assert.throws(()=>restoredQueue.enqueueRegistration(base),/existing submission/,'An uncertain registration never becomes a replacement');
  await activationTests(base,memory);
  await deviceRecoveryTests(base,memory);
  await navigationTests();
  console.log('Registration proofs, exact nonces, permission ceiling, protocol expiry, real signatures/simulation, committed association, instance binding and reload recovery passed.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
