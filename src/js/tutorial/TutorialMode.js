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

  /**
   * @return {boolean}
   */
  static isActive() {
    const urlParams = new URLSearchParams(document.location.search);
    return urlParams.has('tutorial') || sessionStorage.getItem(TutorialMode.ACTIVE_KEY) === '1';
  }

  static launch() {
    sessionStorage.setItem(TutorialMode.ACTIVE_KEY, '1');
    sessionStorage.removeItem(TutorialMode.EXITED_KEY);
    window.location.reload();
  }

  static exit() {
    sessionStorage.removeItem(TutorialMode.ACTIVE_KEY);
    sessionStorage.setItem(TutorialMode.EXITED_KEY, '1');

    const url = new URL(window.location.href);
    url.searchParams.delete('tutorial');
    window.location.replace(url.toString());
  }

  /**
   * Whether this page load is the return from a finished tutorial. Reading it
   * clears it, so only the first boot after the tutorial sees it.
   *
   * @return {boolean}
   */
  static consumeExited() {
    const exited = sessionStorage.getItem(TutorialMode.EXITED_KEY) === '1';
    sessionStorage.removeItem(TutorialMode.EXITED_KEY);
    return exited;
  }
}
