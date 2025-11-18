import {EVENTS} from "../constants/Events";

export class TaskWorkerProgressEvent extends CustomEvent {
  /**
   * @param {TaskState} state
   */
  constructor(state) {
    super(EVENTS.TASK_WORKER_PROGRESS);
    this.state = state;
  }
}
