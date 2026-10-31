import assert from 'node:assert/strict';
import {toBech32} from '@cosmjs/encoding';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {SigningStargateClient, defaultRegistryTypes} from '@cosmjs/stargate';
import {BaseAccount} from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import {QueryAccountResponse} from 'cosmjs-types/cosmos/auth/v1beta1/query';
import {QuerySpendableBalanceByDenomRequest, QuerySpendableBalanceByDenomResponse} from 'cosmjs-types/cosmos/bank/v1beta1/query';
import {QueryParamsResponse} from 'cosmjs-types/cosmos/staking/v1beta1/query';
import {SimulateRequest, SimulateResponse} from 'cosmjs-types/cosmos/tx/v1beta1/service';
import {TxBody, TxRaw} from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import * as Query from '../../src/js/ts/structs.structs/types/structs/structs/query';
import {MsgPlayerSend, MsgVaultSend} from '../../src/js/ts/structs.structs/types/structs/structs/tx';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import {SigningSubmission} from '../../src/js/managers/SigningSubmission';
import {SigningTransaction, TX_STATUS} from '../../src/js/models/SigningTransaction';
import {submissionBytes} from '../../src/js/util/SignedSubmission';
import {availableAlpha} from '../../src/js/util/AvailableAlpha';
import {transferLimit} from '../../src/js/util/TransferLimit';
import {playerFunds} from '../../src/js/util/PlayerFunds';
import {transferSourceQuery} from '../../src/js/util/TransferCompletion';
import {reactorCommit} from '../../src/js/util/ReactorCompletion';
import {generatorCommit} from '../../src/js/util/GeneratorCompletion';
import {readGeneratorSnapshot} from '../../src/js/managers/GeneratorSnapshot';
import {objectType, planetStatus, techPowerGeneration} from '../../src/js/ts/structs.structs/types/structs/structs/keys';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {TEST_MNEMONIC} from './helpers';

const address = n => toBech32('structs', new Uint8Array(20).fill(n));
const vault = address(1);
const retained = [address(2), address(3)].sort();
const validator = toBech32('structsvaloper', new Uint8Array(20).fill(8));
const height = '3353010';
let signer, registry, offline;

