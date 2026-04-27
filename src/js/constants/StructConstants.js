export const
  STRUCT_TYPES = {
    BATTLESHIP: 'Battleship',
    COMMAND_SHIP: 'Command Ship',
    CONTINENTAL_POWER_PLANT: 'Continental Power Plant',
    CRUISER: 'Cruiser',
    DESTROYER: 'Destroyer',
    FIELD_GENERATOR: 'Field Generator',
    FRIGATE: 'Frigate',
    HIGH_ALTITUDE_INTERCEPTOR: 'High Altitude Interceptor',
    JAMMING_SATELLITE: 'Jamming Satellite',
    MOBILE_ARTILLERY: 'Mobile Artillery',
    ORBITAL_SHIELD_GENERATOR: 'Orbital Shield Generator',
    ORE_BUNKER: 'Ore Bunker',
    ORE_EXTRACTOR: 'Ore Extractor',
    ORE_REFINERY: 'Ore Refinery',
    PLANETARY_DEFENSE_CANNON: 'Planetary Defense Cannon',
    PURSUIT_FIGHTER: 'Pursuit Fighter',
    SAM_LAUNCHER: 'SAM Launcher',
    STARFIGHTER: 'Starfighter',
    STEALTH_BOMBER: 'Stealth Bomber',
    SUBMERSIBLE: 'Submersible',
    TANK: 'Tank',
    WORLD_ENGINE: 'World Engine',
  },
  STRUCT_CATEGORIES = {
    FLEET: 'fleet',
    PLANET: 'planet'
  },
  STRUCT_PRIMARY_WEAPON = {
    UNGUIDED_WEAPONRY: 'unguidedWeaponry',
    GUIDED_WEAPONRY: 'guidedWeaponry',
    NO_ACTIVE_WEAPONRY: 'noActiveWeaponry'
  },
  STRUCT_SECONDARY_WEAPON = {
    UNGUIDED_WEAPONRY: 'unguidedWeaponry',
    ATTACK_RUN: 'attackRun',
    NO_ACTIVE_WEAPONRY: 'noActiveWeaponry'
  },
  STRUCT_PASSIVE_WEAPONRY = {
    COUNTER_ATTACK: 'counterAttack',
    STRONG_COUNTER_ATTACK: 'strongCounterAttack',
    ADVANCED_COUNTER_ATTACK: 'advancedCounterAttack',
    NO_PASSIVE_WEAPONRY: 'noPassiveWeaponry'
  },
  STRUCT_UNIT_DEFENSES = {
    ARMOUR: 'armour',
    DEFENSIVE_MANEUVER: 'defensiveManeuver',
    INDIRECT_COMBAT_MODULE: 'indirectCombatModule',
    SIGNAL_JAMMING: 'signalJamming',
    STEALTH_MODE: 'stealthMode',
    NO_UNIT_DEFENSES: 'noUnitDefenses'
  },
  STRUCT_ORE_RESERVE_DEFENSES = {
    COORDINATED_RESERVE_RESPONSE_TRACKER: 'coordinatedReserveResponseTracker',
    MONITORING_STATION: 'monitoringStation',
    ORE_BUNKER: 'oreBunker',
    NO_ORE_RESERVE_DEFENSES: 'noOreReserveDefenses'
  },
  STRUCT_PLANETARY_DEFENSES = {
    DEFENSIVE_CANNON: 'defensiveCannon',
    LOW_ORBIT_BALLISTIC_INTERCEPTOR_NETWORK: 'lowOrbitBallisticInterceptorNetwork',
    NO_PLANETARY_DEFENSE: 'noPlanetaryDefense'
  },
  STRUCT_PLANETARY_MINING = {
    ORE_MINING_RIG: 'oreMiningRig',
    NO_PLANETARY_MINING: 'noPlanetaryMining'
  },
  STRUCT_PLANETARY_REFINERY = {
    ORE_REFINERY: 'oreRefinery',
    NO_PLANETARY_REFINERY: 'noPlanetaryRefinery'
  },
  STRUCT_POWER_GENERATION = {
    SMALL_GENERATOR: 'smallGenerator',
    MEDIUM_GENERATOR: 'mediumGenerator',
    LARGE_GENERATOR: 'largeGenerator',
    NO_POWER_GENERATION: 'noPowerGeneration'
  },
  STRUCT_EQUIPMENT_ICON_MAP = {
    [STRUCT_SECONDARY_WEAPON.ATTACK_RUN]: 'icon-ballistic-weapon',
    [STRUCT_PRIMARY_WEAPON.GUIDED_WEAPONRY]: 'icon-smart-weapon',
    [STRUCT_PRIMARY_WEAPON.UNGUIDED_WEAPONRY]: 'icon-ballistic-weapon',

    [STRUCT_PASSIVE_WEAPONRY.ADVANCED_COUNTER_ATTACK]: 'icon-adv-counter',
    [STRUCT_PASSIVE_WEAPONRY.COUNTER_ATTACK]: 'icon-counter',
    [STRUCT_PASSIVE_WEAPONRY.STRONG_COUNTER_ATTACK]: 'icon-adv-counter',

    [STRUCT_UNIT_DEFENSES.ARMOUR]: 'icon-armour',
    [STRUCT_UNIT_DEFENSES.DEFENSIVE_MANEUVER]: 'icon-kinetic-barrier',
    [STRUCT_UNIT_DEFENSES.INDIRECT_COMBAT_MODULE]: 'icon-indirect',
    [STRUCT_UNIT_DEFENSES.SIGNAL_JAMMING]: 'icon-signal-jam',
    [STRUCT_UNIT_DEFENSES.STEALTH_MODE]: 'icon-stealth',

    [STRUCT_ORE_RESERVE_DEFENSES.COORDINATED_RESERVE_RESPONSE_TRACKER]: 'icon-planetary-shield',
    [STRUCT_PLANETARY_DEFENSES.DEFENSIVE_CANNON]: 'icon-counter',
    [STRUCT_PLANETARY_DEFENSES.LOW_ORBIT_BALLISTIC_INTERCEPTOR_NETWORK]: 'icon-signal-jam',
    [STRUCT_ORE_RESERVE_DEFENSES.MONITORING_STATION]: 'icon-planetary-shield',
    [STRUCT_ORE_RESERVE_DEFENSES.ORE_BUNKER]: 'icon-planetary-shield',
    [STRUCT_POWER_GENERATION.SMALL_GENERATOR]: 'icon-refine'
  },
  STRUCT_DESCRIPTIONS = {
    [STRUCT_TYPES.BATTLESHIP]: "",
    [STRUCT_TYPES.COMMAND_SHIP]: "",
    [STRUCT_TYPES.CONTINENTAL_POWER_PLANT]: "Consumes Alpha Matter to generate Energy.",
    [STRUCT_TYPES.CRUISER]: "",
    [STRUCT_TYPES.DESTROYER]: "",
    [STRUCT_TYPES.FIELD_GENERATOR]: "Consumes Alpha Matter to generate Energy.",
    [STRUCT_TYPES.FRIGATE]: "",
    [STRUCT_TYPES.HIGH_ALTITUDE_INTERCEPTOR]: "",
    [STRUCT_TYPES.JAMMING_SATELLITE]: "Applies Signal Jamming to all enemy Smart Attacks.",
    [STRUCT_TYPES.MOBILE_ARTILLERY]: "",
    [STRUCT_TYPES.ORBITAL_SHIELD_GENERATOR]: "Improves Planetary Defense.",
    [STRUCT_TYPES.ORE_BUNKER]: "Massively improves Planetary Defense by storing Ore underground.",
    [STRUCT_TYPES.ORE_EXTRACTOR]: "Extracts Alpha Ore from the planet.",
    [STRUCT_TYPES.ORE_REFINERY]: "Refines Ore into usable Alpha Matter.",
    [STRUCT_TYPES.PLANETARY_DEFENSE_CANNON]: "Launches Counter-Attacks against attacking Structs.",
    [STRUCT_TYPES.PURSUIT_FIGHTER]: "",
    [STRUCT_TYPES.SAM_LAUNCHER]: "",
    [STRUCT_TYPES.STARFIGHTER]: "",
    [STRUCT_TYPES.STEALTH_BOMBER]: "",
    [STRUCT_TYPES.SUBMERSIBLE]: "",
    [STRUCT_TYPES.TANK]: "",
    [STRUCT_TYPES.WORLD_ENGINE]: "Consumes Alpha Matter to generate Energy."
  },
  STRUCT_WEAPON_SYSTEM = {
    PRIMARY_WEAPON: 'primaryWeapon',
    SECONDARY_WEAPON: 'secondaryWeapon'
  },
  STRUCT_WEAPON_CONTROL = {
    GUIDED: 'guided',
    UNGUIDED: 'unguided'
  },
  STRUCT_WEAPON_CONTROL_LABELS = {
    [STRUCT_WEAPON_CONTROL.GUIDED]: 'Smart Weapon',
    [STRUCT_WEAPON_CONTROL.UNGUIDED]: 'Ballistic Weapon'
  },
  STRUCT_STATUS_FLAGS = {
    MATERIALIZED: 1,
    BUILT: 2,
    ONLINE: 4,
    STORED: 8,
    HIDDEN: 16,
    DESTROYED: 32,
    LOCKED: 64
  },
  STRUCT_ACTIONS = {
    ACTIVATE: 'ACTIVATE',
    DEACTIVATE: 'DEACTIVATE',
    ATTACK_PRIMARY_WEAPON: 'ATTACK_PRIMARY_WEAPON',
    ATTACK_SECONDARY_WEAPON: 'ATTACK_SECONDARY_WEAPON',
    DEFENSE_SET: 'DEFENSE_SET',
    DEFENSE_CLEAR: 'DEFENSE_CLEAR',
    MOVE: 'MOVE',
    STEALTH_ACTIVATE: 'STEALTH_ACTIVATE',
    STEALTH_DEACTIVATE: 'STEALTH_DEACTIVATE'
  },
  STRUCT_WATER_RIPPLE = 'waterRipple',
  STRUCT_EQUIPMENT = {
    PASSIVE_WEAPONRY: 'passiveWeaponry',
    UNIT_DEFENSES: 'unitDefenses',
    ORE_RESERVE_DEFENSES: 'oreReserveDefenses',
    PLANETARY_DEFENSES: 'planetaryDefenses',
    PLANETARY_MINING: 'planetaryMining',
    PLANETARY_REFINERY: 'planetaryRefinery',
    POWER_GENERATION: 'powerGeneration',
  },
  STRUCT_STILL_LAYERS = {
    STRUCT_VARIANT_BASE: 'structVariantBase',
    STRUCT_VARIANT_DMG: 'structVariantDmg',
  }
;
