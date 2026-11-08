export const TUTORIAL_POINTER_DIRECTIONS = {
  DOWN: 'down',
  UP: 'up'
};

/** Size of the pointer art at 1x. */
const POINTER_SIZE = 32;

/**
 * The bouncing chevron that points the player at what the tutorial is talking
 * about. Targets are looked up again every frame because the map and HUD
 * re-render their elements freely.
 */
export class TutorialPointer {

  constructor() {
    this.element = document.createElement('img');
    this.element.src = '/img/tutorial/tutorial-indicator.gif';
    this.element.alt = '';
    this.element.className = 'tutorial-pointer hidden';
    document.body.appendChild(this.element);

    /** @type {function(): (Element|null)|null} */
    this.getTarget = null;

    this.direction = TUTORIAL_POINTER_DIRECTIONS.DOWN;
    this.frameRequest = null;
  }

  /**
   * @param {function(): (Element|null)} getTarget
   * @param {string} direction see TUTORIAL_POINTER_DIRECTIONS; DOWN sits above the target
   */
  pointAt(getTarget, direction = TUTORIAL_POINTER_DIRECTIONS.DOWN) {
    this.getTarget = getTarget;
    this.direction = direction;
    this.element.classList.toggle('mod-up', direction === TUTORIAL_POINTER_DIRECTIONS.UP);

    if (!this.frameRequest) {
      this.update();
    }
  }

  hide() {
    this.getTarget = null;
    this.element.classList.add('hidden');
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }
  }

  /**
   * @param {Element} target
   * @return {number} how much the target is scaled on screen
   */
  getScale(target) {
    const width = target.offsetWidth;
    if (!width) {
      return 1;
    }
    return target.getBoundingClientRect().width / width;
  }

  update() {
    this.frameRequest = requestAnimationFrame(() => this.update());

    const target = this.getTarget ? this.getTarget() : null;
    if (!target || target.closest('.hidden')) {
      this.element.classList.add('hidden');
      return;
    }

    const rect = target.getBoundingClientRect();
    const size = POINTER_SIZE * this.getScale(target);
    const left = rect.left + (rect.width / 2) - (size / 2);
    const top = this.direction === TUTORIAL_POINTER_DIRECTIONS.UP
      ? rect.bottom
      : rect.top - size;

    this.element.style.width = `${size}px`;
    this.element.style.height = `${size}px`;
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
    this.element.classList.remove('hidden');
  }
}
