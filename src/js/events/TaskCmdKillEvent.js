import {EVENTS} from "../constants/Events";

export class TaskCmdKillEvent extends CustomEvent {
  /**
   * @param {string} pid
   */
  constructor(pid) {
    super(EVENTS.TASK_CMD_KILL);
    this.pid = pid;
  }
}
