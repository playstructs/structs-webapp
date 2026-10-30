import assert from 'node:assert/strict';
import {setTimeout as pause} from 'node:timers/promises';
import {toBech32} from '@cosmjs/encoding';
import {AlphaRefreshManager} from '../../src/js/managers/AlphaRefreshManager';
import {KeyPlayer} from '../../src/js/models/KeyPlayer';
import {AlphaChangeListener} from '../../src/js/grass_listeners/AlphaChangeListener';
import {PlayerAlphaListener} from '../../src/js/grass_listeners/PlayerAlphaListener';
import {ConsumeAlphaChangeListener} from '../../src/js/grass_listeners/ConsumeAlphaChangeListener';
import {AlphaOwnedComponent} from '../../src/js/view_models/components/AlphaOwnedComponent';
import {GrassManager} from '../../src/js/framework/GrassManager';
import {SigningTransactionSettledEvent} from '../../src/js/events/SigningTransactionSettledEvent';
import {playerFunds} from '../../src/js/util/PlayerFunds';
import {CHAIN} from '../../src/js/constants/ChainConstants';
import {EVENTS} from '../../src/js/constants/Events';
import {TX_STATUS} from '../../src/js/models/SigningTransaction';

const address=n=>toBech32('structs',new Uint8Array(20).fill(n));
const metadata=(height='3353000')=>{
  const protocol=BigInt(height)<3353000n?CHAIN.LEGACY_PROTOCOL:CHAIN.PROTOCOL;
  return {chain_id:CHAIN.ID,height,indexed_height:height,observed_tip:height,api_contract:CHAIN.API_CONTRACT,
    activation_height:CHAIN.UPGRADE_HEIGHT,cache_epoch:`${CHAIN.API_CONTRACT}:${protocol}`,protocol,observed_protocol:protocol,
    data_ready:true,transaction_ready:true,required_models:['inventory'],models:{inventory:{ready:true,height}},inventory_authority:'current-claims-v1'};
};
const player=(height='3353000',amount='2999999',id='1-1')=>({id,load:7,alpha:'99999',vault_address:address(1),spendable_alpha_p:amount,
  funds_meta:{height,ready:true,source:'indexed_base_account',provisioned:true,reason:null},snapshot_meta:metadata(height)});
let AuthManager;
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
async function until(check,label){for(let i=0;i<100;i++){if(check())return;await pause(5);}throw new Error(`Timed out: ${label}`);}
function environment(){globalThis.window=new EventTarget();globalThis.document=new EventTarget();document.visibilityState='visible';}
function state(){
  const key=new KeyPlayer('player',false);key.setId('1-1');key.setPlayer(player());
  return {persistenceEnabled:true,currentBlockHeight:3353000,signingAccount:{address:address(2)},thisGuild:{id:'0-1'},keyPlayers:{player:key}};
}
function notice(patch={}){return {subject:'structs.inventory.ualpha.0-9.1-1.retained-address',category:'received',chain_id:CHAIN.ID,
  owner_id:'1-1',owner_type:'player',amount:'9999999999999999999999999999',block_height_exact:'3353000',...patch};}
function session(options={}){
  environment();const game=state(),reads=[],control={read:async()=>player()};
  const api={getPlayer:async(id,opts)=>{assert.equal(id,game.keyPlayers.player.id);assert.equal(opts.timeoutMs,5000);
    reads.push({id,signal:opts.signal});return control.read();}};
  const manager=new AlphaRefreshManager(game,api,{coalesceMs:2,retryMs:20,maxRetryMs:40,pollMs:100000,...options});
  game.alphaRefresh=manager;
  return {game,key:game.keyPlayers.player,manager,control,reads,listener:new AlphaChangeListener(game)};
}

