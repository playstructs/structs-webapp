import {ANIMATION} from "../../constants/AnimationConstants";
import {LottieCustomPlayer} from "./LottieCustomPlayer";
import {MapStructLottieAnimationSVG} from "./MapStructLottieAnimationSVG";
import {StructStillBuilder} from "../../builders/StructStillBuilder";
import {CaseConverter, LOWER_SNAKE_CASE} from "../../util/CaseConverter";
import {AnimationEndEvent} from "../../events/AnimationEndEvent";
import {STRUCT_STILL_LAYERS, STRUCT_TYPES} from "../../constants/StructConstants";

export class MapStructViewerComponent {

  /**
   * @param {GameState} gameState
   * @param {StructManager} structManager
   * @param {string} structId
   * @param {number} structTypeId
   * @param {string|null} mapId the id of the map that owns this viewer; included on
   * dispatched AnimationEndEvents so listeners can filter by their own map
   * @param {string} idPrefix prepended to every internal lottie/container element id.
   * Lets multiple viewers (e.g. the on-map viewer and a picture-in-picture viewer)
   * coexist for the same struct without `document.getElementById` collisions.
   * @param {boolean} dispatchAnimationEnd whether the viewer should dispatch an
   * `AnimationEndEvent` on lottie complete. Picture-in-picture / mirror viewers
   * must pass `false` so they don't drive the global `AnimationEventQueue`.
   */
  constructor(
    gameState,
    structManager,
    structId,
    structTypeId,
    mapId = null,
    idPrefix = '',
    dispatchAnimationEnd = true
  ) {
    this.gameState = gameState;
    this.structManager = structManager;
    this.structId = structId;
    this.structTypeId = structTypeId;
    this.mapId = mapId;
    this.idPrefix = idPrefix;
    this.dispatchAnimationEnd = dispatchAnimationEnd;
    this.layerZIndex = 0;

    this.lottieCustomPlayer = new LottieCustomPlayer();
    this.caseConverter = new CaseConverter();
    this.structStillBuilder = new StructStillBuilder(this.gameState);

    /**
     * Optional hook invoked from `prepareAnimationLifecycle` after the last
     * animation in a play/init cycle completes. Fires regardless of
     * `dispatchAnimationEnd` so muted viewers (e.g. the picture-in-picture
     * mirror) can still observe their own completion without driving the
     * global `AnimationEventQueue`.
     *
     * @type {function(): void}
     */
    this.onAnimationsComplete = null;

    this.showStructStillAfterAnimation = true;
    this.structType = this.gameState.structTypes.getStructTypeById(structTypeId);

    this.deploymentSpaceAnimationContainerId = `${this.idPrefix}deploymentSpaceAnimation-${this.structId}`;
    this.deploymentAirAnimationContainerId = `${this.idPrefix}deploymentAirAnimation-${this.structId}`;
    this.deploymentLandAnimationContainerId = `${this.idPrefix}deploymentLandAnimation-${this.structId}`;
    this.deploymentWaterAnimationContainerId = `${this.idPrefix}deploymentWaterAnimation-${this.structId}`;

    this.moveArriveAnimationContainerId = `${this.idPrefix}moveArriveAnimation-${this.structId}`;
    this.moveDepartAnimationContainerId = `${this.idPrefix}moveDepartAnimation-${this.structId}`;

    this.stealthActivateAnimationContainerId = `${this.idPrefix}stealthActivateAnimation-${this.structId}`;
    this.stealthDeactivateAnimationContainerId = `${this.idPrefix}stealthDeactivateAnimation-${this.structId}`;

    this.impactAngledDownCannonAnimationContainerId = `${this.idPrefix}impactAngledDownCannonAnimation-${this.structId}`;
    this.impactAngledDownMissileAnimationContainerId = `${this.idPrefix}impactAngledDownMissileAnimation-${this.structId}`;
    this.impactAngledDownTorpedoAnimationContainerId = `${this.idPrefix}impactAngledDownTorpedoAnimation-${this.structId}`;
    this.impactAngledUpMissileAnimationContainerId = `${this.idPrefix}impactAngledUpMissileAnimation-${this.structId}`;
    this.impactAngledUpTorpedoAnimationContainerId = `${this.idPrefix}impactAngledUpTorpedoAnimation-${this.structId}`;
    this.impactAngledUpGatlingAnimationContainerId = `${this.idPrefix}impactAngledUpGatlingAnimation-${this.structId}`;
    this.impactAngledUpCannonAnimationContainerId = `${this.idPrefix}impactAngledUpCannonAnimation-${this.structId}`;
    this.impactHorizontalCannonAnimationContainerId = `${this.idPrefix}impactHorizontalCannonAnimation-${this.structId}`;
    this.impactHorizontalGatlingAnimationContainerId = `${this.idPrefix}impactHorizontalGatlingAnimation-${this.structId}`;
    this.impactHorizontalMissileAnimationContainerId = `${this.idPrefix}impactHorizontalMissileAnimation-${this.structId}`;
    this.impactHorizontalTorpedoAnimationContainerId = `${this.idPrefix}impactHorizontalTorpedoAnimation-${this.structId}`;

    this.evadeAnimationContainerId = `${this.idPrefix}evadeAnimation-${this.structId}`;

    this.shakeAngledDownDefaultFirstAnimationContainerId = `${this.idPrefix}shakeAngledDownDefaultFirstAnimation-${this.structId}`;
    this.shakeAngledDownDefaultLastAnimationContainerId = `${this.idPrefix}shakeAngledDownDefaultLastAnimation-${this.structId}`;
    this.shakeAngledUpDefaultFirstAnimationContainerId = `${this.idPrefix}shakeAngledUpDefaultFirstAnimation-${this.structId}`;
    this.shakeAngledUpDefaultLastAnimationContainerId = `${this.idPrefix}shakeAngledUpDefaultLastAnimation-${this.structId}`;
    this.shakeAngledUpGatlingFirstAnimationContainerId = `${this.idPrefix}shakeAngledUpGatlingFirstAnimation-${this.structId}`;
    this.shakeAngledUpGatlingLastAnimationContainerId = `${this.idPrefix}shakeAngledUpGatlingLastAnimation-${this.structId}`;
    this.shakeHorizontalDefaultFirstAnimationContainerId = `${this.idPrefix}shakeHorizontalDefaultFirstAnimation-${this.structId}`;
    this.shakeHorizontalDefaultLastAnimationContainerId = `${this.idPrefix}shakeHorizontalDefaultLastAnimation-${this.structId}`;
    this.shakeHorizontalGatlingFirstAnimationContainerId = `${this.idPrefix}shakeHorizontalGatlingFirstAnimation-${this.structId}`;
    this.shakeHorizontalGatlingLastAnimationContainerId = `${this.idPrefix}shakeHorizontalGatlingLastAnimation-${this.structId}`;

    this.destroySpaceAnimationContainerId = `${this.idPrefix}destroySpaceAnimation-${this.structId}`;
    this.destroyAirAnimationContainerId = `${this.idPrefix}destroyAirAnimation-${this.structId}`;
    this.destroyLandAnimationContainerId = `${this.idPrefix}destroyLandAnimation-${this.structId}`;
    this.destroyWaterAnimationContainerId = `${this.idPrefix}destroyWaterAnimation-${this.structId}`;

    this.attackPrimaryWeaponAnimationContainerId = `${this.idPrefix}attackPrimaryWeaponAnimation-${this.structId}`;
    this.attackSecondaryWeaponAnimationContainerId = `${this.idPrefix}attackSecondaryWeaponAnimation-${this.structId}`;

    this.activeLoopContainerId = `${this.idPrefix}activeLoop-${this.structId}`;
    this.structStillContainerId = `${this.idPrefix}structStill-${this.structId}`;
  }

