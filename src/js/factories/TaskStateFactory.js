import {TaskState} from "../models/TaskState";
import {AbstractFactory} from "../framework/AbstractFactory";

export class TaskStateFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {Transaction}
   */
  make(obj) {
    const task_state = new TaskState();
    Object.assign(task_state, obj);
    return task_state;
  }
}