import assert from 'node:assert/strict';
import WebSocket from 'ws';
import {DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {Comet38Client} from '@cosmjs/tendermint-rpc';
import {QueryClientImpl as BankQueryClient} from 'cosmjs-types/cosmos/bank/v1beta1/query';
import {ChainQueryClient} from '../../src/js/api/ChainQueryClient';
import {OwnedRpcClient} from '../../src/js/api/OwnedRpcClient';
import {SigningClientManager} from '../../src/js/managers/SigningClientManager';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {exactQueryHeight, protocolAtHeight, validateSigningSnapshot} from '../../src/js/util/ChainProtocol';
import {legacyDecimalFromWire} from '../../src/js/util/MessagePayload';
import {QueryClientImpl, QueryVaultResponse, QueryAddressResponse} from '../../src/js/ts/structs.structs/types/structs/structs/query';

const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return {promise, resolve}; };
const status = (height = 3353000) => ({nodeInfo:{network:CHAIN.ID,version:'0.38.19'},syncInfo:{latestBlockHeight:height,catchingUp:false}});
function fake(overrides = {}) {
  return {status:async()=>status(),abciQuery:async({height})=>({height,code:0,value:new Uint8Array([1])}),disconnect(){this.closed=true;},...overrides};
}
const request = snapshot => snapshot.request('structs.structs.Query', 'Vault', new Uint8Array());
function metadata(height = '3353000', models = ['inventory']) {
  const protocol = protocolAtHeight(CHAIN.ID, height);
  return {chain_id:CHAIN.ID,height,indexed_height:height,observed_tip:height,activation_height:CHAIN.UPGRADE_HEIGHT,
    api_contract:CHAIN.API_CONTRACT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,protocol,observed_protocol:protocol,
    inventory_authority:protocol===CHAIN.PROTOCOL?'current-claims-v1':'ledger',data_ready:true,transaction_ready:true,
    required_models:models,models:Object.fromEntries(models.map(name=>[name,{height,ready:true}]))};
}

async function testSnapshots() {
  const calls = [];
  let height = 3353000;
  const source = fake({status:async()=>status(height++),abciQuery:async params=>{
    calls.push(params); return {code:0,height:params.height,value:QueryAddressResponse.encode(QueryAddressResponse.fromPartial({
      address:'fixture-address',playerId:'1-1',permissions:'18446744073709551615',proofNonce:'9007199254740993',
    })).finish()};
  }});
  const query = new ChainQueryClient(source);
  let expired;
  const snapshot = await query.readSnapshot(async rpc => {
    expired = rpc;
    const generated = new QueryClientImpl(rpc);
    // Two pages/point reads must use the selected height, even when the node advances.
    return [await generated.Address({address:'fixture-address'}),await generated.Address({address:'fixture-address'})];
  });
  assert.equal(snapshot.height,'3353000'); assert.equal(snapshot.observedHeight,'3353001');
  assert.equal(snapshot.data[0].proofNonce,'9007199254740993');
  assert.equal(snapshot.data[0].permissions,'18446744073709551615');
  assert.deepEqual(calls.map(call=>call.height),[3353000,3353000]);
  assert.ok(calls.every(call=>call.prove===false && call.path==='/structs.structs.Query/Address'));
  await assert.rejects(request(expired),/expired/);
  const historic = await query.readSnapshot(request,{height:'3352999'});
  assert.equal(historic.height,'3352999');
  await assert.rejects(query.readSnapshot(request,{height:'9007199254740991'}),/ahead/);
  query.disconnect(); await assert.rejects(query.status(),/closed/);

  for (const returned of [0,undefined,'',3352999,9007199254740992]) {
    const q = new ChainQueryClient(fake({abciQuery:async()=>({height:returned,code:0,value:new Uint8Array()})}));
    await assert.rejects(q.readSnapshot(request)); q.disconnect();
  }
  for (const transform of [s=>{s.nodeInfo.network='other';},s=>{s.nodeInfo.version='0.37.1';},s=>{s.syncInfo.catchingUp=true;},s=>{s.syncInfo.latestBlockHeight=0;}]) {
    const s = status(); transform(s);
    const q = new ChainQueryClient(fake({status:async()=>s}));
    await assert.rejects(q.readSnapshot(request)); q.disconnect();
  }
  for (const result of [{code:2,log:'version pruned',height:3353000},{code:0,height:3353000,value:new Uint8Array(1048577)}]) {
    const q = new ChainQueryClient(fake({abciQuery:async()=>result}));
    await assert.rejects(q.readSnapshot(request)); q.disconnect();
  }
  let pages = 0;
  const mixed = new ChainQueryClient(fake({abciQuery:async()=>({code:0,height:3353000+pages++,value:new Uint8Array()})}));
  await assert.rejects(mixed.readSnapshot(async rpc=>{await request(rpc);return request(rpc);}),/different height/); mixed.disconnect();
  // Even a callback that swallows a failed page cannot publish a partial snapshot.
  const partial = new ChainQueryClient(fake({abciQuery:async()=>({code:1,log:'pruned'})}));
  await assert.rejects(partial.readSnapshot(async rpc=>{try {await request(rpc);} catch {} return []; }),/pruned/); partial.disconnect();
  const bounded = new ChainQueryClient(fake());
  await assert.rejects(bounded.readSnapshot(async rpc=>{for(let i=0;i<65;i++) await request(rpc);}),/limit/); bounded.disconnect();
  let probes = 0;
  const changed = new ChainQueryClient(fake({status:async()=>{const s=status();if(probes++)s.nodeInfo.network='other';return s;}}));
  await assert.rejects(changed.readSnapshot(request),/identity/); changed.disconnect();
  probes = 0;
  const regressed = new ChainQueryClient(fake({status:async()=>status(3353000-probes++)}));
  await assert.rejects(regressed.readSnapshot(request),/regressed/); regressed.disconnect();

  const started = deferred(), reply = deferred();
  const disconnected = new ChainQueryClient(fake({abciQuery:()=>{started.resolve();return reply.promise;}}));
  const running = disconnected.readSnapshot(request);
  await started.promise; disconnected.disconnect();
  await assert.rejects(running,/closed/);
  reply.resolve({code:0,height:3353000,value:new Uint8Array()});
  const timed = fake({abciQuery:()=>new Promise(()=>{})});
  const timeout = new ChainQueryClient(timed,{requestTimeoutMs:25,snapshotTimeoutMs:100});
  await assert.rejects(timeout.readSnapshot(request),/timed out|closed/);
  assert.equal(timed.closed,true);
  const deadline = new ChainQueryClient(fake(),{snapshotTimeoutMs:25});
  await assert.rejects(deadline.readSnapshot(()=>new Promise(()=>{})),/timed out|closed/);
  assert.equal(deadline.closed,true);
  console.log('Height-pinned generated queries: exact fields, complete snapshots, identity, pruning, page heights, bounds and lifecycle passed.');
}

