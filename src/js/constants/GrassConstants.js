export const LOG_LEVEL = {
  ALL: 'ALL',
  KEY_PLAYER: 'KEY_PLAYER',
  NONE: 'NONE'
};

/**
 * How long the chain clock may go quiet before the stream is treated as
 * stalled. Calibrated against the `consensus` block cadence of a few seconds,
 * so this is comfortably longer than any healthy gap.
 */
export const STALE_BLOCK_MS = 60000;

/**
 * How often to poll for a stalled stream. Browsers clamp this in a hidden tab,
 * which is acceptable: a hidden tab only has to be healthy again by the time it
 * becomes visible, and the resume triggers cover that moment exactly.
 */
export const RESUME_CHECK_INTERVAL_MS = 30000;
