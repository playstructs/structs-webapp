import {Struct} from "../models/Struct";
import {Player} from "../models/Player";
import {Planet} from "../models/Planet";
import {Fleet} from "../models/Fleet";
import {PlanetRaid} from "../models/PlanetRaid";
import {PlanetaryShieldInfoDTO} from "../dtos/PlanetaryShieldInfoDTO";
import {Settings} from "../models/Settings";
import {Setting} from "../models/Setting";
import {Guild} from "../models/Guild";
import {SETTING} from "../constants/SettingConstants";
import {STRUCT_STATUS_FLAGS, STRUCT_TYPES, STRUCT_WEAPON_SYSTEM} from "../constants/StructConstants";
import {StructTypeFactory} from "../factories/StructTypeFactory";
import {TUTORIAL_STRUCT_TYPES} from "./TutorialStructTypes";
import {RAID_STATUS} from "../constants/RaidStatus";
import {EVENTS} from "../constants/Events";
import {ShieldHealthChangedEvent} from "../events/ShieldHealthChangedEvent";
import {ChargeLevelChangedEvent} from "../events/ChargeLevelChangedEvent";
import {PfpViewerComponent} from "../view_models/components/PfpViewerComponent";

const BUILT_ONLINE = STRUCT_STATUS_FLAGS.MATERIALIZED | STRUCT_STATUS_FLAGS.BUILT | STRUCT_STATUS_FLAGS.ONLINE;

/** IDs follow the chain's prefixes (players 1-, planets 2-, structs 5-, fleets 9-), which the map relies on. */
export const TUTORIAL_IDS = {
  PLAYER: '1-90001',
  RAIDER: '1-90002',
  PLANET: '2-90001',
  RAIDER_PLANET: '2-90002',
  PLAYER_FLEET: '9-90001',
  RAIDER_FLEET: '9-90002',
  CMD_SHIP: '5-90001',
  EXTRACTOR: '5-90002',
  REFINERY: '5-90003',
  TANK_A: '5-90004',
  SAM_LAUNCHER: '5-90005',
  BOMBER: '5-90006',
  NEW_CMD_SHIP: '5-90007',
  ENEMY_CMD_SHIP: '5-90101',
  ENEMY_TANK: '5-90102',
};

/** See TutorialWorld.destroyStruct. */
const WRECK_SWEEP_DEFERRAL_BLOCKS = 100000;

/** Milliseconds between simulated blocks. Short so the Battery visibly recharges. */
const BLOCK_INTERVAL_MS = 1500;

/**
 * Counter-attack damage by passive weaponry. The real damage model lives on
 * chain; these values are tuned so the tutorial plays out as scripted.
 */
const COUNTER_DAMAGE = {
  counterAttack: 1,
  advancedCounterAttack: 1,
  strongCounterAttack: 2,
};

/**
 * In-memory stand-in for the chain and the Guild API during the tutorial.
 *
 * It owns the authoritative copy of every simulated struct, resolves combat
 * and reports results through the same GRASS message shapes the real
 * listeners consume, so the real map, HUD and animation code render them.
 */
export class TutorialWorld {

  constructor() {
    const structTypeFactory = new StructTypeFactory();

    /** @type {StructType[]} */
    this.structTypes = structTypeFactory.parseList(TUTORIAL_STRUCT_TYPES);

    this.blockHeight = 1000;

    /** @type {Object<string, Struct>} */
    this.structs = {};

    /** @type {StructListener|null} */
    this.structListener = null;

    /**
     * Surviving structs whose defender or protectee was destroyed; their
     * defense icons need refreshing once the wreck is cleared.
     *
     * @type {Set<string>}
     */
    this.structsWithBrokenDefenses = new Set();

    /** @type {GameState|null} */
    this.gameState = null;

    /**
     * Once the scripted lessons are over, counter-attacks can no longer
     * destroy the player's structs, so the simulation cannot be lost.
     *
     * @type {boolean}
     */
    this.protectPlayerStructs = false;

    /** @type {number|null} */
    this.blockTimer = null;

    this.raidActive = false;

    /** @type {string} Shown in the HUD once the raiders' Breach is underway. */
    this.breachCountdown = '';

    this.buildPlayers();
    this.buildStructs();
  }

  /**
   * @param {string} type see STRUCT_TYPES
   * @return {StructType}
   */
  getStructTypeByName(type) {
    return this.structTypes.find(structType => structType.type === type);
  }