function testProtocol() {
  for (const invalid of [0,-1,NaN,Infinity,9007199254740992,'9007199254740992','01','1e2','',null]) assert.throws(()=>exactQueryHeight(invalid));
  assert.equal(exactQueryHeight('9007199254740991'),'9007199254740991');
  assert.equal(protocolAtHeight(CHAIN.ID,'3352999'),CHAIN.LEGACY_PROTOCOL);
  assert.equal(protocolAtHeight(CHAIN.ID,'3353000'),CHAIN.PROTOCOL);
  assert.throws(()=>protocolAtHeight('wrong','3353000'));
  for (const height of ['3352999','3353000']) {
    const context = validateSigningSnapshot(metadata(height),{chainId:CHAIN.ID,height},['inventory']);
    assert.equal(context.timeoutHeight,height==='3352999'?'3352999':(BigInt(height)+60n).toString());
  }
  const observed = {chainId:CHAIN.ID,height:'3353000'};
  for (const patch of [{chain_id:'wrong'},{protocol:CHAIN.LEGACY_PROTOCOL},{observed_protocol:CHAIN.LEGACY_PROTOCOL},
    {activation_height:'3353001'},{api_contract:'old'},{cache_epoch:'old'},{data_ready:false},{transaction_ready:false},
    {inventory_authority:'ledger'},{height:'3352999'},{indexed_height:'3353001'},
    {observed_tip:'3352999'},{required_models:[]},{models:{inventory:{height:'3352999',ready:true}}},
    {models:{inventory:{height:'3353000',ready:false}}}]) {
    assert.throws(()=>validateSigningSnapshot({...metadata(),...patch},observed,['inventory']));
  }
  assert.throws(()=>validateSigningSnapshot(metadata('3352999'),observed,['inventory']));
  assert.throws(()=>validateSigningSnapshot(metadata(),{...observed,height:'3352999'},['inventory']));
  assert.throws(()=>validateSigningSnapshot(null,observed));
  for (const [wire,decimal] of [['0','0'],['1','0.000000000000000001'],['-1','-0.000000000000000001'],
    ['100000000000000000','0.1'],['9007199254740993000000000000000000','9007199254740993']]) {
    assert.equal(legacyDecimalFromWire(wire),decimal);
  }
  for (const invalid of ['0.1','1e18','01','-0',1,'',((1n<<256n)*1000000000000000000n).toString()]) assert.throws(()=>legacyDecimalFromWire(invalid));
  console.log('Protocol boundary: H-1 expiry context, H activation, stale/missing/mixed readiness and exact LegacyDec decoding passed.');
}

