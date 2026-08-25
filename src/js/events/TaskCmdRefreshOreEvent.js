import {EVENTS} from "../constants/Events";

export class TaskCmdRefreshOreEvent extends CustomEvent {
  /**
   * @param {string} taskType see ORE_TASK_TYPES
   * @param {number} blockStart The planet's shared ore clock. Zero means the
   *   clock is cleared and the work cannot be run.
   */
  constructor(taskType, blockStart) {
    super(EVENTS.TASK_CMD_REFRESH_ORE);
    this.taskType = taskType;
    this.blockStart = blockStart;
  }
}
