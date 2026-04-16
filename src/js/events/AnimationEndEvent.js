import {EVENTS} from "../constants/Events";

export class AnimationEndEvent extends CustomEvent {

  /**
   * @param {string} animationName the name of the animation
   * @param {string} structId the subject of the animation
   */
  constructor(animationName, structId) {
    super(EVENTS.ANIMATION_END);

    this.animationName = animationName;
    this.structId = structId;
  }
}