  getLayerZIndex() {
    this.layerZIndex++;
    return this.layerZIndex;
  }

  hideStructStill() {
    const structStillContainer = document.getElementById(this.structStillContainerId);

    if (!structStillContainer) {
      return;
    }

    const activeLoopAnimation = this.lottieCustomPlayer.getAnimation(ANIMATION.NAMES.ACTIVE_LOOP);

    if (activeLoopAnimation) {
      activeLoopAnimation.stop();
    }

    structStillContainer.classList.add('invisible');
  }

  showStructStill() {
    const structStillContainer = document.getElementById(this.structStillContainerId);

    if (!structStillContainer) {
      return;
    }

    if (this.structType.hasOnlineProcess()) {

      const struct = this.structManager.getStructById(this.structId);
      const activeLoopAnimation = this.lottieCustomPlayer.getAnimation(ANIMATION.NAMES.ACTIVE_LOOP);

      if (struct && struct.isOnline()) {
        structStillContainer.classList.add('invisible');
        this.lottieCustomPlayer.play(ANIMATION.NAMES.ACTIVE_LOOP);
      } else {
        activeLoopAnimation.stop();
        structStillContainer.classList.remove('invisible');
      }
    } else {
      structStillContainer.classList.remove('invisible');
    }
  }

  /**
   * @param {boolean} isActive whether the struct should be rendered in a stealth-active state
   */
  setStealthActive(isActive) {
    const structStillContainer = document.getElementById(this.structStillContainerId);
    if (!structStillContainer) {
      return;
    }

    if (this.structType.type === STRUCT_TYPES.SUBMERSIBLE) {
      structStillContainer.innerHTML = this.renderStructStillInnerHTML(
        null,
        isActive
      );
    } else {
      if (isActive) {
        structStillContainer.classList.add('struct-stealth-active');
      } else {
        structStillContainer.classList.remove('struct-stealth-active');
      }
    }
  }

