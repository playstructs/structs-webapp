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
   * @param {string} fleet_id
   * @param {string} planet_id
   * @param {number} block_start
   * @param {number} difficulty_target
   * @return {TaskState}
   */
  initRaidTask(fleet_id, planet_id, block_start, difficulty_target){

    const task_state = new TaskState();

    task_state.task_type = TASK_TYPES.RAID;
    task_state.object_type = OBJECT_TYPE.FLEET;
    task_state.object_id = fleet_id;
    task_state.target_id = planet_id;
    task_state.block_start = block_start;
    task_state.difficulty_target = difficulty_target;

    task_state.prefix = task_state.object_id + TASK.TARGET_DELIMITER + task_state.target_id + task_state.task_type + task_state.block_start + TASK.NONCE_PREFIX;
    task_state.postfix = '';

    return task_state;
  }



  /**
   * @param {string} struct_id
   * @param {string} task_type
   * @param {number} block_start
   * @param {number} difficulty_target
   * @return {TaskState}
   */
  initStructTask(struct_id, task_type, block_start, difficulty_target){

    const task_state = new TaskState();

    task_state.task_type = task_type;
    task_state.object_type = OBJECT_TYPE.STRUCT;
    task_state.object_id = struct_id;
    task_state.block_start = block_start;
    task_state.difficulty_target = difficulty_target;

    task_state.prefix = task_state.object_id  + task_state.task_type + task_state.block_start + TASK.NONCE_PREFIX;
    task_state.postfix = '';

    return task_state;
}


}