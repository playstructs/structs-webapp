import {EVENTS} from "../constants/Events";

export class AnimationEvent extends CustomEvent {

  /**
   * @param {string} structId the subject of the animation
   * @param {string[]} animationNames the names of the animations to play simultaneously
   * @param {boolean} showStructStillDuringAnimation whether or not to show the still struct image while the animation plays
   * @param {boolean} showStructStillAfterAnimation whether or not the still struct image should still be shown after the animations ends
   * @param {object} options optional parameters such which projectile to use in the animation
   * @param {string|null} mapId the id of the map the animation should play on; used by
   * map layer listeners to ignore events not intended for them
   */
  constructor(
    structId,
    animationNames,
    showStructStillDuringAnimation = false,
    showStructStillAfterAnimation = true,
    options = {},
    mapId = null
  ) {
    super(EVENTS.ANIMATION);

    this.structId = structId;
    this.animationNames = animationNames;
    this.showStructStillDuringAnimation = showStructStillDuringAnimation;
    this.showStructStillAfterAnimation = showStructStillAfterAnimation;
    this.options = options;
    this.mapId = mapId;

    /** @type {function(): (void|Promise<void>)} */
    this.onAnimationEnd = null;
  }

}
