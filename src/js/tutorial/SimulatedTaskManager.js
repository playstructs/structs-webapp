import {TaskManager} from "../managers/TaskManager";
import {workUint64} from "../util/WorkDifficulty";

const SIMULATED_PROOF_METHODS = {
  RAID: 'queueMsgPlanetRaidComplete',
  BUILD: 'queueMsgStructBuildComplete',
  MINE: 'queueMsgStructOreMinerComplete',
  REFINE: 'queueMsgStructOreRefineryComplete',
};

/**
 * Task manager for the tutorial. Work comes from the TutorialWorld rather than
 * an indexed snapshot, so there is no snapshot to validate, no saved signing
 * evidence to reconcile, and GRASS ore clocks are applied directly.
 */
export class SimulatedTaskManager extends TaskManager {

  /**
   * The tutorial spawns exactly the task it describes.
   *
   * @param {TaskState} task_state
   */
  handleSpawnCommand(task_state) {
    this.spawn(task_state);
  }

  /**
   * @return {boolean}
   */
  hasSavedSubmission() {
    return false;
  }

  /**
   * Hands a finished proof straight to the simulated signing client.
   *
   * @param {TaskState} state
   */
  submitCompletedProof(state) {
    const method = SIMULATED_PROOF_METHODS[state.task_type];
    if (!method) return;
    this.signingClientManager[method](state.object_id, state.result_hash, state.result_nonce)
      .then(() => this.sweep(state.getPID()))
      .catch(error => console.debug('[SimulatedTaskManager] simulated proof unavailable:', error));
  }

  retryCompletedProofs() {
  }

  /**
   * Applies a GRASS ore clock to the simulated work.
   *
   * @param {string} taskType see ORE_TASK_TYPES
   * @param {number} block_start Zero when the clock has been cleared.
   * @return {Promise<void>}
   */
  async refreshOreTasks(taskType, block_start) {
    // A cleared clock stops the work outright, and cancels anything held
    // over from a raid since there is no longer a clock to go back to.
    if (block_start == null || workUint64(block_start) === 0n) {
      delete this.held_ore_clocks[taskType];
      this.terminateAllByType(taskType);
      return;
    }

    // The chain shifts the ore clocks forward the moment a raid ends, in the
    // same block as the raid result and ahead of it, so this can arrive
    // while the raid is still being played out on screen. Hold it rather
    // than drop it: the chain announces a given clock once, and the next
    // reconcile is what puts it back to work.
    if (this.isPlayerPlanetRaided()) {
      this.held_ore_clocks[taskType] = block_start;
      this.terminateAllByType(taskType);
      return;
    }

    delete this.held_ore_clocks[taskType];

    try {
      const work = await this.fetchWork();
      this.syncOreTasks(taskType, work, block_start);
    } catch (error) {
      console.warn('[SimulatedTaskManager] could not refresh ore work:', error);
    }
  }

  /**
   * The GRASS clock leads the simulated work record.
   *
   * @param {Work} workTask
   * @param {number|null} block_start
   * @return {number|string|null}
   */
  taskBlockStart(workTask, block_start) {
    return block_start ?? workTask.block_start;
  }

  acceptWorkSnapshot() {
  }

  /**
   * @return {boolean}
   */
  isWorkCurrent() {
    return true;
  }

  requireObservedWork() {
  }
}
