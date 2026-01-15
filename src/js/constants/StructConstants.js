export const
  STRUCT_CATEGORIES = {
    FLEET: 'fleet',
    PLANET: 'planet'
  },
  STRUCT_VARIANTS = {
    BASE: 'base',
    DMG: 'dmg',
    BLINK: 'blink'
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
    'attackRun': 'icon-ballistic-weapon',
    'guidedWeaponry': 'icon-smart-weapon',
    'unguidedWeaponry': 'icon-ballistic-weapon',

    'advancedCounterAttack': 'icon-adv-counter',
    'counterAttack': 'icon-counter',
    'strongCounterAttack': 'icon-adv-counter',

    'armour': 'icon-armour',
    'defensiveManeuver': 'icon-kinetic-barrier',
    'indirectCombatModule': 'icon-indirect',
    'signalJamming': 'icon-signal-jam',
    'stealthMode': 'icon-stealth',

    'coordinatedReserveResponseTracker': 'icon-planetary-shield',
    'defensiveCannon': 'icon-counter',
    'lowOrbitBallisticInterceptorNetwork': 'icon-signal-jam',
    'monitoringStation': 'icon-planetary-shield',
    'oreBunker': 'icon-planetary-shield',
    'smallGenerator': 'icon-refine'
  },
  STRUCT_DESCRIPTIONS = {
    "Battleship": "",
    "Command Ship": "",
    "Continental Power Plant": "Consumes Alpha Matter to generate Energy.",
    "Cruiser": "",
    "Destroyer": "",
    "Field Generator": "Consumes Alpha Matter to generate Energy.",
    "Frigate": "",
    "High Altitude Interceptor": "",
    "Jamming Satellite": "Applies Signal Jamming to all enemy Smart Attacks.",
    "Mobile Artillery": "",
    "Orbital Shield Generator": "Improves Planetary Defense.",
    "Ore Bunker": "Massively improves Planetary Defense by storing Ore underground.",
    "Ore Extractor": "Extracts Alpha Ore from the planet.",
    "Ore Refinery": "Refines Ore into usable Alpha Matter.",
    "Planetary Defense Cannon": "Launches Counter-Attacks against attacking Structs.",
    "Pursuit Fighter": "",
    "SAM Launcher": "",
    "Starfighter": "",
    "Stealth Bomber": "",
    "Submersible": "",
    "Tank": "",
    "World Engine": "Consumes Alpha Matter to generate Energy."
  },
  STRUCT_WEAPON_CONTROL = {
    GUIDED: 'guided',
    UNGUIDED: 'unguided'
  },
  STRUCT_WEAPON_CONTROL_LABELS = {
    'guided': 'Smart Weapon',
    'unguided': 'Ballistic Weapon'
  },
  STRUCT_STATUS_FLAGS = {
    MATERIALIZED: 1,
    BUILT: 2,
    ONLINE: 4,
    STORED: 8,
    HIDDEN: 16,
    DESTROYED: 32,
    LOCKED: 64
  }
;