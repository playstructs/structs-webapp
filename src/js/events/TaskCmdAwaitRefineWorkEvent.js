import {EVENTS} from "../constants/Events";

export class TaskCmdAwaitRefineWorkEvent extends CustomEvent {
  constructor() {
    super(EVENTS.TASK_CMD_AWAIT_REFINE_WORK);
  }
}
