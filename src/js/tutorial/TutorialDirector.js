import {TutorialDialogue, TUTORIAL_DIALOGUE_POSITIONS} from "./TutorialDialogue";
import {TutorialPointer, TUTORIAL_POINTER_DIRECTIONS} from "./TutorialPointer";
import {TUTORIAL_IDS} from "./TutorialWorld";
import {TUTORIAL_COPY} from "./TutorialCopy";
import {HUDViewModel} from "../view_models/HUDViewModel";
import {EVENTS} from "../constants/Events";
import {MAP_TILE_TYPES} from "../constants/MapConstants";
import {STRUCT_ACTIONS} from "../constants/StructConstants";
import {ClearTileSelectionEvent} from "../events/ClearTileSelectionEvent";
import {MenuPage} from "../framework/MenuPage";

const TOP = TUTORIAL_DIALOGUE_POSITIONS.TOP;
const BOTTOM = TUTORIAL_DIALOGUE_POSITIONS.BOTTOM;
const UP = TUTORIAL_POINTER_DIRECTIONS.UP;

/** See focusHome(). */
const HOME_VERTICAL_ANCHOR = 0.44;

/** How long a camera pan takes. */
const CAMERA_PAN_MS = 600;

/** Pause after combat before the narrator comments on it. */
const AFTER_COMBAT_PAUSE_MS = 800;

const SELECTORS = {
  OK_BUTTON: '#notification-dialogue-btn-a',
  PRIMARY_WEAPON_BUTTON: '#player-action-bar-primary-weapon-btn',
  SECONDARY_WEAPON_BUTTON: '#player-action-bar-secondary-weapon-btn',
  DEFEND_BUTTON: '#player-action-bar-defend-btn',
  DEPLOY_BUTTON: '#player-action-bar-deploy-btn',
  MAP_TILE: '.map-tile-selection-tile',
  BATTERY: '#player-action-bar-battery',
  HEADER: '#player-action-bar-header',
  TILE_TYPE_ICON: '#player-action-bar-property-tile-type',
  SHIELD_STATUS: '#hud-shield-status',
  ORE: '#hud-ore-hint',
  DEPLOY_MENU: '#sui-offcanvas',
  DEPLOY_MENU_CLOSE: '.sui-offcanvas-close-btn',
};

/**
 * Runs the tutorial's script: narration, pointers and the moments where the
 * player has to act. The map, HUD and combat are the real game components
 * running against the TutorialWorld; this class only decides what happens
 * next and which controls the player may use at each step.
 */
export class TutorialDirector {

  /**
   * @param {GameState} gameState
   * @param {TutorialWorld} world
   * @param {SimulatedSigningClientManager} signingClientManager
   * @param {function(): void} rerenderMap
   * @param {function(string|null): void} sweepWreck clears a destroyed struct (or all, given null) off the map now
   * @param {function(): void} onComplete
   */
  constructor(gameState, world, signingClientManager, rerenderMap, sweepWreck, onComplete) {
    this.gameState = gameState;
    this.world = world;
    this.signingClientManager = signingClientManager;
    this.rerenderMap = rerenderMap;
    this.sweepWreck = sweepWreck;
    this.onComplete = onComplete;

    this.dialogue = new TutorialDialogue();
    this.pointer = new TutorialPointer();

    /**
     * Selectors the player may click. Null allows everything not denied.
     * @type {string[]|null}
     */
    this.allowedSelectors = [];

    /** @type {string[]} */
    this.deniedSelectors = [];

    /** @type {Array<function(string, object): void>} */
    this.actionListeners = [];

    /** Identifies the latest camera pan so an older one stops when a new one starts. */
    this.panId = 0;

    this.signingClientManager.onAction = (action, result) => {
      this.actionListeners.slice().forEach(listener => listener(action, result));
    };
  }

  /* Interaction gating */

