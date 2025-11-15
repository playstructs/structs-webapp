import {TASK} from "../constants/TaskConstants";
import {TASK_STATUS} from "../constants/TaskStatus";

export class TaskState {
  constructor() {
    this.status = TASK_STATUS.INITIATED;
    this.object_id = null;
    this.target_id = null;
    this.object_type = null;
    this.task_type = null;
    this.identity = null;

    this.prefix = null; // Entire string up to NONCE
    this.postfix = null; // Optional IDENTITY
    this.nonce_start = Math.floor(Math.random() * 10000000000);
    this.nonce_current = this.nonce_start;
    this.iterations = 0;
    this.process_start_time = new Date();
    this.process_end_time = null;
    this.difficulty_start = null;
    this.difficulty_target = null;
    this.block_start = null;
    this.block_checkpoint = null;
    this.block_checkpoint_time = null;
    this.block_current_estimated = null;
    this.result_message = null;
    this.result_nonce = null;
    this.result_hash = null;

  }

  /**
   * @return {boolean}
   */
  isCompleted() {
    return this.status === TASK_STATUS.COMPLETED;
  }

  /**
   * @return {string}
   */
  toLog(){
    return JSON.stringify(this, null, 2);
  }

  /**
   * @param {number} block
   */
  setBlockCheckpoint(block) {
    this.block_checkpoint_time = new Date();
    this.block_checkpoint = block;
    this.block_current_estimated = block;
  }

  /**
   * @param {string} status
   */
  setStatus(status) {
    this.status = status
  }

  /**
   * @param {string} nonce
   * @param {string} message
   * @param {string} hash
   */
  setResult(nonce, message, hash) {
    this.status = TASK_STATUS.COMPLETED;
    this.process_end_time = new Date();
    this.result_message = message;
    this.result_nonce = nonce + this.postfix;
    this.result_hash = hash;
  }

  getNextNonce() {
    this.iterations++;
    return ++this.nonce_current;
  }

  getObjectId() {
    return this.object_id;
  }

  /**
   * @return {number}
   */
  getPID() {
    return this.object_id;
  }

  /**
   * @return {number}
   */
  getPercentCompleteEstimate() {
    if (this.isCompleted()) {
      return 1;
    }
    return 1.0-(this.getCurrentDifficulty()/100) // TODO better
  }

  /**
   * @return {number}
   */
  getTimeRemainingEstimate() {
    if (this.isCompleted()) {
      return 0.0;
    }

    const hash_scope = 2.0 ** (this.getCurrentDifficulty() * 4);
    return hash_scope / this.getHashrate()
  }

  /**
   * @return {number}
   */
  getHashrate() {
    if (this.isCompleted()) {
      return 0.0;
    }

    const current_time = new Date();
    return this.iterations / (Math.floor((current_time - this.process_start_time)) * 1);
  }

  /**
   * @param {string} nonce
   * @return {string}
   */
  getMessage(nonce) {
    return this.prefix + nonce + this.postfix;
  }

  /**
   * @return {number}
   */
  getCurrentAgeEstimate() {
    const current_time = new Date();
    const estimated_blocks_past = Math.floor((current_time - this.block_checkpoint_time) / TASK.ESTIMATED_BLOCK_TIME);
    this.block_current_estimated = Math.floor(this.block_checkpoint + estimated_blocks_past);

    return this.block_current_estimated - this.block_start;
  }

  /**
   * @return {number}
   */
  getCurrentDifficulty(){
    const age = this.getCurrentAgeEstimate();

    if (age <= 1) {
      return 64;
    }

    // Using logarithmic function to calculate difficulty
    let difficulty = 64 - Math.floor(Math.log10(age) / Math.log10(this.difficulty_target) * 63);

    if (difficulty < 1) {
      return 1;
    }

    return difficulty;
  }
}