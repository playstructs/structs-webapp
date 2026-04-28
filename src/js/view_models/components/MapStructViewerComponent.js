import {ANIMATION} from "../../constants/AnimationConstants";
import {LottieCustomPlayer} from "./LottieCustomPlayer";
import {MapStructLottieAnimationSVG} from "./MapStructLottieAnimationSVG";
import {StructStillBuilder} from "../../builders/StructStillBuilder";
import {CaseConverter, LOWER_SNAKE_CASE} from "../../util/CaseConverter";
import {AnimationEndEvent} from "../../events/AnimationEndEvent";

export class MapStructViewerComponent {

  /**
   * @param {GameState} gameState
   * @param {StructManager} structManager
   * @param {string} structId
   * @param {number} structTypeId
   * @param {string|null} mapId the id of the map that owns this viewer; included on
   * dispatched AnimationEndEvents so listeners can filter by their own map
   */
  constructor(gameState, structManager, structId, structTypeId, mapId = null) {
    this.gameState = gameState;
    this.structManager = structManager;
    this.structId = structId;
    this.structTypeId = structTypeId;
    this.mapId = mapId;
    this.layerZIndex = 0;

    this.lottieCustomPlayer = new LottieCustomPlayer();
    this.caseConverter = new CaseConverter();
    this.structStillBuilder = new StructStillBuilder(this.gameState);

    this.showStructStillAfterAnimation = true;
    this.structType = this.gameState.structTypes.getStructTypeById(structTypeId);

    this.deploymentSpaceAnimationContainerId = `deploymentSpaceAnimation-${this.structId}`;
    this.deploymentAirAnimationContainerId = `deploymentAirAnimation-${this.structId}`;
    this.deploymentLandAnimationContainerId = `deploymentLandAnimation-${this.structId}`;
    this.deploymentWaterAnimationContainerId = `deploymentWaterAnimation-${this.structId}`;

    this.moveArriveAnimationContainerId = `moveArriveAnimation-${this.structId}`;
    this.moveDepartAnimationContainerId = `moveDepartAnimation-${this.structId}`;

    this.stealthActivateAnimationContainerId = `stealthActivateAnimation-${this.structId}`;
    this.stealthDeactivateAnimationContainerId = `stealthDeactivateAnimation-${this.structId}`;

    this.impactAngledDownCannonAnimationContainerId = `impactAngledDownCannonAnimation-${this.structId}`;
    this.impactAngledDownMissileAnimationContainerId = `impactAngledDownMissileAnimation-${this.structId}`;
    this.impactAngledDownTorpedoAnimationContainerId = `impactAngledDownTorpedoAnimation-${this.structId}`;
    this.impactAngledUpMissileAnimationContainerId = `impactAngledUpMissileAnimation-${this.structId}`;
    this.impactAngledUpTorpedoAnimationContainerId = `impactAngledUpTorpedoAnimation-${this.structId}`;
    this.impactAngledUpGatlingAnimationContainerId = `impactAngledUpGatlingAnimation-${this.structId}`;
    this.impactHorizontalCannonAnimationContainerId = `impactHorizontalCannonAnimation-${this.structId}`;
    this.impactHorizontalGatlingAnimationContainerId = `impactHorizontalGatlingAnimation-${this.structId}`;
    this.impactHorizontalMissileAnimationContainerId = `impactHorizontalMissileAnimation-${this.structId}`;
    this.impactHorizontalTorpedoAnimationContainerId = `impactHorizontalTorpedoAnimation-${this.structId}`;

    this.evadeAnimationContainerId = `evadeAnimation-${this.structId}`;

    this.shakeAngledDownDefaultFirstAnimationContainerId = `shakeAngledDownDefaultFirstAnimation-${this.structId}`;
    this.shakeAngledDownDefaultLastAnimationContainerId = `shakeAngledDownDefaultLastAnimation-${this.structId}`;
    this.shakeAngledUpDefaultFirstAnimationContainerId = `shakeAngledUpDefaultFirstAnimation-${this.structId}`;
    this.shakeAngledUpDefaultLastAnimationContainerId = `shakeAngledUpDefaultLastAnimation-${this.structId}`;
    this.shakeAngledUpGatlingFirstAnimationContainerId = `shakeAngledUpGatlingFirstAnimation-${this.structId}`;
    this.shakeAngledUpGatlingLastAnimationContainerId = `shakeAngledUpGatlingLastAnimation-${this.structId}`;
    this.shakeHorizontalDefaultFirstAnimationContainerId = `shakeHorizontalDefaultFirstAnimation-${this.structId}`;
    this.shakeHorizontalDefaultLastAnimationContainerId = `shakeHorizontalDefaultLastAnimation-${this.structId}`;
    this.shakeHorizontalGatlingFirstAnimationContainerId = `shakeHorizontalGatlingFirstAnimation-${this.structId}`;
    this.shakeHorizontalGatlingLastAnimationContainerId = `shakeHorizontalGatlingLastAnimation-${this.structId}`;

    this.destroySpaceAnimationContainerId = `destroySpaceAnimation-${this.structId}`;
    this.destroyAirAnimationContainerId = `destroyAirAnimation-${this.structId}`;
    this.destroyLandAnimationContainerId = `destroyLandAnimation-${this.structId}`;
    this.destroyWaterAnimationContainerId = `destroyWaterAnimation-${this.structId}`;

    this.attackPrimaryWeaponAnimationContainerId = `attackPrimaryWeaponAnimation-${this.structId}`;
    this.attackSecondaryWeaponAnimationContainerId = `attackSecondaryWeaponAnimation-${this.structId}`;

    this.structStillContainerId = `structStill-${this.structId}`;
  }

