import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {STRUCT_VARIANTS} from "../../constants/StructConstants";

export class StructStillRenderer extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {string[]} topDetailLayers
   * @param {object} structVariants
   * @param {string[]} bottomDetailLayers
   */
  constructor(
    gameState,
    topDetailLayers,
    structVariants,
    bottomDetailLayers
  ) {
    super(gameState);

    this.topDetailLayers = topDetailLayers;
    this.structVariants = structVariants;
    this.bottomDetailLayers = bottomDetailLayers;

    this.defaultVariant = STRUCT_VARIANTS.BASE;
  }

  /**
   * @param {string} layerPath path to the image file
   * @param {string|null} position top or bottom
   * @return {string}
   */
  renderLayerHtml(layerPath, position = null) {
    const positionClass = position
      ? ` struct-${position}-detail`
      : '';

    return `<img src="${layerPath}" class="${positionClass}" alt=""/>`;
  }

  /**
   * @return {string}
   */
  renderTopDetailLayers() {
    return this.topDetailLayers.map(layer =>
      this.renderLayerHtml(layer, 'top')
    ).join('');
  }

  /**
   * @return {string}
   */
  renderBottomDetailLayers() {
    return this.bottomDetailLayers.map(layer =>
      this.renderLayerHtml(layer, 'bottom')
    ).join('');
  }

  /**
   * @param {string} variant
   * @return {string}
   */
  renderStructVariant(variant) {
    return this.renderLayerHtml(this.structVariants[variant]);
  }

  /**
   * @param {string} structVariant
   * @return {string}
   */
  renderHTML(structVariant = this.defaultVariant) {
    return `
      <div class="struct-still">
        ${this.renderTopDetailLayers()}
        ${this.renderStructVariant(structVariant)}
        ${this.renderBottomDetailLayers()}
      </div>
    `;
  }

}