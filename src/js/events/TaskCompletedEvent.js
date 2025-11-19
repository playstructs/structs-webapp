import {EVENTS} from "../constants/Events";

export class TaskCompletedEvent extends CustomEvent {
  /**
   * @param {TaskState} state
   */
  constructor(state) {
    super(EVENTS.TASK_COMPLETED);
    this.state = state;
  }
}