  getLayerZIndex() {
    this.layerZIndex++;
    return this.layerZIndex;
  }

  hideStructStill() {
    document.getElementById(this.structStillContainerId).classList.add('invisible');
  }

  showStructStill() {
    document.getElementById(this.structStillContainerId).classList.remove('invisible');
  }

  /**
   * @param {boolean} isActive whether the struct should be rendered in a stealth-active state
   */
  setStealthActive(isActive) {
    const structStillContainer = document.getElementById(this.structStillContainerId);
    if (!structStillContainer) {
      return;
    }
    if (isActive) {
      structStillContainer.classList.add('struct-stealth-active');
    } else {
      structStillContainer.classList.remove('struct-stealth-active');
    }
  }

  /**
   * Render the struct still HTML for this struct's current game state.
   * @return {string}
   */
  renderStructStillInnerHTML() {
    const struct = this.structManager.getStructById(this.structId);
    if (!struct) {
      return '';
    }
    const structStill = this.structStillBuilder.build(this.structType);
    return structStill.renderHTML(struct.health);
  }

  /**
   * Refresh only the struct still image from current game state, preserving any
   * state classes (e.g. struct-stealth-active) on the container and leaving all
   * other animation layers untouched.
   */
  updateStructStill() {
    const structStillContainer = document.getElementById(this.structStillContainerId);
    if (!structStillContainer) {
      return;
    }
    structStillContainer.innerHTML = this.renderStructStillInnerHTML();
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
   */
  prepareAnimationLifecycle(animationNames) {
    this.resetAnimationCallbacks();

    let pendingCount = animationNames.length;

    for (let i = 0; i < animationNames.length; i++) {
      const animationName = animationNames[i];
      const animation = this.lottieCustomPlayer.getAnimation(animationName);

      if (!animation) {
        throw new Error(`Missing animation "${animationName}" for struct ${this.structId}`);
      }

      animation.onCompleteCallback = () => {
        if (animationName === ANIMATION.NAMES.STEALTH.ACTIVATE) {
          this.setStealthActive(true);
        } else if (animationName === ANIMATION.NAMES.STEALTH.DEACTIVATE) {
          this.setStealthActive(false);
        }

        pendingCount--;
        if (pendingCount === 0) {
          this.updateStructStill();
          if (this.showStructStillAfterAnimation) {
            this.showStructStill();
          }
          window.dispatchEvent(new AnimationEndEvent(animationName, this.structId, this.mapId));
        }
      };
    }
  }

  /**
   * @param {string[]} animationNames
   * @param {boolean} showStructStillDuringAnimation whether or not to show the still struct image while the animation plays
   * @param {boolean} showStructStillAfterAnimation whether or not the still struct image should still be shown after the animations ends
   */
  play(
    animationNames,
    showStructStillDuringAnimation = false,
    showStructStillAfterAnimation = true
  ) {
    this.preparePlaybackState(
      showStructStillDuringAnimation,
      showStructStillAfterAnimation
    );
    this.prepareAnimationLifecycle(animationNames);

    for (let i = 0; i < animationNames.length; i++) {
      this.lottieCustomPlayer.play(animationNames[i]);
    }
  }

  /**
   * @param {string[]} animationNames the names of the animations to play after initialization
   * @param {boolean} showStructStillDuringAnimation whether or not to show the still struct image while the animation plays
   * @param {boolean} showStructStillAfterAnimation whether or not the still struct image should still be shown after the animations ends
   */
  init(
    animationNames = [],
    showStructStillDuringAnimation = false,
    showStructStillAfterAnimation = true
  ) {
    this.registerAnimations();

    if (animationNames.length) {
      this.preparePlaybackState(
        showStructStillDuringAnimation,
        showStructStillAfterAnimation
      );
      this.prepareAnimationLifecycle(animationNames);
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
    if (!this.structType.hasPrimaryWeapon()) {
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

  renderHTML() {
    const struct = this.structManager.getStructById(this.structId);
    const stealthClass = struct && struct.isHidden() ? ' struct-stealth-active' : '';

    return `
      <div class="map-struct-viewer">
        <div id="${this.structStillContainerId}" class="map-struct-viewer-layer${stealthClass}" style="z-index:${this.getLayerZIndex()}">${this.renderStructStillInnerHTML()}</div>

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
        path: `/lottie/stealth_activate/data.json`
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
        path: `/lottie/stealth_deactivate/data.json`
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
    if (!this.structType.hasPrimaryWeapon()) {
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
}
