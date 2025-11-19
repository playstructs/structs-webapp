import {EVENTS} from "../constants/Events";

export class TaskCmdResumeEvent extends CustomEvent {
  /**
   * @param {string} pid
   */
  constructor(pid) {
    super(EVENTS.TASK_CMD_RESUME);
    this.pid = pid;
  }
}
