import {DTest, DTestSuite} from "../framework/DTestFramework";
import {TaskManager} from "../managers/TaskManager";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TASK_TYPES} from "../constants/TaskTypes";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {PlanetRaid} from "../models/PlanetRaid";
import {RAID_STATUS} from "../constants/RaidStatus";
import {KeyPlayer} from "../models/KeyPlayer";
import {Player} from "../models/Player";
import {KeyPlayerOreListener} from "../grass_listeners/KeyPlayerOreListener";
import {EVENTS} from "../constants/Events";
import {TASK} from "../constants/TaskConstants";

/**
 * Covers the decisions TaskManager makes about ore work, which since structsd
 * v0.21.0 runs off a clock shared by every rig on the planet instead of one
 * held by each struct.
 *
 * spawn and terminate are replaced with recorders so no Web Worker is started;
 * what is under test is which structs get started and stopped, and on what
 * clock.
 */
export class TaskManagerOreTest extends DTestSuite {

  constructor() {
    super('TaskManagerOreTest');
  }

  /**
   * @param {string|null} raidStatus
   * @return {TaskManager}
   */
  static makeTaskManager(raidStatus = null) {
    const planetRaidInfo = new PlanetRaid();
    planetRaidInfo.status = raidStatus;

    const gameState = {
      currentBlockHeight: 1000,
      keyPlayers: {
        [PLAYER_TYPES.PLAYER]: {id: '1-1', planetRaidInfo: planetRaidInfo}
      }
    };

    const taskManager = new TaskManager(gameState, {}, {}, new TaskStateFactory());

    taskManager.spawned = [];
    taskManager.terminated = [];

    taskManager.spawn = function (task_state) {
      this.spawned.push(task_state);
      return task_state.getPID();
    }.bind(taskManager);

    taskManager.terminate = function (pid) {
      this.terminated.push(pid);
      delete this.processes[pid];
    }.bind(taskManager);

    return taskManager;
  }

  /**
   * Stands in for a live process without starting a worker.
   *
   * @param {TaskManager} taskManager
   * @param {string} pid
   * @param {string} taskType
   * @param {number} block_start
   */
  static givenRunningTask(taskManager, pid, taskType, block_start) {
    taskManager.processes[pid] = {
      state: {task_type: taskType, block_start: block_start}
    };
    taskManager.running_queue.push(pid);
  }

  /**
   * @param {string} object_id
   * @param {string} category
   * @param {number} block_start
   * @return {object}
   */
  static makeWork(object_id, category, block_start) {
    return {
      object_id: object_id,
      player_id: '1-1',
      target_id: object_id,
      category: category,
      block_start: block_start,
      difficulty_target: 8
    };
  }

  /**
   * Replaces the work request with one that never answers, counting how often
   * it is asked.
   *
   * @param {TaskManager} taskManager
   */
  static givenPendingWorkRequests(taskManager) {
    taskManager.work_requests = 0;
    taskManager.fetchWork = function () {
      this.work_requests++;
      return new Promise(() => {});
    }.bind(taskManager);
  }

  /**
   * Delivers a GRASS ore update for a key player holding the given ore, and
   * collects what the listener dispatched instead of broadcasting it to every
   * task manager the other tests have left listening.
   *
   * @param {string} playerType
   * @param {number|string|null} oreBefore
   * @param {number} oreAfter
   * @return {string[]} the dispatched event types
   */
  static whenOreChanges(playerType, oreBefore, oreAfter) {
    const keyPlayer = new KeyPlayer(playerType, false);
    keyPlayer.id = '1-1';
    keyPlayer.player = new Player();
    keyPlayer.player.ore = oreBefore;

    const listener = new KeyPlayerOreListener({keyPlayers: {[playerType]: keyPlayer}}, {}, playerType);

    const dispatched = [];
    const dispatchEvent = window.dispatchEvent;
    window.dispatchEvent = (event) => {
      dispatched.push(event.type);
      return true;
    };

    try {
      listener.handler({category: 'ore', subject: 'structs.grid.player.1-1.1-1', value: oreAfter});
    } finally {
      window.dispatchEvent = dispatchEvent;
    }

    return dispatched;
  }

