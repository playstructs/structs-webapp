import {AbstractFactory} from "../framework/AbstractFactory";
import {Work} from "../models/Work";
import {TASK_TYPES} from "../constants/TaskTypes";
import {workUint64} from "../util/WorkDifficulty";

export class WorkFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {Work}
   */
  make(obj) {
    if (!obj || !Object.values(TASK_TYPES).includes(obj.category)
        || typeof obj.object_id !== 'string' || !obj.object_id
        || typeof obj.player_id !== 'string' || !obj.player_id
        || (obj.category === TASK_TYPES.RAID && (typeof obj.target_id !== 'string' || !obj.target_id))) {
      throw new Error('Invalid work identity');
    }
    const work = new Work();
    Object.assign(work, obj);
    work.block_start=String(workUint64(obj.block_start));
    work.difficulty_target=String(workUint64(obj.difficulty_target));
    return work;
  }

}
