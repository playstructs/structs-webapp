import {EVENTS} from "../constants/Events";

export class TaskCmdPauseEvent extends CustomEvent {
  /**
   * @param {string} pid
   */
  constructor(pid) {
    super(EVENTS.TASK_CMD_PAUSE);
    this.pid = pid;
  }
}
