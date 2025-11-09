import {TASK} from "../constants/TaskConstants";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TASK_MESSAGE_TYPES} from "../constants/TaskMessageTypes";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TaskComputer} from "./TaskComputer";
import {TaskState} from "./TaskState";

export class TaskProcess {
  constructor(_state, _callback) {
    this.status = TASK_STATUS.INITIATED;
    this.worker = null;
    this.state = _state;
    this.callback = _callback;
  }

  hasWorker() {
    return (this.worker !== undefined) && (this.worker !== null) && (this.worker !== "");
  }

  isInitiated() {
    return this.status === TASK_STATUS.INITIATED;
  }

  isStarting() {
    return this.status === TASK_STATUS.STARTING;
  }

  isRunning() {
    return this.status === TASK_STATUS.RUNNING;
  }

  isTerminated() {
    return this.status === TASK_STATUS.TERMINATED;
  }

  isCompleted() {
    return this.status === TASK_STATUS.COMPLETED;
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
    /*
      result object format
        result.data[0] = pid
        result.data[1] = message type
        result.data[3] = payload (optional)
     */
    this.worker.onmessage = async function (result) {
      const msg_pid   = result.data[0];
      const msg_type  = result.data[1];
      let new_state = null;
      let computer = new TaskComputer();
      let taskStateFactory = new TaskStateFactory();

      console.log('[' + msg_pid + '] Task Worker Message: ' + msg_type );
      switch (msg_type) {
        case TASK_MESSAGE_TYPES.STARTED:
          console.log('Started Process Request ' + msg_pid);
          computer.setStatus(msg_pid, TASK_STATUS.RUNNING);
          break;
        case TASK_MESSAGE_TYPES.COMMIT:
          new_state = taskStateFactory.make(result.data[2]);
          computer.setState(msg_pid, new_state);
          break;
        case TASK_MESSAGE_TYPES.COMPLETED:
          new_state = taskStateFactory.make(result.data[2]);
          computer.setState(msg_pid, new_state);

          console.log(new_state.toLog());

          computer.complete(msg_pid)
          // TODO Do something with this data like either create a transaction or hit an API endpoint
          if ((this.callback !== undefined) && (this.callback !== null) && (this.callback !== "")) {
            this.callback(new_state);
          }
          break;
        default:
          console.debug('[' + msg_pid + '] Why is this in my response?');
      }
    }

    // Send the initial state to the Worker
    this.status = TASK_STATUS.STARTING;
    this.worker.postMessage([TASK_MESSAGE_TYPES.START, this.state]);
    return true
  }

  pause() {
    this.worker.terminate();
    this.worker = null;
    this.status = TASK_STATUS.PAUSED;
  }

  terminate() {
    this.worker.terminate()
    this.worker = null;
    this.status = TASK_STATUS.TERMINATED;
  }

  complete() {
    this.worker.terminate()
    this.worker = null;
    this.status = TASK_STATUS.COMPLETED;
  }

  getPID(){
    return this.state.getObjectId();
  }

  setStatus(new_status) {
    this.status = new_status;
  }

  setState(new_state) {
    this.state = new_state;
  }

  setCallback(_callback) {
    this.callback = _callback;
  }
}
