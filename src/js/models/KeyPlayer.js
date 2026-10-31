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
import {playerFunds} from "../util/PlayerFunds";
import {exactQueryHeight, maxQueryHeight, protocolAtHeight} from "../util/ChainProtocol";
import {CHAIN} from "../constants/ChainConstants";

const FUNDS_FIELDS = ['alpha','vault_address','spendable_alpha_p','available_alpha_p','retained_alpha_p','retained_sources','retained_funds_meta','funds_meta'];

/**
 * Identifies the funds a snapshot shows, ignoring read heights, which advance
 * on every poll even when the balances are unchanged.
 *
 * @param {object} snapshot
 * @return {string}
 */
function fundsKey(snapshot) {
  const withoutHeight = meta => meta ? {...meta, height: undefined} : meta;
  return JSON.stringify({
    ...Object.fromEntries(FUNDS_FIELDS.map(field => [field, snapshot[field]])),
    funds_meta: withoutHeight(snapshot.funds_meta),
    retained_funds_meta: withoutHeight(snapshot.retained_funds_meta),
    protocol: snapshot.protocol,
    data_ready: snapshot.snapshot_meta?.data_ready,
    transaction_ready: snapshot.snapshot_meta?.transaction_ready
  });
}

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
    this.alphaSnapshot = null;
    this.fundsObservedHeight = null;

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

  setFunds(player, observedHeight = null) {
    if (!this.player || this.player.id !== this.id || player?.id !== this.id) return false;
    // Clearing an expired balance may mutate this.player. Stage the incoming
    // fields first, including when setPlayer just installed the same object.
    player = {...player};
    const meta = player.snapshot_meta;
    try {
      // A known activation boundary invalidates legacy funds even while the
      // new inventory projection or individual vault evidence is unavailable.
      if (meta?.chain_id === CHAIN.ID && meta.api_contract === CHAIN.API_CONTRACT
          && meta.observed_protocol === protocolAtHeight(CHAIN.ID,meta.observed_tip)) this.expireFunds(meta.observed_tip);
    } catch { return false; }
    let snapshot;
    try {
      const observed = this.fundsObservedHeight && observedHeight
        ? maxQueryHeight(this.fundsObservedHeight,observedHeight) : this.fundsObservedHeight || observedHeight;
      snapshot = playerFunds(player,observed);
    } catch { return false; }
    if (this.alphaSnapshot && BigInt(snapshot.height) < BigInt(this.alphaSnapshot.height)) return false;
    if (this.alphaSnapshot?.height === snapshot.height && (['alpha','vault_address','spendable_alpha_p','protocol'].some(
      field=>this.alphaSnapshot[field] !== snapshot[field]) || this.alphaSnapshot.funds_meta?.provisioned !== snapshot.funds_meta?.provisioned)) return false;
    this.expireFunds(maxQueryHeight(snapshot.snapshot_meta.observed_tip,observedHeight || snapshot.snapshot_meta.observed_tip));
    // A newer height with the same funds is not a change; listeners rebuild
    // their own state on this event.
    const changed = !this.alphaSnapshot || fundsKey(this.alphaSnapshot) !== fundsKey(snapshot);
    this.alphaSnapshot = snapshot;
    this.applyFunds();
    if (changed) window.dispatchEvent(new AlphaCountChangedEvent(this.playerType));
    return true;
  }

  applyFunds() {
    if (!this.player) return;
    const snapshot = this.alphaSnapshot;
    for (const field of FUNDS_FIELDS) {
      this.player[field] = snapshot ? structuredClone(snapshot[field]) : null;
    }
    // Funds refresh independently of profile/grid fields. Never stamp an old
    // full player row with the newer funds height.
    this.player.funds_snapshot_meta = snapshot ? structuredClone(snapshot.snapshot_meta) : null;
  }

  clearFunds() {
    this.alphaSnapshot = null;
    this.applyFunds();
    window.dispatchEvent(new AlphaCountChangedEvent(this.playerType));
  }

  expireFunds(height) {
    try { this.fundsObservedHeight = this.fundsObservedHeight ? maxQueryHeight(this.fundsObservedHeight,height) : exactQueryHeight(height); }
    catch { return; }
    if (this.alphaSnapshot && protocolAtHeight(CHAIN.ID,this.fundsObservedHeight) !== this.alphaSnapshot.protocol) this.clearFunds();
  }

  /**
   * @param {number} connectionCapacity
   */
  setConnectionCapacity(connectionCapacity) {
    if (this.player && this.player.hasOwnProperty('connection_capacity')) {
      this.player.connection_capacity = connectionCapacity;

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
    const changed = id !== this.id;
    if (changed) {
      this.player = null;
      this.alphaSnapshot = null;
      this.fundsObservedHeight = null;
    }
    this.id = id;
    if (changed) window.dispatchEvent(new AlphaCountChangedEvent(this.playerType));

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
   * @param {number} load
   */
  setLoad(load) {
    if (this.player && this.player.hasOwnProperty('load')) {
      this.player.load = load;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * @param {number|string} ore
   */
  setOre(ore) {
    if (this.player && this.player.hasOwnProperty('ore')) {
      this.player.ore = parseInt(ore);

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
  setPlayer(player, observedHeight = null, {simulated = false} = {}) {
    if (player?.id !== this.id) return false;
    if (this.player?.snapshot_meta) {
      try {
        if (BigInt(exactQueryHeight(player.snapshot_meta?.height)) < BigInt(exactQueryHeight(this.player.snapshot_meta.height))) return false;
      } catch { return false; }
    }
    if (observedHeight) this.expireFunds(observedHeight);
    this.player = player;
    let fundsApplied = false;
    if (!simulated || player.snapshot_meta || this.alphaSnapshot) {
      fundsApplied = this.setFunds(player,observedHeight);
      if (!fundsApplied) this.applyFunds();
    }

    if (!fundsApplied) window.dispatchEvent(new AlphaCountChangedEvent(this.playerType));
    window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    window.dispatchEvent(new OreCountChangedEvent(this.playerType));
    window.dispatchEvent(new RenderPlayerPfpEvent(this.playerType));
    return true;
  }

  /**
   * @param {number} capacity
   */
  setPlayerCapacity(capacity) {
    if (this.player && this.player.hasOwnProperty('capacity')) {
      this.player.capacity = capacity;

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
   * @param {number} structsLoad
   */
  setStructsLoad(structsLoad) {
    if (this.player && this.player.hasOwnProperty('structs_load')) {
      this.player.structs_load = structsLoad;

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
  isCommandStructOnPlanet() {
    return !!(
      this.fleet?.isOnStation()
      && this.isCommandStructAlive()
    );
  }

  /**
   * @return {boolean}
   */
  arePlanetaryDefensesSecure() {
    return this.isCommandStructOnPlanet();
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