  /**
   * Render the struct still HTML using either an explicit health value or, when
   * none is provided, the struct's current health from gameState. The override
   * is used during multi-source attack sequences where gameState already holds
   * the final health but the visual should reflect the per-animation partial
   * state.
   *
   * @param {number|null} healthOverride
   * @param {boolean} isHidden
   * @return {string}
   */
  renderStructStillInnerHTML(healthOverride = null, isHidden = false) {
    const struct = this.structManager.getStructById(this.structId);
    if (!struct) {
      return '';
    }
    const structStill = this.structStillBuilder.build(this.structType);
    const health = (healthOverride !== null && healthOverride !== undefined)
      ? healthOverride
      : struct.health;
    const variantOverride = (isHidden && this.structType.type === STRUCT_TYPES.SUBMERSIBLE)
      ? STRUCT_STILL_LAYERS.STRUCT_VARIANT_HIDDEN
      : '';
    return structStill.renderHTML(health, variantOverride);
  }

  /**
   * Refresh only the struct still image, preserving any state classes (e.g.
   * struct-stealth-active) on the container and leaving all other animation
   * layers untouched. Pass `healthOverride` to render a specific (partial)
   * health value rather than the current gameState value.
   *
   * @param {number|null} healthOverride
   * @param {boolean} isHidden
   */
  updateStructStill(healthOverride = null, isHidden = false) {
    const structStillContainer = document.getElementById(this.structStillContainerId);
    if (!structStillContainer) {
      return;
    }
    structStillContainer.innerHTML = this.renderStructStillInnerHTML(healthOverride, isHidden);
  }

  /**
   * @param {boolean} showStructStillDuringAnimation
   * @param {boolean} showStructStillAfterAnimation
   */
  preparePlaybackState(
    showStructStillDuringAnimation = false,
    showStructStillAfterAnimation = true
  ) {
    this.showStructStillAfterAnimation = showStructStillAfterAnimation;
    this.lottieCustomPlayer.hideAll();

    if (showStructStillDuringAnimation) {
      this.showStructStill();
    } else {
      this.hideStructStill();
    }
  }

