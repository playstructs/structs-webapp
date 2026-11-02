// Validate saved, DOM-visible reports from CombatTutorialController. This checks
// observed renderer completions; it does not generate events or drive the browser.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const captures=require('../proto/combat-v022.json');
const directory=process.argv[2];
if(!directory)throw new Error('Supply the directory of saved browser reports');
for(const index of [4,9,11,13]){
  const report=JSON.parse(fs.readFileSync(path.join(directory,`implementation-combat-render-case${index}-20261030.json`)));
  const detail=JSON.parse(captures.fixtures[index].event.attributes[0].value);
  assert.equal(report.status,'completed',report.name);
  assert.equal(report.started.length,report.completed.length,report.name);
  assert.ok(report.started.length>=7);
  for(let i=0;i<report.started.length;i++){
    const start=report.started[i],end=report.completed[i];
    assert.equal(start.id,end.id);assert.ok(start.names.includes(end.name));
    assert.equal(start.options.healthAfter,end.health);
    assert.ok(end.at>start.at,'Renderer completion must follow animation start');
  }
  assert.deepEqual(report.renderedHealth,report.finalHealth,'Final DOM health must agree with refreshed state');
  assert.equal(report.finalHealth['5-90004'],Number(detail.attackerHealthAfter));
  const destructions=report.started.filter(event=>event.names.some(name=>name.startsWith('DESTROY_')));
  assert.equal(new Set(destructions.map(event=>event.id)).size,destructions.length);
  if(index===4){
    assert.equal(report.hydrated,true,'The actual oversized frame must hydrate through the API');
    assert.equal(report.started.filter(event=>event.names.includes('ATTACK_PRIMARY_WEAPON')).length,6);
    assert.equal(destructions.length,2);
  } else {
    const counter=report.started.findIndex(event=>event.options.badge==='icon-defender-counter');
    assert.ok(counter>0);assert.equal(report.started[counter].options.healthAfter,1);
    const attackerDestroyed=report.started.findIndex(event=>event.id==='5-90004'&&event.names.includes('DESTROY_LAND'));
    const targetDestroyed=report.started.findIndex(event=>event.id===report.started[counter].id&&event.names.includes('DESTROY_LAND'));
    assert.ok(attackerDestroyed>counter&&targetDestroyed>attackerDestroyed);
    assert.ok(report.started.slice(attackerDestroyed+1,targetDestroyed).some(event=>event.id===report.started[counter].id&&event.options.healthAfter===0));
    if(index===11){
      const evade=report.started.findIndex(event=>event.names.includes('EVADE'));
      assert.ok(evade>=0&&evade<counter);assert.equal(report.completed[evade].health,1);
    }
  }
  console.log(`${report.name}: ${report.completed.length} real completions; final DOM health verified`);
}
