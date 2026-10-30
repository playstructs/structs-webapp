// Measured against the pinned v0.22 release through real signed app transactions.
// The native query snapshot also enforces 64 requests / 15 seconds. These are
// client bounds, not a claim that arbitrary state fits: every batch is simulated.
export const REACTOR_TRANSACTION = Object.freeze({
  MAX_POSITIONS: 16,
  MAX_PAGES_PER_LIST: 4,
  GAS: '20000000', // Structs GasRouter's DefaultFreeGasCap; not the native staking path.
});
