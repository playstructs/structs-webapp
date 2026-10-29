import assert from 'node:assert/strict';
import {GuildAPI} from '../../src/js/api/GuildAPI';

async function main() {
  const api = new GuildAPI();
  const meta = {chain_id:'structstestnet-111',height:'3353000',data_ready:true,
    transfer_source:{ready:true,reason:null,required_height:'3353000'}};
  const row = {id:'9007199254740994',amount_p:'9007199254740993',block_height:'3353000',
    chain_id:'structstestnet-111',tx_index:7,msg_index:-1,event_index:8,time:'2026-10-29 22:38:04.286225+00'};
  const query = {chain_id:row.chain_id,block_height:row.block_height,tx_index:'7',
    block_time:'2026-10-29T22:38:04.286225999Z',address:'source',counterparty:'recipient',denom:'ualpha',amount_p:row.amount_p};
  let requested;
  let data=row;
  api.ajax.get=async url=>{requested=url;return {success:true,errors:[],data,meta};};
  const response=await api.getTransferSource('1-1',query);
  assert.equal(response.data.id,row.id);assert.equal(response.data.amount_p,row.amount_p);
  assert.equal(response.data.snapshot_meta,meta);assert.equal(response.meta.transfer_source.ready,true);
  const url=new URL(requested,'https://fixture.invalid');
  assert.equal(url.pathname,'/api/ledger/player/1-1/transfer-source');
  assert.deepEqual(Object.fromEntries(url.searchParams),query);
  assert.equal((await api.getTransaction(row.id)).snapshot_meta,meta);
  data=null;meta.transfer_source={ready:false,reason:'ambiguous',required_height:'3353000'};
  const missing=await api.getTransferSource('1-1',query);
  assert.equal(missing.data,null);assert.equal(missing.meta.transfer_source.reason,'ambiguous');
  data=[];
  const empty=await api.getTransactions('1-1',1);
  assert.equal(empty.length,0);assert.equal(empty.snapshot_meta,meta);
  data=[row];
  const history=await api.getTransactions('1-1',1);
  assert.equal(history[0].amount_p,row.amount_p);assert.equal(history[0].id,row.id);
  assert.equal(history[0].snapshot_meta,meta);assert.equal(history.snapshot_meta,meta);
  api.ajax.get=async()=>({success:false,errors:{authentication_error:'Login required'},data:null});
  await assert.rejects(()=>api.getTransferSource('1-1',query));
  console.log('Ledger API adapter passed: exact source values and timestamps, ready/ambiguous metadata, empty history and authentication failure preservation.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
