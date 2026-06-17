export const SIGNING_QUEUE = {
  STORAGE_KEY_PREFIX: 'signingQueue',
  STORAGE_VERSION: 2,
  DEFAULT_RETRY_LIMIT: 0,           // 0 retries => 1 attempt (no retries for now)
  MAX_QUEUE_AGE_MS: 30 * 60 * 1000, // 30 minutes; older snapshots quarantined
  BLOCK_TIME_SAMPLE_SIZE: 20,       // rolling avg window
  TIMEOUT_POLL_BLOCKS: 5,           // getTx polls after a cosmjs TimeoutError
};
