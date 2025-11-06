import {TASK} from "../constants/TaskConstants";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TASK_MESSAGE_TYPES} from "../constants/TaskMessageTypes";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TaskComputer} from "./TaskComputer";
import {TaskState} from "./TaskState";

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

  start(pid) {
    if (!this.hasWorker()) {
      this.worker = new Worker(TASK.WORKER_PATH);

      // TODO
      // Deal with the Results handler
      /*
        result object format
          result.data[0] = pid
          result.data[1] = message type
          result.data[3] = payload (optional)
       */
      this.worker.onmessage = async function (result) {
        const pid       = result.data[0];
        const msg_type  = result.data[1];

        let computer = new TaskComputer();

        console.debug('[' + pid + '] Task Worker Message: ' + msg_type );
        switch (msg_type) {
          case TASK_MESSAGE_TYPES.STARTED:
            computer.setStatus(pid, TASK_STATUS.STARTING);
            break;
          case TASK_MESSAGE_TYPES.PAUSED:
            computer.setStatus(pid, TASK_STATUS.PAUSED);
            break;
          case TASK_MESSAGE_TYPES.COMMIT:
            let taskStateFactory = new TaskStateFactory();
            let new_state = taskStateFactory.make(result.data[2]);
            console.log(new_state.toLog());
            computer.setStatus(pid, new_state);
            break;
          case TASK_MESSAGE_TYPES.COMPLETED:
            computer.setStatus(pid, TASK_STATUS.COMPLETED);
            // TODO Do something with this data like either create a transaction or hit an API endpoint
            break;
          default:
            console.debug('[' + pid + '] Why is this in my response?');
        }


      }
    }

    if (!this.isRunning()) {
      this.state.pid = pid

      // Send the initial state to the Worker
      this.worker.postMessage([TASK_MESSAGE_TYPES.START, this.state]);

      this.status = TASK_STATUS.STARTING;

    } else {
      console.log("Trying to start an already running process?");
    }
  }

  pause() {
    this.worker.postMessage([TASK_MESSAGE_TYPES.PAUSE]);
    this.status = TASK_STATUS.PAUSING;
  }

  terminate() {
    this.worker.terminate()
    this.worker = null;
    this.status = TASK_STATUS.TERMINATED;
  }

  sendMessage(msg_type, payload) {
    this.worker.postMessage([msg_type, payload]);
  }
}