  // The clock on the event leads the work record, which the indexer may not
  // have caught up on yet, and every eligible rig hashes against that one clock.
  grassClockFansOutToEveryStructTest = new DTest('grassClockFansOutToEveryStructTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    const work = [
      TaskManagerOreTest.makeWork('5-1', TASK_TYPES.MINE, 900),
      TaskManagerOreTest.makeWork('5-2', TASK_TYPES.MINE, 900),
      TaskManagerOreTest.makeWork('5-3', TASK_TYPES.REFINE, 900)
    ];

    taskManager.syncOreTasks(TASK_TYPES.MINE, work, 1234);

    this.assertEquals(taskManager.spawned.length, 2);
    this.assertArrayEquals(
      taskManager.spawned.map((task) => task.object_id),
      ['5-1', '5-2']
    );
    this.assertEquals(taskManager.spawned[0].block_start, 1234);
    this.assertEquals(taskManager.spawned[1].block_start, 1234);

    // The block is what the chain checks the hash against.
    this.assertEquals(taskManager.spawned[0].prefix, '5-1MINE1234NONCE');
  });

  // A reconcile has no event to work from, so the work record carries the clock.
  workRecordClockIsUsedWithoutGrassTest = new DTest('workRecordClockIsUsedWithoutGrassTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    const work = [TaskManagerOreTest.makeWork('5-1', TASK_TYPES.MINE, 900)];

    taskManager.syncOreTasks(TASK_TYPES.MINE, work);

    this.assertEquals(taskManager.spawned.length, 1);
    this.assertEquals(taskManager.spawned[0].block_start, 900);
  });

  // Respawning restarts the worker and discards every nonce already searched.
  unchangedClockLeavesProgressAloneTest = new DTest('unchangedClockLeavesProgressAloneTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenRunningTask(taskManager, '5-1', TASK_TYPES.MINE, 900);

    const work = [TaskManagerOreTest.makeWork('5-1', TASK_TYPES.MINE, 900)];

    taskManager.syncOreTasks(TASK_TYPES.MINE, work, 900);

    this.assertEquals(taskManager.spawned.length, 0);
    this.assertEquals(taskManager.terminated.length, 0);
  });

  movedClockRestartsTheTaskTest = new DTest('movedClockRestartsTheTaskTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenRunningTask(taskManager, '5-1', TASK_TYPES.MINE, 900);

    const work = [TaskManagerOreTest.makeWork('5-1', TASK_TYPES.MINE, 900)];

    taskManager.syncOreTasks(TASK_TYPES.MINE, work, 1500);

    this.assertEquals(taskManager.spawned.length, 1);
    this.assertEquals(taskManager.spawned[0].block_start, 1500);
  });

  // The chain no longer reports a per-struct stop, so falling off the work list
  // is the only signal that a rig went offline or ran out of ore.
  structMissingFromWorkIsStoppedTest = new DTest('structMissingFromWorkIsStoppedTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenRunningTask(taskManager, '5-1', TASK_TYPES.MINE, 900);
    TaskManagerOreTest.givenRunningTask(taskManager, '5-2', TASK_TYPES.MINE, 900);

    const work = [TaskManagerOreTest.makeWork('5-1', TASK_TYPES.MINE, 900)];

    taskManager.syncOreTasks(TASK_TYPES.MINE, work, 900);

    this.assertArrayEquals(taskManager.terminated, ['5-2']);
    this.assertEquals(taskManager.spawned.length, 0);
  });

  // Build work shares the process table but is driven by a per-struct clock.
  otherTaskTypesAreLeftAloneTest = new DTest('otherTaskTypesAreLeftAloneTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenRunningTask(taskManager, '5-9', TASK_TYPES.BUILD, 900);
    TaskManagerOreTest.givenRunningTask(taskManager, '5-8', TASK_TYPES.REFINE, 900);

    taskManager.syncOreTasks(TASK_TYPES.MINE, [], 1234);

    this.assertEquals(taskManager.terminated.length, 0);
  });

  // The chain refuses ore work while a raider sits on the planet.
  raidStopsOreWorkTest = new DTest('raidStopsOreWorkTest', function(params) {
    const taskManager = TaskManagerOreTest.makeTaskManager(params.raidStatus);
    TaskManagerOreTest.givenRunningTask(taskManager, '5-1', TASK_TYPES.MINE, 900);

    const work = [TaskManagerOreTest.makeWork('5-1', TASK_TYPES.MINE, 900)];

    taskManager.syncOreTasks(TASK_TYPES.MINE, work, 1234);

    this.assertArrayEquals(taskManager.terminated, ['5-1']);
    this.assertEquals(taskManager.spawned.length, 0);
  }, function() {
    return [
      {raidStatus: RAID_STATUS.INITIATED},
      {raidStatus: RAID_STATUS.ONGOING},
      {raidStatus: RAID_STATUS.SHIELDS_VULNERABLE}
    ];
  });

  // view.work has no block_start > 0 filter, and there is nothing to hash
  // against without a clock.
  zeroClockIsNotStartedTest = new DTest('zeroClockIsNotStartedTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    const work = [TaskManagerOreTest.makeWork('5-1', TASK_TYPES.MINE, 0)];

    taskManager.syncOreTasks(TASK_TYPES.MINE, work);

    this.assertEquals(taskManager.spawned.length, 0);
  });

  // The regression this suite exists for. structsd shifts the ore clocks the
  // moment a raid ends, in the same block as the raid result and ahead of it, so
  // the clock lands while the victory dialogue is still up and local raid state
  // still reads active. The chain announces a clock once, so dropping it here
  // stranded mining until the player reloaded.
  clockArrivingDuringRaidSurvivesToReconcileTest = new DTest('clockArrivingDuringRaidSurvivesToReconcileTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager(RAID_STATUS.SHIELDS_VULNERABLE);
    TaskManagerOreTest.givenRunningTask(taskManager, '5-1', TASK_TYPES.MINE, 900);

    // The raid-end clock arrives while the raid is still playing out on screen.
    taskManager.refreshOreTasks(TASK_TYPES.MINE, 1500);

    this.assertArrayEquals(taskManager.terminated, ['5-1']);
    this.assertEquals(taskManager.spawned.length, 0);

    // raidEndActions clears the raid, then reconciles.
    taskManager.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planetRaidInfo = new PlanetRaid();

    const work = [TaskManagerOreTest.makeWork('5-1', TASK_TYPES.MINE, 900)];
    taskManager.syncOreTasks(TASK_TYPES.MINE, work, taskManager.consumeHeldOreClock(TASK_TYPES.MINE));

    // Mining restarts, and on the shifted clock rather than the stale one the
    // indexer may still be serving.
    this.assertEquals(taskManager.spawned.length, 1);
    this.assertEquals(taskManager.spawned[0].block_start, 1500);
  });

  // A held clock is only good once; a later reconcile must fall back to the
  // work record rather than replay a stale block.
  heldClockIsConsumedOnceTest = new DTest('heldClockIsConsumedOnceTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager(RAID_STATUS.ONGOING);

    taskManager.refreshOreTasks(TASK_TYPES.MINE, 1500);

    this.assertEquals(taskManager.consumeHeldOreClock(TASK_TYPES.MINE), 1500);
    this.assertEquals(taskManager.consumeHeldOreClock(TASK_TYPES.MINE), null);
  });

  // A clock the chain actually cleared must not be resurrected later.
  clearedClockIsNotHeldTest = new DTest('clearedClockIsNotHeldTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager(RAID_STATUS.ONGOING);

    taskManager.refreshOreTasks(TASK_TYPES.MINE, 1500);
    taskManager.refreshOreTasks(TASK_TYPES.MINE, 0);

    this.assertEquals(taskManager.consumeHeldOreClock(TASK_TYPES.MINE), null);
  });

  // Each ore clock is held separately.
  heldClocksDoNotCrossTypesTest = new DTest('heldClocksDoNotCrossTypesTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager(RAID_STATUS.ONGOING);

    taskManager.refreshOreTasks(TASK_TYPES.MINE, 1500);
    taskManager.refreshOreTasks(TASK_TYPES.REFINE, 1600);

    this.assertEquals(taskManager.consumeHeldOreClock(TASK_TYPES.REFINE), 1600);
    this.assertEquals(taskManager.consumeHeldOreClock(TASK_TYPES.MINE), 1500);
  });

  // The regression: the refinery ran the player out of ore and stopped, and an
  // extractor finishing later left the refine clock alone, so nothing started
  // it again until the page was reloaded.
  oreArrivingWithNoneStoredAwaitsRefineWorkTest = new DTest('oreArrivingWithNoneStoredAwaitsRefineWorkTest', function(params) {
    const dispatched = TaskManagerOreTest.whenOreChanges(params.playerType, params.oreBefore, params.oreAfter);

    this.assertEquals(dispatched.includes(EVENTS.TASK_CMD_AWAIT_REFINE_WORK), params.awaitsRefineWork);
  }, function() {
    return [
      {playerType: PLAYER_TYPES.PLAYER, oreBefore: 0, oreAfter: 1, awaitsRefineWork: true},
      {playerType: PLAYER_TYPES.PLAYER, oreBefore: '0', oreAfter: 1, awaitsRefineWork: true},
      // A refinery that already had ore to work on is still running.
      {playerType: PLAYER_TYPES.PLAYER, oreBefore: 1, oreAfter: 2, awaitsRefineWork: false},
      {playerType: PLAYER_TYPES.PLAYER, oreBefore: 1, oreAfter: 0, awaitsRefineWork: false},
      // Only the player's own refineries are worked on here.
      {playerType: PLAYER_TYPES.RAID_ENEMY, oreBefore: 0, oreAfter: 1, awaitsRefineWork: false}
    ];
  });

  // The ore update can land before the indexer lists the refinery, so the
  // lookup carries on over the next few blocks, and no further.
  refineWorkLookupRetriesOnLaterBlocksTest = new DTest('refineWorkLookupRetriesOnLaterBlocksTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenPendingWorkRequests(taskManager);

    taskManager.awaitRefineWork();
    this.assertEquals(taskManager.work_requests, 1);

    for (let block = 0; block < TASK.REFINE_WORK_LOOKUP_BLOCKS + 3; block++) {
      taskManager.lookForAwaitedRefineWork();
    }

    this.assertEquals(taskManager.work_requests, TASK.REFINE_WORK_LOOKUP_BLOCKS);
  });

  refineWorkLookupStopsOnceRefiningTest = new DTest('refineWorkLookupStopsOnceRefiningTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenPendingWorkRequests(taskManager);

    taskManager.awaitRefineWork();
    TaskManagerOreTest.givenRunningTask(taskManager, '5-3', TASK_TYPES.REFINE, 900);
    taskManager.lookForAwaitedRefineWork();
    taskManager.lookForAwaitedRefineWork();

    this.assertEquals(taskManager.work_requests, 1);
    this.assertEquals(taskManager.refine_work_lookups_remaining, 0);
  });

  // Mining left the refine clock where it was, so the work record's copy is
  // current. The mine clock moved in the same block and the work record may
  // still carry the old one, so mining is left to its own clock event.
  awaitedRefineWorkStartsOnlyTheRefineryTest = new DTest('awaitedRefineWorkStartsOnlyTheRefineryTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenRunningTask(taskManager, '5-1', TASK_TYPES.MINE, 1500);

    const work = [
      TaskManagerOreTest.makeWork('5-1', TASK_TYPES.MINE, 1400),
      TaskManagerOreTest.makeWork('5-3', TASK_TYPES.REFINE, 900)
    ];

    taskManager.startAwaitedRefineWork(work);

    this.assertEquals(taskManager.spawned.length, 1);
    this.assertEquals(taskManager.spawned[0].object_id, '5-3');
    this.assertEquals(taskManager.spawned[0].task_type, TASK_TYPES.REFINE);
    this.assertEquals(taskManager.spawned[0].block_start, 900);
    this.assertEquals(taskManager.terminated.length, 0);
  });

  awaitedRefineWorkNotYetListedStartsNothingTest = new DTest('awaitedRefineWorkNotYetListedStartsNothingTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();

    taskManager.startAwaitedRefineWork([TaskManagerOreTest.makeWork('5-1', TASK_TYPES.MINE, 1400)]);

    this.assertEquals(taskManager.spawned.length, 0);
  });

  // A refine clock event can start the refinery while the lookup is out, on a
  // clock that leads the work record the lookup comes back with.
  awaitedRefineWorkLeavesAStartedRefineryAloneTest = new DTest('awaitedRefineWorkLeavesAStartedRefineryAloneTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenRunningTask(taskManager, '5-3', TASK_TYPES.REFINE, 1600);

    taskManager.startAwaitedRefineWork([TaskManagerOreTest.makeWork('5-3', TASK_TYPES.REFINE, 900)]);

    this.assertEquals(taskManager.spawned.length, 0);
    this.assertEquals(taskManager.terminated.length, 0);
  });
}
