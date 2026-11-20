import {GuildAPI} from "../api/GuildAPI";
import {PublicSectorBlitzAPI} from "../api/PublicSectorBlitzAPI";
import {GuildAPIError} from "../errors/GuildAPIError";

/** How many more times a snapshot older than the newest live message is asked for. */
const SNAPSHOT_RETRIES = 3;
const SNAPSHOT_RETRY_MS = 1000;

/**
 * Guild API for spectating a raid. The game's map, HUD and GRASS listeners keep making their
 * usual reads; this answers them from the public raid snapshot instead, which the server builds
 * once per block for everyone watching. Nothing here needs a signed-in player.
 *
 * Reads the snapshot does not cover fall through to the real API and fail, as they would for
 * any visitor who is not signed in; spectator mode keeps the UI away from them.
 */
export class SpectatorGuildAPI extends GuildAPI {

  /**
   * @param {string} planetId the raided planet being watched
   * @param {PublicSectorBlitzAPI} publicAPI
   */
  constructor(planetId, publicAPI = new PublicSectorBlitzAPI()) {
    super();
    this.planetId = planetId;
    this.publicAPI = publicAPI;
    this.spectator = true;

    /** @type {object|null} the latest snapshot */
    this.snapshot = null;

    /** @type {Promise<object>|null} the snapshot request in flight, shared by concurrent reads */
    this.snapshotRequest = null;

    /**
     * The newest block a live message has reported. Reads made after it wait for a snapshot
     * at least this new, so a struct refreshed after an attack shows the attack's result.
     *
     * @type {number}
     */
    this.minHeight = 0;

    /** @type {Promise<Array>|null} */
    this.structTypesRequest = null;
  }

  cacheItem(key, value) {}

  getCachedItem(key, ttl) {
    return null;
  }

  /**
   * @param {number|string|null|undefined} height
   */
  observeHeight(height) {
    const value = Number(height);
    if (Number.isSafeInteger(value) && value > this.minHeight) {
      this.minHeight = value;
    }
  }

  /**
   * @param {object|null} snapshot
   * @return {boolean}
   */
  isFresh(snapshot) {
    return snapshot !== null && Number(snapshot.height) >= this.minHeight;
  }

  /**
   * Once the contest is no longer running, the server stops building snapshots: the one it
   * sends never catches up with the live messages, and asking again cannot change that.
   *
   * @param {object|null} snapshot
   * @return {boolean}
   */
  isFinal(snapshot) {
    return snapshot !== null && snapshot.phase !== 'active';
  }

  /**
   * The snapshot, fetched again when a live message has reported a newer block. When the
   * server is still behind that block, it is asked again a few times, a second apart, and then
   * the newest copy it has is used.
   *
   * @param {boolean} force fetch even when the current copy is new enough, and use whatever comes back
   * @return {Promise<object>}
   */
  async loadSnapshot(force = false) {
    if (!force && (this.isFresh(this.snapshot) || this.isFinal(this.snapshot))) {
      return this.snapshot;
    }
    for (let attempt = 0; ; attempt++) {
      const snapshot = await this.fetchSnapshot();
      if (force || this.isFresh(snapshot) || this.isFinal(snapshot) || attempt >= SNAPSHOT_RETRIES) {
        return snapshot;
      }
      await new Promise(resolve => setTimeout(resolve, SNAPSHOT_RETRY_MS));
    }
  }

  /**
   * One snapshot request, shared by every read made while it is in flight.
   *
   * @return {Promise<object>} the newest snapshot received so far
   */
  fetchSnapshot() {
    if (!this.snapshotRequest) {
      const minHeight = this.minHeight;
      this.snapshotRequest = this.publicAPI.getSpectate(this.planetId, minHeight || null)
        .then(snapshot => {
          if (!this.snapshot || Number(snapshot.height) >= Number(this.snapshot.height)) {
            this.snapshot = snapshot;
          }
          return this.snapshot;
        })
        .finally(() => {
          this.snapshotRequest = null;
        });
    }
    return this.snapshotRequest;
  }

