export const SIGNING_QUEUE = {
  STORAGE_KEY_PREFIX: 'signingQueue',
  STORAGE_VERSION: 3,
  DEFAULT_RETRY_LIMIT: 0,           // Retained for saved intents; signed sends never auto-retry.
  MAX_QUEUE_AGE_MS: 30 * 60 * 1000, // Unsent intents only; ambiguous submissions never expire.
  BLOCK_TIME_SAMPLE_SIZE: 20,       // rolling avg window
  // Bounds preparation/wallet signing. Broadcast and reconciliation use the
  // shorter owned-RPC deadlines; a local deadline never proves non-inclusion.
  BROADCAST_TIMEOUT_MS: 90 * 1000,
  RECONCILE_TIMEOUT_MS: 15 * 1000,
};