  /**
   * @param {number|string} id
   * @return {StructType}
   */
  getStructTypeById(id) {
    return this.structTypes.find(structType => `${structType.id}` === `${id}`);
  }

  buildPlayers() {
    this.player = Object.assign(new Player(), {
      id: TUTORIAL_IDS.PLAYER,
      primary_address: 'structs1tutorial',
      planet_id: TUTORIAL_IDS.PLANET,
      fleet_id: TUTORIAL_IDS.PLAYER_FLEET,
      username: 'Trainee',
      pfp_client_render_attributes: new PfpViewerComponent(null, true).pfp,
      alpha: 54,
      ore: 3,
      load: 0,
      structs_load: 32,
      capacity: 50,
      connection_capacity: 0,
    });

    this.raider = Object.assign(new Player(), {
      id: TUTORIAL_IDS.RAIDER,
      primary_address: 'structs1raider',
      planet_id: TUTORIAL_IDS.RAIDER_PLANET,
      fleet_id: TUTORIAL_IDS.RAIDER_FLEET,
      username: 'Raider',
      alpha: 0,
      ore: 0,
      load: 0,
      structs_load: 0,
      capacity: 50,
      connection_capacity: 0,
    });

    this.planet = Object.assign(new Planet(), {
      id: TUTORIAL_IDS.PLANET,
      owner: TUTORIAL_IDS.PLAYER,
      space_slots: 4,
      air_slots: 4,
      land_slots: 4,
      water_slots: 4,
      name: 'Training Grounds',
      undiscovered_ore: 12,
    });

    this.playerFleet = Object.assign(new Fleet(), {
      id: TUTORIAL_IDS.PLAYER_FLEET,
      owner: TUTORIAL_IDS.PLAYER,
      space_slots: 4,
      air_slots: 4,
      land_slots: 4,
      water_slots: 4,
      location_type: 'planet',
      location_id: TUTORIAL_IDS.PLANET,
      status: 'onStation',
      command_struct: TUTORIAL_IDS.CMD_SHIP,
    });

    this.raiderFleet = Object.assign(new Fleet(), {
      id: TUTORIAL_IDS.RAIDER_FLEET,
      owner: TUTORIAL_IDS.RAIDER,
      space_slots: 4,
      air_slots: 4,
      land_slots: 4,
      water_slots: 4,
      location_type: 'planet',
      location_id: TUTORIAL_IDS.PLANET,
      status: 'away',
      command_struct: TUTORIAL_IDS.ENEMY_CMD_SHIP,
    });
  }

  /**
   * @param {string} id
   * @param {string} type see STRUCT_TYPES
   * @param {string} owner
   * @param {string} locationType
   * @param {string} ambit
   * @param {number} slot
   * @return {Struct}
   */
  makeStruct(id, type, owner, locationType, ambit, slot) {
    const structType = this.getStructTypeByName(type);
    const locationId = locationType === 'planet'
      ? TUTORIAL_IDS.PLANET
      : (owner === TUTORIAL_IDS.PLAYER ? TUTORIAL_IDS.PLAYER_FLEET : TUTORIAL_IDS.RAIDER_FLEET);

    return Object.assign(new Struct(), {
      id,
      index: parseInt(id.split('-')[1]),
      type: structType.id,
      creator: owner,
      owner,
      location_type: locationType,
      location_id: locationId,
      operating_ambit: ambit,
      slot,
      health: structType.max_health,
      status: BUILT_ONLINE,
      protected_struct_id: null,
      defending_struct_ids: [],
      destroyed_block: null,
      fuel: 0,
    });
  }

