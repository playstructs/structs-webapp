
export class TaskState {
  constructor() {
    this.prefix = null; // Entire string up to NONCE
    this.postfix = null; // Optional IDENTITY
    this.nonce_start = null;
    this.nonce_current = null;
    this.difficulty_start = null;
    this.difficulty_current = null;
    this.block_start = null;
    this.result_hash = null;
    this.result_nonce = null;
    this.created_at = null;
    this.updated_at = null;
  }

  toLog(){
    return JSON.stringify(this, null, 2);
  }
}