  initClickGate() {
    const gate = (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const matches = selector => !!event.target.closest(selector);
      const denied = this.deniedSelectors.some(matches);
      const allowed = this.allowedSelectors === null || this.allowedSelectors.some(matches);

      if (denied || !allowed) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    // Capture phase on window runs before the page's own handlers.
    window.addEventListener('click', gate, true);
  }

  /**
   * @param {string[]|null} selectors null allows everything
   * @param {string[]} denied
   */
  allow(selectors, denied = []) {
    this.allowedSelectors = selectors;
    this.deniedSelectors = denied;
  }

  /* Element lookups */

  /**
   * @param {string} structId
   * @return {string}
   */
  structTileSelector(structId) {
    return `.map-tile-selection-tile[data-struct-id="${structId}"]`;
  }

  /**
   * @return {string}
   */
  commandTileSelector() {
    return `.map-tile-selection-tile[data-tile-type="${MAP_TILE_TYPES.COMMAND}"][data-ambit="LAND"][data-player-id="${TUTORIAL_IDS.PLAYER}"]`;
  }

  /**
   * @param {string} selector
   * @return {function(): (Element|null)}
   */
  find(selector) {
    return () => document.querySelector(selector);
  }

  /* Camera */

  /**
   * Pans the map (the window is the map's scroller) to bring an element into view.
   *
   * @param {string} selector
   * @param {string} inline 'start' keeps the element at the left edge, 'center' centers it
   * @param {number} verticalAnchor where the element's middle lands, as a fraction of the screen height
   */
  focus(selector, inline = 'center', verticalAnchor = 0.5) {
    const element = document.querySelector(selector);
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const maxX = document.documentElement.scrollWidth - window.innerWidth;
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    const targetX = inline === 'start'
      ? window.scrollX + rect.left
      : window.scrollX + rect.left + (rect.width / 2) - (window.innerWidth / 2);
    const targetY = window.scrollY + rect.top + (rect.height / 2) - (window.innerHeight * verticalAnchor);

    this.panTo(
      Math.max(0, Math.min(maxX, targetX)),
      Math.max(0, Math.min(maxY, targetY))
    );
  }

  /**
   * Native smooth scrolling is unreliable across browsers, so pan by hand.
   *
   * @param {number} x
   * @param {number} y
   */
  panTo(x, y) {
    const startX = window.scrollX;
    const startY = window.scrollY;
    const startTime = performance.now();
    const panId = ++this.panId;

    const step = (now) => {
      if (panId !== this.panId) {
        return;
      }
      const progress = Math.min(1, (now - startTime) / CAMERA_PAN_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo({
        left: startX + ((x - startX) * eased),
        top: startY + ((y - startY) * eased),
        behavior: 'instant'
      });
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  /**
   * Frames the Alpha Base the way the design does: the land battleground's
   * top row just above the middle of the screen.
   */
  focusHome() {
    this.focus(this.commandTileSelector(), 'start', HOME_VERTICAL_ANCHOR);
  }

  /* Waiting */

  /**
   * @param {number} ms
   * @return {Promise<void>}
   */
  pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * @param {function(): boolean} condition
   * @param {number} intervalMs
   * @return {Promise<void>}
   */
  waitUntil(condition, intervalMs = 200) {
    return new Promise(resolve => {
      const check = () => {
        if (condition()) {
          resolve();
        } else {
          setTimeout(check, intervalMs);
        }
      };
      check();
    });
  }

  /**
   * @param {string} eventName
   * @param {function(Event): boolean} predicate
   * @return {Promise<Event>}
   */
  waitForEvent(eventName, predicate = () => true) {
    return new Promise(resolve => {
      const listener = (event) => {
        if (predicate(event)) {
          window.removeEventListener(eventName, listener);
          resolve(event);
        }
      };
      window.addEventListener(eventName, listener);
    });
  }

  /**
   * @param {string} action
   * @param {function(object): boolean} predicate
   * @return {Promise<object>}
   */
  waitForAction(action, predicate = () => true) {
    return new Promise(resolve => {
      const listener = (actionName, result) => {
        if (actionName === action && predicate(result)) {
          this.actionListeners = this.actionListeners.filter(l => l !== listener);
          resolve(result);
        }
      };
      this.actionListeners.push(listener);
    });
  }

  /**
   * @param {function(object): boolean} predicate tested against HUDViewModel.currentSelectedTile
   * @return {Promise<void>}
   */
  waitForSelection(predicate) {
    return this.waitUntil(() => !!HUDViewModel.currentSelectedTile && predicate(HUDViewModel.currentSelectedTile));
  }

  /**
   * @param {string} structId
   * @return {Promise<void>}
   */
  waitForStructSelected(structId) {
    return this.waitForSelection(tile => tile.structId === structId);
  }

  /**
   * @param {string} action see STRUCT_ACTIONS
   * @return {Promise<void>}
   */
  waitForActionMode(action) {
    return this.waitUntil(() => this.gameState.actionBarLock.getCurrentAction() === action);
  }

  /**
   * Resolves once the animation queue has drained and the action bar is free.
   *
   * @return {Promise<void>}
   */
  async waitForCombatToSettle() {
    await this.pause(300);
    await this.waitUntil(() =>
      this.gameState.animationEventQueue.isEmpty()
      && !this.gameState.animationEventQueue.isPlaying
      && !this.gameState.actionBarLock.isLocked()
    );
    await this.pause(AFTER_COMBAT_PAUSE_MS);
  }

  /* Narration */

  /**
   * Shows a line the player acknowledges with OK.
   *
   * @param {string} html
   * @param {string} position
   * @param {function(): (Element|null)|null} pointAt
   * @param {string} pointerDirection
   * @return {Promise<void>}
   */
  async say(html, position, pointAt = null, pointerDirection = TUTORIAL_POINTER_DIRECTIONS.DOWN) {
    this.allow([SELECTORS.OK_BUTTON]);
    this.setPointer(pointAt, pointerDirection);
    await this.dialogue.show(html, position, true);
    this.pointer.hide();
  }

  /**
   * Shows a line that asks the player to do something; it stays up until
   * the returned promise from `until` resolves.
   *
   * @param {string} html
   * @param {string} position
   * @param {string[]} allowedSelectors
   * @param {function(): Promise} until
   * @param {function(): (Element|null)|null} pointAt
   * @param {string} pointerDirection
   * @return {Promise<void>}
   */
  async ask(html, position, allowedSelectors, until, pointAt = null, pointerDirection = TUTORIAL_POINTER_DIRECTIONS.DOWN) {
    this.allow(allowedSelectors);
    this.setPointer(pointAt, pointerDirection);
    this.dialogue.show(html, position, false);
    await until();
    this.pointer.hide();
    this.allow([]);
  }

  /**
   * @param {function(): (Element|null)|null} pointAt
   * @param {string} direction
   */
  setPointer(pointAt, direction) {
    if (pointAt) {
      this.pointer.pointAt(pointAt, direction);
    } else {
      this.pointer.hide();
    }
  }

  /**
   * Plays out something on the map with the narrator out of the way.
   *
   * @param {function(): Promise} scene
   * @return {Promise<void>}
   */
  async cutscene(scene) {
    this.allow([]);
    this.pointer.hide();
    this.dialogue.hide();
    await scene();
  }

  /**
   * Has the player attack a specific target, and waits for the combat to end.
   *
   * @param {string} attackerId
   * @param {string} targetId
   * @param {string} weaponCopy narration for pressing the weapon
   * @param {string} targetCopy narration while choosing the target
   * @param {boolean} pointAtWeapon only the first lesson points out the weapon
   * @return {Promise<void>}
   */
  async guideAttack(attackerId, targetId, weaponCopy, targetCopy, pointAtWeapon = false) {
    // A quick player can outpace the recharge; the lesson should never stall on it.
    this.world.rechargeBattery();

    await this.ask(
      weaponCopy,
      TOP,
      [SELECTORS.PRIMARY_WEAPON_BUTTON],
      () => this.waitForActionMode(STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON),
      pointAtWeapon ? this.find(SELECTORS.PRIMARY_WEAPON_BUTTON) : null
    );

    // As in the design, the camera stays put: the player pans the map to find the target.
    const attackResolved = this.waitForAction('attack', result => result.targetId === targetId);
    await this.ask(
      targetCopy,
      TOP,
      [this.structTileSelector(targetId)],
      () => attackResolved,
      this.find(this.structTileSelector(targetId))
    );

    await this.cutscene(() => this.waitForCombatToSettle());
    this.afterCombat();
  }

  /**
   * Tidies the battlefield before the narrator picks up again.
   */
  afterCombat() {
    this.sweepWreck(null);

    // Keep the attacker selected, as the design does, unless it was destroyed.
    const selectedStructId = HUDViewModel.currentSelectedTile?.structId;
    if (!selectedStructId || !this.gameState.keyPlayers.player.structs[selectedStructId]) {
      window.dispatchEvent(new ClearTileSelectionEvent());
    }
  }

  /* Script */

  async start() {
    document.body.classList.add('tutorial-active');
    this.dialogue.init();
    this.initClickGate();
    this.focusHome();

    await this.pause(600);

    await this.introduction();
    await this.raid();
    await this.summonCommandShip();
    await this.assignDefenders();
    await this.firstAttack();
    await this.secondAttack();
    await this.bomberAttack();
    await this.destroyEnemyCommandShip();
    await this.newCommandShip();

    this.allow([]);
    this.pointer.hide();
    this.dialogue.hide();
    await this.pause(1000);

    // The closing screens are regular menu pages.
    this.allow(null);
    document.body.classList.remove('tutorial-active');
    this.onComplete();
  }

  async introduction() {
    const C = TUTORIAL_COPY;

    await this.say(C.WELCOME, BOTTOM);
    await this.say(C.ALPHA_BASE, BOTTOM);
    await this.say(C.ALPHA_ORE, BOTTOM, this.find(this.structTileSelector(TUTORIAL_IDS.EXTRACTOR)));
    await this.say(C.REFINERY, BOTTOM, this.find(this.structTileSelector(TUTORIAL_IDS.REFINERY)));
    await this.say(C.ORE_RESERVES, BOTTOM, this.find(SELECTORS.ORE), UP);
    await this.say(C.ORE_THEFTS, BOTTOM, this.find(SELECTORS.ORE), UP);
    await this.say(C.CMD_SHIP, BOTTOM, this.find(this.structTileSelector(TUTORIAL_IDS.CMD_SHIP)));
    await this.say(C.CMD_SHIP_DESTROYED_WARNING, BOTTOM, this.find(this.structTileSelector(TUTORIAL_IDS.CMD_SHIP)));
  }

  async raid() {
    const C = TUTORIAL_COPY;

    this.world.startRaid();
    this.rerenderMap();

    // The camera goes over to the raiders as they arrive.
    await this.pause(100);
    this.focus(this.structTileSelector(TUTORIAL_IDS.ENEMY_TANK));

    await this.say(C.RAIDERS_ATTACK, BOTTOM, this.find(this.structTileSelector(TUTORIAL_IDS.ENEMY_TANK)));
    await this.say(C.PLANETARY_DEFENSES, BOTTOM, this.find(SELECTORS.SHIELD_STATUS), UP);
    await this.ask(
      C.INSPECT_DEFENSES,
      BOTTOM,
      [SELECTORS.SHIELD_STATUS],
      () => this.waitForInspect(SELECTORS.SHIELD_STATUS),
      this.find(SELECTORS.SHIELD_STATUS),
      UP
    );

    this.focusHome();
    await this.say(C.CMD_SHIP_PROTECTS, BOTTOM, this.find(this.structTileSelector(TUTORIAL_IDS.CMD_SHIP)));

    await this.cutscene(async () => {
      await this.pause(600);
      this.world.raiderOpeningStrike();
      await this.waitForCombatToSettle();
      this.world.setBreachCountdown('30m');
    });

    await this.say(C.CMD_SHIP_DESTROYED, BOTTOM, this.find(SELECTORS.SHIELD_STATUS), UP);
    await this.say(C.BREACH_COUNTDOWN, BOTTOM, this.find(SELECTORS.SHIELD_STATUS), UP);
  }

  /**
   * Resolves once the player has press-and-held an element long enough to
   * open its Inspect panel (cheatsheet) and has let go again.
   *
   * @param {string} selector
   * @return {Promise<void>}
   */
  async waitForInspect(selector) {
    const isInspecting = () => {
      const panel = document.getElementById('sui-cheatsheet-container');
      return !!panel && panel.isConnected && !!document.querySelector(selector)?.dataset.suiCheatsheet;
    };
    await this.waitUntil(isInspecting, 100);
    await this.waitUntil(() => !isInspecting(), 100);
  }

  async summonCommandShip() {
    const C = TUTORIAL_COPY;

    // The wreck has to be cleared from the command tile before a new ship can deploy there.
    this.sweepWreck(TUTORIAL_IDS.CMD_SHIP);

    await this.ask(
      C.SUMMON_CMD_SHIP,
      BOTTOM,
      [this.commandTileSelector()],
      () => this.waitForSelection(tile =>
        tile.tileType === MAP_TILE_TYPES.COMMAND
        && tile.side === 'left'
        && `${tile.ambit}`.toUpperCase() === 'LAND'
      ),
      this.find(this.commandTileSelector())
    );

    const deployed = this.waitForAction('build');
    await this.ask(
      C.DEPLOY,
      TOP,
      [SELECTORS.DEPLOY_BUTTON],
      () => this.waitUntil(() => this.isDeployMenuOpen()),
      this.find(SELECTORS.DEPLOY_BUTTON)
    );

    // In the Deploy Menu the narrator steps aside; the menu explains itself.
    this.dialogue.hide();
    this.decorateDeployMenu();
    this.allow([SELECTORS.DEPLOY_MENU], [SELECTORS.DEPLOY_MENU_CLOSE]);
    this.pointer.pointAt(() => document.querySelector('.deploy-struct-type'), UP);
    await deployed;
    this.pointer.hide();
    this.allow([]);
    await this.pause(800);

    await this.say(C.BATTERY_DEPLETES, TOP);
  }

  /**
   * The training Deploy Menu carries its own title and instructions.
   */
  decorateDeployMenu() {
    MenuPage.sui.offcanvas.setHeader(TUTORIAL_COPY.DEPLOY_MENU_TITLE);

    const structList = document.querySelector('.offcanvas-struct-list-layout');
    if (structList && !document.querySelector('.tutorial-deploy-hint')) {
      structList.insertAdjacentHTML(
        'afterend',
        `<div class="tutorial-deploy-hint">${TUTORIAL_COPY.DEPLOY_MENU_HINT}</div>`
      );
    }
  }

  /**
   * @return {boolean}
   */
  isDeployMenuOpen() {
    return !!document.querySelector('.deploy-struct-type');
  }

  async assignDefenders() {
    const C = TUTORIAL_COPY;

    await this.say(C.CMD_SHIP_UNPROTECTED, TOP);

    await this.ask(
      C.SELECT_INDICATED_TANK,
      TOP,
      [this.structTileSelector(TUTORIAL_IDS.TANK_A)],
      () => this.waitForStructSelected(TUTORIAL_IDS.TANK_A),
      this.find(this.structTileSelector(TUTORIAL_IDS.TANK_A))
    );

    // The Battery is still recharging from the deploy: the Defend button
    // unlocks by itself once there is enough charge.
    await this.ask(
      C.DEFEND_OTHER_TANK,
      TOP,
      [SELECTORS.DEFEND_BUTTON],
      () => this.waitForActionMode(STRUCT_ACTIONS.DEFENSE_SET),
      this.find(SELECTORS.DEFEND_BUTTON)
    );

    const defended = this.waitForAction('defenseSet', result =>
      result.defenderStructId === TUTORIAL_IDS.TANK_A
      && result.protectedStructId === TUTORIAL_IDS.TANK_B
    );
    await this.ask(
      C.ASSIGN_DEFENSE,
      TOP,
      [this.structTileSelector(TUTORIAL_IDS.TANK_B)],
      () => defended,
      this.find(this.structTileSelector(TUTORIAL_IDS.TANK_B))
    );

    await this.cutscene(() => this.waitForCombatToSettle());

    await this.say(C.DEFENDED_AND_DEFENDERS, TOP);

    window.dispatchEvent(new ClearTileSelectionEvent());
    await this.say(C.CMD_SHIP_TAKES_TIME, BOTTOM);
  }

  async firstAttack() {
    const C = TUTORIAL_COPY;

    // Show the player what they are up against.
    this.focus(this.structTileSelector(TUTORIAL_IDS.ENEMY_CMD_SHIP));
    await this.say(C.DESTROY_ENEMY_CMD_SHIP, BOTTOM, this.find(this.structTileSelector(TUTORIAL_IDS.ENEMY_CMD_SHIP)));

    this.focusHome();
    this.world.setBreachCountdown('29m');

    // The lesson starts with a full Battery, whatever was spent on the Defend.
    this.world.rechargeBattery();

    await this.ask(
      C.SELECT_TANK,
      BOTTOM,
      [this.structTileSelector(TUTORIAL_IDS.TANK_A)],
      () => this.waitForStructSelected(TUTORIAL_IDS.TANK_A),
      this.find(this.structTileSelector(TUTORIAL_IDS.TANK_A))
    );

    await this.guideAttack(
      TUTORIAL_IDS.TANK_A,
      TUTORIAL_IDS.ENEMY_CMD_SHIP,
      C.RAIL_GUN,
      C.RAIL_GUN_TARGET,
      true
    );

    // The debrief happens over the enemy formation it explains.
    this.focus(this.structTileSelector(TUTORIAL_IDS.ENEMY_TANK));
    const enemyTank = this.find(this.structTileSelector(TUTORIAL_IDS.ENEMY_TANK));
    const enemyCommandShip = this.find(this.structTileSelector(TUTORIAL_IDS.ENEMY_CMD_SHIP));

    await this.say(C.WENT_POORLY, TOP, enemyTank);
    await this.say(C.DEFENDER_COUNTER_ATTACK, TOP, enemyTank);
    await this.say(C.DEFENDER_BLOCKED, TOP, enemyTank);
    await this.say(C.CMD_SHIP_COUNTER_ATTACK, TOP, enemyCommandShip);
    await this.say(C.DESTROY_DEFENDER_FIRST, TOP);
  }

  async secondAttack() {
    const C = TUTORIAL_COPY;

    this.focus(this.structTileSelector(TUTORIAL_IDS.TANK_B));
    await this.ask(
      C.ONE_MORE_TANK,
      TOP,
      [this.structTileSelector(TUTORIAL_IDS.TANK_B)],
      () => this.waitForStructSelected(TUTORIAL_IDS.TANK_B),
      this.find(this.structTileSelector(TUTORIAL_IDS.TANK_B))
    );

    await this.guideAttack(
      TUTORIAL_IDS.TANK_B,
      TUTORIAL_IDS.ENEMY_TANK,
      C.ATTACK_ENEMY_TANK,
      C.ATTACK_ENEMY_TANK,
      true
    );

    await this.say(C.TRIGGERED_COUNTER_ATTACK, TOP);
    await this.say(C.BATTLEGROUNDS, TOP);
    await this.say(C.RAIL_GUN_LAND_ONLY, TOP);
  }

  async bomberAttack() {
    const C = TUTORIAL_COPY;

    // The Bomber flies above the land battleground, out of view: bring it in.
    this.focus(this.structTileSelector(TUTORIAL_IDS.BOMBER));
    this.world.setBreachCountdown('28m');

    await this.ask(
      C.STEALTH_BOMBER,
      TOP,
      [this.structTileSelector(TUTORIAL_IDS.BOMBER)],
      () => this.waitForStructSelected(TUTORIAL_IDS.BOMBER),
      this.find(this.structTileSelector(TUTORIAL_IDS.BOMBER))
    );

    await this.guideAttack(
      TUTORIAL_IDS.BOMBER,
      TUTORIAL_IDS.ENEMY_TANK,
      C.STEALTH_BOMBER,
      C.STEALTH_BOMBER
    );

    await this.say(C.SUCCESS, BOTTOM);
    await this.say(C.CLOSE_TO_VICTORY, BOTTOM);
  }

  async destroyEnemyCommandShip() {
    // From here the player is on their own until the enemy CMD Ship falls.
    this.world.protectPlayerStructs = true;
    this.dialogue.hide();
    this.pointer.hide();
    this.allow([
      SELECTORS.MAP_TILE,
      SELECTORS.PRIMARY_WEAPON_BUTTON,
      SELECTORS.SECONDARY_WEAPON_BUTTON,
    ]);

    await this.waitForAction('attack', result =>
      result.targetId === TUTORIAL_IDS.ENEMY_CMD_SHIP && result.targetDestroyed
    );

    this.allow([]);
    await this.waitForCombatToSettle();

    this.world.endRaid();
    this.gameState.actionBarLock.clear();
    window.dispatchEvent(new ClearTileSelectionEvent());
    this.rerenderMap();
    this.focusHome();
  }

  async newCommandShip() {
    const C = TUTORIAL_COPY;

    await this.say(C.RAIDERS_REPELLED, BOTTOM);
    await this.say(C.CMD_SHIP_ARRIVING, BOTTOM);

    await this.cutscene(async () => {
      this.world.completeBuild(TUTORIAL_IDS.NEW_CMD_SHIP);
      await this.waitForCombatToSettle();
    });

    await this.say(C.DEFENSES_SECURE, BOTTOM);
  }
}
