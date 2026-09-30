import {PlanetaryShieldInfoDTO} from "../dtos/PlanetaryShieldInfoDTO";
import {PlanetRaid} from "./PlanetRaid";
import {ChargeLevelChangedEvent} from "../events/ChargeLevelChangedEvent";
import {ChargeCalculator} from "../util/ChargeCalculator";
import {SaveGameStateEvent} from "../events/SaveGameStateEvent";
import {StructCountChangedEvent} from "../events/StructCountChangedEvent";
import {Player} from "./Player";
import {AlphaCountChangedEvent} from "../events/AlphaCountChangedEvent";
import {EnergyUsageChangedEvent} from "../events/EnergyUsageChangedEvent";
import {OreCountChangedEvent} from "../events/OreCountChangedEvent";
import {DifficultyEstimator} from "../util/DifficultyEstimator";
import {ShieldHealthChangedEvent} from "../events/ShieldHealthChangedEvent";
import {UndiscoveredOreCountChangedEvent} from "../events/UndiscoveredOreCountChangedEvent";
import {PlanetRaidStatusChangedEvent} from "../events/PlanetRaidStatusChangedEvent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {Fleet} from "./Fleet";
import {TrackDestroyedStructsEvent} from "../events/TrackDestroyedStructsEvent";
import {TrackDestroyedStructEvent} from "../events/TrackDestroyedStructEvent";
import {DateFormatter} from "../util/DateFormatter";
import {RenderPlayerPfpEvent} from "../events/RenderPlayerPfpEvent";
import {FleetChangedEvent} from "../events/FleetChangedEvent";
import {legacyToBase, toBase} from "../util/Units";

export class KeyPlayer {

  /**
   * @param {string} playerType See PLAYER_TYPES
   * @param {boolean} planetUsedForMap Whether or not this key player's planet is used for a map
   * @param {string} planetMapType The map type of this planet if it's used for a map.
   * @param {string} foreignRaidInfoKeyPlayer The key player that contains the raid info
   */
  constructor(
    playerType,
    planetUsedForMap,
    planetMapType = '',
    foreignRaidInfoKeyPlayer = ''
  ) {

    this.chargeCalculator = new ChargeCalculator();
    this.difficultyEstimator = new DifficultyEstimator();
    this.dateFormatter = new DateFormatter();

    /** @type {string} See PLAYER_TYPES */
    this.playerType = playerType;

    /** @type {string} */
    this.id = '';

    /** @type {Player} */
    this.player = null;

    /** @type {number} UI/display value; may be optimistically drained on enqueue. */
    this.lastActionBlockHeight = 0;

    /** @type {number} GRASS/chain/API confirmed value; read by the signing queue scheduler. */
    this.confirmedLastActionBlockHeight = 0;

    /** @type {boolean} True once the confirmed value has been loaded (API/GRASS); gates charge scheduling. */
    this.confirmedLastActionLoaded = false;

    /** @type {number} */
    this.chargeLevel = 0;

    /** @type {Planet} */
    this.planet = null;

    /** @type {string} */
    this.planetShieldHealth = '';

    /** @type {PlanetaryShieldInfoDTO} */
    this.planetShieldInfo = new PlanetaryShieldInfoDTO();

    /** @type {PlanetRaid} */
    this.planetRaidInfo = new PlanetRaid();

    /** @type {boolean} Whether or not this key player's planet is used for a map */
    this.planetUsedForMap = planetUsedForMap;

    /** @type {string} The map type of this planet if it's used for a map. */
    this.planetMapType = planetUsedForMap ? planetMapType : '';

    /** @type {Fleet} */
    this.fleet = null;

    /** @type {Object<string, Struct>} */
    this.structs = {};

    /** @type {string} foreignRaidInfoKeyPlayer */
    this.foreignRaidInfoKeyPlayer = foreignRaidInfoKeyPlayer;

  }

  /**
   * Legacy wrapper: whole Alpha (grams) → ualpha on alpha_p.
   * @param {number|string} alpha
   */
  setAlpha(alpha) {
    this.setAlphaP(legacyToBase(alpha, 6));
  }

