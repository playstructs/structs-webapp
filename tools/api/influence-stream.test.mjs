import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash, webcrypto} from 'node:crypto';
globalThis.crypto ??= webcrypto;
const source = await readFile(new URL('../../src/js/framework/InfluenceStream.js', import.meta.url), 'utf8');
const {InfluenceAssembler, InfluenceStore} = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
globalThis.fetch = () => { throw new Error('Influence must not fetch HTTP'); };
const subject = 'structs.influence.test.1.guild.0-1';
const base = {contract:'structs-influence-grass-v1',subject,frame_id:'9007199254740993',previous_frame_id:'0',mode:'replace',build_id:'1',height:'10',category:'influence_guild',context:{},data:{guild_id:'0-1',reset_roster:true,players:[{player_id:'1-1',guild_id:'0-1',exists:true,points:'300'}],sectors:[],history:{complete:false,samples:[]},large:'星🌌'.repeat(5000)}};
const parts = frame => {
 const body = Buffer.from(JSON.stringify(frame));
 const count = Math.ceil(body.length / 4096), sha256 = createHash('sha256').update(body).digest('hex');
 return Array.from({length:count},(_,i)=>({contract:base.contract,subject,category:'influence_part',frame_id:frame.frame_id,part_index:i,part_count:count,sha256,encoding:'base64',payload:body.subarray(i*4096,(i+1)*4096).toString('base64')}));
};
const assembler = new InfluenceAssembler(), store = new InfluenceStore();
const p = parts(base);
for (const part of p.slice(1).reverse()) assert.equal(await assembler.accept(part),null);
assert.equal(store.cursor(subject),'0'); // incomplete frames are never applied
const completed = await assembler.accept(p[0]);
assert.deepEqual(completed,base); assert.equal(store.apply(completed),true);
assert.equal(store.apply(completed),false); // duplicates safe above JS number precision
assert.equal(store.scopes.get(subject).players.get('1-1').points,'300');
assert.equal(store.scopes.get(subject).historyReady,false);
const history = {...base,frame_id:'9007199254740994',previous_frame_id:base.frame_id,mode:'patch',category:'influence_history',data:{history:{complete:true,samples:[{height:'9',entity:'0-1',sector:127,unique_delta:'1',claim_delta:'1',points_delta:'300'}]}}};
store.apply(history);
assert.equal(store.scopes.get(subject).data.guild_id,'0-1');
assert.equal(store.scopes.get(subject).historyReady,true);
assert.equal(store.scopes.get(subject).history.size,1);
const moved = {...history,frame_id:'9007199254740995',previous_frame_id:history.frame_id,category:'influence_guild',data:{guild_id:'0-1',players:[{player_id:'1-1',guild_id:'0-2',previous_guild_id:'0-1',exists:true,points:'300'}],history:{complete:true,samples:[]}}};
store.apply(moved);assert.equal(store.scopes.get(subject).players.size,0);
assert.throws(()=>store.apply({...moved,frame_id:'9007199254740997',previous_frame_id:'9007199254740996'}),/gap/);
const replacement = {...base,frame_id:'9007199254741000',previous_frame_id:'9007199254740999',build_id:'2',height:'8',data:{...base.data,history:{complete:false,samples:[]}}};
store.apply(replacement); assert.equal(store.scopes.get(subject).history.size,0);
assert.equal(store.apply(moved),false); // old-generation late packet
const corrupt = parts({...base,frame_id:'2',data:{small:true}})[0];corrupt.sha256='0'.repeat(64);
await assert.rejects(assembler.accept(corrupt),/digest/);
const conflicting = parts(base);
await assembler.accept(conflicting[0]);await assert.rejects(assembler.accept({...conflicting[1],sha256:'f'.repeat(64)}),/Conflicting/);
console.log('PASS: exact cursors, multipart ordering/digests, atomic application, duplicates/gaps, membership removal, history completion and generation replacement; zero HTTP calls');

