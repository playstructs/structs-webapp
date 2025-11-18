import {TASK} from "../constants/TaskConstants";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TaskState} from "./TaskState";
import {TaskProgressEvent} from "../events/TaskProgressEvent";

export class TaskProcess {

  /**
   * @param {TaskState} _state
   */
  constructor(_state) {
    this.worker = null;
    this.state = _state;
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
      let taskStateFactory = new TaskStateFactory();
      let _state = taskStateFactory.make(result.data[0]);
      window.dispatchEvent(new TaskProgressEvent(_state));
    }

    // Send the initial state to the Worker
    this.state.status = TASK_STATUS.STARTING;
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
        this.state = new_state;
        break;

      case TASK_STATUS.STARTING:
      case TASK_STATUS.RUNNING:
      case TASK_STATUS.TERMINATED:
        this.state = new_state;
        this.start();
        break;

      case TASK_STATUS.COMPLETED:
        console.log("Tried to spawn new state over completed task " + this.state.getPID());
        break;
    }
  }

  pause() {
    this.clearWorker();
    this.state.status = TASK_STATUS.PAUSED;
  }

  terminate() {
    this.clearWorker();
    this.state.status = TASK_STATUS.TERMINATED;
  }

  clearWorker() {
      this.worker.terminate()
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
    return (this.worker !== undefined) && (this.worker !== null) && (this.worker !== "");
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

  /**
   * @param {string} new_status
   */
  setStatus(new_status) {
    this.state.status = new_status;
  }

  /**
   * @param {TaskState} new_state
   */
  setState(new_state) {
    this.state = new_state;
  }


}
