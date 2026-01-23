import {TASK} from "../constants/TaskConstants";
import {TASK_STATUS} from "../constants/TaskStatus";
import {sha256} from "js-sha256";


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
    this.iterations_since_last_start = 0;
    this.process_start_time = new Date();
    this.process_end_time = null;
    this.difficulty_start = null;
    this.difficulty_target = null;
    this.block_start = null;
    this.block_checkpoint = null;
    this.block_checkpoint_time = null;
    this.block_current_estimated = null;
    this.result_exists = false;
    this.result_message = null;
    this.result_nonce = null;
    this.result_hash = null;
    this.result_difficulty = 0;

    this.estimated_hashrate = TASK.HASHRATE_INITIAL_ESTIMATE;
    this.estimated_block_start_offset = 0;
    this.last_status_change_time = new Date();
  }

  /**
   * @return {boolean}
   */
  isCompleted() {
    return this.status === TASK_STATUS.COMPLETED;
  }

  /**
   * @return {boolean}
   */
  isWaiting() {
    return this.status === TASK_STATUS.WAITING;
  }

  /**
   * @return {boolean}
   */
  isRunning() {
    return this.status === TASK_STATUS.RUNNING;
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
    this.last_status_change_time = new Date();
    this.status = status
  }

  /**
   * @param {string} nonce
   * @param {string} message
   * @param {string} hash
   * @param {number} difficulty
   */
  setResult(nonce, message, hash, difficulty) {
    this.status = TASK_STATUS.COMPLETED;
    this.process_end_time = new Date();
    this.result_exists = true;
    this.result_message = message;
    this.result_nonce = nonce + this.postfix;
    this.result_hash = hash;
    this.result_difficulty = difficulty;
  }

  /**
   * @param {number} difficulty
   */
  setPreviousResult(difficulty) {
    this.status = TASK_STATUS.COMPLETED;
    this.process_end_time = new Date();
    this.result_difficulty = difficulty;
  }

  getNextNonce() {
    this.iterations++;
    return ++this.nonce_current;
  }

  getObjectId() {
    return this.object_id;
  }

  /**
   * @return {string}
   */
  getPID() {
    return this.object_id;
  }

  /**
   * Calculate percent complete using getBlockRemainingEstimate.
   *
   * @param {number} hashrate
   * @param {number} blockStartOffset
   * @return {number} Percent complete (0.0 to 1.0)
   */
  getPercentCompleteEstimate(hashrate = this.getHashrate(), blockStartOffset = this.estimated_block_start_offset) {
    if (this.isCompleted()) {
      return 1.0;
    }

    // Age represents blocks processed since start
    const age = this.block_current_estimated - this.block_start;

    // Get the blocks remaining using current hash rate
    const blocksRemaining = this.getBlockRemainingEstimate(hashrate, blockStartOffset);

    // Total blocks needed = blocks already processed + blocks remaining
    const totalBlocks = age + blocksRemaining;

    // Percent complete = blocks processed / total blocks needed
    const percent = totalBlocks > 0 ? age / totalBlocks : 0.0;

    return Math.min(1.0, Math.max(0.0, percent));
  }


  /**
   * @param {number} hashrate
   * @param {number} blockStartOffset
   * @return {number}
   */
  getBlockRemainingEstimate(hashrate= this.getHashrate(), blockStartOffset = this.estimated_block_start_offset) {
    if (this.isCompleted()) {
      return 0;
    }

    const currentAge = this.getCurrentAgeEstimate()

    const baseDifficultyRange = this.difficulty_target;
    const maxBlocksToCheck =  TASK.MAX_BLOCKS_WHEN_ESTIMATING;
    const blockTimeSeconds = TASK.ESTIMATED_BLOCK_TIME;

    let cumulativeExpectedSuccesses = 0;
    let blocksAhead = 0;

    while (cumulativeExpectedSuccesses < 1 && blocksAhead < maxBlocksToCheck) {
      if (blocksAhead > blockStartOffset) {
        const ageAtBlock = currentAge + blocksAhead;
        const difficulty = this.getCalculatedDifficulty(ageAtBlock, baseDifficultyRange);
        const successProbability = 1 / Math.pow(16, difficulty);

        // Expected number of successful hashes in this block
        const expectedSuccessesInBlock = hashrate * blockTimeSeconds * successProbability;
        cumulativeExpectedSuccesses += expectedSuccessesInBlock;
      }
      blocksAhead++;
    }

    return Math.min(blocksAhead, maxBlocksToCheck);
  }


  /**
   * @param {number} hashrate
   * @param {number} blockStartOffset
   * @return {number}
   */
  getTimeRemainingEstimate(hashrate= this.getHashrate(), blockStartOffset = this.estimated_block_start_offset) {
    const blocksAhead = this.getBlockRemainingEstimate(hashrate, blockStartOffset);
    return blocksAhead * TASK.ESTIMATED_BLOCK_TIME;
  }

  /**
   * @return {number}
   */
  getHashrate() {
    if (!this.isRunning()) {
      return this.estimated_hashrate;
    }

    const current_time = new Date();
    return this.iterations_since_last_start / (Math.floor((current_time - this.last_status_change_time)) * 1);
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

    return Math.max(1, difficulty)
  }

  /**
   * Calculate difficulty from age
   *
   * @param {number} age - Current age in blocks
   * @param {number} baseDifficultyRange - Base difficulty range
   * @returns {number} Difficulty (number of leading zeros required in hash)
   */
   getCalculatedDifficulty(age, baseDifficultyRange) {
    if (age <= 1) {
      return 64;
    }

    const difficulty = 64 - Math.floor(
        Math.log10(age) / Math.log10(baseDifficultyRange) * 63
    );

    return Math.max(1, difficulty);
  }

  /**
   * Check to see if Hash was built for an acceptable block height
   */
  checkResultHashDifficulty() {
    return this.result_difficulty >= this.getCurrentDifficulty();
  }
}