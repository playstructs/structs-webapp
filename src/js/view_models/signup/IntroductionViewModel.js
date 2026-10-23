import {AbstractViewModel} from "../../framework/AbstractViewModel";

/** Delay between typed characters. */
const TYPE_CHAR_MS = 28;

/** Pause after each line finishes typing. */
const LINE_PAUSE_MS = 900;

/** Pause before the screen is cleared for the next part. */
const PAGE_PAUSE_MS = 2200;

/** The empty screen between pressing Play Me and the first letter. */
const OPENING_BEAT_MS = 1200;

/** How long the world count takes to tick up. */
const COUNT_UP_MS = 1600;

const STRUCT_WORLD_COUNT = 272;

/**
 * The opening crawl shown to new visitors before the title screen.
 * It types out the setting, then hands over to the title screen; Enter skips it.
 */
export class IntroductionViewModel extends AbstractViewModel {

  /**
   * @param {function(): void} onComplete
   */
  constructor(onComplete) {
    super();
    this.onComplete = onComplete;
    this.finished = false;
    this.containerId = 'introduction-crawl';
    this.keydownHandler = (event) => {
      if (event.key === 'Enter') {
        event.stopImmediatePropagation();
        this.finish();
      }
    };
  }

  /**
   * @param {number} ms
   * @return {Promise<void>}
   */
  pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * @return {HTMLElement}
   */
  getScreen() {
    return document.getElementById(`${this.containerId}-screen`);
  }

  clearScreen() {
    this.getScreen().innerHTML = '';
  }

  /**
   * @param {string} className
   * @return {HTMLElement}
   */
  addLine(className = '') {
    const line = document.createElement('p');
    line.className = `introduction-crawl-line ${className}`;
    this.getScreen().appendChild(line);
    return line;
  }

  /**
   * @param {HTMLElement} element
   * @param {string} text
   * @return {Promise<void>}
   */
  async type(element, text) {
    for (let i = 1; i <= text.length; i++) {
      if (this.finished) {
        return;
      }
      element.textContent = text.slice(0, i);
      await this.pause(TYPE_CHAR_MS);
    }
  }

  /**
   * @param {HTMLElement} element
   * @param {number} target
   * @return {Promise<void>}
   */
  async countUp(element, target) {
    const start = performance.now();
    while (!this.finished) {
      const progress = Math.min(1, (performance.now() - start) / COUNT_UP_MS);
      element.textContent = `${Math.round(target * progress)}`;
      if (progress === 1) {
        return;
      }
      await this.pause(30);
    }
  }

  /**
   * @param {string} label
   * @param {number} count
   * @return {Promise<void>}
   */
  async typeTally(label, count) {
    const row = this.addLine('introduction-crawl-tally');
    const labelElement = document.createElement('span');
    const countElement = document.createElement('span');
    countElement.className = 'introduction-crawl-tally-count';
    row.append(labelElement, countElement);

    await this.type(labelElement, label);
    await this.countUp(countElement, count);
  }

  async play() {
    const steps = [
      async () => {
        await this.pause(OPENING_BEAT_MS);
        this.getScreen().classList.add('mod-presentation');
        await this.type(this.addLine(), 'A slow Ninja presentation');
        await this.pause(PAGE_PAUSE_MS);
        this.clearScreen();
        this.getScreen().classList.remove('mod-presentation');
      },
      async () => {
        // The skip hint appears with the story, not with the studio title.
        this.showSkipHint();
        await this.type(this.addLine(), 'Thousands of years ago, the inhabitants of the Milky Way discovered a dangerously unstable new element -- Alpha Matter, the fuel of galactic civilization.');
        await this.pause(LINE_PAUSE_MS);
        await this.type(this.addLine(), 'In 3029, a catastrophic Alpha mining accident obliterated the Hoag star system, extinguishing 2 billion souls. The galaxy teetered on the brink of civil war.');
        await this.pause(LINE_PAUSE_MS);
        await this.type(this.addLine(), 'The Alpha Star Council decreed only Structs, mysterious machines of unknown origin, could be trusted to mine Alpha Matter.');
        await this.pause(PAGE_PAUSE_MS);
        this.clearScreen();
      },
      async () => {
        await this.type(this.addLine(), 'The year is 402X.');
        await this.pause(LINE_PAUSE_MS);
        await this.typeTally('Alpha-seeded Worlds controlled by Structs:', STRUCT_WORLD_COUNT);
        await this.pause(LINE_PAUSE_MS);
        await this.typeTally('Alpha-seeded Worlds controlled by Organics:', 0);
        await this.pause(PAGE_PAUSE_MS);
      },
    ];

    for (const step of steps) {
      if (this.finished) {
        return;
      }
      await step();
    }

    this.finish();
  }

  finish() {
    if (this.finished) {
      return;
    }
    this.finished = true;
    window.removeEventListener('keydown', this.keydownHandler, true);
    document.getElementById(this.containerId)?.remove();
    this.onComplete();
  }

  showSkipHint() {
    document.getElementById(`${this.containerId}-skip`)?.classList.remove('hidden');
  }

  start() {
    document.getElementById(`${this.containerId}-play`).remove();
    this.play().then();
  }

  render() {
    document.getElementById(this.containerId)?.remove();

    document.body.insertAdjacentHTML('beforeend', `
      <div id="${this.containerId}" class="introduction-crawl">
        <div id="${this.containerId}-screen" class="introduction-crawl-screen"></div>
        <a id="${this.containerId}-play" href="javascript: void(0)" class="introduction-crawl-play">Play Me</a>
        <div id="${this.containerId}-skip" class="introduction-crawl-skip hidden">Press <span class="tutorial-highlight">ENTER</span> to Skip</div>
      </div>
    `);

    document.getElementById(`${this.containerId}-play`).addEventListener('click', () => this.start());
    window.addEventListener('keydown', this.keydownHandler, true);
  }
}