  buildStructs() {
    const P = TUTORIAL_IDS.PLAYER;
    const R = TUTORIAL_IDS.RAIDER;

    [
      this.makeStruct(TUTORIAL_IDS.CMD_SHIP, STRUCT_TYPES.COMMAND_SHIP, P, 'fleet', 'land', 0),
      // Odd slots sit in the column nearest the CMD Ship, stacked top (1) and bottom (3).
      this.makeStruct(TUTORIAL_IDS.EXTRACTOR, STRUCT_TYPES.ORE_EXTRACTOR, P, 'planet', 'land', 1),
      this.makeStruct(TUTORIAL_IDS.REFINERY, STRUCT_TYPES.ORE_REFINERY, P, 'planet', 'land', 3),
      this.makeStruct(TUTORIAL_IDS.TANK_A, STRUCT_TYPES.TANK, P, 'fleet', 'land', 1),
      this.makeStruct(TUTORIAL_IDS.SAM_LAUNCHER, STRUCT_TYPES.SAM_LAUNCHER, P, 'fleet', 'land', 3),
      this.makeStruct(TUTORIAL_IDS.BOMBER, STRUCT_TYPES.STEALTH_BOMBER, P, 'fleet', 'air', 0),
      this.makeStruct(TUTORIAL_IDS.ENEMY_CMD_SHIP, STRUCT_TYPES.COMMAND_SHIP, R, 'fleet', 'land', 0),
      this.makeStruct(TUTORIAL_IDS.ENEMY_TANK, STRUCT_TYPES.TANK, R, 'fleet', 'land', 0),
    ].forEach(struct => {
      this.structs[struct.id] = struct;
    });

    // The raider's CMD Ship arrives battered, so one strike finishes it in free play.
    this.structs[TUTORIAL_IDS.ENEMY_CMD_SHIP].health = 2;

    // The raider's Tank starts out defending its CMD Ship.
    this.structs[TUTORIAL_IDS.ENEMY_TANK].protected_struct_id = TUTORIAL_IDS.ENEMY_CMD_SHIP;
    this.structs[TUTORIAL_IDS.ENEMY_CMD_SHIP].defending_struct_ids = [TUTORIAL_IDS.ENEMY_TANK];
  }

  /* Read access, shaped like the Guild API */

  /**
   * @param {string} id
   * @return {Struct|null}
   */
  getStruct(id) {
    const struct = this.structs[id];
    if (!struct) {
      return null;
    }
    const copy = Object.assign(new Struct(), struct);
    copy.defending_struct_ids = [...struct.defending_struct_ids];
    return copy;
  }

  /**
   * @param {string} playerId
   * @return {Struct[]}
   */
  getStructsByPlayerId(playerId) {
    return Object.keys(this.structs)
      .filter(id => this.structs[id].owner === playerId)
      .map(id => this.getStruct(id));
  }

  /**
   * @param {string} playerId
   * @return {Player|null}
   */
  getPlayer(playerId) {
    if (playerId === TUTORIAL_IDS.PLAYER) {
      return Object.assign(new Player(), this.player);
    }
    if (playerId === TUTORIAL_IDS.RAIDER) {
      return Object.assign(new Player(), this.raider);
    }
    return null;
  }

  /**
   * @param {string} playerId
   * @return {Fleet|null}
   */
  getFleetByPlayerId(playerId) {
    if (playerId === TUTORIAL_IDS.PLAYER) {
      return Object.assign(new Fleet(), this.playerFleet);
    }
    if (playerId === TUTORIAL_IDS.RAIDER) {
      return Object.assign(new Fleet(), this.raiderFleet);
    }
    return null;
  }

  /**
   * @return {PlanetRaid}
   */
  getPlanetRaid() {
    if (!this.raidActive) {
      return new PlanetRaid();
    }
    return Object.assign(new PlanetRaid(), {
      planet_id: TUTORIAL_IDS.PLANET,
      planet_owner: TUTORIAL_IDS.PLAYER,
      fleet_id: TUTORIAL_IDS.RAIDER_FLEET,
      fleet_owner: TUTORIAL_IDS.RAIDER,
      status: RAID_STATUS.ONGOING,
    });
  }

  /**
   * @return {PlanetaryShieldInfoDTO}
   */
  getPlanetaryShieldInfo() {
    return Object.assign(new PlanetaryShieldInfoDTO(), {
      planet_id: TUTORIAL_IDS.PLANET,
      planetary_shield: 0,
      block_start_raid: null,
    });
  }

  /**
   * @return {Settings}
   */
  getSettings() {
    const settings = new Settings();
    settings.add(Object.assign(new Setting(), {
      name: SETTING.STRUCT_SWEEP_DELAY,
      value: '1',
    }));
    return settings;
  }

  /**
   * @return {Guild}
   */
  getGuild() {
    return Object.assign(new Guild(), {
      id: '0-1',
      name: 'SN.Corporation',
      tag: 'SNC',
    });
  }

  /* Game state wiring */