async function valuesAndCache(){
  environment();
  assert.equal(playerFunds(player()).alpha,'2');
  assert.equal(playerFunds(player('3353000','9007199254740993000001')).alpha,'9007199254740993');
  const unprovisioned=player();unprovisioned.funds_meta={...unprovisioned.funds_meta,provisioned:false,source:'chain_spendable'};
  assert.equal(playerFunds(unprovisioned).alpha,'2');
  const legacy=player('3352999');legacy.alpha='9007199254740993.999999';
  assert.equal(playerFunds(legacy).alpha,'9007199254740993');
  for(const mutate of [p=>p.spendable_alpha_p=null,p=>p.spendable_alpha_p=9007199254740992,p=>p.funds_meta.ready=false,
    p=>p.funds_meta.height='3352999',p=>p.funds_meta.provisioned=null,p=>p.vault_address=address(1).toUpperCase(),
    p=>p.snapshot_meta.chain_id='another-chain',p=>p.snapshot_meta.models.inventory.ready=false]){
    const bad=player();mutate(bad);assert.throws(()=>playerFunds(bad));
  }
  assert.throws(()=>playerFunds(legacy,3353000));
  const game=state(),key=game.keyPlayers.player;
  assert.equal(key.player.alpha,'2');
  assert.equal(key.setFunds(player('3353003','5000000')),true);
  assert.equal(key.player.snapshot_meta.height,'3353000','A balance read cannot certify old grid/profile fields');
  assert.equal(key.player.funds_snapshot_meta.height,'3353003');assert.equal(key.player.load,7);
  const laterProfile=player('3353002','9000000');laterProfile.load=11;
  assert.equal(key.setPlayer(laterProfile),true);assert.equal(key.player.load,11);assert.equal(key.player.alpha,'5');
  assert.equal(key.player.funds_meta.height,'3353003');assert.equal(key.player.snapshot_meta.height,'3353002');
  assert.equal(key.setPlayer(player('3353001','99000000')),false);assert.equal(key.player.alpha,'5');
  assert.equal(key.setFunds(player('3353003','6000000')),false,'Conflicting values at one immutable height are refused');
  assert.equal(key.setFunds(player('3353004','9000000','1-2')),false);
  const malformed=player('3353004');malformed.funds_meta.ready=false;
  assert.equal(key.setFunds(malformed),false);assert.equal(key.player.alpha,'5');
  const displayed=new AlphaOwnedComponent(game,'balance');assert.equal(displayed.getAlphaOwned(),'5');
  key.setFunds(player('3353005','9007199254740993000001'));assert.equal(displayed.getAlphaOwned(),'9P');
  key.setId('1-2');assert.equal(key.player,null);assert.equal(key.alphaSnapshot,null);assert.equal(displayed.getAlphaOwned(),'');

  key.setId('1-1');key.setPlayer(legacy);assert.equal(key.player.alpha,'9007199254740993');
  const unavailable=player();unavailable.funds_meta.ready=false;unavailable.snapshot_meta.transaction_ready=false;
  key.setPlayer(unavailable);assert.equal(key.player.alpha,null,'Known H clears incompatible legacy funds while indexing catches up');
  assert.equal(key.setFunds(legacy),false,'Late legacy data cannot restore expired funds');
  assert.equal(key.setFunds(player('3353000','0')),true);assert.equal(displayed.getAlphaOwned(),'0');
  key.player.alpha='999';assert.equal(key.setFunds(player('3353000','0')),true);assert.equal(key.player.alpha,'0');
  const noEvidence=new KeyPlayer('player',false);noEvidence.setId('1-1');noEvidence.setPlayer({id:'1-1',alpha:3});
  assert.equal(noEvidence.player.alpha,null,'A server response without snapshot evidence never initializes a real balance');
  const simulated=new KeyPlayer('player',false);simulated.setId('1-1');simulated.setPlayer({id:'1-1',alpha:3},null,{simulated:true});
  assert.equal(simulated.player.alpha,3,'Metadata-free tutorial state remains usable');
  for (const observed of [null,3353000]) {
    const cross=new KeyPlayer('player',false);cross.setId('1-1');
    const old=player('3352999');old.alpha='99';cross.setPlayer(old);
    cross.setPlayer(player('3353000','6000000'),observed);
    assert.equal(cross.player.alpha,'6','Expiring the old balance cannot erase the incoming post-H evidence');
    assert.equal(cross.alphaSnapshot.protocol,CHAIN.PROTOCOL);
  }
}

