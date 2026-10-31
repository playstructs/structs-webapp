import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Registry, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {defaultRegistryTypes, SigningStargateClient} from '@cosmjs/stargate';
import {TxRaw, TxBody} from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import {msgTypes} from '../../src/js/ts/structs.structs/registry';
import schemas from '../../src/js/ts/structs.structs/message-schemas.json';
import legacy from './legacy-wire.json';
import {normalizeMessagePayload, messagePayloadToWire} from '../../src/js/util/MessagePayload';
import {SigningTransaction} from '../../src/js/models/SigningTransaction';
import {SigningClientManager} from '../../src/js/managers/SigningClientManager';
import {SigningQueueManager} from '../../src/js/managers/SigningQueueManager';
import {TEST_MNEMONIC} from './helpers';

async function main() {
  const registry = new Registry([...defaultRegistryTypes, ...msgTypes]);
  const rankType = '/structs.structs.MsgPlayerUpdateGuildRank';
  const max = '18446744073709551615';
  let checked = 0;
  for (const value of ['0','9007199254740991','9007199254740992','9007199254740993',max]) {
    const payload = normalizeMessagePayload(rankType,{playerId:'1-1',guildRank:value});
    const codec = registry.lookupType(rankType);
    const partial = codec.fromPartial(payload);
    assert.equal(codec.decode(codec.encode(partial).finish()).guildRank,value);
    assert.equal(codec.fromJSON(codec.toJSON(partial)).guildRank,value);
    checked++;
  }
  for (const invalid of [9007199254740992, 1.5, NaN, Infinity, '18446744073709551616','-1','01','1e3','',1n]) {
    assert.throws(()=>normalizeMessagePayload(rankType,{guildRank:invalid})); checked++;
  }
  assert.equal(normalizeMessagePayload(rankType,{guildRank:123}).guildRank,'123');
  assert.throws(()=>normalizeMessagePayload('/structs.structs.MsgReactorCancelDefusion',{creationHeight:max}));
  assert.equal(normalizeMessagePayload('/structs.structs.MsgReactorCancelDefusion',{creationHeight:'-9223372036854775808'}).creationHeight,'-9223372036854775808');
  assert.throws(()=>normalizeMessagePayload(rankType,{guild_rank:'1'}));
  assert.throws(()=>normalizeMessagePayload('/structs.structs.Unknown',{}));
  const feeType = '/structs.structs.MsgGuildUpdateBankConvertInFee';
  assert.equal(messagePayloadToWire(feeType,{bankConvertInFee:'0.1'}).bankConvertInFee,'100000000000000000');
  assert.equal(messagePayloadToWire(feeType,{bankConvertInFee:'0.000000000000000001'}).bankConvertInFee,'1');
  for (const value of [0.1,'1e-3','0.1234567890123456789']) assert.throws(()=>messagePayloadToWire(feeType,{bankConvertInFee:value}));
  for (const typeUrl of Object.keys(schemas).filter(name=>name.startsWith('/structs.structs.Msg'))) {
    assert.ok(registry.lookupType(typeUrl),`missing registration ${typeUrl}`);
  }
  for (const fixture of legacy.fixtures) {
    const type = registry.lookupType(fixture.typeUrl);
    const value = type.fromPartial(messagePayloadToWire(fixture.typeUrl,fixture.payload));
    assert.equal(Buffer.from(type.encode(value).finish()).toString('base64'),fixture.wire,fixture.typeUrl);
  }

  const memory = new Map();
  globalThis.localStorage = {getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
  globalThis.window = new EventTarget();
  const state = {signingAccount:{address:'creator-fixture'},currentBlockHeight:3353000};
  const queue = new SigningQueueManager(state,{registry,wsUrl:'ws://fixture'});
  const id = queue.enqueueImmediate(rankType,{playerId:'1-1',guildRank:max});
  const saved = JSON.parse(memory.get(queue.getStorageKey()));
  assert.equal(saved.immediateQueue[0].message.payload.guildRank,max);
  const loaded = new SigningQueueManager(state,{registry,wsUrl:'ws://fixture'});
  loaded.loadPersistedState();
  const restored = loaded.getTransaction(id);
  assert.equal(registry.decode({...restored.toCosmosMsg(registry),value:registry.encode(restored.toCosmosMsg(registry))}).guildRank,max);
  assert.throws(()=>queue.enqueueImmediate(rankType,{guildRank:9007199254740992}));
  const unsafe = SigningTransaction.fromJSON({...saved.immediateQueue[0],message:{typeUrl:rankType,payload:{guildRank:9007199254740992}}});
  assert.throws(()=>unsafe.toCosmosMsg(registry));

  // Drive real existing builders into the actual queue; no network or UI action.
  queue.whenSettled = async id => queue.getTransaction(id); // Settlement itself is outside this codec fixture.
  const manager = Object.create(SigningClientManager.prototype);
  manager.queue = queue;
  const amount = {denom:'ualpha',amount:max};
  await manager.queueMsgVaultSend('1-1','1-2',[amount]);
  await manager.queueMsgReactorInfuse('', 'validator',amount,{ownerId:'1-1'});
  await manager.queueMsgReactorDefuse('', 'validator',amount,{ownerId:'1-1'});
  await manager.queueMsgReactorDefuse('retained','validator',amount);
  await manager.queueMsgReactorBeginMigration('', 'validator','validator-dest',amount,{ownerId:'0-1'});
  await manager.queueMsgReactorCancelDefusion('', 'validator',amount,'9223372036854775807',{ownerId:'1-1'});
  await manager.queueMsgProviderCreate('4-1',{denom:'ualpha',amount:'2'},0,'0.1','0.2','1',max,'1','9007199254740993',{ownerId:'0-1'});
  await manager.queueMsgAgreementOpen('5-1','9007199254740993',max,{ownerId:'1-1'});
  await manager.queueMsgGuildCreate('3-1','endpoint','4-1');
  await manager.queueMsgGuildUpdateBankConvertInFee('0-1','0.000000000000000001');
  await manager.queueMsgGuildUpdateBankConvertOutFee('0-1','0.999999999999999999');
  const persisted = JSON.parse(memory.get(queue.getStorageKey())).immediateQueue;
  const messages = persisted.map(json=>SigningTransaction.fromJSON(json).toCosmosMsg(registry));
  const decoded = messages.map(message=>registry.decode({typeUrl:message.typeUrl,value:registry.encode(message)}));
  assert.equal(decoded[1].recipientOwnerId,'1-2');
  assert.equal(decoded[2].ownerId,'1-1');
  assert.equal(decoded[3].ownerId,'1-1');
  assert.equal(decoded[4].ownerId,'');
  assert.equal(decoded[4].delegatorAddress,'retained');
  assert.equal(decoded[5].ownerId,'0-1');
  assert.equal(decoded[6].creationHeight,'9223372036854775807');
  assert.equal(decoded[7].capacityMaximum,max);
  assert.equal(decoded[7].ownerId,'0-1');
  assert.equal(decoded[7].providerCancellationPenalty,'100000000000000000');
  assert.equal(persisted[7].message.payload.providerCancellationPenalty,'0.1');
  assert.equal(decoded[8].duration,'9007199254740993');
  assert.equal(decoded[8].ownerId,'1-1');
  for (const name of ['proof','nonce','founderPlayerId','address','proofPubKey','proofSignature']) assert.equal(decoded[9][name],'');

  // Public test mnemonic; sign offline only. Go independently decodes these
  // bytes with the pinned release types, including the actual signed TxBody.
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(TEST_MNEMONIC,{prefix:'structs'});
  const [account] = await wallet.getAccounts();
  for (const message of messages) message.value.creator = account.address;
  const client = await SigningStargateClient.offline(wallet,{registry});
  const signed = await client.sign(account.address,messages,{amount:[],gas:'20000000'},'v022-codec-fixture',{
    accountNumber:0,sequence:0,chainId:'structstestnet-111',
  });
  assert.equal(signed.signatures.length,1);
  assert.equal(signed.signatures[0].length,64);
  assert.equal(TxBody.decode(signed.bodyBytes).messages.length,messages.length);
  if (process.env.STRUCTS_WIRE_FIXTURE) fs.writeFileSync(process.env.STRUCTS_WIRE_FIXTURE,JSON.stringify({
    release:'96cea3a322c406b46ca1feb880dc4497ebd9353f',
    signed_tx:Buffer.from(TxRaw.encode(signed).finish()).toString('base64'),
    messages:messages.map(message=>{
      const expected = registry.lookupType(message.typeUrl).toJSON(message.value);
      for (const [name,field] of Object.entries(schemas[message.typeUrl])) {
        if (field.legacyDecimal && expected[name] !== undefined) {
          const atoms = BigInt(expected[name]);
          expected[name] = `${atoms / 1000000000000000000n}.${(atoms % 1000000000000000000n).toString().padStart(18,'0')}`;
        }
      }
      return {type_url:message.typeUrl,expected};
    }),
  },null,2)+'\n');
  client.disconnect();
  console.log(`Passed ${checked} unsigned integer vectors, signed/decimal boundaries, ${legacy.fixtures.length} legacy byte fixtures, queue persistence/reload, registry coverage, ${messages.length} builder wire cases and offline signing.`);
}
main().then(()=>{process.exitCode=0;},error=>{console.error(error);process.exitCode=1;});