  resetAnimationCallbacks() {
    for (let i = 0; i < this.lottieCustomPlayer.animations.length; i++) {
      this.lottieCustomPlayer.animations[i].onCompleteCallback = () => {};
    }
  }

  /**
   * @param {string[]} animationNames
   * @param {object} options optional values from the originating AnimationEvent;
   * `healthAfter` is read here to drive partial-state still/HUD rendering for
   * multi-source attack sequences (where gameState already holds the final
   * post-attack value but the visual should reflect this animation's partial
   * snapshot)
   */
  prepareAnimationLifecycle(animationNames, options = {}) {
    this.resetAnimationCallbacks();

    let pendingCount = animationNames.length;

    const healthAfter = (options && options.healthAfter !== undefined && options.healthAfter !== null)
      ? parseInt('' + options.healthAfter)
      : null;

    for (let i = 0; i < animationNames.length; i++) {
      const animationName = animationNames[i];
      const animation = this.lottieCustomPlayer.getAnimation(animationName);

      if (!animation) {
        throw new Error(`Missing animation "${animationName}" for struct ${this.structId}`);
      }

      animation.onCompleteCallback = () => {
        let isHidden = false;
        if (animationName === ANIMATION.NAMES.STEALTH.ACTIVATE) {
          isHidden = true;
          this.setStealthActive(true);
        } else if (animationName === ANIMATION.NAMES.STEALTH.DEACTIVATE) {
          this.setStealthActive(false);
        }

        pendingCount--;
        if (pendingCount === 0) {
          this.updateStructStill(healthAfter, isHidden);
          if (this.showStructStillAfterAnimation) {
            this.showStructStill();
          }
          if (typeof this.onAnimationsComplete === 'function') {
            this.onAnimationsComplete();
          }
          if (this.dispatchAnimationEnd) {
            window.dispatchEvent(new AnimationEndEvent(
              animationName,
              this.structId,
              this.mapId,
              healthAfter
            ));
          }
        }
      };
    }
  }

  /**
   * @param {string[]} animationNames
   * @param {boolean} showStructStillDuringAnimation whether or not to show the still struct image while the animation plays
   * @param {boolean} showStructStillAfterAnimation whether or not the still struct image should still be shown after the animations ends
   * @param {object} options the originating AnimationEvent's options (e.g. healthAfter)
   */
  play(
    animationNames,
    showStructStillDuringAnimation = false,
    showStructStillAfterAnimation = true,
    options = {}
  ) {
    this.preparePlaybackState(
      showStructStillDuringAnimation,
      showStructStillAfterAnimation
    );
    this.prepareAnimationLifecycle(animationNames, options);

    for (let i = 0; i < animationNames.length; i++) {
      this.lottieCustomPlayer.play(animationNames[i]);
    }
  }

  /**
   * @param {string[]} animationNames the names of the animations to play after initialization
   * @param {boolean} showStructStillDuringAnimation whether or not to show the still struct image while the animation plays
   * @param {boolean} showStructStillAfterAnimation whether or not the still struct image should still be shown after the animations ends
   * @param {object} options the originating AnimationEvent's options (e.g. healthAfter)
   */
  init(
    animationNames = [],
    showStructStillDuringAnimation = false,
    showStructStillAfterAnimation = true,
    options = {}
  ) {
    this.registerAnimations();

    if (animationNames.length) {
      this.preparePlaybackState(
        showStructStillDuringAnimation,
        showStructStillAfterAnimation
      );
      this.prepareAnimationLifecycle(animationNames, options);
    } else {
      this.showStructStillAfterAnimation = true;
      this.lottieCustomPlayer.hideAll();
      this.showStructStill();
    }

    this.lottieCustomPlayer.init(animationNames);
  }

  renderMoveHTML() {
    if (!this.structType.isMovable()) {
      return '';
    }

    return `
      <div id="${this.moveArriveAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
      <div id="${this.moveDepartAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
    `;
  }

