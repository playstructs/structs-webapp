
export class TaskState {
  constructor() {
    this.object_id = null;
    this.object_type = null;
    this.task_type = null;

    this.prefix = null; // Entire string up to NONCE
    this.postfix = null; // Optional IDENTITY
    this.nonce_start = Math.floor(Math.random() * 10000000000);
    this.nonce_current = this.nonce_start;
    this.difficulty_start = null;
    this.difficulty_target = null;
    this.block_start = null;
    this.block_current = null;
    this.result_hash = null;
    this.result_nonce = null;

  }

  toLog(){
    return JSON.stringify(this, null, 2);
  }

  setBlockCurrent(block) {
    this.block_current = block;
  }

  getNextNonce() {
    return this.nonce_current++
  }

  getMessage(nonce) {
    return this.prefix + nonce + this.postfix;
  }

  getCurrentAge() {
    return this.block_current - this.block_start;
  }

  getCurrentDifficulty(){
    const age = this.getCurrentAge();

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