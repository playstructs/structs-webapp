import {EVENTS} from "../constants/Events";

export class TaskSpawnEvent extends CustomEvent {
  /**
   * @param {TaskState} state
   */
  constructor(state) {
    super(EVENTS.TASK_SPAWN);
    this.state = state;
  }
}