async function testRpcLifecycle() {
  class Socket {
    static OPEN = 1;
    constructor() { this.readyState = 0; this.sent = []; this.closes = 0; }
    send(data) { this.sent.push(JSON.parse(data)); }
    close() { this.closes++; this.readyState = 3; }
    open() { this.readyState = 1; this.onopen(); }
    reply(value) { this.onmessage({data:JSON.stringify(value)}); }
  }
  const original = globalThis.WebSocket;
  globalThis.WebSocket = Socket;
  try {
    const rpc = new OwnedRpcClient('ws://fixture');
    const first = rpc.execute({jsonrpc:'2.0',id:1,method:'status'});
    const second = rpc.execute({jsonrpc:'2.0',id:2,method:'status'});
    assert.equal(rpc.socket.sent.length,0); rpc.socket.open(); assert.equal(rpc.socket.sent.length,2);
    rpc.socket.reply({jsonrpc:'2.0',id:2,result:'second'});
    rpc.socket.reply({jsonrpc:'2.0',id:1,result:'first'});
    assert.equal((await first).result,'first'); assert.equal((await second).result,'second');
    const rejected = rpc.execute({jsonrpc:'2.0',id:3,method:'status'});
    rpc.socket.reply({jsonrpc:'2.0',id:3,error:{code:-32603,message:'unavailable'}});
    await assert.rejects(rejected,/unavailable/);
    rpc.disconnect(); rpc.disconnect(); assert.equal(rpc.socket.closes,1);
    await assert.rejects(rpc.execute({jsonrpc:'2.0',id:4,method:'status'}),/closed/);

    const connecting = new OwnedRpcClient('ws://fixture');
    const pending = connecting.execute({jsonrpc:'2.0',id:1,method:'status'});
    connecting.disconnect(); await assert.rejects(pending,/closed/);
    connecting.socket.open(); assert.equal(connecting.socket.sent.length,0);
    assert.equal(connecting.socket.readyState,3);

    const stalled = new OwnedRpcClient('ws://fixture',{timeoutMs:25});
    await assert.rejects(stalled.execute({jsonrpc:'2.0',id:1,method:'status'}),/timed out/);
    assert.equal(stalled.closed,true); assert.equal(stalled.pending.size,0);
    for (const response of ['bad json',JSON.stringify({jsonrpc:'2.0',id:1}), 'x'.repeat(2*1048576+1)]) {
      const bad = new OwnedRpcClient('ws://fixture');
      const operation = bad.execute({jsonrpc:'2.0',id:1,method:'status'});
      bad.socket.onmessage({data:response}); await assert.rejects(operation);
      assert.equal(bad.closed,true);
    }
    const bounded = new OwnedRpcClient('ws://fixture');
    const requests = Array.from({length:64},(_,id)=>bounded.execute({jsonrpc:'2.0',id,method:'status'}));
    const settling = Promise.allSettled(requests);
    await assert.rejects(bounded.execute({jsonrpc:'2.0',id:65,method:'status'}),/excessive/);
    await assert.rejects(bounded.execute({jsonrpc:'2.0',id:0,method:'status'}),/Invalid/);
    bounded.disconnect(); assert.ok((await settling).every(result=>result.status==='rejected'));
  } finally { globalThis.WebSocket = original; }
  console.log('Owned RPC: response correlation, errors, pending limits, size limits, timeout, close-before-open and no resend passed.');
}

function wireStatus(network = CHAIN.ID) {
  return {node_info:{protocol_version:{p2p:'8',block:'11',app:'0'},id:'00'.repeat(20),listen_addr:'127.0.0.1:0',network,
    version:'0.38.19',channels:'',moniker:'fixture',other:{tx_index:'on',rpc_address:''}},
    sync_info:{latest_block_hash:'00'.repeat(32),latest_app_hash:'00'.repeat(32),latest_block_height:'3353000',
      latest_block_time:'2026-10-29T00:00:00Z',earliest_block_hash:'00'.repeat(32),earliest_app_hash:'00'.repeat(32),
      earliest_block_height:'1',earliest_block_time:'2026-01-01T00:00:00Z',catching_up:false},
    validator_info:{address:'00'.repeat(20),pub_key:{type:'tendermint/PubKeyEd25519',value:Buffer.alloc(32).toString('base64')},voting_power:'0'}};
}