async function invalidationsAndCoalescing(){
  const s=session();try{
    s.manager.start();
    for(let i=0;i<100;i++)s.listener.handler(notice());
    new PlayerAlphaListener(s.game).handler({subject:'structs.grid.player.1-1.1-1',category:'alpha',value:'9999999999999'});
    new ConsumeAlphaChangeListener(s.game,'5-1').handler(notice({subject:'structs.inventory.ualpha.infused.0-1.1-1.address',category:'infused',counterparty:'5-1'}));
    await until(()=>s.reads.length===1&&!s.manager.session.running,'coalesced first read');
    assert.equal(s.key.player.alpha,'2','Retained receipt and legacy delta never change spendability');
    await pause(15);assert.equal(s.reads.length,1);
    for(const patch of [{owner_id:'1-2'},{owner_type:'guild'},{chain_id:'other'},
      {subject:'structs.inventory.ualpha.0-1.1-10.address'},{subject:'structs.inventory.foo.0-1.1-1.address'}])s.listener.handler(notice(patch));
    await pause(10);assert.equal(s.reads.length,1,'Unrelated owners/denominations do not fetch');
    for(const denom of ['ualpha','ualpha.infused','ualpha.defusing'])s.listener.handler(notice({subject:`structs.inventory.${denom}.noGuild.1-1.address`}));
    s.listener.handler({subject:'structs.grid.player.1-1',category:'player_consensus',invalidates:'infusion',notification_owner_type:'player',notification_owner_id:'1-1'});
    await until(()=>s.reads.length===2&&!s.manager.session.running,'whole-owner invalidation');
    s.listener.handler({subject:'structs.inventory.ualpha.0-1.1-1.address',category:'refined',amount:500});
    await until(()=>s.reads.length===3,'legacy producer invalidation');
  }finally{s.manager.stop();}

  const race=session();try{
    const first=deferred(),second=deferred();let count=0;
    race.control.read=()=>++count===1?first.promise:second.promise;race.manager.start();
    await until(()=>race.reads.length===1,'pending read');
    for(let i=0;i<100;i++)race.listener.handler(notice());
    first.resolve(player());await until(()=>race.reads.length===2,'one follow-up after in-flight burst');
    race.key.setFunds(player('3353003','7000000'));
    second.resolve(player('3353001','1000000'));await pause(10);
    assert.equal(race.key.player.alpha,'7','An older in-flight read cannot replace a newer completion');
    race.control.read=async()=>player('3353003','7000000');
    await until(()=>race.reads.length===3&&!race.manager.session.running,'older-response retry');
    assert.equal(race.key.player.alpha,'7');
  }finally{race.manager.stop();}
}

