import {EVENTS} from "../../constants/Events";
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
    this.isLoaded = false;

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

    if (newImageSrc) {
      const svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      svgImage.setAttributeNS(null, 'height', `${originalSVGImage.height.baseVal.valueAsString}`);
      svgImage.setAttributeNS(null, 'width', `${originalSVGImage.width.baseVal.valueAsString}`);
      svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', newImageSrc);
      svgImage.setAttributeNS(null, 'visibility', 'visible');

      gContainer.append(svgImage);
    }
  }

  configStructImages() {
    const struct = this.structManager.getStructById(this.structId);
    if (!struct) {
      return;
    }
    const structStillRenderer = this.structStillBuilder.build(this.structType);

    let structInitSrc = structStillRenderer.structVariantDmg;

    if (this.structType.max_health === struct.health) {
      structInitSrc = structStillRenderer.structVariantBase;
    }

    this.swapImage('.struct_top_layer_1', structStillRenderer.topDetailLayer1);
    this.swapImage('.struct_top_layer_2', structStillRenderer.topDetailLayer2);
    this.swapImage('.struct_init', structInitSrc);
    this.swapImage('.struct_dmg', structStillRenderer.structVariantDmg);
    this.swapImage('.struct_bottom_layer_1', structStillRenderer.bottomDetailLayer1)
  }

  show() {
    this.lottieLoadOptions.container.style.visibility = 'visible';
  }

  hide() {
    this.lottieLoadOptions.container.style.visibility = 'hidden';
  }

  play() {
    if (!this.animation) {
      // First-time play: lazily load the Lottie data and let the DOMLoaded
      // callback (customizeLottie) trigger playback once the JSON + images
      // have finished downloading.
      this.load(true);
      return;
    }

    if (!this.isLoaded) {
      // Animation has been requested but the JSON/images aren't ready yet.
      // The pending DOMLoaded callback will autoplay, so just no-op here to
      // avoid issuing a duplicate play() against an unloaded Lottie.
      return;
    }

    this.animation.stop();
    this.configStructImages();
    this.show();
    this.animation.play();
  }

  stop() {
    this.hide();
    if (this.animation) {
      this.animation.stop();
    }
  }

  /**
   * @param {boolean} autoplayAfterCustomized
   * @return {Promise<void>}
   */
  async customizeLottie(autoplayAfterCustomized) {
    this.isLoaded = true;
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
   * Initialize the wrapper without fetching the Lottie data. Pass
   * `autoplayAfterInit = true` to eagerly load and autoplay; otherwise the
   * animation is loaded lazily on the first play() call.
   *
   * @param {boolean} autoplayAfterInit
   */
  init(autoplayAfterInit) {
    this.hide();

    if (autoplayAfterInit) {
      this.load(true);
    }
  }

  /**
   * Load the Lottie animation data and register completion handlers. Safe
   * to call multiple times; subsequent calls are no-ops.
   *
   * @param {boolean} autoplayAfterCustomized whether to autoplay once
   * customizeLottie runs after DOMLoaded
   */
  load(autoplayAfterCustomized = false) {
    if (this.animation) {
      return;
    }

    const {lottie} = window;
    const {loadAnimation} = lottie;
    const animation = loadAnimation(this.lottieLoadOptions);

    animation.addEventListener('DOMLoaded', this.customizeLottie.bind(this, autoplayAfterCustomized));

    animation.addEventListener('complete', () => {
      this.hide();
      this.onCompleteCallback();
    });

    this.animation = animation;
  }

  /**
   * Tear down the underlying lottie player and release references so the
   * animation's frame cache, image bitmaps, internal listeners, and SVG
   * renderer can be garbage collected. Safe to call when the animation was
   * never loaded.
   */
  destroy() {
    // Drop our own callback first so any in-flight 'complete' event that
    // fires during lottie teardown can't re-enter wrapper logic against a
    // half-destroyed instance.
    this.onCompleteCallback = () => {};

    if (this.animation) {
      try {
        this.animation.destroy();
      } catch (e) {
        // lottie can throw if destroy is invoked on a partially-initialized
        // animation (e.g. JSON fetch in flight). Swallow so a single bad
        // animation can't block teardown of the rest of the viewer.
      }
      this.animation = null;
    }

    this.isLoaded = false;

    // Drop the strong reference to the (possibly already detached) DOM
    // container so it can be reclaimed even if something else still holds
    // a reference to this wrapper.
    if (this.lottieLoadOptions) {
      this.lottieLoadOptions.container = null;
    }
  }
}