  renderStealthHTML() {
    if (!this.structType.stealth_systems) {
      return '';
    }

    return `
      <div id="${this.stealthActivateAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
      <div id="${this.stealthDeactivateAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
    `;
  }

  renderEvadeHTML() {
    if (!this.structType.hasDefensiveManeuver() && !this.structType.hasSignalJamming()) {
      return '';
    }

    return `
      <div id="${this.evadeAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
    `;
  }

  renderAttackPrimaryWeaponHTML() {
    if (!this.structType.hasPrimaryWeapon() && this.structType.type !== STRUCT_TYPES.PLANETARY_DEFENSE_CANNON) {
      return '';
    }

    return `
      <div id="${this.attackPrimaryWeaponAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
    `;
  }

  renderAttackSecondaryWeaponHTML() {
    if (!this.structType.hasSecondaryWeapon()) {
      return '';
    }

    return `
      <div id="${this.attackSecondaryWeaponAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
    `;
  }

  renderActiveLoopHTML() {
    if (!this.structType.hasOnlineProcess()) {
      return '';
    }

    return `
      <div id="${this.activeLoopContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
    `;
  }

  renderHTML() {
    const struct = this.structManager.getStructById(this.structId);
    const isHidden = struct && struct.isHidden();
    const stealthClass = isHidden && this.structType.type !== STRUCT_TYPES.SUBMERSIBLE
      ? ' struct-stealth-active'
      : '';

    return `
      <div class="map-struct-viewer">
        <div id="${this.structStillContainerId}" class="map-struct-viewer-layer${stealthClass}" style="z-index:${this.getLayerZIndex()}">${this.renderStructStillInnerHTML(null, isHidden)}</div>

        ${this.renderActiveLoopHTML()}
        ${this.renderAttackSecondaryWeaponHTML()}
        ${this.renderAttackPrimaryWeaponHTML()}

        <div id="${this.destroyWaterAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.destroyLandAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.destroyAirAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.destroySpaceAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>

        <div id="${this.shakeHorizontalGatlingLastAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.shakeHorizontalGatlingFirstAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.shakeHorizontalDefaultLastAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.shakeHorizontalDefaultFirstAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.shakeAngledUpGatlingLastAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.shakeAngledUpGatlingFirstAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.shakeAngledUpDefaultLastAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.shakeAngledUpDefaultFirstAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.shakeAngledDownDefaultLastAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.shakeAngledDownDefaultFirstAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}"></div>

        ${this.renderEvadeHTML()}

        <div id="${this.impactHorizontalTorpedoAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.impactHorizontalMissileAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.impactHorizontalGatlingAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.impactHorizontalCannonAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.impactAngledUpCannonAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.impactAngledUpGatlingAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.impactAngledUpTorpedoAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.impactAngledUpMissileAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.impactAngledDownTorpedoAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.impactAngledDownMissileAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.impactAngledDownCannonAnimationContainerId}" class="map-struct-viewer-layer sui-flip-horizontal" style="z-index:${this.getLayerZIndex()}"></div>

        ${this.renderStealthHTML()}
        ${this.renderMoveHTML()}

        <div id="${this.deploymentWaterAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.deploymentLandAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.deploymentAirAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}" style="z-index:${this.getLayerZIndex()}"></div>
        <div id="${this.deploymentSpaceAnimationContainerId}" class="map-struct-viewer-layer" style="z-index:${this.getLayerZIndex()}" style="z-index:${this.getLayerZIndex()}"></div>
      </div>
    `;
  }

  registerAnimations() {
    this.registerStandardAnimations();
    this.registerMoveAnimations();
    this.registerStealthAnimations();
    this.registerEvadeAnimation();
    this.registerAttackPrimaryWeaponAnimation();
    this.registerAttackSecondaryWeaponAnimation();
    this.registerActiveLoopAnimation();
  }