async function testOwnedConnection() {
  globalThis.window = new EventTarget(); window.location = {hostname:'127.0.0.1'};
  globalThis.WebSocket = WebSocket;
  const server = new WebSocket.Server({host:'127.0.0.1',port:0});
  await new Promise(resolve=>server.once('listening',resolve));
  let network = CHAIN.ID, holdStatus = false, intercepted = deferred(), connections = 0;
  const methods = [];
  server.on('connection', socket=>{ connections++; socket.on('message', raw=>{
    const request = JSON.parse(String(raw)); methods.push(request.method);
    if (request.method==='status' && holdStatus) { intercepted.resolve(); return; }
    let result;
    if (request.method==='status') result = wireStatus(network);
    else if (request.method==='abci_query') result = {response:{code:0,log:'',info:'',index:'0',
      height:request.params.height,key:'',value:Buffer.from(QueryVaultResponse.encode(QueryVaultResponse.fromPartial({
        ownerId:'1-1',address:'vault-fixture',provisioned:true,
      })).finish()).toString('base64'),codespace:''}};
    else throw new Error(`Unexpected RPC ${request.method}`);
    socket.send(JSON.stringify({jsonrpc:'2.0',id:request.id,result}));
  }); });
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',{prefix:'structs'});
  const state = {wallet,signingClient:null,currentBlockHeight:3353000};
  const manager = new SigningClientManager(state);
  manager.wsUrl = `ws://127.0.0.1:${server.address().port}`;
  try {
    await manager.connect();
    assert.ok(state.signingClient);
    assert.equal(await manager.isAlive(),true);
    const vault = await manager.chainQuery.readSnapshot(rpc=>new QueryClientImpl(rpc).Vault({ownerId:'1-1'}));
    assert.equal(vault.data.address,'vault-fixture');
    assert.equal(vault.height,'3353000');
    assert.equal((await manager.getSigningContext(metadata(),['inventory'])).protocol,CHAIN.PROTOCOL);
    // A cached signer chain ID must not bypass the independent status request.
    assert.equal(await state.signingClient.getChainId(),CHAIN.ID);
    network = 'wrong';
    await assert.rejects(manager.getSigningContext(metadata(),['inventory']),/identity/);
    await assert.rejects(manager.connect(),/identity/);
    assert.equal(state.signingClient,null); assert.equal(manager.chainQuery,null);
    network = CHAIN.ID;
    holdStatus = true;
    const abandoned = manager.connect();
    await intercepted.promise;
    const oldQuery = manager.chainQuery;
    holdStatus = false;
    const replacement = manager.connect();
    await assert.rejects(abandoned,/closed|superseded/);
    await replacement;
    assert.equal(oldQuery.closed,true); assert.ok(state.signingClient);
    intercepted = deferred(); holdStatus = true;
    const interrupted = manager.connect();
    await intercepted.promise;
    manager.stopForLogout();
    await assert.rejects(interrupted,/closed|superseded/);
    assert.equal(manager.queue.suspended,true);
    assert.equal(state.signingClient,null); assert.equal(manager.chainQuery,null);
    assert.ok(methods.every(method=>['status','abci_query'].includes(method)));
    const closedAt = connections;
    await new Promise(resolve=>setTimeout(resolve,250));
    assert.equal(server.clients.size,0);
    assert.equal(connections,closedAt,'disconnect must not reconnect after the old wrapper\'s 100ms delay');
  } finally {
    manager.disconnect();
    for (const socket of server.clients) socket.terminate();
    await new Promise(resolve=>server.close(resolve));
  }
  console.log('Real WebSocket/Comet/SigningStargate lifecycle passed: shared queries, wrong-chain refusal, overlapping connect and disconnect during initialization. No transaction broadcast.');
}

async function testLiveQuery() {
  if (!process.env.STRUCTS_QUERY_RPC) return;
  const rpc = new OwnedRpcClient(process.env.STRUCTS_QUERY_RPC);
  const query = new ChainQueryClient(await Comet38Client.create(rpc));
  try {
    const result = await query.readSnapshot(async snapshot=>{
      const structs = new QueryClientImpl(snapshot);
      const player = await structs.Player({id:'1-1'});
      assert.equal(player.Player?.id,'1-1');
      const address = await structs.Address({address:player.Player.primaryAddress});
      const balance = await new BankQueryClient(snapshot).Balance({address:player.Player.primaryAddress,denom:'ualpha'});
      assert.equal(address.address,player.Player.primaryAddress);
      assert.equal(typeof address.permissions,'string');
      assert.match(balance.balance.amount,/^(0|[1-9][0-9]*)$/);
      return {playerId:player.Player.id,queries:3};
    });
    console.log('Read-only local node snapshot passed:',JSON.stringify(result));
  } finally { query.disconnect(); }
}

async function main() { testProtocol(); await testSnapshots(); await testRpcLifecycle(); await testOwnedConnection(); await testLiveQuery(); }
main().then(()=>{process.exitCode=0;},error=>{console.error(error);process.exitCode=1;});
