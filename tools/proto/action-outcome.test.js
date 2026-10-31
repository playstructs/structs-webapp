import assert from 'node:assert/strict';
import {ActionBarLock} from '../../src/js/models/ActionBarLock';
import {GameState} from '../../src/js/models/GameState';
import {TX_STATUS} from '../../src/js/models/SigningTransaction';
import {DeployOffcanvas} from '../../src/js/view_models/components/offcanvas/DeployOffcanvas';
import {MapTileSelectionComponent} from '../../src/js/view_models/components/map/MapTileSelectionComponent';
import {TargetSelectedIndicator} from '../../src/js/view_models/components/map/TargetSelectedIndicator';
import {HUDViewModel} from '../../src/js/view_models/HUDViewModel';
import {MenuPage} from '../../src/js/framework/MenuPage';
import {EVENTS} from '../../src/js/constants/Events';

globalThis.window = new EventTarget();
HUDViewModel.refreshActionBar = () => {};

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return {promise, resolve};
}

async function actionLockOutcomes() {
  const lock = new ActionBarLock();
  let successCalls = 0;
  const succeeded = () => { successCalls++; };
  assert.equal(await lock.run(() => { throw new Error('Enqueue refused'); }, succeeded), false);
  assert.equal(lock.isLocked(), false);
  assert.equal(await lock.run(async () => ({status: TX_STATUS.DROPPED}), succeeded), false);
  assert.equal(successCalls, 0, 'A definitive failure cannot invoke the success UI');

  const uncertain = deferred();
  const waiting = lock.run(() => uncertain.promise, succeeded);
  assert.equal(lock.isLocked(), true);
  lock.clearFromNotification();
  assert.equal(lock.isLocked(), true, 'An unrelated notification cannot settle this action');
  uncertain.resolve({status: TX_STATUS.SUCCEEDED});
  assert.equal(await waiting, true);
  assert.equal(lock.isLocked(), false);
  assert.equal(successCalls, 1);

  const old = deferred();
  const first = lock.run(() => old.promise, succeeded);
  lock.clear();
  const current = lock.lock();
  old.resolve({status: TX_STATUS.DROPPED});
  assert.equal(await first, false);
  assert.equal(lock.isLocked(), true, 'A late failure cannot clear a newer operation');
  assert.equal(current.aborted, false);
  lock.clear();
}

async function refusedAndRejectedBuild() {
  const handlers = {};
  globalThis.document = {getElementById: () => ({addEventListener: (name, callback) => { handlers[name] = callback; }})};
  let closed = 0;
  MenuPage.sui = {offcanvas: {close: () => { closed++; }}};
  const state = {
    pendingBuilds: new Map(),
    keyPlayers: {player: {id: '1-1'}},
    alphaBaseMap: {mapId: 'alpha-base'},
  };
  for (const method of ['getPendingBuildKey', 'addPendingBuild', 'getPendingBuild', 'removePendingBuild']) {
    state[method] = GameState.prototype[method];
  }
  const offcanvas = Object.assign(Object.create(DeployOffcanvas.prototype), {
    gameState: state,
    handledLinkIds: new Set(),
    structManager: {getDeploymentBlocker: () => null},
    signingClientManager: {queueMsgStructBuildInitiate: () => { throw new Error('Unresolved send'); }},
    ambit: 'land',
    slot: 0,
  });
  const type = {type: 'Fixture', id: '1', category: 'planet', build_charge: 1};
  offcanvas.attachDeployHandler(type);
  handlers.mousedown();
  handlers.mouseup();
  assert.equal(closed, 0, 'A refused enqueue leaves the existing picker open');
  assert.equal(state.pendingBuilds.size, 0, 'No phantom build is created');

  const completion = deferred();
  offcanvas.signingClientManager.queueMsgStructBuildInitiate = () => completion.promise;
  let cleared = 0;
  window.addEventListener(EVENTS.CLEAR_STRUCT_TILE, () => { cleared++; });
  handlers.mousedown();
  handlers.mouseup();
  assert.equal(closed, 1);
  assert.equal(state.pendingBuilds.size, 1);
  completion.resolve({status: TX_STATUS.DROPPED});
  await completion.promise;
  await Promise.resolve();
  assert.equal(state.pendingBuilds.size, 0, 'A rejected queued build removes only its own pending marker');
  assert.equal(cleared, 1);
}

async function rejectedMove() {
  const lock = new ActionBarLock();
  lock.setActionSourceStruct({id: '5-1', type: '1', location_type: 'planet'});
  let focused = 0;
  const component = Object.assign(Object.create(MapTileSelectionComponent.prototype), {
    gameState: {actionBarLock: lock, structTypes: {getStructTypeById: () => ({move_charge: 1})}},
    signingClientManager: {queueMsgStructMove: async () => { throw new Error('Enqueue refused'); }},
    addFocusToSourceTile: () => { focused++; },
  });
  TargetSelectedIndicator.play = () => {};
  const tile = {getAttribute: name => ({'data-ambit': 'land', 'data-slot': '1'})[name]};
  await component.handleMoveTargetClick(tile);
  assert.equal(focused, 0, 'Failed movement cannot optimistically move selection');
  assert.equal(lock.isLocked(), false);
}

async function main() {
  await actionLockOutcomes();
  await refusedAndRejectedBuild();
  await rejectedMove();
  console.log('Action outcomes passed: refused enqueue, rejected build/move, pending unknown send, success and late-operation isolation.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
