import {ANIMATION} from "../constants/AnimationConstants";
import {AnimationEvent} from "../events/AnimationEvent";
import {CaseConverter, UPPER_SNAKE_CASE} from "../util/CaseConverter";
import {
  STRUCT_CATEGORIES,
  STRUCT_TYPES,
  STRUCT_UNIT_DEFENSES,
  STRUCT_WEAPON_SYSTEM
} from "../constants/StructConstants";
import {AMBITS} from "../constants/Ambits";
import {AnimationError} from "../errors/AnimationError";

export class AnimationEventFactory {

  constructor() {
    this.caseConverter = new CaseConverter();
  }

  /**
   * @param {string} structId the id of the struct that activated stealth mode
   * @return {AnimationEvent} an event specifying the animation to play when stealth mode is activated
   */
  makeStealthActivateAnimationEvent(structId) {
    return new AnimationEvent(
      structId,
      [ANIMATION.NAMES.STEALTH.ACTIVATE]
    );
  }

  /**
   * @param {string} structId the id of the struct that deactivated stealth mode
   * @return {AnimationEvent} an event specifying the animation to play when stealth mode is deactivated
   */
  makeStealthDeactivateAnimationEvent(structId) {
    return new AnimationEvent(
      structId,
      [ANIMATION.NAMES.STEALTH.DEACTIVATE]
    );
  }

  /**
   * @param {string} attackStructId the id of the attacking struct
   * @param {string} weaponSystem the weapon system being used by the attacking struct such as primaryWeapon, secondaryWeapon or planetaryDefenses
   * @return {AnimationEvent} an event specifying the animation to play for the attacking struct
   */
  makeAttackAnimationEvent(attackStructId, weaponSystem) {
    const weaponSystemFormatted = this.caseConverter.convert(weaponSystem, UPPER_SNAKE_CASE);
    return new AnimationEvent(
      attackStructId,
      [ANIMATION.NAMES.ATTACK[weaponSystemFormatted]]
    );
  }

