/**
 * Identifies whether a given animation (or set of animations) belongs to an
 * attack sequence enqueued by `StructListener.handleStructAttack`.
 *
 * Attack sequences are made up of attack, impact, shake, evade and destroy
 * animations. Status-driven animations (deployment, move, stealth) are not
 * part of the attack sequence.
 */
export class AttackSequenceAnimationUtil {

  /**
   * Animation name prefixes that only ever appear during an attack sequence.
   * `EVADE` is included as an exact match because it is the only animation in
   * its family.
   */
  static ATTACK_SEQUENCE_NAME_PREFIXES = [
    'ATTACK_',
    'IMPACT_',
    'SHAKE_',
    'EVADE',
    'DESTROY_',
  ];

  /**
   * @param {string} animationName
   * @return {boolean}
   */
  static isAttackSequenceAnimation(animationName) {
    if (!animationName) {
      return false;
    }
    return AttackSequenceAnimationUtil.ATTACK_SEQUENCE_NAME_PREFIXES.some(
      (prefix) => animationName === prefix || animationName.startsWith(prefix)
    );
  }

  /**
   * @param {string[]} animationNames
   * @return {boolean}
   */
  static includesAttackSequenceAnimation(animationNames) {
    if (!Array.isArray(animationNames)) {
      return false;
    }
    return animationNames.some(
      (name) => AttackSequenceAnimationUtil.isAttackSequenceAnimation(name)
    );
  }
}
