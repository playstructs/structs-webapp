import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {STRUCT_VARIANTS} from "../../constants/StructConstants";
import {StructType} from "../../models/StructType";

export class StructStillRenderer extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {StructType} structType
   * @param {string[]} topDetailLayers
   * @param {object} structVariants
   * @param {string[]} bottomDetailLayers
   */
  constructor(
    gameState,
    structType,
    topDetailLayers,
    structVariants,
    bottomDetailLayers
  ) {
    super(gameState);

    /** @type {StructType} */
    this.structType = structType;
    this.topDetailLayers = topDetailLayers;
    this.structVariants = structVariants;
    this.bottomDetailLayers = bottomDetailLayers;
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
   * @param {number} currentHealth
   * @param {string} structVariant
   * @return {string}
   */
  renderHTML(currentHealth = -1, structVariant = '') {

    if (currentHealth === 0) {
      return `<div class="struct-still"></div>`;
    }

    if (structVariant === '') {
      structVariant = (0 < currentHealth && currentHealth < this.structType.max_health)
        ? STRUCT_VARIANTS.DMG
        : STRUCT_VARIANTS.BASE;
    }

    return `
      <div class="struct-still">
        ${this.renderTopDetailLayers()}
        ${this.renderStructVariant(structVariant)}
        ${this.renderBottomDetailLayers()}
      </div>
    `;
  }

}