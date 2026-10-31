import assert from 'node:assert/strict';
import captured from './combat-v022.json';

globalThis.window = new EventTarget();
globalThis.CustomEvent = class extends Event { constructor(name) { super(name); } };
const {StructListener} = require('../../src/js/grass_listeners/StructListener');
const {ANIMATION} = require('../../src/js/constants/AnimationConstants');

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

async function main() {
  assert.equal(captured.release, '96cea3a322c406b46ca1feb880dc4497ebd9353f');
  assert.equal(captured.fixtures.length, 14);
  for (const fixture of captured.fixtures) {
    const detail = freeze(JSON.parse(fixture.event.attributes.find(row => row.key === 'eventAttackDetail').value));
    const events = [], refreshes = new Set();
    const canonical = freeze({attackerHealth: detail.attackerHealthAfter,
      targetHealth: detail.eventAttackShotDetail.at(-1).targetHealthAfter});
    const gameState = {keyPlayers: {player: {planetMapType: 'home'}}, home: {mapId: 'home-map'}, canonical,
      actionBarLock: {getCurrentAction: () => null}, animationEventQueue: {enqueue: event => events.push(event)}};
    const manager = {refreshStruct: async id => {refreshes.add(id);}, getStructById: () => canonical};
    const listener = new StructListener(gameState, {}, manager);
    listener.animationEventFactory = {
      makeAttackAnimationEvent: (...args) => ({kind: 'attack', id: args[0], health: args[3], options: {}}),
      makeReceiveDamageAnimationEvent: (...args) => ({kind: 'receive', id: args[0], before: Number(args[7]), after: Number(args[8]), evaded: args[9], options: {}}),
      makeDestroyAnimationEvent: (...args) => ({kind: 'destroy', id: args[0], options: {}}),
    };
    listener.handleStructAttack('fixture', {category: 'struct_attack', subject: 'fixture', detail});
    await Promise.resolve();
    for (const shot of detail.eventAttackShotDetail) {
      if (!shot.targetCountered) continue;
      const counterIndex = events.findIndex(event => event.kind === 'attack' && event.id === shot.targetStructId
        && event.options.badge === ANIMATION.BADGES.COUNTER_ATTACK);
      assert.ok(counterIndex >= 0, `${fixture.name}: a reported counter must play even if the target later dies`);
      const counterHealth = Number(shot.targetHealthBefore) - (shot.blocked || shot.evaded || shot.evadedByPlanetaryDefenses ? 0 : Number(shot.damage));
      assert.equal(Number(events[counterIndex].health), counterHealth, `${fixture.name}: counter uses pre-rebound health`);
      if (shot.targetDestroyed) {
        const destruction = events.findIndex(event => event.kind === 'destroy' && event.id === shot.targetStructId);
        assert.ok(destruction > counterIndex, `${fixture.name}: destruction follows the target counter`);
        const rebound = events.findIndex((event, index) => index > counterIndex && event.kind === 'receive'
          && event.id === shot.targetStructId && event.after === Number(shot.targetHealthAfter));
        assert.ok(rebound > counterIndex && rebound < destruction, `${fixture.name}: final damage follows the counter`);
        assert.equal(events[rebound].before, counterHealth);
      }
    }
    for (const event of events.filter(event => event.kind === 'receive' && event.evaded)) {
      assert.equal(event.after, event.before, `${fixture.name}: evasion must not apply later rebound damage`);
    }
    const destroyed = events.filter(event => event.kind === 'destroy').map(event => event.id);
    assert.equal(new Set(destroyed).size, destroyed.length, `${fixture.name}: destruction is enqueued once`);
    if (detail.attackerHealthAfter === '0') assert.ok(destroyed.includes(detail.attackerStructId));
    for (const shot of detail.eventAttackShotDetail) {
      assert.ok(refreshes.has(shot.targetStructId), `${fixture.name}: refresh the target even when it evades`);
      for (const counter of shot.eventAttackDefenderCounterDetail) assert.ok(refreshes.has(counter.counterByStructId));
      if (shot.targetDestroyed) assert.ok(destroyed.includes(shot.targetStructId));
      if (shot.blockerDestroyed) assert.ok(destroyed.includes(shot.blockedByStructId));
    }
    assert.equal(gameState.canonical, canonical, 'Animation replay cannot replace indexed state');
    assert.ok(refreshes.has(detail.attackerStructId));
  }
  console.log('Combat: 14 captured release scenarios preserve counters, evasion, observed health, rebound ordering and one destruction per struct.');
}
main().then(()=>{process.exitCode=0;},error=>{console.error(error);process.exitCode=1;});