  /**
   * @param {GameState} gameState
   * @param {StructListener} structListener
   */
  attach(gameState, structListener) {
    this.gameState = gameState;
    this.structListener = structListener;
  }

  /**
   * Populates the key player for the tutorial player, mirroring what
   * AuthManager.login does with API data.
   */
  loadPlayerIntoGameState() {
    const keyPlayer = this.gameState.keyPlayers.player;

    // Give the tutorial its own breach countdown instead of the chain estimate.
    keyPlayer.setPlanetShieldHealth = () => {
      keyPlayer.planetShieldHealth = (this.raidActive && keyPlayer.arePlanetaryDefensesBreached())
        ? this.breachCountdown
        : '';
      window.dispatchEvent(new ShieldHealthChangedEvent(keyPlayer.playerType));
    };

    this.gameState.currentBlockHeight = this.blockHeight;
    this.gameState.setStructTypes(this.structTypes);

    keyPlayer.setId(TUTORIAL_IDS.PLAYER);
    keyPlayer.setPlayer(this.getPlayer(TUTORIAL_IDS.PLAYER));
    keyPlayer.setLastActionBlockHeight(this.blockHeight, 0);
    keyPlayer.setFleet(this.getFleetByPlayerId(TUTORIAL_IDS.PLAYER));
    keyPlayer.setStructs(this.getStructsByPlayerId(TUTORIAL_IDS.PLAYER));
    keyPlayer.setPlanet(this.planet);
    keyPlayer.setPlanetShieldInfo(this.getPlanetaryShieldInfo(), this.blockHeight);
  }

  /**
   * @param {string} label e.g. "30m"
   */
  setBreachCountdown(label) {
    this.breachCountdown = label;
    this.gameState.keyPlayers.player.setPlanetShieldHealth(this.blockHeight);
  }

  /**
   * The raiders' fleet arrives at the player's planet.
   */
  startRaid() {
    this.raidActive = true;
    this.raiderFleet.status = 'onStation';

    const raider = this.gameState.keyPlayers.planet_raider;
    this.gameState.setPlanetPlanetRaidInfo(this.getPlanetRaid(), false);
    raider.setPlayer(this.getPlayer(TUTORIAL_IDS.RAIDER));
    raider.setLastActionBlockHeight(this.blockHeight, 0);
    raider.setFleet(this.getFleetByPlayerId(TUTORIAL_IDS.RAIDER));
    raider.setStructs(this.getStructsByPlayerId(TUTORIAL_IDS.RAIDER));
    this.gameState.keyPlayers.player.setPlanetShieldHealth(this.blockHeight);
  }

  /**
   * The raiders retreat once their CMD Ship is destroyed.
   */
  endRaid() {
    this.raidActive = false;
    this.raiderFleet.status = 'away';

    Object.keys(this.structs).forEach(id => {
      if (this.structs[id].owner === TUTORIAL_IDS.RAIDER) {
        delete this.structs[id];
      }
    });

    const planetRaid = this.getPlanetRaid();
    planetRaid.status = RAID_STATUS.ATTACKER_DEFEATED;
    this.gameState.setPlanetPlanetRaidInfo(planetRaid, false);
    this.gameState.clearPlanetRaidData();
    this.gameState.keyPlayers.planet_raider.structs = {};
    this.gameState.keyPlayers.planet_raider.fleet = null;
    this.gameState.keyPlayers.player.setPlanetShieldHealth(this.blockHeight);
  }

  /* Blocks */

  startBlocks() {
    this.stopBlocks();
    this.blockTimer = setInterval(() => this.nextBlock(), BLOCK_INTERVAL_MS);
  }

  stopBlocks() {
    if (this.blockTimer) {
      clearInterval(this.blockTimer);
      this.blockTimer = null;
    }
  }

  nextBlock() {
    this.blockHeight++;
    this.gameState.setCurrentBlockHeight(this.blockHeight);
    window.dispatchEvent(new CustomEvent(EVENTS.BLOCK_HEIGHT_CHANGED));
  }

  /**
   * Lets the Battery refill straight away, e.g. before an action the
   * tutorial asks for right after another one.
   */
  rechargeBattery() {
    const keyPlayer = this.gameState.keyPlayers.player;
    keyPlayer.setLastActionBlockHeight(this.blockHeight, this.blockHeight - 10);
    window.dispatchEvent(new ChargeLevelChangedEvent(keyPlayer.id, keyPlayer.chargeLevel));
  }

