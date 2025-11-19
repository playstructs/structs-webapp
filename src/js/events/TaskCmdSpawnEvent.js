import {EVENTS} from "../constants/Events";

export class TaskCmdSpawnEvent extends CustomEvent {
  /**
   * @param {TaskState} state
   */
  constructor(state) {
    super(EVENTS.TASK_CMD_SPAWN);
    this.state = state;
  }
}
