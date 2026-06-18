import {PFP_PART_COUNTS} from "../../constants/PfpConstants";
import {PfpClientRenderAttributes} from "../../models/PfpClientRenderAttributes";

/**
 * Composes and displays a player's profile picture from its layered render
 * attributes. The picture is built from 5 image layers of identical
 * dimensions, painted from back to front in the following order:
 *   background, arms, body, neck, head.
 *
 * When no render attributes are available (and none are being generated) the
 * portrait placeholder image is shown instead.
 */
export class PfpViewerComponent {

  /**
   * @param {PfpClientRenderAttributes|null} pfpClientRenderAttributes
   * @param {boolean} generateRandom Whether to randomly generate a configuration.
   */
  constructor(pfpClientRenderAttributes = null, generateRandom = false) {
    this.pfp = generateRandom
      ? this.generateRandomPfp()
      : (pfpClientRenderAttributes || null);
    this.containerElement = null;
  }

  /**
   * @return {string|null}
   */
  getPfpJson() {
    if (this.pfp && typeof this.pfp === "object") {
      return JSON.stringify(this.pfp);
    }

    return null;
  }

  /**
   * Generates a random profile picture configuration.
   *
   * @return {PfpClientRenderAttributes}
   */
  generateRandomPfp() {
    const randomPart = (count) => Math.floor(Math.random() * count) + 1;

    return new PfpClientRenderAttributes(
      randomPart(PFP_PART_COUNTS.head),
      randomPart(PFP_PART_COUNTS.neck),
      randomPart(PFP_PART_COUNTS.body),
      randomPart(PFP_PART_COUNTS.arms),
      randomPart(PFP_PART_COUNTS.background)
    );
  }

  /**
   * Returns the inner HTML for the profile picture, intended to be placed
   * inside one of the portrait container elements.
   *
   * @return {string}
   */
  renderHTML() {
    if (!this.pfp) {
      return `<img class="pfp-viewer-layer" src="/img/portrait-placeholder.png" alt="Profile picture">`;
    }

    // Back to front so that the head layer paints on top.
    const layers = [
      ['background', this.pfp.background],
      ['arms', this.pfp.arms],
      ['body', this.pfp.body],
      ['neck', this.pfp.neck],
      ['head', this.pfp.head],
    ];

    return layers
      .filter(([, index]) => index !== null && index !== undefined)
      .map(([part, index]) =>
        `<img class="pfp-viewer-layer" src="/img/pfp/${part}/pfp_${part}_${index}.png" alt="">`
      )
      .join('');
  }

  /**
   * Binds the component to a container element and renders into it.
   *
   * @param {HTMLElement} containerElement
   * @return {PfpViewerComponent}
   */
  mount(containerElement) {
    this.containerElement = containerElement;
    this.render();
    return this;
  }

  /**
   * Renders the current profile picture into the bound container element.
   */
  render() {
    if (this.containerElement) {
      this.containerElement.innerHTML = this.renderHTML();
    }
  }

  /**
   * Re-renders the profile picture, optionally regenerating a new random
   * configuration first.
   *
   * @param {boolean} regenerate Whether to generate a new random configuration.
   */
  rerender(regenerate = false) {
    if (regenerate) {
      this.pfp = this.generateRandomPfp();
    }
    this.render();
  }
}