  /* Messages */

  /**
   * @param {object} message a GRASS message
   */
  emit(message) {
    this.structListener.handler(message);
  }

  /**
   * @return {string}
   */
  getSubject() {
    return `structs.planet.${TUTORIAL_IDS.PLANET}.${TUTORIAL_IDS.PLAYER}`;
  }

  /**
   * @param {Struct} struct
   * @param {number} damage
   * @return {{before: number, after: number, destroyed: boolean}}
   */
  applyDamage(struct, damage) {
    const before = struct.health;
    let after = Math.max(0, before - damage);

    if (this.protectPlayerStructs && struct.owner === TUTORIAL_IDS.PLAYER) {
      after = Math.max(1, after);
    }

    struct.health = after;

    const destroyed = after === 0;
    if (destroyed) {
      this.destroyStruct(struct);
    }

    return {before, after, destroyed};
  }

  /**
   * @param {Struct} struct
   */
  destroyStruct(struct) {
    struct.addStatusFlag(STRUCT_STATUS_FLAGS.DESTROYED);
    struct.removeStatusFlag(STRUCT_STATUS_FLAGS.ONLINE);
    // Dated in the future so the regular sweep never clears a wreck while its
    // destruction is still animating; the tutorial sweeps wrecks itself once
    // each fight has played out.
    struct.destroyed_block = this.blockHeight + WRECK_SWEEP_DEFERRAL_BLOCKS;

    // A destroyed struct no longer defends or is defended.
    if (struct.protected_struct_id && this.structs[struct.protected_struct_id]) {
      const protectedStruct = this.structs[struct.protected_struct_id];
      protectedStruct.defending_struct_ids = protectedStruct.defending_struct_ids.filter(id => id !== struct.id);
      this.structsWithBrokenDefenses.add(protectedStruct.id);
    }
    struct.protected_struct_id = null;
    struct.defending_struct_ids.forEach(id => {
      if (this.structs[id]) {
        this.structs[id].protected_struct_id = null;
        this.structsWithBrokenDefenses.add(id);
      }
    });
    struct.defending_struct_ids = [];
  }

  /**
   * @return {string[]} surviving structs whose defenses changed since the last call
   */
  takeStructsWithBrokenDefenses() {
    const structIds = [...this.structsWithBrokenDefenses]
      .filter(id => this.isAlive(this.structs[id]));
    this.structsWithBrokenDefenses.clear();
    return structIds;
  }

  /**
   * Whether a struct's weapon can reach a struct in the given ambit.
   *
   * @param {Struct} struct
   * @param {Struct} target
   * @return {boolean}
   */
  canReach(struct, target) {
    const structType = this.getStructTypeById(struct.type);
    const ambits = structType.primary_weapon_ambits_array || [];
    return ambits.includes(target.operating_ambit)
      || (ambits.includes('local') && struct.operating_ambit === target.operating_ambit);
  }

  /**
   * @param {Struct} struct
   * @return {number}
   */
  getCounterDamage(struct) {
    const structType = this.getStructTypeById(struct.type);
    return COUNTER_DAMAGE[structType.passive_weaponry] ?? 0;
  }

  /**
   * @param {Struct} struct
   * @return {boolean}
   */
  isAlive(struct) {
    return !!struct && !struct.isDestroyed();
  }

