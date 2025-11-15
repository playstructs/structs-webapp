import {EVENTS} from "../constants/Events";

export class TaskProgressEvent extends CustomEvent {
  /**
   * @param {TaskState} state
   */
  constructor(state) {
    super(EVENTS.TASK_PROGRESS);
    this.state = state;
  }
}
