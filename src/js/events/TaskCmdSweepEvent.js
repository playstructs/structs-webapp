import {EVENTS} from "../constants/Events";

export class TaskCmdSweepEvent extends CustomEvent {
  /**
   * @param {string} pid
   */
  constructor(pid) {
    super(EVENTS.TASK_CMD_SWEEP);
    this.pid = pid;
  }
}
