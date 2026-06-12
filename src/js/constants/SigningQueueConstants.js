export const SIGNING_QUEUE = {
  STORAGE_KEY_PREFIX: 'signingQueue',
  STORAGE_VERSION: 1,
  DEFAULT_RETRY_LIMIT: 2,           // 2 retries => 3 total attempts
  MAX_QUEUE_AGE_MS: 30 * 60 * 1000, // 30 minutes; older snapshots quarantined
  BLOCK_TIME_SAMPLE_SIZE: 20,       // rolling avg window
  TIMEOUT_POLL_BLOCKS: 5,           // getTx polls after a cosmjs TimeoutError
};
