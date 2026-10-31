import assert from 'node:assert/strict';
import captured from './combat-v022.json';
import {resolvePlanetActivityNotification as resolve} from '../../src/js/util/PlanetActivityNotification';

async function main() {
  let reads=0,pending=null;
  const state={signingAccount:{address:'fixture'},keyPlayers:{player:{id:'1-2',getPlanetId:()=> '2-1'}},
    isSessionCurrent:()=>true,guildAPI:{getPlanetActivityEvent:async(planet,seq,time)=>{
      reads++;assert.equal(planet,'2-1');assert.equal(seq,'0');assert.equal(time,'2026-10-30T12:34:56.123456+00:00');
      return pending;
    }}};
  const key={subject:'structs.planet.2-1.1-2',player_id:'1-2',planet_id:'2-1',seq:0,time:'2026-10-30T12:34:56.123456+00:00',category:'struct_attack'};
  for(const fixture of captured.fixtures) {
    const detail=JSON.parse(fixture.event.attributes[0].value);
    pending={...key,seq:'0',detail,block_height:'3353001'};
    for(const stub of [true,'true']) {
      const message=Object.freeze({...key,stub});
      const result=await resolve(message,state);
      assert.deepEqual(result.detail,detail,fixture.name);assert.equal(result.stub,undefined);
      assert.equal(result.subject,key.subject);assert.equal(result.block_height,'3353001');
    }
    const full={...key,detail};const before=reads;
    assert.equal(await resolve(full,state),full);assert.equal(reads,before);
  }
  const stub={...key,stub:true},row=pending;
  for(const change of [{seq:'1'},{planet_id:'2-2'},{time:'2026-10-30T12:34:56.123457+00:00'},
    {category:'struct_move'},{detail:null},{block_height:'0'}]) {
    pending={...row,...change};await assert.rejects(resolve(stub,state),/does not match/);
  }
  pending=null;await assert.rejects(resolve(stub,state),/does not match/);
  const before=reads;
  assert.equal(await resolve({...stub,subject:'structs.planet.2-2.1-2',planet_id:'2-2'},state),null);
  assert.equal(reads,before,'unrelated planets do not issue API reads');
  await assert.rejects(resolve({...stub,seq:'1;DROP'},state),/Invalid/);
  let release;pending=new Promise(r=>{release=r;});const delayed=resolve(stub,state);
  state.signingAccount=null;release(row);assert.equal(await delayed,null,'logout discards a late detail response');
  state.signingAccount={address:'fixture'};
  pending=new Promise(r=>{release=r;});const moved=resolve(stub,state);
  state.keyPlayers.player.getPlanetId=()=> '2-2';release(row);assert.equal(await moved,null,'planet changes discard old replay');
  console.log('Planet activity: all 14 release payloads hydrate exactly, including >8 KB combat; keys and late-session/map guards pass.');
}
main().then(()=>{process.exitCode=0;},error=>{console.error(error);process.exitCode=1;});
