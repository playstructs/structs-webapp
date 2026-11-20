import {DTest, DTestSuite} from "../framework/DTestFramework";
import {TaskManager} from "../managers/TaskManager";
import {SigningQueueManager} from "../managers/SigningQueueManager";
import {SpectatorActionError} from "../errors/SpectatorActionError";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

/**
 * Spectators watch other players' raids with the real TaskManager and signing queue, so those
 * classes must refuse, in spectator mode, to do any work or sign anything on the watched players'
 * behalf. A spectator's "player" slot holds the attacker being watched.
 */
export class SpectatorGuardTest extends DTestSuite {

  constructor() {
    super('SpectatorGuardTest');
  }

  /**
   * @param {boolean} spectatorMode
   * @return {object}
   */
  static gameState(spectatorMode) {
    return {
      spectatorMode,
      currentBlockHeight: 1000,
      keyPlayers: {[PLAYER_TYPES.PLAYER]: {id: '1-1'}},
    };
  }

  /**
   * @param {string} pid
   * @return {object} a task state that fails the test if spawn() goes past its guard
   */
  static taskState(pid) {
    return {
      getPID: () => pid,
      setBlockCheckpoint: () => {
        throw new Error('spawn() went past the spectator guard');
      },
    };
  }

  /**
   * @param {function(): *} fn
   * @return {Error|null}
   */
  static thrown(fn) {
    try {
      fn();
      return null;
    } catch (error) {
      return error;
    }
  }

  spectatorSpawnStartsNoProcessTest = new DTest('spectatorSpawnStartsNoProcessTest', function () {
    // Only spawn() is under test: run it against a bare manager, without the constructor's
    // window listeners and status timer.
    const manager = Object.create(TaskManager.prototype);
    manager.gameState = SpectatorGuardTest.gameState(true);
    manager.processes = {};
    manager.running_queue = [];
    manager.waiting_queue = [];

    const pid = manager.spawn(SpectatorGuardTest.taskState('RAID-9-1'));

    this.assertEquals(pid, 'RAID-9-1');
    this.assertEquals(Object.keys(manager.processes).length, 0);
    this.assertEquals(manager.running_queue.length + manager.waiting_queue.length, 0);
  });

  spectatorLooksUpNoWorkTest = new DTest('spectatorLooksUpNoWorkTest', function () {
    const manager = Object.create(TaskManager.prototype);
    manager.gameState = SpectatorGuardTest.gameState(true);
    manager.work_request = null;
    let asked = 0;
    manager.guildAPI = {
      getWorkByPlayerId: () => {
        asked++;
        return new Promise(() => {});
      },
    };

    const work = manager.fetchWork();

    this.assertEquals(asked, 0);
    this.assertEquals(work instanceof Promise, true);
  });

  spectatorQueueRefusesActionsTest = new DTest('spectatorQueueRefusesActionsTest', function () {
    const queue = new SigningQueueManager(SpectatorGuardTest.gameState(true), {registry: null, wsUrl: ''});

    const action = SpectatorGuardTest.thrown(() => queue.enqueueAction('/spectator.test.MsgAction', {}, 1));
    const immediate = SpectatorGuardTest.thrown(() => queue.enqueueImmediate('/spectator.test.MsgImmediate', {}));

    this.assertEquals(action instanceof SpectatorActionError, true);
    this.assertEquals(immediate instanceof SpectatorActionError, true);
    this.assertEquals(queue.hasQueuedTransactions(), false);
  });

  playerQueueIsNotRefusedAsSpectatorTest = new DTest('playerQueueIsNotRefusedAsSpectatorTest', function () {
    // Outside spectator mode the guard stays out of the way; whatever the queue does next for a
    // session with no signing account is not this guard's concern.
    const queue = new SigningQueueManager(SpectatorGuardTest.gameState(false), {registry: null, wsUrl: ''});

    const error = SpectatorGuardTest.thrown(() => queue.enqueueImmediate('/spectator.test.MsgImmediate', {}));

    this.assertEquals(error instanceof SpectatorActionError, false);
  });
}