  /**
   * @param {bigint|string|number|null|undefined} alpha_p ualpha
   */
  setAlphaP(alpha_p) {
    if (this.player && this.player.hasOwnProperty('alpha_p')) {
      this.player.alpha_p = toBase(alpha_p);
      this.player.alpha = this.player.alpha_p != null
        ? Number(this.player.alpha_p / 1000000n)
        : null;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new AlphaCountChangedEvent(this.playerType));
    }
  }

  /**
   * Legacy wrapper: watts → milliwatts on connection_capacity_p.
   * @param {number|string} connectionCapacity
   */
  setConnectionCapacity(connectionCapacity) {
    this.setConnectionCapacityP(legacyToBase(connectionCapacity, 3));
  }

  /**
   * @param {bigint|string|number|null|undefined} connectionCapacity_p milliwatts
   */
  setConnectionCapacityP(connectionCapacity_p) {
    if (this.player && this.player.hasOwnProperty('connection_capacity_p')) {
      this.player.connection_capacity_p = toBase(connectionCapacity_p);
      this.player.connection_capacity = this.player.connection_capacity_p != null
        ? Number(this.player.connection_capacity_p / 1000n)
        : null;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * @param {Fleet} fleet
   */
  setFleet(fleet) {
    this.fleet = fleet;

    window.dispatchEvent(new FleetChangedEvent(this.playerType));
  }

  /**
   * @param {string} id
   */
  setId(id) {
    this.id = id;

    window.dispatchEvent(new SaveGameStateEvent());
  }

  /**
   * @param {number} currentBlockHeight
   * @param {number} height
   */
  setLastActionBlockHeight(currentBlockHeight, height) {
    this.lastActionBlockHeight = height;
    this.confirmedLastActionBlockHeight = height;
    this.confirmedLastActionLoaded = true;
    this.chargeLevel = this.chargeCalculator.calc(currentBlockHeight, this.lastActionBlockHeight);

    window.dispatchEvent(new SaveGameStateEvent());
    window.dispatchEvent(new ChargeLevelChangedEvent(this.id, this.chargeLevel));
  }

  /**
   * Optimistically drain the displayed charge bar as if an action landed this
   * block. UI-only: does NOT touch confirmedLastActionBlockHeight, so the signing
   * queue scheduler keeps using the GRASS/chain-confirmed base.
   *
   * @param {number} currentBlockHeight
   */
  setOptimisticLastActionBlockHeight(currentBlockHeight) {
    this.lastActionBlockHeight = currentBlockHeight + 1;
    this.chargeLevel = this.chargeCalculator.calc(currentBlockHeight, this.lastActionBlockHeight);

    window.dispatchEvent(new SaveGameStateEvent());
    window.dispatchEvent(new ChargeLevelChangedEvent(this.id, this.chargeLevel));
  }

  /**
   * Legacy wrapper: watts → milliwatts on load_p.
   * @param {number|string} load
   */
  setLoad(load) {
    this.setLoadP(legacyToBase(load, 3));
  }

  /**
   * @param {bigint|string|number|null|undefined} load_p milliwatts
   */
  setLoadP(load_p) {
    if (this.player && this.player.hasOwnProperty('load_p')) {
      this.player.load_p = toBase(load_p);
      this.player.load = this.player.load_p != null
        ? Number(this.player.load_p / 1000n)
        : null;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * Legacy wrapper / passthrough: ore is already grams (exp 0).
   * @param {number|string} ore
   */
  setOre(ore) {
    this.setOreP(ore);
  }

  /**
   * @param {bigint|string|number|null|undefined} ore_p grams
   */
  setOreP(ore_p) {
    if (this.player && this.player.hasOwnProperty('ore_p')) {
      this.player.ore_p = toBase(ore_p);
      this.player.ore = this.player.ore_p != null
        ? Number(this.player.ore_p)
        : null;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new OreCountChangedEvent(this.playerType));
    }
  }

  /**
   * @param {Planet} planet
   */
  setPlanet(planet) {
    this.planet = planet;

    window.dispatchEvent(new UndiscoveredOreCountChangedEvent(this.playerType));
  }

  /**
   * @param {string} status
   * @param dispatchEvent
   */
  setPlanetRaidStatus(status, dispatchEvent = true) {
    this.planetRaidInfo.status = status;
    window.dispatchEvent(new SaveGameStateEvent());

    if (dispatchEvent) {
      window.dispatchEvent(new PlanetRaidStatusChangedEvent(this.playerType));
    }
  }

  /**
   * @param {number} currentBlockHeight
   */
  setPlanetShieldHealth(currentBlockHeight) {
    if (
      this.planetRaidInfo.isRaidActive()
      && currentBlockHeight
      && this.planetShieldInfo.block_start_raid
    ) {
      let health = this.difficultyEstimator.getTimeRemainingEstimate(
        this.planetShieldInfo.planetary_shield,
        this.planetShieldInfo.block_start_raid,
        currentBlockHeight
      );
      this.planetShieldHealth = this.dateFormatter.formatDuration(health);
    } else {
      this.planetShieldHealth = '';
    }

    window.dispatchEvent(new ShieldHealthChangedEvent(this.playerType));
  }

  /**
   * @param {PlanetaryShieldInfoDTO} info
   * @param {number} currentBlockHeight
   */
  setPlanetShieldInfo(info, currentBlockHeight) {
    this.planetShieldInfo = info;

    this.setPlanetShieldHealth(currentBlockHeight);
  }

  /**
   * @param {Player} player
   */
  setPlayer(player) {
    this.player = player;

    window.dispatchEvent(new AlphaCountChangedEvent(this.playerType));
    window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    window.dispatchEvent(new OreCountChangedEvent(this.playerType));
    window.dispatchEvent(new RenderPlayerPfpEvent(this.playerType));
  }

  /**
   * Legacy wrapper: watts → milliwatts on capacity_p.
   * @param {number|string} capacity
   */
  setPlayerCapacity(capacity) {
    this.setPlayerCapacityP(legacyToBase(capacity, 3));
  }

  /**
   * @param {bigint|string|number|null|undefined} capacity_p milliwatts
   */
  setPlayerCapacityP(capacity_p) {
    if (this.player && this.player.hasOwnProperty('capacity_p')) {
      this.player.capacity_p = toBase(capacity_p);
      this.player.capacity = this.player.capacity_p != null
        ? Number(this.player.capacity_p / 1000n)
        : null;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * @param {Struct[]} structs
   */
  setStructs(structs) {
    this.structs = {};
    structs.forEach(struct => {
      this.structs[struct.id] = struct;
    });

    window.dispatchEvent(new StructCountChangedEvent(this.playerType));
    window.dispatchEvent(new TrackDestroyedStructsEvent(this.playerType));
  }

  /**
   * Legacy wrapper: watts → milliwatts on structs_load_p.
   * @param {number|string} structsLoad
   */
  setStructsLoad(structsLoad) {
    this.setStructsLoadP(legacyToBase(structsLoad, 3));
  }

  /**
   * @param {bigint|string|number|null|undefined} structsLoad_p milliwatts
   */
  setStructsLoadP(structsLoad_p) {
    if (this.player && this.player.hasOwnProperty('structs_load_p')) {
      this.player.structs_load_p = toBase(structsLoad_p);
      this.player.structs_load = this.player.structs_load_p != null
        ? Number(this.player.structs_load_p / 1000n)
        : null;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * @param {Struct} struct
   */
  setStruct(struct) {
    this.structs[struct.id] = struct;

    window.dispatchEvent(new StructCountChangedEvent(this.playerType));
    window.dispatchEvent(new TrackDestroyedStructEvent(this.playerType, struct.id));
  }

  /**
   * @param {number} currentBlockHeight
   * @return {number}
   */
  getCharge(currentBlockHeight) {
    return this.chargeCalculator.calcCharge(currentBlockHeight, this.lastActionBlockHeight);
  }

  getForeignRaidInfoSource() {
    return this.foreignRaidInfoKeyPlayer;
  }

  getPlanetId() {
    if (!this.planetUsedForMap) {
      return null;
    }

    if (this.planet) {
      return this.planet.id;
    } else if (this.isRaidDependent()) {
      return this.planetRaidInfo.planet_id;
    }

    return null;
  }

  /**
   * @return {string}
   */
  getPlanetShieldHealth() {
    return this.planetShieldHealth;
  }

  /**
   * @return {string}
   */
  getTag() {
    return this.player && this.player.tag && this.player.tag.length > 0
      ? `[${this.player.tag}]`
      : '';
  }

  /**
   * @return {string}
   */
  getUsername() {
    return this.player && this.player.username && this.player.username.length > 0
      ? `${this.player.username}`
      : `PID# ${this.id}`;
  }

  /**
   * @return {boolean}
   */
  isRaidDependent() {
    return this.playerType !== PLAYER_TYPES.PLAYER;
  }

  /**
   * @return {boolean}
   */
  hasForeignRaidInfo() {
    return !!this.foreignRaidInfoKeyPlayer;
  }

  /**
   * @param {string} fleetId
   */
  isFleetOwner(fleetId) {
    return fleetId && this.fleet?.id === fleetId;
  }

  /**
   * @return {boolean}
   */
  isCommandStructAlive() {
    return !!(
      this.fleet?.command_struct
      && this.structs[this.fleet.command_struct]
      && this.structs[this.fleet.command_struct].isBuilt()
      && !this.structs[this.fleet.command_struct].isDestroyed()
    );
  }

  /**
   * @return {boolean}
   */
  arePlanetaryDefensesSecure() {
    return !!(
      this.fleet?.isOnStation()
      && this.isCommandStructAlive()
    );
  }

  /**
   * @return {boolean}
   */
  arePlanetaryDefensesVulnerable() {
    return !this.arePlanetaryDefensesSecure();
  }

  /**
   * @return {boolean}
   */
  arePlanetaryDefensesBreached() {
    return !!(
      this.arePlanetaryDefensesVulnerable()
      && this.planetRaidInfo.isRaidActive()
    );
  }

  /**
   * @return {string}
   */
  getProjectedShieldBreachTime() {
    let health = this.difficultyEstimator.getTimeRemainingEstimate(
      this.planetShieldInfo.planetary_shield,
      1,
      1
    );
    return this.dateFormatter.formatDuration(health);
  }
}
