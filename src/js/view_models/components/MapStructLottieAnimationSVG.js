import {EVENTS} from "../../constants/Events";
import {StructStillBuilder} from "../../builders/StructStillBuilder";
import {StructType} from "../../models/StructType"

export class MapStructLottieAnimationSVG {

  /**
   * Process-wide cache of in-flight / completed image decodes, keyed by
   * source URL. Repeated swaps of the same sprite across wrapper instances
   * (and across animations) skip the network round-trip and decode cost.
   *
   * @type {Map<string, Promise<HTMLImageElement>>}
   */
  static _imageCache = new Map();

  /**
   * Preload (and where supported, decode) an image. Successful loads stay
   * cached for the page lifetime; failures are evicted so a transient
   * error can't permanently poison the entry.
   *
   * @param {string} src
   * @returns {Promise<HTMLImageElement>}
   */
  static _preloadImage(src) {
    const cached = MapStructLottieAnimationSVG._imageCache.get(src);
    if (cached) {
      return cached;
    }

    const img = new Image();
    img.src = src;

    const ready = typeof img.decode === 'function'
      ? img.decode()
      : new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
        });

    const entry = ready
      .then(() => img)
      .catch((err) => {
        MapStructLottieAnimationSVG._imageCache.delete(src);
        throw err;
      });

    MapStructLottieAnimationSVG._imageCache.set(src, entry);
    return entry;
  }

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

    // Monotonic generation token used to disambiguate overlapping
    // configStructImages() calls. Each new config bumps the counter
    // so that in flight swaps that finish after a newer config started
    // bail out before mutating the DOM so the latest sprite set always wins.
    this._configGen = 0;
  }

  /**
   * Swap the image in the lottie animation as identified by the targetClass with the image specified by newImageSrc.
   *
   * @param {string} targetClass the class of the parent g container in the lottie that holds the image to replace
   * @param {string} newImageSrc the image source for the new image
   * @param {number} [generation] generation token from a configStructImages call.
   *   If provided and stale by the time preload finishes, the append is skipped so a newer config can win.
   * @returns {Promise<void>}
   */
  swapImage(targetClass, newImageSrc, generation) {
    const originalSVGImage = document.querySelector(
      `#${this.lottieContainerId} g g${targetClass} image`
    );

    if (!originalSVGImage) {
      return Promise.resolve();
    }

    const gContainer = originalSVGImage.parentNode;
    gContainer.innerHTML = '';

    if (!newImageSrc) {
      return Promise.resolve();
    }

    const height = originalSVGImage.height.baseVal.valueAsString;
    const width = originalSVGImage.width.baseVal.valueAsString;

    return MapStructLottieAnimationSVG._preloadImage(newImageSrc)
      .catch(() => {
        // Swallow preload failures and still insert the SVG <image>; the
        // browser may yet succeed via its own fetch and a broken-image
        // attempt is no worse than a permanently empty slot.
      })
      .then(() => {
        // Bail if the wrapper was destroyed during the preload; destroy()
        // nulls this.animation, so the append below would land on an
        // orphaned SVG node that lottie has already torn down.
        if (!this.animation) {
          return;
        }

        // Bail if a newer configStructImages superseded us. Leave the DOM
        // alone so the live owner's swap can win.
        if (generation !== undefined && generation !== this._configGen) {
          return;
        }

        const svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        svgImage.setAttributeNS(null, 'height', height);
        svgImage.setAttributeNS(null, 'width', width);
        svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', newImageSrc);
        svgImage.setAttributeNS(null, 'visibility', 'visible');

        gContainer.append(svgImage);
      });
  }

  /**
   * @returns {Promise<number>} resolves with the generation token this
   *   call ran under, so callers can detect being superseded by a later
   *   configStructImages() before continuing.
   */
  configStructImages() {
    const struct = this.structManager.getStructById(this.structId);
    if (!struct) {
      return Promise.resolve(this._configGen);
    }
    const structStillRenderer = this.structStillBuilder.build(this.structType);

    let structInitSrc = structStillRenderer.structVariantDmg;

    if (this.structType.max_health === struct.health) {
      structInitSrc = structStillRenderer.structVariantBase;
    }

    const generation = ++this._configGen;

    return Promise.all([
      this.swapImage('.struct_top_layer_1', structStillRenderer.topDetailLayer1, generation),
      this.swapImage('.struct_top_layer_2', structStillRenderer.topDetailLayer2, generation),
      this.swapImage('.struct_init',        structInitSrc, generation),
      this.swapImage('.struct_dmg',         structStillRenderer.structVariantDmg, generation),
      this.swapImage('.struct_bottom_layer_1', structStillRenderer.bottomDetailLayer1, generation),
    ]).then(() => generation);
  }

  show() {
    this.lottieLoadOptions.container.style.visibility = 'visible';
  }

  hide() {
    this.lottieLoadOptions.container.style.visibility = 'hidden';
  }

  async play() {
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
    const ranGen = await this.configStructImages();

    // Bail if a newer play()/configStructImages() superseded us, or if
    // destroy() ran while images were preloading. The newer caller (or
    // teardown) is responsible for the final DOM/animation state.
    if (!this.animation || ranGen !== this._configGen) {
      return;
    }

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
    await this.configStructImages();

    // destroy() may have run while images were preloading; bail out so we
    // don't flip flags or dispatch events against a torn-down wrapper.
    if (!this.animation) {
      return;
    }

    this.isLoaded = true;

    if (autoplayAfterCustomized) {
      await this.play();

      // play() also awaits internally, so destroy() may have raced in
      // between. Re-check before dispatching the customized event.
      if (!this.animation) {
        return;
      }
    }

    if (this.lottieLoadOptions && this.lottieLoadOptions.container) {
      this.lottieLoadOptions.container.dispatchEvent(new CustomEvent(
        EVENTS.LOTTIE_CUSTOMIZED,
        {
          detail: {
            animationName: this.animationName,
          }
        }
      ));
    }
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
