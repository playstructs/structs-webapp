import {TASK} from "../constants/TaskConstants";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TASK_MESSAGE_TYPES} from "../constants/TaskMessageTypes";

export class TaskProcess {
  constructor() {
    this.state = null;
    this.worker = null;
    this.status = TASK_STATUS.NEW;

    this.success_callback = null;
  }

  hasWorker() {
    return (this.worker !== undefined) && (this.worker !== null) && (this.worker !== "");
  }

  isNew() {
    return this.status === TASK_STATUS.NEW;
  }

  isRunning() {
    return this.status === TASK_STATUS.RUNNING;
  }

  isPaused() {
    return this.status === TASK_STATUS.PAUSED;
  }

  isTerminated() {
    return this.status === TASK_STATUS.TERMINATED;
  }

  start() {
    if(!this.hasWorker()) {
      this.worker = new Worker(TASK.WORKER_PATH);

      // TODO
      // Deal with the Results handler
      this.worker.onmessage = async function (result) {
        console.log('Received from action worker [Process ID #' + result.data[0].id + ']...');
      }

      // Send the initial state to the Worker
      this.worker.postMessage([this.state]);
    }
    this.worker.start()

    this.status = TASK_STATUS.RUNNING;
  }

  pause() {
    this.worker.postMessage([TASK_MESSAGE_TYPES.PAUSE_AND_EXPORT]);
    this.status = TASK_STATUS.PAUSING;
  }

  terminate() {
    this.worker.terminate()
    this.status = TASK_STATUS.TERMINATED;
  }

  sendMessage(msg) {
    this.worker.postMessage([msg]);
  }
}
