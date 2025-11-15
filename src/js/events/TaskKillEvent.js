import {EVENTS} from "../constants/Events";

export class TaskKillEvent extends CustomEvent {
  /**
   * @param {string} pid
   */
  constructor(pid) {
    super(EVENTS.TASK_KILL);
    this.pid = pid;
  }
}
