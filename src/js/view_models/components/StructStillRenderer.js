import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {STRUCT_STILL_LAYERS} from "../../constants/StructConstants";
import {StructType} from "../../models/StructType";
import {AnimationError} from "../../errors/AnimationError";

export class StructStillRenderer extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {StructType} structType
   * @param {string} topDetailLayer1
   * @param {string} topDetailLayer2
   * @param {string} structVariantBase
   * @param {string} structVariantDmg
   * @param {string} bottomDetailLayer1
   */
  constructor(
    gameState,
    structType,
    topDetailLayer1,
    topDetailLayer2,
    structVariantBase,
    structVariantDmg,
    bottomDetailLayer1
  ) {
    super(gameState);

    this.structType = structType;
    this.topDetailLayer1 = topDetailLayer1;
    this.topDetailLayer2 = topDetailLayer2;
    this.structVariantBase = structVariantBase;
    this.structVariantDmg = structVariantDmg;
    this.structVariantHidden = '';
    this.bottomDetailLayer1 = bottomDetailLayer1;
  }

  /**
   * @param {string} layerPath path to the image file
   * @param {string|null} position top or bottom
   * @return {string}
   */
  renderLayerHtml(layerPath, position = null) {
    if (!layerPath) {
      return '';
    }

    const positionClass = position
      ? ` struct-${position}-detail`
      : '';

    return `<img src="${layerPath}" class="${positionClass}" alt=""/>`;
  }

  /**
   * @param {string} structVariant
   * @return {string}
   */
  renderTopDetailLayers(structVariant) {
    if (structVariant === STRUCT_STILL_LAYERS.STRUCT_VARIANT_HIDDEN) {
      return '';
    }
    return this.renderLayerHtml(this.topDetailLayer1, 'top')
      + this.renderLayerHtml(this.topDetailLayer2, 'top');
  }

  /**
   * @param {string} structVariant
   * @return {string}
   */
  renderBottomDetailLayers(structVariant) {
    if (structVariant === STRUCT_STILL_LAYERS.STRUCT_VARIANT_HIDDEN) {
      return '';
    }
    return this.renderLayerHtml(this.bottomDetailLayer1, 'bottom');
  }

  /**
   * @param {string} variant
   * @return {string}
   */
  renderStructVariant(variant) {
    if (!this.hasOwnProperty(variant)) {
      throw new AnimationError(`Struct variant does not exist ${variant}`);
    }
    return this.renderLayerHtml(this[variant]);
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
        ? STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG
        : STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE;
    }

    return `
      <div class="struct-still">
        ${this.renderTopDetailLayers(structVariant)}
        ${this.renderStructVariant(structVariant)}
        ${this.renderBottomDetailLayers(structVariant)}
      </div>
    `;
  }

}