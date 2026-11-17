import {FEATURE_FLAGS} from "../constants/FeatureFlags";
import {SECTOR_BLITZ, SECTOR_BLITZ_PHASES, SECTORS} from "../constants/SectorBlitzConstants";
import {TASK} from "../constants/TaskConstants";
import {EVENTS} from "../constants/Events";
import {TutorialMode} from "../tutorial/TutorialMode";
import {InfluenceStream} from "../framework/InfluenceStream";
import {GrassInfluenceConnection} from "../framework/GrassInfluenceConnection";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

/**
 * Knows which Sector Blitz contest (if any) the player should see and keeps it live.
 *
 * - Active: start_height <= height < end_height.
 * - Results: end_height <= height < end_height + 14 days of blocks.
 * - Nothing is shown before a contest starts.
 */
export class SectorBlitzManager {

  /**
   * @param {GameState} gameState
   * @param {InfluenceAPI} influenceAPI
   * @param {GrassManager} grassManager
   */
  constructor(gameState, influenceAPI, grassManager) {
    this.gameState = gameState;
    this.influenceAPI = influenceAPI;
    this.grassManager = grassManager;

    /** @type {object[]|null} */
    this.contests = null;
    this.contestsLoadedAt = 0;
    this.contestsRequest = null;

    this.phase = SECTOR_BLITZ_PHASES.NONE;
    this.contest = null;

    this.stream = null;
    this.streamSubject = null;
    this.connection = null;
    this.updateTimer = null;
    this.lastUpdateDispatchedAt = 0;

    this.onBlockHeightChanged = () => this.evaluatePhase();
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return FEATURE_FLAGS.SECTOR_BLITZ && !TutorialMode.isActive();
  }

  init() {
    if (!this.isEnabled()) return;
    window.addEventListener(EVENTS.BLOCK_HEIGHT_CHANGED, this.onBlockHeightChanged);
    window.addEventListener(EVENTS.LOGIN_COMPLETE, () => this.refresh(true).catch(() => {}));
    this.refresh().catch(error => console.debug('[SectorBlitz] contests unavailable:', error));
  }

