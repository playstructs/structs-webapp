import {onboardingTelemetry} from "../telemetry/OnboardingTelemetry";
import {MenuPage} from "../framework/MenuPage";

/**
 * The tutorial is a fully simulated session: the page boots with in-memory
 * game data instead of the player's real account, so no chain transactions are
 * sent and nothing is written over the player's saved game state.
 *
 * Switching in and out of the simulation is done with a page reload so that
 * none of the real app's listeners (GRASS, signing queue, tasks) are running
 * alongside it. The flags live in sessionStorage so they only affect this tab.
 */
export class TutorialMode {

  static ACTIVE_KEY = 'tutorialActive';

  static EXITED_KEY = 'tutorialExited';

  /** How the player left the tutorial, as stored under EXITED_KEY. */
  static EXIT_COMPLETED = 'completed';

  static EXIT_ABANDONED = 'abandoned';

  static PLAYER_ENERGY_KEY = 'tutorialPlayerEnergy';

  /** The player's energy figures; the simulation shows these instead of made-up ones. */
  static PLAYER_ENERGY_FIELDS = ['load', 'structs_load', 'capacity', 'connection_capacity'];

  /** Where the CMD Ship's tile lands vertically, as a fraction of the screen height. */
  static HOME_VERTICAL_ANCHOR = 0.44;

  /**
   * @return {boolean}
   */
  static isActive() {
    const urlParams = new URLSearchParams(document.location.search);
    return urlParams.has('tutorial') || sessionStorage.getItem(TutorialMode.ACTIVE_KEY) === '1';
  }

  static launch() {
    onboardingTelemetry.flushNow();
    TutorialMode.rememberPlayerEnergy(global.gameState?.keyPlayers?.player?.player);
    sessionStorage.setItem(TutorialMode.ACTIVE_KEY, '1');
    sessionStorage.removeItem(TutorialMode.EXITED_KEY);
    window.location.reload();
  }

  /**
   * Opens Combat Training's menu (restart or abandon).
   */
  static openMenu() {
    MenuPage.router.goto('Tutorial', 'menu');
    MenuPage.open();
  }

  /**
   * Starts the simulation over from the loading screen.
   */
  static restart() {
    onboardingTelemetry.flushNow();
    window.location.reload();
  }

  /**
   * @param {string} how TutorialMode.EXIT_COMPLETED or TutorialMode.EXIT_ABANDONED
   */
  static exit(how) {
    onboardingTelemetry.flushNow();
    sessionStorage.removeItem(TutorialMode.ACTIVE_KEY);
    sessionStorage.removeItem(TutorialMode.PLAYER_ENERGY_KEY);
    sessionStorage.setItem(TutorialMode.EXITED_KEY, how);

    const url = new URL(window.location.href);
    url.searchParams.delete('tutorial');
    window.location.replace(url.toString());
  }

  /**
   * The simulation runs without the player's account, so their energy is
   * carried across the reload into it.
   *
   * @param {Player|null|undefined} player
   */
  static rememberPlayerEnergy(player) {
    if (!player) {
      sessionStorage.removeItem(TutorialMode.PLAYER_ENERGY_KEY);
      return;
    }
    const energy = {};
    TutorialMode.PLAYER_ENERGY_FIELDS.forEach(field => {
      energy[field] = parseInt('' + (player[field] || 0)) || 0;
    });
    sessionStorage.setItem(TutorialMode.PLAYER_ENERGY_KEY, JSON.stringify(energy));
  }

  /**
   * @return {object|null} the energy fields saved by rememberPlayerEnergy()
   */
  static getPlayerEnergy() {
    try {
      return JSON.parse(sessionStorage.getItem(TutorialMode.PLAYER_ENERGY_KEY));
    } catch (error) {
      return null;
    }
  }

  /**
   * Whether this page load is the return from the tutorial, and how it was
   * left. Reading it clears it, so only the first boot after the tutorial sees it.
   *
   * @return {string|null} TutorialMode.EXIT_COMPLETED, TutorialMode.EXIT_ABANDONED or null
   */
  static consumeExited() {
    const exited = sessionStorage.getItem(TutorialMode.EXITED_KEY);
    sessionStorage.removeItem(TutorialMode.EXITED_KEY);
    return exited;
  }

  /**
   * After the FTL jump the real game opens at the top of its map, in Space.
   * Frames the land battleground instead, so the player sees their CMD Ship.
   * The map renders after login, so this waits for the CMD Ship's tile.
   *
   * @param {string} playerId
   */
  static frameHomeAfterReturn(playerId) {
    const selector = `.map-tile-selection-tile[data-tile-type="COMMAND"][data-ambit="LAND"][data-player-id="${playerId}"]`;
    const giveUpAt = performance.now() + 10000;

    const frame = () => {
      const tile = document.querySelector(selector);
      if (!tile || !tile.offsetParent) {
        if (performance.now() < giveUpAt) {
          setTimeout(frame, 200);
        }
        return;
      }

      // Same framing as the tutorial's home view: CMD Ship at the left edge,
      // the land battleground's top row just above the middle of the screen.
      const rect = tile.getBoundingClientRect();
      window.scrollTo({
        left: window.scrollX + rect.left,
        top: window.scrollY + rect.top + (rect.height / 2) - (window.innerHeight * TutorialMode.HOME_VERTICAL_ANCHOR),
        behavior: 'instant'
      });
    };
    frame();
  }
}
