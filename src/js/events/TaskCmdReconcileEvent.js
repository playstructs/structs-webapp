import {EVENTS} from "../constants/Events";

export class TaskCmdReconcileEvent extends CustomEvent {
  constructor() {
    super(EVENTS.TASK_CMD_RECONCILE);
  }
}
