import {TaskState} from "../models/TaskState";
import {AbstractFactory} from "../framework/AbstractFactory";
import {TASK} from "../constants/TaskConstants";
import {TASK_MESSAGE_TYPES} from "../constants/TaskMessageTypes";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TASK_TYPES} from "../constants/TaskTypes";
import {OBJECT_TYPES as OBJECT_TYPE} from "../constants/ObjectTypes";

export class TaskStateFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {TaskState}
   */
  make(obj) {
    const task_state = new TaskState();
    Object.assign(task_state, obj);

    return task_state;
  }

  /**
   * @param {object} obj
   * @return {TaskState}
   */
  init(obj) {
    const task_state = new TaskState();
    Object.assign(task_state, obj);

    /* build the prefix */
    switch (task_state.task_type) {
      case TASK_TYPES.RAID:
        task_state.object_type = OBJECT_TYPE.FLEET
        task_state.prefix = task_state.object_id + TASK.TARGET_DELIMITER + task_state.target_id + task_state.task_type + task_state.block_start + TASK.NONCE_PREFIX;
        break;
      case TASK_TYPES.BUILD:
      case TASK_TYPES.MINE:
      case TASK_TYPES.REFINE:
        task_state.object_type = OBJECT_TYPE.STRUCT
        task_state.prefix = task_state.object_id  + task_state.task_type + task_state.block_start + TASK.NONCE_PREFIX;
        break;
    }

    /* Set the Identity Postfix */
    if ((task_state.identity !== undefined) && (task_state.identity !== null) && (task_state.identity !== "")) {
      task_state.postfix = TASK.IDENTITY_PREFIX + task_state.identity;
    } else {
      task_state.postfix = '';
    }

    return task_state;
  }

}