  /**
   * Resolves an attack and reports it as a struct_attack GRASS message.
   *
   * Order follows the chain: the target's defenders counter first, a defender
   * in the target's ambit blocks the shot, then a surviving target counters.
   *
   * @param {string} attackerId
   * @param {string} targetId
   * @param {string} weaponSystem see STRUCT_WEAPON_SYSTEM
   * @return {{attackerDestroyed: boolean, targetDestroyed: boolean, blocked: boolean, countered: boolean}}
   */
  attack(attackerId, targetId, weaponSystem = STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON) {
    const attacker = this.structs[attackerId];
    const target = this.structs[targetId];
    const attackerType = this.getStructTypeById(attacker.type);
    const targetType = this.getStructTypeById(target.type);
    const isPrimary = weaponSystem === STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON;
    const damage = parseInt(isPrimary ? attackerType.primary_weapon_damage : attackerType.secondary_weapon_damage) || 0;

    const attackerHealthBefore = attacker.health;
    const shot = {
      eventAttackDefenderCounterDetail: [],
      evaded: false,
      evadedCause: '',
      evadedByPlanetaryDefenses: false,
      evadedByPlanetaryDefensesCause: '',
      blocked: false,
      blockedByStructId: '',
      blockedByStructType: '',
      blockedByStructOperatingAmbit: '',
      blockedByStructLocationType: '',
      blockerHealthBefore: 0,
      blockerHealthAfter: 0,
      blockerDestroyed: false,
      targetStructId: target.id,
      targetStructType: targetType.type,
      targetStructOperatingAmbit: target.operating_ambit,
      targetStructLocationType: target.location_type,
      targetHealthBefore: target.health,
      targetHealthAfter: target.health,
      targetDestroyed: false,
      targetCountered: false,
      targetCounterWeaponSystem: STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON,
      targetCounteredDamage: 0,
      targetCounterDestroyedAttacker: false,
    };

    const defenders = target.defending_struct_ids
      .map(id => this.structs[id])
      .filter(defender => this.isAlive(defender));

    // 1. Defenders always fire first.
    for (const defender of defenders) {
      if (!this.canReach(defender, attacker)) {
        continue;
      }
      const result = this.applyDamage(attacker, this.getCounterDamage(defender));
      shot.eventAttackDefenderCounterDetail.push({
        counterByStructId: defender.id,
        counterByStructType: this.getStructTypeById(defender.type).type,
        counterByStructOperatingAmbit: defender.operating_ambit,
        counterByStructWeaponSystem: STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON,
        counterDamage: result.before - result.after,
        counterDestroyedAttacker: result.destroyed,
      });
      if (result.destroyed) {
        break;
      }
    }

    if (this.isAlive(attacker)) {
      // 2. A defender in the target's battleground blocks the shot and takes its DMG.
      const blocker = defenders.find(defender =>
        this.isAlive(defender) && defender.operating_ambit === target.operating_ambit
      );

      if (blocker) {
        const result = this.applyDamage(blocker, damage);
        shot.blocked = true;
        shot.blockedByStructId = blocker.id;
        shot.blockedByStructType = this.getStructTypeById(blocker.type).type;
        shot.blockedByStructOperatingAmbit = blocker.operating_ambit;
        shot.blockedByStructLocationType = blocker.location_type;
        shot.blockerHealthBefore = result.before;
        shot.blockerHealthAfter = result.after;
        shot.blockerDestroyed = result.destroyed;
      } else {
        const result = this.applyDamage(target, damage);
        shot.targetHealthAfter = result.after;
        shot.targetDestroyed = result.destroyed;
      }

      // 3. A surviving target counters if it can reach the attacker.
      if (!shot.targetDestroyed && this.canReach(target, attacker)) {
        const counterDamage = this.getCounterDamage(target);
        if (counterDamage > 0) {
          const result = this.applyDamage(attacker, counterDamage);
          shot.targetCountered = true;
          shot.targetCounteredDamage = result.before - result.after;
          shot.targetCounterDestroyedAttacker = result.destroyed;
        }
      }
    }

    this.emit({
      subject: this.getSubject(),
      category: 'struct_attack',
      detail: {
        attackerStructId: attacker.id,
        attackerHealthBefore,
        attackerStructType: attackerType.type,
        attackerStructOperatingAmbit: attacker.operating_ambit,
        attackerStructLocationType: attacker.location_type,
        weaponSystem,
        planetaryDefenseCannonDamageToAttacker: false,
        planetaryDefenseCannonDamage: 0,
        planetaryDefenseCannonDamageDestroyedAttacker: false,
        eventAttackShotDetail: [shot],
      },
    });

    return {
      attackerDestroyed: !this.isAlive(attacker),
      targetDestroyed: shot.targetDestroyed,
      blocked: shot.blocked,
      countered: shot.targetCountered || shot.eventAttackDefenderCounterDetail.length > 0,
    };
  }

