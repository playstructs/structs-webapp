import {EVENTS} from "../constants/Events";

export class TaskWorkerChangedEvent extends CustomEvent {
  /**
   * @param {TaskState} state
   */
  constructor(state) {
    super(EVENTS.TASK_WORKER_CHANGED);
    this.state = state;
  }
}
