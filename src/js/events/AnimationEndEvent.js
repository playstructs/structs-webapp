import {EVENTS} from "../constants/Events";

export class AnimationEndEvent extends CustomEvent {

  /**
   * @param {string} animationName the name of the animation
   * @param {string} structId the subject of the animation
   * @param {string|null} mapId the id of the map the animation played on
   */
  constructor(animationName, structId, mapId = null) {
    super(EVENTS.ANIMATION_END);

    this.animationName = animationName;
    this.structId = structId;
    this.mapId = mapId;
  }
}
