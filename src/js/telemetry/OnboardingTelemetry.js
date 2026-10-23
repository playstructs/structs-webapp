/**
 * Onboarding telemetry: records which signup and tutorial steps a new player
 * reaches or skips, so drop-off can be measured per step. See structs-pg
 * docs/onboarding-telemetry-handoff.md for the data model.
 *
 * Writes are insert-only and keyed by (session, step, kind) on the server, so
 * resending is harmless. Events are queued in sessionStorage because the
 * tutorial launches and exits with a page reload; pending events are sent with
 * sendBeacon before those reloads and when the page is hidden.
 */

/** Same value as mini_game_progress.interface_name for this client. */
export const ONBOARDING_INTERFACE_NAME = 'structs-webapp';

/**
 * The tutorial design being played. Bump by hand when the tutorial changes,
 * together with a new onboarding_step catalog in structs-pg.
 */
export const ONBOARDING_CONTENT_VERSION = 'tutorial-4';

export const ONBOARDING_STEP_KINDS = {
  REACHED: 'reached',
  SKIPPED: 'skipped',
};

/** The only step whose reached event carries the player id. */
export const ONBOARDING_PLAYER_STEP_KEY = 'signup.employee_record';

const ENDPOINT = '/api/onboarding/events';

/** Must not exceed the server's OnboardingManager::MAX_EVENTS. */
const MAX_EVENTS_PER_REQUEST = 64;

/** Steps close together go out in one request. */
const FLUSH_DELAY_MS = 2000;

/** Wait before retrying after a network error or rate limit. */
const RETRY_DELAY_MS = 15000;

const STORAGE_KEYS = {
  BROWSER_ID: 'onboardingBrowserId',
  SESSION_ID: 'onboardingSessionId',
  QUEUE: 'onboardingQueue',
  RECORDED: 'onboardingRecorded',
};

/** Menu pages that are onboarding steps, as "Controller.page". */
const NAVIGATION_STEP_KEYS = {
  'Auth.signupConnectingToCorporate1': 'signup.connecting',
  'Auth.signupConnectingToCorporate2': 'signup.connected',
  'Auth.signupIncomingCall1': 'signup.incoming_call',
  'Auth.signupIncomingCall2': 'signup.hr_greeting',
  'Auth.signupIncomingCall3': 'signup.orientation_brief',
  'Auth.signupSetUsername': 'signup.profile',
  'Auth.signupRecoveryKeyIntro': 'signup.recovery_key_intro',
  'Auth.signupRecoveryKeyCreation': 'signup.recovery_key_create',
  'Auth.signupRecoveryKeyFaq': 'signup.recovery_key_faq',
  'Auth.signupRecoveryKeyConfirmation': 'signup.recovery_key_confirm',
  'Auth.signupSuccess': 'signup.submit',
  'Auth.orientationEnd': 'orientation.tutorial_offer',
  'Tutorial.loading': 'tutorial.loading',
};

/** The page that starts signup, and so the onboarding session. */
const SESSION_START_PAGE = 'Auth.signupConnectingToCorporate1';

/**
 * @return {string}
 */
function createUuid() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Storage can be unavailable (private windows, blocked site data). Telemetry
 * must never break the game, so every access is guarded.
 *
 * @param {Storage} storage
 * @param {string} key
 * @return {string|null}
 */
function readStorage(storage, key) {
  try {
    return storage.getItem(key);
  } catch (error) {
    return null;
  }
}

/**
 * @param {Storage} storage
 * @param {string} key
 * @param {string} value
 */
function writeStorage(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch (error) {
    // Telemetry is best effort.
  }
}

export class OnboardingTelemetry {

  constructor() {
    this.flushTimer = null;
    this.sending = false;

    window.addEventListener('pagehide', () => this.flushNow());
  }

  /**
   * @return {string} this browser's id, created on first use
   */
  getBrowserId() {
    let browserId = readStorage(localStorage, STORAGE_KEYS.BROWSER_ID);
    if (!browserId) {
      browserId = createUuid();
      writeStorage(localStorage, STORAGE_KEYS.BROWSER_ID, browserId);
    }
    return browserId;
  }

  /**
   * @return {string|null} this tab's onboarding session, if signup has started in it
   */
  getSessionId() {
    return readStorage(sessionStorage, STORAGE_KEYS.SESSION_ID);
  }

  /**
   * Starts this tab's onboarding session, once. A new tab or a later visit
   * starts a new one; the browser id ties them together.
   */
  startSession() {
    if (!this.getSessionId()) {
      writeStorage(sessionStorage, STORAGE_KEYS.SESSION_ID, createUuid());
    }
  }

  /**
   * Records the onboarding step for a menu page, if it is one.
   *
   * @param {string} controllerName
   * @param {string} pageName
   */
  recordNavigation(controllerName, pageName) {
    const page = `${controllerName}.${pageName}`;
    if (page === SESSION_START_PAGE) {
      this.startSession();
    }
    const stepKey = NAVIGATION_STEP_KEYS[page];
    if (stepKey) {
      this.reached(stepKey);
    }
  }

