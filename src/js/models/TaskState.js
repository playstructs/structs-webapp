import {task_processes} from "./TaskComputer";
import {TASK} from "../constants/TaskConstants";

export class TaskState {
  constructor() {
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
    this.difficulty_start = null;
    this.difficulty_target = null;
    this.block_start = null;
    this.block_checkpoint = null;
    this.block_checkpoint_time = null;
    this.block_current_estimated = null;
    this.result_message = null;
    this.result_nonce = null;
    this.result_hash = null;
    this.completed = false;

  }

  isCompleted() {
    return this.completed;
  }

  toLog(){
    return JSON.stringify(this, null, 2);
  }

  setBlockCheckpoint(block) {
    this.block_checkpoint_time = new Date();
    this.block_checkpoint = block;
    this.block_current_estimated = block;
  }

  setResult(nonce, message, hash) {
    this.completed = true;
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

  getPID() {
    return this.object_id;
  }

  getPercentCompleteEstimate() {
    return 0.5 // TODO
  }

  getTimeRemainingEstimate() {
    return 60 // TODO
  }

  getMessage(nonce) {
    return this.prefix + nonce + this.postfix;
  }

  getCurrentAgeEstimate() {
    const current_time = new Date();
    const estimated_blocks_past = Math.floor((current_time - this.block_checkpoint_time) / TASK.ESTIMATED_BLOCK_TIME);
    this.block_current_estimated = Math.floor(this.block_checkpoint + estimated_blocks_past);

    return this.block_current_estimated - this.block_start;
  }

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
    console.log("Current Difficulty:" + difficulty);
    return difficulty;
  }
}