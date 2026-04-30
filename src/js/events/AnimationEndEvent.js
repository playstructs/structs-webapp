import {EVENTS} from "../constants/Events";

export class AnimationEndEvent extends CustomEvent {

  /**
   * @param {string} animationName the name of the animation
   * @param {string} structId the subject of the animation
   * @param {string|null} mapId the id of the map the animation played on
   * @param {number|null} healthAfter the struct health that this animation ended with;
   * lets HUD/HUD-like listeners render partial state mid-attack-sequence rather than
   * pulling the (already-final) value from gameState
   */
  constructor(animationName, structId, mapId = null, healthAfter = null) {
    super(EVENTS.ANIMATION_END);

    this.animationName = animationName;
    this.structId = structId;
    this.mapId = mapId;
    this.healthAfter = healthAfter;
  }
}