function fixture(kind = 'alpha_transfer') {
  const meta = {chain_id:CHAIN.ID, height, indexed_height:height, observed_tip:height,
    activation_height:CHAIN.UPGRADE_HEIGHT, api_contract:CHAIN.API_CONTRACT,
    cache_epoch:`${CHAIN.API_CONTRACT}:${CHAIN.PROTOCOL}`, protocol:CHAIN.PROTOCOL,
    observed_protocol:CHAIN.PROTOCOL, data_ready:true, transaction_ready:true,
    inventory_authority:'current-claims-v1', required_models:['inventory'],
    models:{inventory:{height,ready:true}}};
  const player = {id:'1-1', vault_address:vault, snapshot_meta:meta, spendable_alpha_p:'2000000',
    funds_meta:{ready:true,height,provisioned:true}, retained_alpha_p:'50000000', available_alpha_p:'52000000',
    retained_funds_meta:{ready:true,height,source_limit:16},
    retained_sources:retained.map(a => ({address:a,spendable_alpha_p:'25000000'}))};
  const state = {player, permissions:'48', gas:100000n, signed:0, simulated:0,
    balances:new Map([[vault,'2000000'], ...retained.map(a => [a,'25000000'])]),
    reassigned:new Set(), reads:[], failure:null};
  const request = async (service, method, bytes) => {
    state.reads.push([service,method]);
    if (state.failure === method) throw new Error('Native evidence unavailable');
    if (service === 'cosmos.auth.v1beta1.Query') {
      return QueryAccountResponse.encode({account:{typeUrl:'/cosmos.auth.v1beta1.BaseAccount',
        value:BaseAccount.encode(BaseAccount.fromPartial({address:signer.address,accountNumber:1n,sequence:7n})).finish()}}).finish();
    }
    if (service === 'structs.structs.Query') {
      if (method === 'Address') {
        const {address:a} = Query.QueryGetAddressRequest.decode(bytes);
        return Query.QueryAddressResponse.encode({address:a,playerId:state.reassigned.has(a) ? '1-9' : '1-1',
          permissions:state.permissions,proofNonce:'0'}).finish();
      }
      if (method === 'Player') return Query.QueryGetPlayerResponse.encode(Query.QueryGetPlayerResponse.fromPartial({
        Player:{id:'1-1',guildId:'0-1',primaryAddress:retained[0]}})).finish();
      if (method === 'Vault') {
        const {ownerId} = Query.QueryVaultRequest.decode(bytes);
        return Query.QueryVaultResponse.encode({ownerId,address:ownerId === '1-1' ? vault : address(4),provisioned:true}).finish();
      }
      if (method === 'Guild') return Query.QueryGetGuildResponse.encode(Query.QueryGetGuildResponse.fromPartial({Guild:{id:'0-1',primaryReactorId:'3-1'}})).finish();
      if (method === 'Reactor') return Query.QueryGetReactorResponse.encode(Query.QueryGetReactorResponse.fromPartial({Reactor:{id:'3-1',validator}})).finish();
      if (method === 'Struct') {
        return Query.QueryGetStructResponse.encode(Query.QueryGetStructResponse.fromPartial({
          Struct:{id:'5-1', owner:'1-1', type:'20', locationId:'2-1', locationType:objectType.planet},
          structAttributes:{isOnline:true, isDestroyed:false}
        })).finish();
      }
      if (method === 'StructType') {
        return Query.QueryGetStructTypeResponse.encode(Query.QueryGetStructTypeResponse.fromPartial({
          StructType:{id:'20', powerGeneration:techPowerGeneration.smallGenerator, generatingRate:'2'}
        })).finish();
      }
      if (method === 'Planet') {
        return Query.QueryGetPlanetResponse.encode(Query.QueryGetPlanetResponse.fromPartial({
          Planet:{id:'2-1', status:planetStatus.active}
        })).finish();
      }
    }
    if (service === 'cosmos.bank.v1beta1.Query') {
      const {address:a} = QuerySpendableBalanceByDenomRequest.decode(bytes);
      return QuerySpendableBalanceByDenomResponse.encode({balance:{denom:'ualpha',amount:state.balances.get(a) ?? '0'}}).finish();
    }
    if (service === 'cosmos.staking.v1beta1.Query' && method === 'Params') {
      return QueryParamsResponse.encode(QueryParamsResponse.fromPartial({params:{bondDenom:'ualpha',maxEntries:7}})).finish();
    }
    if (service === 'cosmos.tx.v1beta1.Service') {
      state.simulated++;
      state.simulatedBytes = SimulateRequest.decode(bytes).txBytes;
      return SimulateResponse.encode(SimulateResponse.fromPartial({gasInfo:{gasUsed:state.gas}})).finish();
    }
    throw new Error(`Unexpected query ${service}/${method}`);
  };
  const manager = {registry,connectionEpoch:1,gameState:{signingAccount:signer,
    signingClient:{sign:async (...args) => { state.signed++; return offline.sign(...args); }},
    guildAPI:{getPlayer:async () => player}}};
  manager.chainQuery = {closed:false,status:async () => ({chainId:CHAIN.ID,height}),
    readSnapshot:async read => ({chainId:CHAIN.ID,height,observedHeight:height,
      data:await read({chainId:CHAIN.ID,height,request})})};
  const intents = {
    alpha_transfer:{recipientId:'1-2', recipientAddress:address(4)},
    reactor_change:{guildId:'0-1', reactorId:'3-1', direction:'infuse'},
    generator_fund:{structId:'5-1'},
  };
  const intent = {kind, version:1, ownerId:'1-1', amount:'10000000', ...intents[kind]};
  const tx = SigningTransaction.create({intent,isAction:false,retryLimit:0,accountAddress:signer.address,enqueuedAtBlock:Number(height)});
  return {state, tx, manager, submission:new SigningSubmission(manager)};
}