  /**
   * @param {string} targetStructId the id of the struct being targeted
   * @param {string} attackStructType the StructType.type of the attacking struct
   * @param {string} attackStructOperatingAmbit the current ambit of the attacking struct
   * @param {string} weaponSystem the weapon system being used by the attacking struct such as primaryWeapon, secondaryWeapon or planetaryDefenses
   * @param {string} targetStructType the StructType.type of the struct being targeted
   * @param {string} targetStructOperatingAmbit the current ambit of the struct being targeted
   * @param {string} targetStructCategory whether the struct being targeted is fleet or planetary
   * @param {string|number} targetHealthMax the max health of the struct being targeted
   * @param {string|number} targetHealthBefore the health of the struct being targeted before receiving damage
   * @param {string|number} targetHealthAfter the health of the struct being targeted after receiving damage
   * @param {boolean} evaded whether or not the struct being targeted evaded the attack
   * @param {string} evadedCause the unit defenses used to evade the attack
   * @return {AnimationEvent|null} an event specifying the animation to play for the target struct
   */
  makeReceiveDamageAnimationEvent(
    targetStructId,
    attackStructType,
    attackStructOperatingAmbit,
    weaponSystem,
    targetStructType,
    targetStructOperatingAmbit,
    targetStructCategory,
    targetHealthMax,
    targetHealthBefore,
    targetHealthAfter,
    evaded = false,
    evadedCause = ''
  ) {

    attackStructOperatingAmbit = attackStructOperatingAmbit.toUpperCase();
    targetStructOperatingAmbit = targetStructOperatingAmbit.toUpperCase();
    targetHealthMax = parseInt('' + targetHealthMax);
    targetHealthBefore = parseInt('' + targetHealthBefore);
    targetHealthAfter = parseInt('' + targetHealthAfter);

    const options = {
      targetHealthMax: targetHealthMax,
      targetHealthBefore: targetHealthBefore,
      targetHealthAfter: targetHealthAfter,
      playCount: evaded ? 1 : (targetHealthBefore - targetHealthAfter),
    };

    // --- Evasion cases ---

    if (evaded && evadedCause === STRUCT_UNIT_DEFENSES.SIGNAL_JAMMING) {
      return new AnimationEvent(
        targetStructId,
        [
          ANIMATION.NAMES.EVADE,
        ],
        false,
        true,
        { ...options, projectile: ANIMATION.PROJECTILES.TORPEDO }
      );
    }

    if (evaded) {
      return new AnimationEvent(
        targetStructId,
        [ANIMATION.NAMES.EVADE],
        false,
        true,
        options
      );
    }

    let animationNames = [];
    let showStructStillDuringAnimation = (targetStructCategory === STRUCT_CATEGORIES.PLANET);
    let firstOrLast = (targetHealthAfter > 0) ? ANIMATION.NAMES.FIRST : ANIMATION.NAMES.LAST;
    let projectile = '';

    // --- Horizontal cases ---

    // - Horizontal Cannon -
    if (
      (
        attackStructType === STRUCT_TYPES.BATTLESHIP
        && attackStructOperatingAmbit === AMBITS.SPACE
        && targetStructOperatingAmbit === AMBITS.SPACE
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === STRUCT_TYPES.TANK
        && attackStructOperatingAmbit === AMBITS.LAND
        && targetStructOperatingAmbit === AMBITS.LAND
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(ANIMATION.NAMES.IMPACT.HORIZONTAL.CANNON);

      if (!showStructStillDuringAnimation) {
        animationNames.push(ANIMATION.NAMES.SHAKE.HORIZONTAL.DEFAULT[firstOrLast]);
      }

      projectile = ANIMATION.PROJECTILES.CANNON;
    }

    // - Horizontal Missile -
    else if (
      (
        attackStructType === STRUCT_TYPES.STARFIGHTER
        && attackStructOperatingAmbit === AMBITS.SPACE
        && targetStructOperatingAmbit === AMBITS.SPACE
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === STRUCT_TYPES.FRIGATE
        && attackStructOperatingAmbit === AMBITS.SPACE
        && targetStructOperatingAmbit === AMBITS.SPACE
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === STRUCT_TYPES.PURSUIT_FIGHTER
        && attackStructOperatingAmbit === AMBITS.AIR
        && targetStructOperatingAmbit === AMBITS.AIR
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === STRUCT_TYPES.COMMAND_SHIP
        && attackStructOperatingAmbit === targetStructOperatingAmbit
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(ANIMATION.NAMES.IMPACT.HORIZONTAL.MISSILE);

      if (!showStructStillDuringAnimation) {
        animationNames.push(ANIMATION.NAMES.SHAKE.HORIZONTAL.DEFAULT[firstOrLast]);
      }

      projectile = ANIMATION.PROJECTILES.MISSILE;
    }

    // - Horizontal Torpedo -
    else if (
      attackStructType === STRUCT_TYPES.HIGH_ALTITUDE_INTERCEPTOR
      && attackStructOperatingAmbit === AMBITS.AIR
      && targetStructOperatingAmbit === AMBITS.AIR
      && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
    ) {
      animationNames.push(ANIMATION.NAMES.IMPACT.HORIZONTAL.TORPEDO);

      if (!showStructStillDuringAnimation) {
        animationNames.push(ANIMATION.NAMES.SHAKE.HORIZONTAL.DEFAULT[firstOrLast]);
      }

      projectile = ANIMATION.PROJECTILES.TORPEDO;
    }

    // - Horizontal Gatling -
    else if (
      attackStructType === STRUCT_TYPES.STARFIGHTER
      && attackStructOperatingAmbit === AMBITS.SPACE
      && targetStructOperatingAmbit === AMBITS.SPACE
      && weaponSystem === STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON
    ) {
      animationNames.push(ANIMATION.NAMES.IMPACT.HORIZONTAL.GATLING);

      if (!showStructStillDuringAnimation) {
        animationNames.push(ANIMATION.NAMES.SHAKE.HORIZONTAL.GATLING[firstOrLast]);
      }

      projectile = ANIMATION.PROJECTILES.GATLING;
    }

    // --- Angled down cases ---

    // - Angled down missile -
    else if (
      (
        attackStructType === STRUCT_TYPES.CRUISER
        && attackStructOperatingAmbit === AMBITS.WATER
        && targetStructOperatingAmbit === AMBITS.LAND
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === STRUCT_TYPES.SUBMERSIBLE
        && attackStructOperatingAmbit === AMBITS.WATER
        && targetStructOperatingAmbit === AMBITS.WATER
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(ANIMATION.NAMES.IMPACT.ANGLED.DOWN.MISSILE);

      if (!showStructStillDuringAnimation) {
        animationNames.push(ANIMATION.NAMES.SHAKE.ANGLED.DOWN.DEFAULT[firstOrLast]);
      }

      projectile = ANIMATION.PROJECTILES.MISSILE;
    }

    // - Angled down torpedo -
    else if (
      (
        attackStructType === STRUCT_TYPES.DESTROYER
        && attackStructOperatingAmbit === AMBITS.WATER
        && targetStructOperatingAmbit === AMBITS.WATER
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === STRUCT_TYPES.STEALTH_BOMBER
        && attackStructOperatingAmbit === AMBITS.AIR
        && (
          targetStructOperatingAmbit === AMBITS.WATER
          || targetStructOperatingAmbit === AMBITS.LAND
        )
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(ANIMATION.NAMES.IMPACT.ANGLED.DOWN.TORPEDO);

      if (!showStructStillDuringAnimation) {
        animationNames.push(ANIMATION.NAMES.SHAKE.ANGLED.DOWN.DEFAULT[firstOrLast]);
      }

      projectile = ANIMATION.PROJECTILES.TORPEDO;
    }

    // - Angled down cannon -
    else if (
      (
        attackStructType === STRUCT_TYPES.MOBILE_ARTILLERY
        && attackStructOperatingAmbit === AMBITS.LAND
        && (
          targetStructOperatingAmbit === AMBITS.WATER
          || targetStructOperatingAmbit === AMBITS.LAND
        )
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === STRUCT_TYPES.BATTLESHIP
        && attackStructOperatingAmbit === AMBITS.SPACE
        && (
          targetStructOperatingAmbit === AMBITS.WATER
          || targetStructOperatingAmbit === AMBITS.LAND
        )
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(ANIMATION.NAMES.IMPACT.ANGLED.DOWN.CANNON);

      if (!showStructStillDuringAnimation) {
        animationNames.push(ANIMATION.NAMES.SHAKE.ANGLED.DOWN.DEFAULT[firstOrLast]);
      }

      projectile = ANIMATION.PROJECTILES.CANNON;
    }

    // --- Angled up cases ---

    // - Angled up missile -
    else if (
      (
        attackStructType === STRUCT_TYPES.SAM_LAUNCHER
        && attackStructOperatingAmbit === AMBITS.LAND
        && (
          targetStructOperatingAmbit === AMBITS.AIR
          || targetStructOperatingAmbit === AMBITS.SPACE
        )
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === STRUCT_TYPES.SUBMERSIBLE
        && attackStructOperatingAmbit === AMBITS.WATER
        && (
          targetStructOperatingAmbit === AMBITS.AIR
          || targetStructOperatingAmbit === AMBITS.SPACE
        )
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(ANIMATION.NAMES.IMPACT.ANGLED.UP.MISSILE);

      if (!showStructStillDuringAnimation) {
        animationNames.push(ANIMATION.NAMES.SHAKE.ANGLED.UP.DEFAULT[firstOrLast]);
      }

      projectile = ANIMATION.PROJECTILES.MISSILE;
    }

    // - Angled up torpedo -
    else if (
      (
        attackStructType === STRUCT_TYPES.DESTROYER
        && attackStructOperatingAmbit === AMBITS.WATER
        && targetStructOperatingAmbit === AMBITS.AIR
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === STRUCT_TYPES.HIGH_ALTITUDE_INTERCEPTOR
        && attackStructOperatingAmbit === AMBITS.AIR
        && targetStructOperatingAmbit === AMBITS.SPACE
        && weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(ANIMATION.NAMES.IMPACT.ANGLED.UP.TORPEDO);

      if (!showStructStillDuringAnimation) {
        animationNames.push(ANIMATION.NAMES.SHAKE.ANGLED.UP.DEFAULT[firstOrLast]);
      }

      projectile = ANIMATION.PROJECTILES.TORPEDO;
    }

    // - Angled up gatling -
    else if (
      attackStructType === STRUCT_TYPES.CRUISER
      && attackStructOperatingAmbit === AMBITS.WATER
      && targetStructOperatingAmbit === AMBITS.AIR
      && weaponSystem === STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON
    ) {
      animationNames.push(ANIMATION.NAMES.IMPACT.ANGLED.UP.GATLING);

      if (!showStructStillDuringAnimation) {
        animationNames.push(ANIMATION.NAMES.SHAKE.ANGLED.UP.GATLING[firstOrLast]);
      }

      projectile = ANIMATION.PROJECTILES.GATLING;
    }

    if (!animationNames.length) {
      throw new AnimationError(
        'No receive damage animation matching parameters. See detail.',
      {
          targetStructId: targetStructId,
          attackStructType: attackStructType,
          attackStructOperatingAmbit: attackStructOperatingAmbit,
          weaponSystem: weaponSystem,
          targetStructType: targetStructType,
          targetStructOperatingAmbit: targetStructOperatingAmbit,
          targetStructCategory: targetStructCategory,
          targetHealthMax: targetHealthMax,
          targetHealthBefore: targetHealthBefore,
          targetHealthAfter: targetHealthAfter,
          evaded: evaded,
          evadedCause: evadedCause,
        }
      );
    }

    return new AnimationEvent(
      targetStructId,
      animationNames,
      showStructStillDuringAnimation,
      true,
      { ...options, projectile: projectile }
    );
  }

  /**
   * @param {string} structId the id of the struct that was destroyed
   * @param {string} ambit the current ambit of the struct that was destroyed
   * @return {AnimationEvent} an event specifying the animation to play for the struct that was destroyed
   */
  makeDestroyAnimationEvent(structId, ambit) {
    const ambitFormatted = ambit.toUpperCase();
    return new AnimationEvent(
      structId,
      [ANIMATION.NAMES.DESTROY[ambitFormatted]],
      false,
      false
    );
  }

  /**
   * @param {string} structId the id of the struct that was deployed
   * @param {string} ambit the current ambit of the struct that was deployed
   * @return {AnimationEvent} an event specifying the animation to play for the struct that was deployed
   */
  makeDeploymentAnimationEvent(structId, ambit) {
    const ambitFormatted = ambit.toUpperCase();
    return new AnimationEvent(
      structId,
      [ANIMATION.NAMES.DEPLOYMENT[ambitFormatted]]
    );
  }
}
