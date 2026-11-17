/**
 * Manually toggled feature switches. Flip a flag and rebuild to enable or hide a feature.
 */
export const FEATURE_FLAGS = Object.freeze({

  /**
   * Sector Blitz (sector control contests, a.k.a. influence contests).
   *
   * When false every contest change is hidden: the Fleet card, Event Rules, Sector Map,
   * Sector Leaderboards, the contest Scan variant and the contest alerts.
   * The FTL Jump screen shown after launching a fleet is not part of this flag.
   */
  SECTOR_BLITZ: true,
});
