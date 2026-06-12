/**
 * Fixed charge costs for the chain's charge-bar messages, where the cost is a
 * constant (per docs / StructType defaults). Variable costs — move, attack
 * (primary/secondary weapon) — stay caller-supplied from the relevant
 * StructType field and are NOT listed here.
 *
 * The chain's StructsDecorator gates eight message types on charge:
 * StructActivate, StructAttack, StructBuildInitiate, StructDefenseClear,
 * StructDefenseSet, StructMove, StructStealthActivate, StructStealthDeactivate.
 */
export const CHARGE_STRUCT_ACTIVATE = 1;
export const CHARGE_STRUCT_BUILD_INITIATE = 8;
export const CHARGE_STRUCT_DEFEND_CHANGE = 1; // defense set + defense clear
export const CHARGE_STRUCT_STEALTH_ACTIVATE = 1;
export const CHARGE_STRUCT_STEALTH_DEACTIVATE = 1;