async function boundariesAndLifecycle(){
  const delayed=session();try{
    delayed.manager.start();await until(()=>delayed.reads.length===1&&!delayed.manager.session.running,'initial');
    delayed.listener.handler(notice({block_height_exact:'3353002'}));
    await until(()=>delayed.reads.length===2&&!delayed.manager.session.running,'lagging response');
    assert.equal(delayed.key.player.alpha,'2');
    delayed.control.read=async()=>player('3353002','1000000');
    await until(()=>delayed.key.player.alpha==='1','catch-up without new notification');
    delayed.control.read=async()=>player('3353003','0');
    window.dispatchEvent(new SigningTransactionSettledEvent('test',TX_STATUS.SUCCEEDED,address(2),
      {stage:'committed',code:0,chainId:CHAIN.ID,height:'3353003'},null));
    await until(()=>delayed.key.player.alpha==='0','committed source height refresh');
    const reads=delayed.reads.length;
    window.dispatchEvent(new SigningTransactionSettledEvent('test',TX_STATUS.SUCCEEDED,address(3),
      {stage:'committed',code:0,chainId:CHAIN.ID,height:'3353004'},null));
    await pause(10);assert.equal(delayed.reads.length,reads);
  }finally{delayed.manager.stop();}

  const activation=session();try{
    activation.game.currentBlockHeight=3352999;activation.key.setId('1-2');activation.key.setId('1-1');
    const old=player('3352999');old.alpha='99';activation.key.setPlayer(old);activation.control.read=async()=>old;
    activation.manager.start();await until(()=>activation.reads.length===1&&!activation.manager.session.running,'pre-H read');
    activation.game.currentBlockHeight=3353000;window.dispatchEvent(new Event(EVENTS.BLOCK_HEIGHT_CHANGED));
    assert.equal(activation.key.player.alpha,null);await until(()=>activation.reads.length===2&&!activation.manager.session.running,'legacy response after H');
    assert.equal(activation.key.player.alpha,null);
    activation.control.read=async()=>player();await until(()=>activation.key.player.alpha==='2','post-H snapshot');
  }finally{activation.manager.stop();}

  for(const kind of ['stop','account','owner','logout']){
    const s=session();const pending=deferred();s.control.read=()=>pending.promise;s.manager.start();
    await until(()=>s.reads.length===1,'cancellable in-flight read');
    if(kind==='stop')s.manager.stop();
    if(kind==='account')s.game.signingAccount={address:address(9)};
    if(kind==='owner')s.key.setId('1-2');
    if(kind==='logout')AuthManager.prototype.logout.call({gameState:s.game,signingClientManager:{stopForLogout(){}},guildAPI:{logout:()=>new Promise(()=>{})}});
    pending.resolve(player('3353001','7000000'));await pause(10);
    assert.notEqual(s.key.player?.alpha,'7');assert.equal(s.manager.session,null);
    assert.equal(s.reads[0].signal.aborted,true);const count=s.reads.length;
    window.dispatchEvent(new Event('focus'));await pause(10);assert.equal(s.reads.length,count);s.manager.stop();
  }

  const recovery=session({pollMs:30});try{
    recovery.manager.start();await until(()=>recovery.reads.length===1&&!recovery.manager.session.running,'poll initial');
    recovery.control.read=async()=>player('3353001','4000000');
    await until(()=>recovery.key.player.alpha==='4','missed notification periodic refresh');
    recovery.control.read=async()=>player('3353002','5000000');
    window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));
    await until(()=>recovery.key.player.alpha==='5','resume coalesced refresh');
    recovery.control.read=async()=>player('3353003','6000000');
    const grass=new GrassManager('fixture','structs.>',recovery.game);grass.running=true;
    grass.nc={status:async function*(){yield {type:'reconnecting'};yield {type:'reconnect'};}};
    await grass.observeStatus(grass.nc);await until(()=>recovery.key.player.alpha==='6','native reconnect invalidation');
  }finally{recovery.manager.stop();}

  const retry=session();try{
    retry.control.read=async()=>{throw new Error('unavailable fixture');};retry.manager.start();
    await until(()=>retry.reads.length===2,'bounded retry');
    retry.control.read=async()=>player('3353001','0');await until(()=>retry.key.player.alpha==='0','read recovery');
  }finally{retry.manager.stop();}
  const tutorial=session();tutorial.game.persistenceEnabled=false;tutorial.manager.start();await pause(10);assert.equal(tutorial.reads.length,0);

  const hidden=session({pollMs:20});try{
    hidden.manager.start();await until(()=>hidden.reads.length===1&&!hidden.manager.session.running,'visible initial');
    document.visibilityState='hidden';const count=hidden.reads.length;
    hidden.control.read=async()=>player('3353001','4000000');
    for(let i=0;i<100;i++)hidden.listener.handler(notice({block_height_exact:'3353001'}));
    await pause(55);assert.equal(hidden.reads.length,count,'Hidden tabs retain invalidation without polling the API');
    document.visibilityState='visible';document.dispatchEvent(new Event('visibilitychange'));
    await until(()=>hidden.key.player.alpha==='4','resume after hidden invalidations');
  }finally{hidden.manager.stop();}
}

async function main(){
  environment();({AuthManager}=await import('../../src/js/managers/AuthManager'));
  await valuesAndCache();await invalidationsAndCoalescing();await boundariesAndLifecycle();
  console.log('Shared Alpha refresh passed: exact vault/legacy values, monotonic per-field evidence, owner/session/H isolation, coalesced notifications, retained receipts, no deltas, index catch-up, committed outcomes, native reconnect/resume/poll recovery and cancellation. No chain broadcast.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