  /**
   * @param {string} playerId
   * @return {Promise<object|null>} the attacker's or defender's part of the snapshot
   */
  async side(playerId) {
    const snapshot = await this.loadSnapshot();
    return [snapshot.attacker, snapshot.defender].find(side => side?.player?.id === playerId) ?? null;
  }

  /**
   * @param {string} what
   * @throws {GuildAPIError}
   */
  notInRaid(what) {
    throw new GuildAPIError(`${what} is not part of the raid being watched`);
  }

  async getStructTypes() {
    if (!this.structTypesRequest) {
      this.structTypesRequest = this.publicAPI.getStructTypes()
        .then(response => this.structTypeFactory.parseList(response.data))
        .catch(error => {
          this.structTypesRequest = null;
          throw error;
        });
    }
    return this.structTypesRequest;
  }

  async getStruct(structId) {
    const snapshot = await this.loadSnapshot();
    for (const side of [snapshot.attacker, snapshot.defender]) {
      const row = side?.structs?.find(struct => struct.id === structId);
      if (row) {
        return this.structFactory.make(row, side.structs_meta ?? null);
      }
    }
    return this.notInRaid(`Struct ${structId}`);
  }

  async getStructsByPlayerId(playerId) {
    const side = await this.side(playerId);
    if (!side) {
      return this.notInRaid(`Player ${playerId}`);
    }
    return side.structs.map(row => this.structFactory.make(row, side.structs_meta ?? null));
  }

  async getPlayer(playerId) {
    const side = await this.side(playerId);
    if (!side?.player) {
      return this.notInRaid(`Player ${playerId}`);
    }
    return this.playerFactory.make(side.player);
  }

  async getPlayerLastActionBlockHeight(playerId) {
    const side = await this.side(playerId);
    return parseInt(side?.last_action_block_height?.last_action_block_height ?? 0);
  }

  async getFleetByPlayerId(playerId) {
    const side = await this.side(playerId);
    if (!side?.fleet) {
      return this.notInRaid(`The fleet of player ${playerId}`);
    }
    return this.fleetFactory.make(side.fleet);
  }

  async getPlanet(planetId) {
    const snapshot = await this.loadSnapshot();
    if (planetId !== this.planetId || !snapshot.planet) {
      return this.notInRaid(`Planet ${planetId}`);
    }
    return this.planetFactory.make(snapshot.planet);
  }

  async getPlanetaryShieldInfo(planetId) {
    const snapshot = await this.loadSnapshot();
    if (planetId !== this.planetId || !snapshot.shield) {
      return this.notInRaid(`Planet ${planetId}`);
    }
    return this.planetaryShieldInfoDTOFactory.make(snapshot.shield);
  }

  /**
   * @return {Promise<PlanetRaid>} the raid, with the planet's owner as the defender
   */
  async getActivePlanetRaidByPlanetId(planetId) {
    const snapshot = await this.loadSnapshot();
    if (planetId !== this.planetId || !snapshot.raid) {
      return this.planetRaidFactory.make({});
    }
    return this.planetRaidFactory.make({...snapshot.raid, planet_owner: snapshot.planet?.owner ?? null});
  }

  async getActivePlanetRaidByFleetId(fleetId) {
    const snapshot = await this.loadSnapshot();
    if (!snapshot.raid || snapshot.raid.fleet_id !== fleetId) {
      return this.planetRaidFactory.make({});
    }
    return this.getActivePlanetRaidByPlanetId(this.planetId);
  }

  async getPlanetActivityEvent(planetId, seq, time) {
    if (planetId !== this.planetId) {
      return this.notInRaid(`Planet ${planetId}`);
    }
    const response = await this.publicAPI.getPlanetActivityEvent(planetId, `${seq}`, time);
    return response.data;
  }

  async getWorkByPlayerId(playerId) {
    return [];
  }

  async getBannedWords() {
    return [];
  }

  async logout() {}
}
