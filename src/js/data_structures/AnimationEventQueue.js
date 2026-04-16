import {EVENTS} from "../constants/Events";
import {Queue} from "./Queue";

export class AnimationEventQueue extends Queue {

  constructor() {
    super();
    this.isPlaying = false;
    this.currentEvent = null;
  }

  enqueue(event) {
    super.enqueue(event);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  playNext() {
    if (this.isEmpty()) {
      this.isPlaying = false;
      this.currentEvent = null;
      return;
    }

    this.isPlaying = true;
    this.currentEvent = super.dequeue();
    window.dispatchEvent(this.currentEvent);
  }

  initListeners() {
    window.addEventListener(EVENTS.ANIMATION_END, async () => {
      if (this.currentEvent && this.currentEvent.onAnimationEnd) {
        await this.currentEvent.onAnimationEnd();
      }
      this.playNext();
    });
  }
}
