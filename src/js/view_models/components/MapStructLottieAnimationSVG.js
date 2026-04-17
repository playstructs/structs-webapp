import {EVENTS} from "../../constants/Events";
import {STRUCT_VARIANTS} from "../../constants/StructConstants";
import {StructStillBuilder} from "../../builders/StructStillBuilder";
import {StructType} from "../../models/StructType"

export class MapStructLottieAnimationSVG {

  /**
   * Only works with Lottie SVG rendering.
   *
   * @param {GameState} gameState
   * @param {StructManager} structManager
   * @param {string} animationName
   * @param {string} structId
   * @param {StructType} structType
   * @param {string} lottieContainerId
   * @param {Object} lottieLoadOptions
   */
  constructor(gameState, structManager, animationName, structId, structType, lottieContainerId, lottieLoadOptions) {
    this.gameState = gameState;
    this.structManager = structManager;
    this.structStillBuilder = new StructStillBuilder(gameState);
    this.animationName = animationName;
    this.structId = structId;
    this.structType = structType;
    this.lottieContainerId = lottieContainerId;
    this.lottieLoadOptions = lottieLoadOptions;
    this.animation = null;

    this.lottieLoadOptions.autoplay = false;

    this.onCompleteCallback = () => {};
  }

  /**
   * Swap the image in the lottie animation as identified by the targetClass with the image specified by newImageSrc.
   *
   * @param {string} targetClass the class of the parent g container in the lottie that holds the image to replace
   * @param {string} newImageSrc the image source for the new image
   */
  swapImage(targetClass, newImageSrc) {
    let originalSVGImage = document.querySelector(`#${this.lottieContainerId} g g${targetClass} image`);

    if (!originalSVGImage) {
      return;
    }

    const gContainer = originalSVGImage.parentNode;
    gContainer.innerHTML = '';

    const svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    svgImage.setAttributeNS(null, 'height', `${originalSVGImage.height.baseVal.valueAsString}`);
    svgImage.setAttributeNS(null, 'width', `${originalSVGImage.width.baseVal.valueAsString}`);
    svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', newImageSrc);
    svgImage.setAttributeNS(null, 'visibility', 'visible');

    gContainer.append(svgImage);
  }

  configStructImages() {
    const struct = this.structManager.getStructById(this.structId);
    if (!struct) {
      return;
    }
    const structStillRenderer = this.structStillBuilder.build(this.structType);

    let structInitSrc = structStillRenderer.structVariants[STRUCT_VARIANTS.DMG];
    let structDmgSrc = structStillRenderer.structVariants[STRUCT_VARIANTS.DMG];

    if (this.structType.max_health === struct.health) {
      structInitSrc = structStillRenderer.structVariants[STRUCT_VARIANTS.BASE];
    }

    this.swapImage('.struct_init', structInitSrc);
    this.swapImage('.struct_dmg', structDmgSrc);
  }

  show() {
    this.lottieLoadOptions.container.style.visibility = 'visible';
  }

  hide() {
    this.lottieLoadOptions.container.style.visibility = 'hidden';
  }

  play() {
    this.animation.stop();
    this.configStructImages();
    this.show();
    this.animation.play();
  }

  stop() {
    this.hide();
    this.animation.stop();
  }

  /**
   * @param {boolean} autoplayAfterCustomized
   * @return {Promise<void>}
   */
  async customizeLottie(autoplayAfterCustomized) {
    this.configStructImages();

    if (autoplayAfterCustomized) {
      this.play();
    }

    this.lottieLoadOptions.container.dispatchEvent(new CustomEvent(
      EVENTS.LOTTIE_CUSTOMIZED,
      {
        detail: {
          animationName: this.animationName,
        }
      }
    ));
  }

  /**
   * Load the animation, customize the structure art and add event listeners.
   *
   * @param {boolean} autoplayAfterInit
   */
  init(autoplayAfterInit) {
    this.hide();

    const {lottie} = window;
    const {loadAnimation} = lottie;
    const animation = loadAnimation(this.lottieLoadOptions);

    animation.addEventListener('DOMLoaded', this.customizeLottie.bind(this, autoplayAfterInit));

    animation.addEventListener('complete', () => {
      this.hide();
      this.onCompleteCallback();
    });

    this.animation = animation;
  }
}
