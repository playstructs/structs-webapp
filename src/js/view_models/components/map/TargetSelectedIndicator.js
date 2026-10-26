export const TARGET_SELECTED_VARIANTS = {
  ENEMY: 'enemy',
  FRIENDLY: 'friendly',
  NEUTRAL: 'neutral'
};

/** How long the art runs, matching the frame delays in the gifs. */
const PLAY_DURATION_MS = 800;

/**
 * The burst that plays on a tile once the player picks a valid target for an
 * action waiting on a map click: red for offensive actions, teal for defensive
 * ones and yellow for neutral ones.
 *
 * The gifs don't loop and end blank, so each play is removed once it has run.
 * A gif only starts from its first frame the first time its URL is decoded,
 * which would leave every later play of the same path showing its blank last
 * frame. Each play is instead given its own object URL of the already
 * downloaded file.
 */
export class TargetSelectedIndicator {

  /** @type {Object<string, Blob>} */
  static blobs = {};

  static preloadStarted = false;

  /**
   * @type {WeakMap<HTMLElement|object, {element: HTMLImageElement|object, timeoutId: number, objectUrl: string|null}>}
   */
  static plays = new WeakMap();

  /**
   * @param {string} variant see TARGET_SELECTED_VARIANTS
   * @return {string}
   */
  static getAssetPath(variant) {
    return `/img/focus/target-selected-${variant}.gif`;
  }

  /**
   * Download the art up front so the first selection isn't kept waiting on it.
   */
  static preload() {
    if (TargetSelectedIndicator.preloadStarted || typeof fetch !== 'function') {
      return;
    }

    TargetSelectedIndicator.preloadStarted = true;

    Object.values(TARGET_SELECTED_VARIANTS).forEach(variant => {
      fetch(TargetSelectedIndicator.getAssetPath(variant))
        .then(response => response.ok ? response.blob() : null)
        .then(blob => {
          if (blob) {
            TargetSelectedIndicator.blobs[variant] = blob;
          }
        })
        // Plays fall back to the path, which still runs from the start the first time it is shown.
        .catch(() => {});
    });
  }

  /**
   * @param {HTMLElement|object} tile
   * @param {string} variant see TARGET_SELECTED_VARIANTS
   */
  static play(tile, variant) {
    TargetSelectedIndicator.stop(tile);

    const blob = TargetSelectedIndicator.blobs[variant];
    const objectUrl = blob ? URL.createObjectURL(blob) : null;

    const element = document.createElement('img');
    element.className = 'map-tile-target-selected';
    element.alt = '';
    element.src = objectUrl || TargetSelectedIndicator.getAssetPath(variant);
    tile.appendChild(element);

    TargetSelectedIndicator.plays.set(tile, {
      element: element,
      timeoutId: setTimeout(() => TargetSelectedIndicator.stop(tile), PLAY_DURATION_MS),
      objectUrl: objectUrl
    });
  }

  /**
   * @param {HTMLElement|object} tile
   */
  static stop(tile) {
    const play = TargetSelectedIndicator.plays.get(tile);

    if (!play) {
      return;
    }

    clearTimeout(play.timeoutId);
    play.element.remove();

    if (play.objectUrl) {
      URL.revokeObjectURL(play.objectUrl);
    }

    TargetSelectedIndicator.plays.delete(tile);
  }
}