  /**
   * The contest API needs a signed-in session; never prompt a session recovery for it.
   *
   * @return {boolean}
   */
  isSignedIn() {
    return !!this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]?.player;
  }

  /**
   * @return {number}
   */
  getCurrentHeight() {
    const height = Number(this.gameState.currentBlockHeight) || 0;
    if (height > 0) return height;
    // Before the first block arrives, the indexer's height is the best estimate.
    return Math.max(0, ...(this.contests ?? []).map(contest => Number(contest.source_height) || 0));
  }

  /**
   * Reload the contest configuration (cached for a minute unless forced).
   *
   * @param {boolean} force
   * @return {Promise<{phase: string, contest: object|null}>}
   */
  async refresh(force = false) {
    if (!this.isEnabled() || !this.isSignedIn()) {
      return {phase: SECTOR_BLITZ_PHASES.NONE, contest: null};
    }

    const fresh = this.contests !== null && Date.now() - this.contestsLoadedAt < SECTOR_BLITZ.CONTEST_REFRESH_MS;
    if (!force && fresh) {
      return this.evaluatePhase();
    }

    if (!this.contestsRequest) {
      this.contestsRequest = this.influenceAPI.getContests()
        .then(contests => {
          this.contests = contests;
          this.contestsLoadedAt = Date.now();
        })
        .finally(() => this.contestsRequest = null);
    }

    try {
      await this.contestsRequest;
    } catch (error) {
      console.debug('[SectorBlitz] contests unavailable:', error);
      if (this.contests === null) {
        this.contests = [];
        this.contestsLoadedAt = Date.now();
      }
    }

    return this.evaluatePhase();
  }

  /**
   * @return {{phase: string, contest: object|null}}
   */
  evaluatePhase() {
    let phase = SECTOR_BLITZ_PHASES.NONE;
    let contest = null;

    if (this.isEnabled() && this.isSignedIn() && this.contests) {
      const height = this.getCurrentHeight();
      const chainId = this.gameState.thisGuild?.chain_id ?? null;
      const candidates = this.contests.filter(c => !chainId || !c.chain_id || c.chain_id === chainId);

      const active = candidates.filter(c => Number(c.start_height) <= height && height < Number(c.end_height));
      const ended = candidates.filter(c =>
        Number(c.end_height) <= height
        && height < Number(c.end_height) + SECTOR_BLITZ.RESULTS_DISPLAY_BLOCKS
      );

      if (height > 0 && active.length) {
        phase = SECTOR_BLITZ_PHASES.ACTIVE;
        contest = active.sort((a, b) => Number(b.start_height) - Number(a.start_height))[0];
      } else if (height > 0 && ended.length) {
        phase = SECTOR_BLITZ_PHASES.RESULTS;
        contest = ended.sort((a, b) => Number(b.end_height) - Number(a.end_height))[0];
      }
    }

    const changed = phase !== this.phase || contest?.contest_id !== this.contest?.contest_id;
    this.phase = phase;
    this.contest = contest;

    if (changed) {
      this.restartLiveUpdates();
      window.dispatchEvent(new CustomEvent(EVENTS.SECTOR_BLITZ_PHASE_CHANGED, {detail: {phase, contest}}));
    }

    return {phase, contest};
  }

  /**
   * @return {boolean}
   */
  isActive() {
    return this.isEnabled() && this.phase === SECTOR_BLITZ_PHASES.ACTIVE && !!this.contest;
  }

  /**
   * @return {boolean}
   */
  isShowingResults() {
    return this.isEnabled() && this.phase === SECTOR_BLITZ_PHASES.RESULTS && !!this.contest;
  }

  /**
   * @return {boolean}
   */
  isVisible() {
    return this.isActive() || this.isShowingResults();
  }

  /**
   * @return {number} estimated milliseconds until the contest's end block
   */
  getMsRemaining() {
    if (!this.contest) return 0;
    const blocks = Number(this.contest.end_height) - this.getCurrentHeight();
    return Math.max(0, blocks * TASK.ESTIMATED_BLOCK_TIME);
  }

  /**
   * @return {number[]} sector ids that are scored in the current contest
   */
  getSectorIds() {
    return SECTORS.map(sector => sector.id);
  }

  restartLiveUpdates() {
    this.stopLiveUpdates();

    if (!this.contest || !this.contest.chain_id || !this.isVisible()) {
      return;
    }

    // Results are frozen at the contest end, but the published build is only final
    // once sectors are complete, so results keep listening too.
    const contestId = this.contest.contest_id;
    this.streamSubject = `structs.influence.${this.contest.chain_id}.${contestId}.scores`;
    this.connection = new GrassInfluenceConnection(this.grassManager, `INFLUENCE_${contestId}`);

    // The first snapshot is the page's own initial load; only later resyncs are news.
    let seeded = false;

    try {
      this.stream = new InfluenceStream(this.connection, this.streamSubject, {
        loadSnapshot: async ({signal}) => {
          const response = await this.influenceAPI.getStandings(contestId, {signal});
          return {build_id: response.meta.build_id, height: response.meta.height, context: {}, data: response.data};
        },
        onSnapshot: () => {
          if (seeded) this.queueUpdate();
          seeded = true;
        },
        onUpdate: () => this.queueUpdate(),
        onError: error => console.debug('[SectorBlitz] live update error:', error),
      });
      this.stream.start();
    } catch (error) {
      console.debug('[SectorBlitz] live updates unavailable:', error);
      this.stream = null;
    }
  }

  stopLiveUpdates() {
    this.stream?.stop();
    this.stream = null;
    this.streamSubject = null;
    this.connection = null;
    clearTimeout(this.updateTimer);
    this.updateTimer = null;
  }

  /**
   * Coalesce bursts of score frames into one refresh of whatever contest page is open.
   */
  queueUpdate() {
    if (this.updateTimer) return;
    const wait = Math.max(0, this.lastUpdateDispatchedAt + SECTOR_BLITZ.LIVE_REFRESH_THROTTLE_MS - Date.now());
    this.updateTimer = setTimeout(() => {
      this.updateTimer = null;
      this.lastUpdateDispatchedAt = Date.now();
      window.dispatchEvent(new CustomEvent(EVENTS.SECTOR_BLITZ_UPDATED, {detail: {contest: this.contest}}));
    }, wait);
  }
}
