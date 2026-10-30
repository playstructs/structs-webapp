import assert from 'node:assert/strict';
import {GameState} from '../../src/js/models/GameState';
import {Player} from '../../src/js/models/Player';
import {ActionBarComponent} from '../../src/js/view_models/components/hud/ActionBarComponent';
import {PLAYER_TYPES} from '../../src/js/constants/PlayerTypes';

const saved = new Map();
globalThis.sessionStorage = {getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
globalThis.localStorage = {getItem:()=>null,setItem:()=>{throw new Error('Tutorial must not persist game state');}};
globalThis.window = new EventTarget();
globalThis.document = new EventTarget();
const {TutorialWorld, TUTORIAL_IDS} = require('../../src/js/tutorial/TutorialWorld');
const {TutorialMode} = require('../../src/js/tutorial/TutorialMode');

for (const energy of [
  {load:25,structs_load:0,capacity:0,connection_capacity:0},
  {load:0,structs_load:100,capacity:50,connection_capacity:0},
  {load:0,structs_load:0,capacity:0,connection_capacity:0},
]) {
  TutorialMode.rememberPlayerEnergy(energy);
  const world = new TutorialWorld(), state = new GameState();
  state.persistenceEnabled = false;
  world.attach(state, {handler(){}});
  world.loadPlayerIntoGameState();
  const keyPlayer = state.keyPlayers.player;
  const actionBar = new ActionBarComponent(state,null,null,null,null,null,PLAYER_TYPES.PLAYER,'left','fixture');
  const tank = world.structs[TUTORIAL_IDS.TANK_A];
  const tankType = world.getStructTypeById(tank.type);
  const realPlayer = Object.assign(new Player(), energy);
  assert.equal(realPlayer.isOverloaded(),energy.load + energy.structs_load > energy.capacity + energy.connection_capacity);
  for (const field of TutorialMode.PLAYER_ENERGY_FIELDS) assert.equal(keyPlayer.player[field],energy[field],'Existing HUD figures stay unchanged');
  keyPlayer.setOptimisticLastActionBlockHeight(world.blockHeight);
  assert.equal(actionBar.isActionAvailable(tank,tankType.defend_change_charge),false,'Deploy still drains simulated charge');
  for (let block=0; block<12; block++) world.nextBlock();
  assert.equal(keyPlayer.chargeLevel,5,'Simulated blocks recharge the battery');
  assert.equal(actionBar.isActionAvailable(tank,tankType.defend_change_charge),true,'An overloaded real account must not block training');
  assert.equal(actionBar.isActionAvailable(tank,tankType.primary_weapon_charge),true);
  keyPlayer.setPlayer(world.getPlayer(TUTORIAL_IDS.PLAYER),null,{simulated:true});
  assert.equal(actionBar.isActionAvailable(tank,tankType.defend_change_charge),true,'Simulated API copies retain the power policy');
  state.actionBarLock.lock();
  assert.equal(actionBar.isActionAvailable(tank,tankType.defend_change_charge),false,'Power policy must not bypass an action lock');
  state.actionBarLock.clear();
  keyPlayer.player = realPlayer;
  assert.equal(actionBar.isActionAvailable(tank,tankType.defend_change_charge),!realPlayer.isOverloaded(),'Normal player power checks remain enforced');
}
console.log('Tutorial keeps displayed power, restores charge and permits simulated combat for overloaded accounts without weakening real power or lock checks.');
