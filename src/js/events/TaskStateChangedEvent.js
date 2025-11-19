import {EVENTS} from "../constants/Events";

export class TaskStateChangedEvent extends CustomEvent {
  /**
   * @param {TaskState} state
   */
  constructor(state) {
    super(EVENTS.TASK_STATE_CHANGED);
    this.state = state;
  }
}
