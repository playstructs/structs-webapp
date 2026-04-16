export class LottieCustomPlayer {
  constructor() {
    this.animations = [];
  }

  getAnimation(animationName) {
    for (let i = 0; i < this.animations.length; i++) {
      if (this.animations[i].animationName === animationName) {
        return this.animations[i];
      }
    }
    return null;
  }

  hideAll() {
    for (let i = 0; i < this.animations.length; i++) {
      this.animations[i].hide();
    }
  }

  stopAll() {
    for (let i = 0; i < this.animations.length; i++) {
      this.animations[i].stop();
    }
  }

  checkHasAnimations() {
    if (this.animations.length === 0) {
      throw Error('No animations to play');
    }
  }

  /**
   * @param {string} animationName
   */
  play(animationName) {
    this.checkHasAnimations();
    for (let i = 0; i < this.animations.length; i++) {
      if (this.animations[i].animationName === animationName) {
        this.animations[i].play();
        break;
      }
    }
  }

  /**
   * @param {MapStructLottieAnimationSVG} animation
   */
  registerAnimation(animation) {
    this.animations.push(animation);
  }

  /**
   * @param {string[]} animationsToAutoplay
   */
  init(animationsToAutoplay = []) {
    for (let i = 0; i < this.animations.length; i++) {
      let autoplay = animationsToAutoplay.includes(this.animations[i].animationName);
      this.animations[i].init(autoplay);
    }
  }
}