// NATS is subscription-only; API bootstrap/resync is provided by the view.
const {InfluenceStream} = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
class Queue {
 constructor() { this.items=[]; this.wait=null; this.closed=false; }
 push(value) { this.items.push(value); this.wait?.(); this.wait=null; }
 unsubscribe() { this.closed=true; this.wait?.(); this.wait=null; }
 stop() { this.unsubscribe(); }
 async *[Symbol.asyncIterator]() { while (!this.closed) { if (this.items.length) yield this.items.shift(); else await new Promise(resolve=>this.wait=resolve); } }
}
const subscriptions = new Map(), status = new Queue();
let flushed=false, releaseInitial;
const connection = {
 subscribe(name) { assert.equal(name,subject); const q=new Queue(); subscriptions.set(name,q); return q; },
 status() { return status; },
 async flush() { flushed=true; },
 publish() { throw new Error('NATS clients cannot publish'); },
 request() { throw new Error('NATS clients cannot request'); }
};
const streamedStore=new InfluenceStore(), errors=[], loads=[];
const snapshot=(height='10')=>({build_id:'1',height,context:{},data:{guild_id:'0-1',sectors:[]},players:base.data.players,
 history:{opening:[],samples:[{height,points:'300'}]}});
const stream=new InfluenceStream(connection,subject,{
 store:streamedStore,onError:error=>errors.push(error),
 async loadSnapshot({subject:scope,reason}) {
  assert.equal(scope,subject);assert.equal(flushed,true);loads.push(reason);
  if(reason==='initial') await new Promise(resolve=>releaseInitial=resolve);
  return snapshot(reason==='initial'?'10':reason==='reconnect'?'15':'18');
 }
});
const emit=frame=>{for(const packet of parts(frame)) subscriptions.get(subject).push({json:()=>packet});};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const initial=stream.start();while(!releaseInitial)await tick();
// Old publisher backlog is already covered by the API snapshot. The next block
// can have an unseen predecessor within that baseline and must apply once.
emit(base);
const liveMoved={...moved,height:'11'};emit(liveMoved);
releaseInitial();await initial;
for(let i=0;i<20 && streamedStore.cursor(subject)!==moved.frame_id;i++)await tick();
assert.equal(streamedStore.cursor(subject),moved.frame_id);
assert.equal(streamedStore.scopes.get(subject).players.size,0);
assert.deepEqual(loads,['initial']);assert.deepEqual(errors,[]);
assert.deepEqual(streamedStore.scopes.get(subject).historyBase,snapshot().history);
const next={...liveMoved,frame_id:'9007199254740996',previous_frame_id:liveMoved.frame_id,height:'12'};emit(next);
for(let i=0;i<20 && streamedStore.cursor(subject)!==next.frame_id;i++)await tick();
assert.deepEqual(loads,['initial']); // healthy events trigger no API requests
status.push({type:'reconnect'});
for(let i=0;i<20 && streamedStore.scopes.get(subject).height!=='15';i++)await tick();
assert.deepEqual(loads,['initial','reconnect']);
emit({...next,height:'14',frame_id:'9007199254740999'});
const resumed={...next,height:'16',frame_id:'9007199254741000',previous_frame_id:'9007199254740999'};emit(resumed);
for(let i=0;i<20 && streamedStore.cursor(subject)!==resumed.frame_id;i++)await tick();
assert.equal(streamedStore.scopes.get(subject).height,'16');assert.equal(loads.length,2);
emit({...resumed,height:'18',frame_id:'9007199254741002',previous_frame_id:'9007199254741001'});
for(let i=0;i<20 && streamedStore.scopes.get(subject).height!=='18';i++)await tick();
assert.deepEqual(loads,['initial','reconnect','gap_or_invalid_frame']);assert.match(errors[0].message,/gap/);
emit({...replacement,frame_id:'9007199254741100',height:'8'});
for(let i=0;i<20 && streamedStore.scopes.get(subject).buildId!=='2';i++)await tick();
assert.equal(streamedStore.scopes.get(subject).buildId,'2');
emit({...resumed,height:'20',frame_id:'9007199254742000'});await tick();await stream.queue;
assert.equal(streamedStore.scopes.get(subject).buildId,'2');assert.equal(loads.length,3);
assert.throws(()=>streamedStore.seed(subject,snapshot('25')),/Stale/);
stream.stop();
console.log('PASS: read-only NATS, API bootstrap/reconnect/gap recovery, buffered-update handoff, stale generation rejection; no API calls for healthy live updates');