  /**
   * @param {string} stepKey
   * @param {string|null} playerId only for ONBOARDING_PLAYER_STEP_KEY
   */
  reached(stepKey, playerId = null) {
    this.record(stepKey, ONBOARDING_STEP_KINDS.REACHED, playerId);
  }

  /**
   * @param {string} stepKey
   */
  skipped(stepKey) {
    this.record(stepKey, ONBOARDING_STEP_KINDS.SKIPPED);
  }

  /**
   * Queues an event. Without a session (signup never started in this tab)
   * nothing is recorded. Each step and kind is recorded once per session, so
   * page restores and back navigation do not resend.
   *
   * @param {string} stepKey
   * @param {string} kind
   * @param {string|null} playerId
   */
  record(stepKey, kind, playerId = null) {
    if (!this.getSessionId()) {
      return;
    }

    const recorded = this.readList(STORAGE_KEYS.RECORDED);
    const recordedKey = `${stepKey}|${kind}`;
    if (recorded.includes(recordedKey)) {
      return;
    }
    recorded.push(recordedKey);
    writeStorage(sessionStorage, STORAGE_KEYS.RECORDED, JSON.stringify(recorded));

    const event = {id: createUuid(), step_key: stepKey, kind};
    if (playerId && stepKey === ONBOARDING_PLAYER_STEP_KEY && kind === ONBOARDING_STEP_KINDS.REACHED) {
      event.player_id = playerId;
    }

    const queue = this.readList(STORAGE_KEYS.QUEUE);
    queue.push(event);
    this.writeQueue(queue);

    this.scheduleFlush(FLUSH_DELAY_MS);
  }

  /**
   * @param {number} delayMs
   */
  scheduleFlush(delayMs) {
    if (this.flushTimer) {
      return;
    }
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush().then();
    }, delayMs);
  }

  /**
   * Sends one batch with fetch and removes it from the queue once the server
   * has it. Rejected batches are dropped rather than retried forever.
   *
   * @return {Promise<void>}
   */
  async flush() {
    const queue = this.readList(STORAGE_KEYS.QUEUE);
    if (this.sending || queue.length === 0 || !this.getSessionId()) {
      return;
    }

    const batch = queue.slice(0, MAX_EVENTS_PER_REQUEST);
    this.sending = true;
    let retry = false;

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: this.buildBody(batch),
        keepalive: true,
      });
      if (response.status === 429 || response.status >= 500) {
        retry = true;
      } else {
        this.removeFromQueue(batch);
      }
    } catch (error) {
      retry = true;
    } finally {
      this.sending = false;
    }

    if (retry) {
      this.scheduleFlush(RETRY_DELAY_MS);
    } else if (this.readList(STORAGE_KEYS.QUEUE).length > 0) {
      this.scheduleFlush(0);
    }
  }

  /**
   * Sends everything queued with sendBeacon, which survives the page going
   * away. Used on pagehide and before the tutorial's reloads.
   */
  flushNow() {
    clearTimeout(this.flushTimer);
    this.flushTimer = null;

    if (!this.getSessionId() || !navigator.sendBeacon) {
      return;
    }

    const queue = this.readList(STORAGE_KEYS.QUEUE);
    while (queue.length > 0) {
      const batch = queue.slice(0, MAX_EVENTS_PER_REQUEST);
      // text/plain keeps the beacon a simple request; the server reads the body as JSON.
      const body = new Blob([this.buildBody(batch)], {type: 'text/plain;charset=UTF-8'});
      if (!navigator.sendBeacon(ENDPOINT, body)) {
        break;
      }
      queue.splice(0, batch.length);
    }
    this.writeQueue(queue);
  }

  /**
   * @param {object[]} batch
   * @return {string}
   */
  buildBody(batch) {
    return JSON.stringify({
      session_id: this.getSessionId(),
      browser_id: this.getBrowserId(),
      interface_name: ONBOARDING_INTERFACE_NAME,
      content_version: ONBOARDING_CONTENT_VERSION,
      events: batch.map(({step_key, kind, player_id}) => (
        player_id ? {step_key, kind, player_id} : {step_key, kind}
      )),
    });
  }

  /**
   * Removes sent events by id, so events queued while the request was in
   * flight are kept.
   *
   * @param {object[]} batch
   */
  removeFromQueue(batch) {
    const sentIds = new Set(batch.map(event => event.id));
    this.writeQueue(this.readList(STORAGE_KEYS.QUEUE).filter(event => !sentIds.has(event.id)));
  }

  /**
   * @param {object[]} queue
   */
  writeQueue(queue) {
    writeStorage(sessionStorage, STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  }

  /**
   * @param {string} key
   * @return {Array}
   */
  readList(key) {
    try {
      const list = JSON.parse(readStorage(sessionStorage, key));
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }
}

export const onboardingTelemetry = new OnboardingTelemetry();
