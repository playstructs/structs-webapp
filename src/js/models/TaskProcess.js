import {TASK} from "../constants/TaskConstants";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TASK_MESSAGE_TYPES} from "../constants/TaskMessageTypes";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TaskComputer} from "./TaskComputer";
import {TaskState} from "./TaskState";
import {TaskProgressEvent} from "../events/TaskProgressEvent";

export class TaskProcess {
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

  getPID(){
    return this.state.getObjectId();
  }

  hasWorker() {
    return (this.worker !== undefined) && (this.worker !== null) && (this.worker !== "");
  }

  isInitiated() {
    return this.state.status === TASK_STATUS.INITIATED;
  }

  isStarting() {
    return this.state.status === TASK_STATUS.STARTING;
  }

  isRunning() {
    return this.state.status === TASK_STATUS.RUNNING;
  }

  isPaused() {
    return this.state.status === TASK_STATUS.PAUSED;
  }

  isTerminated() {
    return this.state.status === TASK_STATUS.TERMINATED;
  }

  isCompleted() {
    return this.state.status === TASK_STATUS.COMPLETED;
  }

  setStatus(new_status) {
    this.state.status = new_status;
  }

  setState(new_state) {
    this.state = new_state;
  }


}
