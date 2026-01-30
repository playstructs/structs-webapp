import {
  STRUCT_PRIMARY_WEAPON,
  STRUCT_SECONDARY_WEAPON,
  STRUCT_PASSIVE_WEAPONRY,
  STRUCT_UNIT_DEFENSES,
  STRUCT_ORE_RESERVE_DEFENSES,
  STRUCT_PLANETARY_DEFENSES,
  STRUCT_PLANETARY_MINING,
  STRUCT_PLANETARY_REFINERY,
  STRUCT_POWER_GENERATION
} from "../constants/StructConstants";

export class StructType {

  constructor() {
    this.id = null;
    this.type = null;
    this.category = null;
    this.build_limit = null;
    this.build_difficulty = null;
    this.build_draw = null;
    this.max_health = null;
    this.passive_draw = null;
    this.possible_ambit = null;
    this.movable = null;
    this.slot_bound = null;
    this.primary_weapon = null;
    this.primary_weapon_label = null;
    this.primary_weapon_description = null;
    this.primary_weapon_control = null;
    this.primary_weapon_charge = null;
    this.primary_weapon_ambits = null;
    this.primary_weapon_ambits_array = null;
    this.primary_weapon_targets = null;
    this.primary_weapon_shots = null;
    this.primary_weapon_damage = null;
    this.primary_weapon_blockable = null;
    this.primary_weapon_counterable = null;
    this.primary_weapon_recoil_damage = null;
    this.primary_weapon_shot_success_rate_numerator = null;
    this.primary_weapon_shot_success_rate_denominator = null;
    this.secondary_weapon = null;
    this.secondary_weapon_label = null;
    this.secondary_weapon_description = null;
    this.secondary_weapon_control = null;
    this.secondary_weapon_charge = null;
    this.secondary_weapon_ambits = null;
    this.secondary_weapon_ambits_array = null;
    this.secondary_weapon_targets = null;
    this.secondary_weapon_shots = null;
    this.secondary_weapon_damage = null;
    this.secondary_weapon_blockable = null;
    this.secondary_weapon_counterable = null;
    this.secondary_weapon_recoil_damage = null;
    this.secondary_weapon_shot_success_rate_numerator = null;
    this.secondary_weapon_shot_success_rate_denominator = null;
    this.passive_weaponry = null;
    this.passive_weaponry_label = null;
    this.passive_weaponry_description = null;
    this.unit_defenses = null;
    this.unit_defenses_label = null;
    this.unit_defenses_description = null;
    this.ore_reserve_defenses = null;
    this.ore_reserve_defenses_label = null;
    this.ore_reserve_defenses_description = null;
    this.planetary_defenses = null;
    this.planetary_defenses_label = null;
    this.planetary_defenses_description = null;
    this.planetary_mining = null;
    this.planetary_mining_label = null;
    this.planetary_mining_description = null;
    this.planetary_refinery = null;
    this.planetary_refinery_label = null;
    this.planetary_refinery_description = null;
    this.power_generation = null;
    this.power_generation_label = null;
    this.power_generation_description = null;
    this.activate_charge = null;
    this.build_charge = null;
    this.defend_change_charge = null;
    this.move_charge = null;
    this.ore_mining_charge = null;
    this.ore_refining_charge = null;
    this.stealth_activate_charge = null;
    this.attack_reduction = null;
    this.attack_counterable = null;
    this.stealth_systems = null;
    this.counter_attack = null;
    this.counter_attack_same_ambit = null;
    this.post_destruction_damage = null;
    this.generating_rate = null;
    this.planetary_shield_contribution = null;
    this.ore_mining_difficulty = null;
    this.ore_refining_difficulty = null;
    this.unguided_defensive_success_rate_numerator = null;
    this.unguided_defensive_success_rate_denominator = null;
    this.guided_defensive_success_rate_numerator = null;
    this.guided_defensive_success_rate_denominator = null;
    this.trigger_raid_defeat_by_destruction = null;
    this.updated_at = null;
    this.possible_ambit_array = null;
    this.is_command = null;
    this.drive_label = null;
    this.drive_description = null;
    this['class'] = null;
    this.class_abbreviation = null;
    this.default_cosmetic_model_number = null;
    this.default_cosmetic_name = null;
  }

  /**
   * Checks if the struct type has a primary weapon.
   * @return {boolean}
   */
  hasPrimaryWeapon() {
    return this.primary_weapon
      && this.primary_weapon !== STRUCT_PRIMARY_WEAPON.NO_ACTIVE_WEAPONRY;
  }

  /**
   * Checks if the struct type has a secondary weapon.
   * @return {boolean}
   */
  hasSecondaryWeapon() {
    return this.secondary_weapon
      && this.secondary_weapon !== STRUCT_SECONDARY_WEAPON.NO_ACTIVE_WEAPONRY;
  }

  /**
   * Checks if the struct type has passive weaponry.
   * @return {boolean}
   */
  hasPassiveWeaponry() {
    return this.passive_weaponry
      && this.passive_weaponry !== STRUCT_PASSIVE_WEAPONRY.NO_PASSIVE_WEAPONRY;
  }

  /**
   * Checks if the struct type has unit defenses.
   * @return {boolean}
   */
  hasUnitDefenses() {
    return this.unit_defenses
      && this.unit_defenses !== STRUCT_UNIT_DEFENSES.NO_UNIT_DEFENSES;
  }

  /**
   * Checks if the struct type has ore reserve defenses.
   * @return {boolean}
   */
  hasOreReserveDefenses() {
    return this.ore_reserve_defenses
      && this.ore_reserve_defenses !== STRUCT_ORE_RESERVE_DEFENSES.NO_ORE_RESERVE_DEFENSES;
  }

  /**
   * Checks if the struct type has planetary defenses.
   * @return {boolean}
   */
  hasPlanetaryDefenses() {
    return this.planetary_defenses
      && this.planetary_defenses !== STRUCT_PLANETARY_DEFENSES.NO_PLANETARY_DEFENSE;
  }

  /**
   * Checks if the struct type has planetary mining capability.
   * @return {boolean}
   */
  hasPlanetaryMining() {
    return this.planetary_mining
      && this.planetary_mining !== STRUCT_PLANETARY_MINING.NO_PLANETARY_MINING;
  }

  /**
   * Checks if the struct type has planetary refinery capability.
   * @return {boolean}
   */
  hasPlanetaryRefinery() {
    return this.planetary_refinery
      && this.planetary_refinery !== STRUCT_PLANETARY_REFINERY.NO_PLANETARY_REFINERY;
  }

  /**
   * Checks if the struct type has power generation capability.
   * @return {boolean}
   */
  hasPowerGeneration() {
    return this.power_generation
      && this.power_generation !== STRUCT_POWER_GENERATION.NO_POWER_GENERATION;
  }

  /**
   * Checks if the struct type has the ability to move.
   * @return {boolean}
   */
  isMovable() {
    return this.movable;
  }
}