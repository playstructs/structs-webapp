import {EVENTS} from "../constants/Events";

export class TaskManagerStatusChangedEvent extends CustomEvent {
  /**
   * @param {string} status
   */
  constructor(status) {
    super(EVENTS.TASK_MANAGER_STATUS_CHANGED);
    this.status = status;
  }
}
