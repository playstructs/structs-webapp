import {TASK} from "../constants/TaskConstants";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TaskState} from "./TaskState";
import {TaskWorkerChangedEvent} from "../events/TaskWorkerChangedEvent";
import {TaskStateChangedEvent} from "../events/TaskStateChangedEvent";


export class TaskProcess {

  /**
   * @param {TaskState} _state
   */
  constructor(state) {
    this.worker = null;
    this.state = state;
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

    if (this.hasWorker()) {
      this.worker.terminate();
    }

    this.worker = new Worker(TASK.WORKER_PATH);

    this.worker.onmessage = async function (result) {
      const taskStateFactory = new TaskStateFactory();
      let state = taskStateFactory.make(result.data[0]);
      window.dispatchEvent(new TaskWorkerChangedEvent(state));
    }

    // Send the initial state to the Worker
    if (!this.isRunning()) {
      this.state.status = TASK_STATUS.STARTING;
    }
    this.clearEstimatedBlockStartOffset();
    this.worker.postMessage([this.state]);
    return true
  }

  /**
   * @param {TaskState} new_state
   */
  replaceState(new_state) {
    switch (this.state.status) {
      case TASK_STATUS.INITIATED:
      case TASK_STATUS.PAUSED:
        new_state.setStatus(this.state.status);
        this.setState(new_state);
        break;

      case TASK_STATUS.STARTING:
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
      this.worker.terminate();
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