function committed(tx, submission) {
  tx.submission = submission;
  tx.status = TX_STATUS.SUCCEEDED;
  tx.response = {stage:'committed',code:0,chainId:CHAIN.ID,transactionHash:submission.hash,
    blockHash:'A'.repeat(64),txIndex:0,blockTime:'2026-10-31T00:00:00Z',height};
  if (tx.intent.kind === 'generator_fund') {
    tx.response.generatorReceipt = {ownerId:'1-1', source:vault,
      primaryAddress:retained[0], amount:tx.intent.amount};
  }
  return SigningTransaction.fromJSON(JSON.parse(JSON.stringify(tx.toJSON())));
}

async function main() {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    TEST_MNEMONIC, {prefix:'structs'});
  [signer] = await wallet.getAccounts();
  registry = new Registry([...defaultRegistryTypes,...msgTypes]);
  offline = await SigningStargateClient.offline(wallet,{registry});

  const display = fixture().state.player;
  assert.equal(availableAlpha(display),52000000n);
  assert.equal(playerFunds(display).alpha,'52');
  assert.equal(transferLimit(display,'1-1'),52);
  assert.throws(() => availableAlpha({...display,retained_alpha_p:'1'}),/total/);
  assert.throws(() => availableAlpha({...display,retained_sources:[...display.retained_sources,display.retained_sources[0]]}),/source/);
  assert.equal(availableAlpha({...display,retained_funds_meta:{ready:false},available_alpha_p:'2000000'}),2000000n);

  for (const kind of ['alpha_transfer','reactor_change','generator_fund']) {
    const f = fixture(kind);
    const signed = await f.submission.prepare(f.tx);
    const body = TxBody.decode(TxRaw.decode(submissionBytes(signed)).bodyBytes);
    assert.equal(body.messages.length,2);
    const collection = MsgPlayerSend.decode(body.messages[0].value);
    assert.equal(collection.creator,signer.address);
    assert.equal(collection.fromAddress,retained[0]);
    assert.equal(collection.toAddress,vault);
    assert.deepEqual(collection.amount,[{denom:'ualpha',amount:'8000000'}], 'only the vault shortfall is collected');
    assert.equal(body.timeoutHeight,BigInt(height)+60n);
    assert.deepEqual(f.state.simulatedBytes,submissionBytes(signed),'the whole signed group is simulated');
    assert.equal(f.state.simulated,1);
    const restored = committed(f.tx,signed);
    const verify = {alpha_transfer:transferSourceQuery, reactor_change:reactorCommit,
      generator_fund:generatorCommit}[kind];
    verify(restored);
    const context = restored.submission[{alpha_transfer:'transfer', reactor_change:'reactor',
      generator_fund:'generator'}[kind]];
    context.funding.sources[0].amount = '9000000';
    assert.throws(() => verify(restored),/collection/);

    const enough = fixture(kind);
    enough.state.balances.set(vault,'10000000');
    if (kind !== 'alpha_transfer') enough.state.permissions = '32';
    const vaultOnly = await enough.submission.prepare(enough.tx);
    assert.equal(TxBody.decode(TxRaw.decode(submissionBytes(vaultOnly)).bodyBytes).messages.length,1);
    assert.equal(enough.state.reads.filter(([,method]) => method === 'Address').length,1,'vault funds avoid retained reads');

    for (const problem of ['reassigned','locked','permission','unavailable','bad_snapshot']) {
      const bad = fixture(kind);
      if (problem === 'reassigned') retained.forEach(a => bad.state.reassigned.add(a));
      if (problem === 'locked') retained.forEach(a => bad.state.balances.set(a,'0'));
      if (problem === 'permission') bad.state.permissions = '32';
      if (problem === 'unavailable') bad.state.failure = 'SpendableBalanceByDenom';
      if (problem === 'bad_snapshot') bad.state.player.retained_funds_meta.height = '3353009';
      await assert.rejects(() => bad.submission.prepare(bad.tx),undefined,problem);
      assert.equal(bad.state.signed,0,`${problem} must fail before signing`);
    }
  }
  const generator = fixture('generator_fund');
  const indexedGenerator = {struct_id:'5-1', source_address:vault,
    snapshot_meta:generator.state.player.snapshot_meta, positions_ready:true,
    fuel_p:'0', power_p:'0', source_exists:false, source_fuel_p:null, source_power_p:null,
    source_ratio_p:null, source_commission:null, source_generator_disabled:null,
    source_recorded_owner_id:null};
  const preview = () => generator.manager.chainQuery.readSnapshot(rpc =>
    readGeneratorSnapshot(rpc, indexedGenerator, '1-1', '5-1', signer.address, generator.state.player));
  assert.equal((await preview()).data.maxAlpha, '52', 'Consume Alpha includes eligible retained funds');
  generator.state.permissions = '32';
  assert.equal((await preview()).data.maxAlpha, '2', 'An infusion-only key cannot collect retained funds');
  generator.state.permissions = '48';
  retained.forEach(a => generator.state.reassigned.add(a));
  assert.equal((await preview()).data.maxAlpha, '2', 'Reassigned funds do not increase generator capacity');
  const multiple = fixture();
  multiple.state.balances.set(retained[0],'3000000');
  const signed = await multiple.submission.prepare(multiple.tx);
  assert.deepEqual(signed.transfer.funding.sources, [
    {address:retained[0],amount:'3000000'}, {address:retained[1],amount:'5000000'}]);
  const body = TxBody.decode(TxRaw.decode(submissionBytes(signed)).bodyBytes);
  assert.equal(MsgVaultSend.decode(body.messages[2].value).recipientOwnerId,'1-2');
  transferSourceQuery(committed(multiple.tx,signed));
  const literal = fixture();
  literal.tx.intent = {...literal.tx.intent,recipientId:null};
  const literalSigned = await literal.submission.prepare(literal.tx);
  const literalBody = TxBody.decode(TxRaw.decode(submissionBytes(literalSigned)).bodyBytes);
  assert.equal(MsgPlayerSend.decode(literalBody.messages[1].value).toAddress,address(4));
  transferSourceQuery(committed(literal.tx,literalSigned));

  const maximum = fixture();
  maximum.tx.intent = {...maximum.tx.intent,amount:'18000000'};
  maximum.state.player.retained_sources = Array.from({length:16}, (_,i) => ({address:address(i+10),spendable_alpha_p:'1000000'}));
  maximum.state.player.retained_alpha_p = '16000000';
  maximum.state.player.available_alpha_p = '18000000';
  for (const row of maximum.state.player.retained_sources) maximum.state.balances.set(row.address,'1000000');
  const maximumSigned = await maximum.submission.prepare(maximum.tx);
  assert.equal(TxBody.decode(TxRaw.decode(submissionBytes(maximumSigned)).bodyBytes).messages.length,17);
  transferSourceQuery(committed(maximum.tx,maximumSigned));
  maximum.state.player.retained_sources.push({address:address(40),spendable_alpha_p:'1000000'});
  await assert.rejects(() => maximum.submission.prepare(maximum.tx),/coverage/);
  const gas = fixture();
  gas.state.gas = 20000001n;
  await assert.rejects(() => gas.submission.prepare(gas.tx),/gas limit/);
  console.log('Retained funding passed: existing balance/limits, vault first, exact shortfall, native authority/spendability, atomic signed groups, simulation cap and completion after reload. No broadcast.');
}

main().then(()=>{process.exitCode=0;},error=>{console.error(error);process.exitCode=1;});