  /**
   * Tear down all lottie players owned by this viewer. Must be called before
   * the viewer is dereferenced (e.g. when its tile is cleared or the viewer
   * is replaced), otherwise lottie-web's internal animation registry keeps
   * the JSON, image bitmaps, rAF subscription, and DOM listeners alive.
   */
  destroy() {
    this.lottieCustomPlayer.destroyAll();
  }

  registerStandardAnimations() {
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.DEPLOYMENT.SPACE,
      this.structId,
      this.structType,
      this.deploymentSpaceAnimationContainerId,
      {
        container: document.getElementById(this.deploymentSpaceAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/deployment_space/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.DEPLOYMENT.AIR,
      this.structId,
      this.structType,
      this.deploymentAirAnimationContainerId,
      {
        container: document.getElementById(this.deploymentAirAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/deployment_air/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.DEPLOYMENT.LAND,
      this.structId,
      this.structType,
      this.deploymentLandAnimationContainerId,
      {
        container: document.getElementById(this.deploymentLandAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/deployment_land/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.DEPLOYMENT.WATER,
      this.structId,
      this.structType,
      this.deploymentWaterAnimationContainerId,
      {
        container: document.getElementById(this.deploymentWaterAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/deployment_water/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.IMPACT.ANGLED.DOWN.CANNON,
      this.structId,
      this.structType,
      this.impactAngledDownCannonAnimationContainerId,
      {
        container: document.getElementById(this.impactAngledDownCannonAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/impact_angled_down_cannon/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.IMPACT.ANGLED.DOWN.MISSILE,
      this.structId,
      this.structType,
      this.impactAngledDownMissileAnimationContainerId,
      {
        container: document.getElementById(this.impactAngledDownMissileAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/impact_angled_down_missile/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.IMPACT.ANGLED.DOWN.TORPEDO,
      this.structId,
      this.structType,
      this.impactAngledDownTorpedoAnimationContainerId,
      {
        container: document.getElementById(this.impactAngledDownTorpedoAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/impact_angled_down_torpedo/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.IMPACT.ANGLED.UP.CANNON,
      this.structId,
      this.structType,
      this.impactAngledUpCannonAnimationContainerId,
      {
        container: document.getElementById(this.impactAngledUpCannonAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/impact_angled_up_cannon/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.IMPACT.ANGLED.UP.MISSILE,
      this.structId,
      this.structType,
      this.impactAngledUpMissileAnimationContainerId,
      {
        container: document.getElementById(this.impactAngledUpMissileAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/impact_angled_up_missile/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.IMPACT.ANGLED.UP.TORPEDO,
      this.structId,
      this.structType,
      this.impactAngledUpTorpedoAnimationContainerId,
      {
        container: document.getElementById(this.impactAngledUpTorpedoAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/impact_angled_up_torpedo/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.IMPACT.ANGLED.UP.GATLING,
      this.structId,
      this.structType,
      this.impactAngledUpGatlingAnimationContainerId,
      {
        container: document.getElementById(this.impactAngledUpGatlingAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/impact_angled_up_gatling/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.IMPACT.HORIZONTAL.CANNON,
      this.structId,
      this.structType,
      this.impactHorizontalCannonAnimationContainerId,
      {
        container: document.getElementById(this.impactHorizontalCannonAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/impact_horizontal_cannon/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.IMPACT.HORIZONTAL.GATLING,
      this.structId,
      this.structType,
      this.impactHorizontalGatlingAnimationContainerId,
      {
        container: document.getElementById(this.impactHorizontalGatlingAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/impact_horizontal_gatling/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.IMPACT.HORIZONTAL.MISSILE,
      this.structId,
      this.structType,
      this.impactHorizontalMissileAnimationContainerId,
      {
        container: document.getElementById(this.impactHorizontalMissileAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/impact_horizontal_missile/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.IMPACT.HORIZONTAL.TORPEDO,
      this.structId,
      this.structType,
      this.impactHorizontalTorpedoAnimationContainerId,
      {
        container: document.getElementById(this.impactHorizontalTorpedoAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/impact_horizontal_torpedo/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.SHAKE.ANGLED.DOWN.DEFAULT.FIRST,
      this.structId,
      this.structType,
      this.shakeAngledDownDefaultFirstAnimationContainerId,
      {
        container: document.getElementById(this.shakeAngledDownDefaultFirstAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/shake_angled_down_default_first/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.SHAKE.ANGLED.DOWN.DEFAULT.LAST,
      this.structId,
      this.structType,
      this.shakeAngledDownDefaultLastAnimationContainerId,
      {
        container: document.getElementById(this.shakeAngledDownDefaultLastAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/shake_angled_down_default_last/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.SHAKE.ANGLED.UP.DEFAULT.FIRST,
      this.structId,
      this.structType,
      this.shakeAngledUpDefaultFirstAnimationContainerId,
      {
        container: document.getElementById(this.shakeAngledUpDefaultFirstAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/shake_angled_up_default_first/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.SHAKE.ANGLED.UP.DEFAULT.LAST,
      this.structId,
      this.structType,
      this.shakeAngledUpDefaultLastAnimationContainerId,
      {
        container: document.getElementById(this.shakeAngledUpDefaultLastAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/shake_angled_up_default_last/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.SHAKE.ANGLED.UP.GATLING.FIRST,
      this.structId,
      this.structType,
      this.shakeAngledUpGatlingFirstAnimationContainerId,
      {
        container: document.getElementById(this.shakeAngledUpGatlingFirstAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/shake_angled_up_gatling_first/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.SHAKE.ANGLED.UP.GATLING.LAST,
      this.structId,
      this.structType,
      this.shakeAngledUpGatlingLastAnimationContainerId,
      {
        container: document.getElementById(this.shakeAngledUpGatlingLastAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/shake_angled_up_gatling_last/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.SHAKE.HORIZONTAL.DEFAULT.FIRST,
      this.structId,
      this.structType,
      this.shakeHorizontalDefaultFirstAnimationContainerId,
      {
        container: document.getElementById(this.shakeHorizontalDefaultFirstAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/shake_horizontal_default_first/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.SHAKE.HORIZONTAL.DEFAULT.LAST,
      this.structId,
      this.structType,
      this.shakeHorizontalDefaultLastAnimationContainerId,
      {
        container: document.getElementById(this.shakeHorizontalDefaultLastAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/shake_horizontal_default_last/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.SHAKE.HORIZONTAL.GATLING.FIRST,
      this.structId,
      this.structType,
      this.shakeHorizontalGatlingFirstAnimationContainerId,
      {
        container: document.getElementById(this.shakeHorizontalGatlingFirstAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/shake_horizontal_gatling_first/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.SHAKE.HORIZONTAL.GATLING.LAST,
      this.structId,
      this.structType,
      this.shakeHorizontalGatlingLastAnimationContainerId,
      {
        container: document.getElementById(this.shakeHorizontalGatlingLastAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/shake_horizontal_gatling_last/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.DESTROY.SPACE,
      this.structId,
      this.structType,
      this.destroySpaceAnimationContainerId,
      {
        container: document.getElementById(this.destroySpaceAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/destroy_space/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.DESTROY.AIR,
      this.structId,
      this.structType,
      this.destroyAirAnimationContainerId,
      {
        container: document.getElementById(this.destroyAirAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/destroy_air/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.DESTROY.LAND,
      this.structId,
      this.structType,
      this.destroyLandAnimationContainerId,
      {
        container: document.getElementById(this.destroyLandAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/destroy_land/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.DESTROY.WATER,
      this.structId,
      this.structType,
      this.destroyWaterAnimationContainerId,
      {
        container: document.getElementById(this.destroyWaterAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/destroy_water/data.json`
      }
    ));
  }

  registerMoveAnimations() {
    if (!this.structType.isMovable()) {
      return;
    }

    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.MOVE.ARRIVE,
      this.structId,
      this.structType,
      this.moveArriveAnimationContainerId,
      {
        container: document.getElementById(this.moveArriveAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/move_arrive/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.MOVE.DEPART,
      this.structId,
      this.structType,
      this.moveDepartAnimationContainerId,
      {
        container: document.getElementById(this.moveDepartAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/move_depart/data.json`
      }
    ));
  }

  registerStealthAnimations() {
    if (!this.structType.stealth_systems) {
      return;
    }

    const structTypeDirectory = this.caseConverter.convert(this.structType.type, LOWER_SNAKE_CASE);

    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.STEALTH.ACTIVATE,
      this.structId,
      this.structType,
      this.stealthActivateAnimationContainerId,
      {
        container: document.getElementById(this.stealthActivateAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/stealth_activate/${structTypeDirectory}/data.json`
      }
    ));
    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.STEALTH.DEACTIVATE,
      this.structId,
      this.structType,
      this.stealthDeactivateAnimationContainerId,
      {
        container: document.getElementById(this.stealthDeactivateAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/stealth_deactivate/${structTypeDirectory}/data.json`
      }
    ));
  }

  registerEvadeAnimation() {
    if (this.structType.hasDefensiveManeuver()) {

      this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
        this.gameState,
        this.structManager,
        ANIMATION.NAMES.EVADE,
        this.structId,
        this.structType,
        this.evadeAnimationContainerId,
        {
          container: document.getElementById(this.evadeAnimationContainerId),
          renderer: 'svg',
          loop: false,
          autoplay: false,
          path: `/lottie/defensive_maneuver/data.json`
        }
      ));

    } else if (this.structType.hasSignalJamming()) {

      this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
        this.gameState,
        this.structManager,
        ANIMATION.NAMES.EVADE,
        this.structId,
        this.structType,
        this.evadeAnimationContainerId,
        {
          container: document.getElementById(this.evadeAnimationContainerId),
          renderer: 'svg',
          loop: false,
          autoplay: false,
          path: `/lottie/signal_jamming/data.json`
        }
      ));

    }
  }

  registerAttackPrimaryWeaponAnimation() {
    if (!this.structType.hasPrimaryWeapon() && this.structType.type !== STRUCT_TYPES.PLANETARY_DEFENSE_CANNON) {
      return;
    }

    const structTypeDirectory = this.caseConverter.convert(this.structType.type, LOWER_SNAKE_CASE);

    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.ATTACK.PRIMARY_WEAPON,
      this.structId,
      this.structType,
      this.attackPrimaryWeaponAnimationContainerId,
      {
        container: document.getElementById(this.attackPrimaryWeaponAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/attack_primary_weapon/${structTypeDirectory}/data.json`
      }
    ));
  }

  registerAttackSecondaryWeaponAnimation() {
    if (!this.structType.hasSecondaryWeapon()) {
      return;
    }

    const structTypeDirectory = this.caseConverter.convert(this.structType.type, LOWER_SNAKE_CASE);

    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.ATTACK.SECONDARY_WEAPON,
      this.structId,
      this.structType,
      this.attackSecondaryWeaponAnimationContainerId,
      {
        container: document.getElementById(this.attackSecondaryWeaponAnimationContainerId),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/attack_secondary_weapon/${structTypeDirectory}/data.json`
      }
    ));
  }

  registerActiveLoopAnimation() {
    if (!this.structType.hasOnlineProcess()) {
      return;
    }

    const structTypeDirectory = this.caseConverter.convert(this.structType.type, LOWER_SNAKE_CASE);

    this.lottieCustomPlayer.registerAnimation(new MapStructLottieAnimationSVG(
      this.gameState,
      this.structManager,
      ANIMATION.NAMES.ACTIVE_LOOP,
      this.structId,
      this.structType,
      this.activeLoopContainerId,
      {
        container: document.getElementById(this.activeLoopContainerId),
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: `/lottie/active_loop/${structTypeDirectory}/data.json`
      }
    ));
  }
}
