import {TASK} from "../constants/TaskConstants";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TaskState} from "./TaskState";
import {TaskWorkerChangedEvent} from "../events/TaskWorkerChangedEvent";
import {TaskStateChangedEvent} from "../events/TaskStateChangedEvent";
import {workUint64} from "../util/WorkDifficulty";


export class TaskProcess {

  /**
   * @param {TaskState} state
   */
  constructor(state) {
    this.worker = null;
    this.state = state;
    this.workerRevision = 0;
    this.workerHandshake = null;
  }

  start() {
    if (this.isCompleted()){
      console.log('Cannot start Completed state');
      return false;
    }

    if (this.isTerminated()){
      console.log('Cannot start Terminated state');
      return false;
    }

    this.clearWorker();
    const worker = new Worker(new URL(/* webpackChunkName: "workers/TaskWorker" */ '../workers/TaskWorker.js', import.meta.url));
    this.worker = worker;
    this.workerRevision++;

    const failed = () => {
      if (this.worker !== worker) return;
      console.warn('[TaskProcess] worker unavailable or incompatible:', this.getPID());
      this.clearWorker();
      this.state.setStatus(TASK_STATUS.TERMINATED);
      window.dispatchEvent(new TaskWorkerChangedEvent(this.state));
    };
    worker.onerror = failed;
    this.workerHandshake = setTimeout(failed, TASK.WORKER_HANDSHAKE_TIMEOUT);

    worker.onmessage = (result) => {
      const reply = result.data;
      // A terminated/replaced worker, or a reply made before a rule update,
      // cannot replace current state or submit its proof.
      if (this.worker !== worker) return;
      if (reply?.version !== TASK.WORKER_VERSION) { failed(); return; }
      clearTimeout(this.workerHandshake);
      this.workerHandshake = null;
      if (reply.revision !== this.workerRevision) return;
      const taskStateFactory = new TaskStateFactory();
      const state = taskStateFactory.make(reply.state);
      if (!this.state.isSameWork(state)) return;
      window.dispatchEvent(new TaskWorkerChangedEvent(state));
    }

    // Send the initial state to the Worker
    if (!this.isRunning()) {
      this.state.status = TASK_STATUS.STARTING;
    }
    this.clearEstimatedBlockStartOffset();
    worker.postMessage({version: TASK.WORKER_VERSION, revision: this.workerRevision, kind: 'start', state: this.state});
    return true
  }

  /**
   * @param {TaskState} new_state
   */
  replaceState(new_state) {
    if (workUint64(new_state.block_start) < workUint64(this.state.block_start)) return;
    if (this.state.isSameWork(new_state)) {
      this.state.updateRules(new_state);
      this.updateWorker();
      this.dispatchProgress();
      return;
    }
    switch (this.state.status) {
      case TASK_STATUS.INITIATED:
      case TASK_STATUS.PAUSED:
        new_state.setStatus(this.state.status);
        this.setState(new_state);
        break;

      case TASK_STATUS.STARTING:
      case TASK_STATUS.WAITING:
      case TASK_STATUS.RUNNING:
      case TASK_STATUS.TERMINATED:
        this.setState(new_state);
        this.start();
        break;

      case TASK_STATUS.COMPLETED:
        console.log("Tried to spawn new state over completed task " + this.state.getPID());
        break;
    }
  }

  setBlockCheckpoint(block) {
    this.state.setBlockCheckpoint(block);
    this.updateWorker();
  }

  updateWorker() {
    if (!this.worker) return;
    this.workerRevision++;
    this.worker.postMessage({version: TASK.WORKER_VERSION, revision: this.workerRevision,
      kind: 'update', state: this.state});
  }

  pause(estimatedHashrate, estimatedBlockStartOffset) {
    this.clearWorker();
    this.setEstimatedHashrateAndBlockStartOffset(estimatedHashrate, estimatedBlockStartOffset);
    this.setStatus(TASK_STATUS.PAUSED);
  }

  terminate() {
    this.clearWorker();
    this.setStatus(TASK_STATUS.TERMINATED);
  }

  clearWorker() {
    clearTimeout(this.workerHandshake);
    this.workerHandshake = null;
    if (this.worker) {
      this.worker.terminate();
    }
    this.worker = null;
  }

  /**
   * @return {string}
   */
  getPID(){
    return this.state.getObjectId();
  }

  /**
   * @return {boolean}
   */
  hasWorker() {
    return (this.worker !== null);
  }

  /**
   * @return {boolean}
   */
  isInitiated() {
    return this.state.status === TASK_STATUS.INITIATED;
  }

  /**
   * @return {boolean}
   */
  isStarting() {
    return this.state.status === TASK_STATUS.STARTING;
  }

  /**
   * @return {boolean}
   */
  isWaiting() {
    return this.state.status === TASK_STATUS.WAITING;
  }

  /**
   * @return {boolean}
   */
  isRunning() {
    return this.state.status === TASK_STATUS.RUNNING;
  }

  /**
   * @return {boolean}
   */
  isPaused() {
    return this.state.status === TASK_STATUS.PAUSED;
  }

  /**
   * @return {boolean}
   */
  isTerminated() {
    return this.state.status === TASK_STATUS.TERMINATED;
  }

  /**
   * @return {boolean}
   */
  isCompleted() {
    return this.state.status === TASK_STATUS.COMPLETED;
  }

  canStart() {
    return this.isInitiated() || this.isPaused();
  }

  canPause() {
    return this.isStarting() || this.isWaiting() || this.isRunning();
  }

  canResume() {
    return !(this.isRunning() || this.isWaiting() || this.isStarting() || this.isCompleted());
  }

  canSweep() {
    return this.isTerminated() || this.isCompleted();
  }

  /**
   * @param {string} new_status
   */
  setStatus(new_status) {
    this.state.status = new_status;
    this.dispatchProgress();
  }

  /**
   * @param {TaskState} new_state
   */
  setState(new_state) {
    this.state = new_state;
    this.dispatchProgress();
  }

  /**
   * @param {number} estimatedHashrate
   * @param {number} estimatedBlockStartOffset
   */
  setEstimatedHashrateAndBlockStartOffset(estimatedHashrate, estimatedBlockStartOffset){
    this.state.estimated_hashrate = estimatedHashrate;
    this.state.estimated_block_start_offset = estimatedBlockStartOffset;
  }

  clearEstimatedBlockStartOffset() {
    this.state.estimated_block_start_offset = 0;
  }

  dispatchProgress(){
    window.dispatchEvent(new TaskStateChangedEvent(this.state));
  }
}
