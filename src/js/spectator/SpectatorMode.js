import {FEATURE_FLAGS} from "../constants/FeatureFlags";

const PLANET_ID = /^2-[1-9][0-9]{0,18}$/;

/**
 * Spectating a Sector Blitz raid: /?spectate=<planet id> boots the game read-only on that raid,
 * with nobody signed in. The public leaderboard's Current Battles links here.
 */
export class SpectatorMode {

  /**
   * @return {string|null} the raided planet being watched, or null outside spectator mode
   */
  static planetId() {
    if (!FEATURE_FLAGS.SECTOR_BLITZ) {
      return null;
    }
    const planetId = new URLSearchParams(window.location.search).get('spectate');
    return planetId && PLANET_ID.test(planetId) ? planetId : null;
  }

  /**
   * @return {boolean}
   */
  static isActive() {
    return SpectatorMode.planetId() !== null;
  }

  /** Where a spectator goes back to: the public leaderboard. */
  static leaderboardUrl() {
    return '/sector-blitz';
  }
}
