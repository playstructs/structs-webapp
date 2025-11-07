
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
    this.difficulty_current = null;
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
}