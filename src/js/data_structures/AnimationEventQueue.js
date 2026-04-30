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
      const wasPlaying = this.isPlaying;
      this.isPlaying = false;
      this.currentEvent = null;
      // Notify listeners that the queue has just transitioned to idle so they
      // can flush any work they deferred while animations were in flight (e.g.
      // HUD renders that would otherwise have clobbered partial-state frames).
      if (wasPlaying) {
        window.dispatchEvent(new CustomEvent(EVENTS.ANIMATION_QUEUE_EMPTY));
      }
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