  /**
   * The raiders' opening strike destroys the player's CMD Ship.
   */
  raiderOpeningStrike() {
    const commandShip = this.structs[TUTORIAL_IDS.CMD_SHIP];
    const raiderTank = this.structs[TUTORIAL_IDS.ENEMY_TANK];
    const raiderTankType = this.getStructTypeById(raiderTank.type);
    const before = commandShip.health;

    this.destroyStruct(commandShip);
    commandShip.health = 0;

    this.emit({
      subject: this.getSubject(),
      category: 'struct_attack',
      detail: {
        attackerStructId: raiderTank.id,
        attackerHealthBefore: raiderTank.health,
        attackerStructType: raiderTankType.type,
        attackerStructOperatingAmbit: raiderTank.operating_ambit,
        attackerStructLocationType: raiderTank.location_type,
        weaponSystem: STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON,
        planetaryDefenseCannonDamageToAttacker: false,
        planetaryDefenseCannonDamage: 0,
        planetaryDefenseCannonDamageDestroyedAttacker: false,
        eventAttackShotDetail: [{
          eventAttackDefenderCounterDetail: [],
          evaded: false,
          evadedCause: '',
          evadedByPlanetaryDefenses: false,
          evadedByPlanetaryDefensesCause: '',
          blocked: false,
          targetStructId: commandShip.id,
          targetStructType: STRUCT_TYPES.COMMAND_SHIP,
          targetStructOperatingAmbit: commandShip.operating_ambit,
          targetStructLocationType: commandShip.location_type,
          targetHealthBefore: before,
          targetHealthAfter: 0,
          targetDestroyed: true,
          targetCountered: false,
          targetCounterDestroyedAttacker: false,
        }],
      },
    });
  }

  /**
   * @param {string} defenderId
   * @param {string} protectedId
   */
  setDefense(defenderId, protectedId) {
    const defender = this.structs[defenderId];
    const protectedStruct = this.structs[protectedId];

    if (defender.protected_struct_id && this.structs[defender.protected_struct_id]) {
      const previous = this.structs[defender.protected_struct_id];
      previous.defending_struct_ids = previous.defending_struct_ids.filter(id => id !== defenderId);
    }

    defender.protected_struct_id = protectedId;
    if (!protectedStruct.defending_struct_ids.includes(defenderId)) {
      protectedStruct.defending_struct_ids.push(defenderId);
    }

    this.emit({
      subject: this.getSubject(),
      category: 'struct_defense_add',
      detail: {
        defender_struct_id: defenderId,
        protected_struct_id: protectedId,
      },
    });
  }

  /**
   * @param {string} defenderId
   */
  clearDefense(defenderId) {
    const defender = this.structs[defenderId];
    const protectedId = defender.protected_struct_id;

    if (protectedId && this.structs[protectedId]) {
      const protectedStruct = this.structs[protectedId];
      protectedStruct.defending_struct_ids = protectedStruct.defending_struct_ids.filter(id => id !== defenderId);
    }
    defender.protected_struct_id = null;

    this.emit({
      subject: this.getSubject(),
      category: 'struct_defense_remove',
      detail: {
        defender_struct_id: defenderId,
        protected_struct_id: protectedId,
      },
    });
  }

  /**
   * Starts building a struct. It stays materialized until completeBuild().
   *
   * @param {number} structTypeId
   * @param {string} ambit
   * @param {number} slot
   * @return {string} the new struct's id
   */
  initiateBuild(structTypeId, ambit, slot) {
    const structType = this.getStructTypeById(structTypeId);
    const isCommand = !!structType.is_command;
    const id = isCommand ? TUTORIAL_IDS.NEW_CMD_SHIP : `5-9${Date.now() % 100000}`;
    const struct = this.makeStruct(
      id,
      structType.type,
      TUTORIAL_IDS.PLAYER,
      structType.category === 'planet' ? 'planet' : 'fleet',
      ambit.toLowerCase(),
      slot
    );
    struct.status = STRUCT_STATUS_FLAGS.MATERIALIZED;
    this.structs[id] = struct;

    if (isCommand) {
      this.playerFleet.command_struct = id;
    }

    this.emit({
      subject: this.getSubject(),
      category: 'struct_status',
      detail: {struct_id: id, status_old: 0, status: struct.status},
    });

    return id;
  }

  /**
   * @param {string} structId
   */
  completeBuild(structId) {
    const struct = this.structs[structId];
    const statusOld = struct.status;
    struct.status = BUILT_ONLINE;

    this.emit({
      subject: this.getSubject(),
      category: 'struct_status',
      detail: {struct_id: structId, status_old: statusOld, status: struct.status},
    });
  }
}
