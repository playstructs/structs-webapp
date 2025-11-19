import {EVENTS} from "../constants/Events";

export class TaskCmdForceRunEvent extends CustomEvent {
  /**
   * @param {string} pid
   */
  constructor(pid) {
    super(EVENTS.TASK_CMD_FORCE_RUN);
    this.pid = pid;
  }
}
