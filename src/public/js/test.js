/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./js/constants/Events.js"
/*!********************************!*\
  !*** ./js/constants/Events.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EVENTS: () => (/* binding */ EVENTS)
/* harmony export */ });
const EVENTS = {
  ALPHA_COUNT_CHANGED: 'ALPHA_COUNT_CHANGED',
  ANIMATION: 'ANIMATION',
  ANIMATION_END: 'ANIMATION_END',
  ANIMATION_QUEUE_EMPTY: 'ANIMATION_QUEUE_EMPTY',
  BLOCK_HEIGHT_CHANGED: 'BLOCK_HEIGHT_CHANGED',
  CHARGE_LEVEL_CHANGED: 'CHARGE_LEVEL_CHANGED',
  CLEAR_ATTACK_TARGETS: 'CLEAR_ATTACK_TARGETS',
  CLEAR_DEFEND_TARGETS: 'CLEAR_DEFEND_TARGETS',
  CLEAR_MOVE_TARGETS: 'CLEAR_MOVE_TARGETS',
  CLEAR_STRUCT_TILE: 'CLEAR_STRUCT_TILE',
  CLEAR_TILE_SELECTION: 'CLEAR_TILE_SELECTION',
  ENERGY_USAGE_CHANGED: 'ENERGY_USAGE_CHANGED',
  LOGIN_COMPLETE: 'LOGIN_COMPLETE',
  LOTTIE_CUSTOMIZED: 'LOTTIE_CUSTOMIZED',
  ORE_COUNT_CHANGED: 'ORE_COUNT_CHANGED',
  PENDING_BUILD_ADDED: 'PENDING_BUILD_ADDED',
  PLANET_RAID_STATUS_CHANGED: 'PLANET_RAID_STATUS_CHANGED',
  REFRESH_ACTION_BAR: 'REFRESH_ACTION_BAR',
  REFRESH_ACTION_BAR_IF_SELECTED: 'REFRESH_ACTION_BAR_IF_SELECTED',
  REFRESH_ATTACK_TARGETS: 'REFRESH_ATTACK_TARGETS',
  RENDER_ALL_STRUCTS: 'RENDER_ALL_STRUCTS',
  RENDER_DEPLOYMENT_INDICATOR: 'RENDER_DEPLOYMENT_INDICATOR',
  RENDER_PLAYER_PFP: 'RENDER_PLAYER_PFP',
  RENDER_STRUCT_HUD: 'RENDER_STRUCT_HUD',
  RENDER_STRUCT: 'RENDER_STRUCT',
  SHOW_MOVE_TARGETS: 'SHOW_MOVE_TARGETS',
  UPDATE_TILE_STRUCT_ID: 'UPDATE_TILE_STRUCT_ID',
  SAVE_GAME_STATE: 'SAVE_GAME_STATE',
  SHIELD_HEALTH_CHANGED: 'SHIELD_HEALTH_CHANGED',
  SHOW_ATTACK_TARGETS: 'SHOW_ATTACK_TARGETS',
  SHOW_DEFEND_TARGETS: 'SHOW_DEFEND_TARGETS',
  SHOW_STRUCT_STILL: 'SHOW_STRUCT_STILL',
  SIGNING_TRANSACTION_SETTLED: 'SIGNING_TRANSACTION_SETTLED',
  STRUCT_COUNT_CHANGED: 'STRUCT_COUNT_CHANGED',
  STRUCT_SELECTION_CHANGED: 'STRUCT_SELECTION_CHANGED',
  TASK_CMD_KILL: 'TASK_CMD_KILL',
  TASK_CMD_MANAGER_PAUSE: 'TASK_CMD_MANAGER_PAUSE',
  TASK_CMD_MANAGER_RESUME: 'TASK_CMD_MANAGER_RESUME',
  TASK_CMD_PAUSE: 'TASK_CMD_PAUSE',
  TASK_CMD_RECONCILE: 'TASK_CMD_RECONCILE',
  TASK_CMD_REFRESH_ORE: 'TASK_CMD_REFRESH_ORE',
  TASK_CMD_RESUME: 'TASK_CMD_RESUME',
  TASK_CMD_SPAWN: 'TASK_CMD_SPAWN',
  TASK_CMD_FORCE_RUN: 'TASK_CMD_FORCE_RUN',
  TASK_CMD_SWEEP: 'TASK_CMD_SWEEP',
  TASK_CMD_SWEEP_ALL: 'TASK_CMD_SWEEP_ALL',
  TASK_COMPLETED: 'TASK_COMPLETED',
  TASK_STATE_CHANGED: 'TASK_STATE_CHANGED',
  TASK_MANAGER_STATUS_CHANGED: 'TASK_MANAGER_STATUS_CHANGED',
  TASK_WORKER_CHANGED: 'TASK_WORKER_CHANGED',
  TRACK_DESTROYED_STRUCT: 'TRACK_DESTROYED_STRUCT',
  TRACK_DESTROYED_STRUCTS: 'TRACK_DESTROYED_STRUCTS',
  UNDISCOVERED_ORE_COUNT_CHANGED: 'UNDISCOVERED_ORE_COUNT_CHANGED',
};

/***/ },

/***/ "./js/constants/ObjectTypes.js"
/*!*************************************!*\
  !*** ./js/constants/ObjectTypes.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OBJECT_TYPES: () => (/* binding */ OBJECT_TYPES)
/* harmony export */ });
const OBJECT_TYPES = {
  GUILD: 'guild',
  PLAYER: 'player',
  PLANET: 'planet',
  REACTOR: 'reactor',
  SUBSTATION: 'substation',
  STRUCT: 'struct',
  ALLOCATION: 'allocation',
  INFUSION: 'infusion',
  ADDRESS: 'address',
  FLEET: 'fleet',
  PROVIDER: 'provider',
  AGREEMENT: 'agreement',
};



/***/ },

/***/ "./js/constants/Permissions.js"
/*!*************************************!*\
  !*** ./js/constants/Permissions.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PERMISSIONS: () => (/* binding */ PERMISSIONS)
/* harmony export */ });
const PERMISSIONS = {
  PLAY: 1,
  ADMIN: 2,
  UPDATE: 4,
  DELETE: 8,
  TOKEN_TRANSFER: 16,
  TOKEN_INFUSE: 32,
  TOKEN_MIGRATE: 64,
  TOKEN_DEFUSE: 128,
  SOURCE_ALLOCATION: 256,
  GUILD_MEMBERSHIP: 512,
  SUBSTATION_CONNECTION: 1024,
  ALLOCATION_CONNECTION: 2048,
  GUILD_TOKEN_BURN: 4096,
  GUILD_TOKEN_MINT: 8192,
  GUILD_ENDPOINT_UPDATE: 16384,
  GUILD_JOIN_CONSTRAINTS_UPDATE: 32768,
  GUILD_SUBSTATION_UPDATE: 65536,
  PROVIDER_WITHDRAW: 131072,
  PROVIDER_OPEN: 262144,
  REACTOR_GUILD_CREATE: 524288,
  HASH_BUILD: 1048576,
  HASH_MINE: 2097152,
  HASH_REFINE: 4194304,
  HASH_RAID: 8388608,
  GUILD_UGC_UPDATE: 16777216,

  ASSETS_ALL: 16 | 32 | 64 | 128,
  HASH_ALL: 1048576 | 2097152 | 4194304 | 8388608,
  ALL: (1 << 25) - 1,
};


/***/ },

/***/ "./js/constants/PlayerTypes.js"
/*!*************************************!*\
  !*** ./js/constants/PlayerTypes.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PLAYER_TYPES: () => (/* binding */ PLAYER_TYPES)
/* harmony export */ });
const PLAYER_TYPES = {
  PLAYER: 'player',
  RAID_ENEMY: 'raid_enemy',
  PLANET_RAIDER: 'planet_raider',
};


/***/ },

/***/ "./js/constants/RaidStatus.js"
/*!************************************!*\
  !*** ./js/constants/RaidStatus.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RAID_STATUS: () => (/* binding */ RAID_STATUS)
/* harmony export */ });
const RAID_STATUS = {
  REQUESTED: 'requested',
  INITIATED: 'initiated',
  ONGOING: 'ongoing',
  SHIELDS_VULNERABLE: 'shieldsVulnerable',
  ATTACKER_DEFEATED: 'attackerDefeated',
  ATTACKER_RETREATED: 'attackerRetreated',
  RAID_SUCCESSFUL: 'raidSuccessful',
  DEMILITARIZED: 'demilitarized',
};


/***/ },

/***/ "./js/constants/TaskConstants.js"
/*!***************************************!*\
  !*** ./js/constants/TaskConstants.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TASK: () => (/* binding */ TASK)
/* harmony export */ });
const TASK = {
  WORKER_PATH: '/js/workers/TaskWorker.js',
  MAX_BLOCKS_WHEN_ESTIMATING: 30000,
  MAX_CONCURRENT_PROCESSES: 5,
  CHECKPOINT_COMMIT: 5000000,
  DIFFICULTY_RECALCULATE: 5000000,
  DIFFICULTY_START: 10,
  DIFFICULTY_START_SLEEP_DELAY: 10000,
  CHECKPOINT_BLOCK: 10,
  ESTIMATED_BLOCK_TIME: 6000,
  HASHRATE_INITIAL_ESTIMATE: 300.0,
  IDENTITY_PREFIX: "IDENTITY",
  NONCE_PREFIX: "NONCE",
  TARGET_DELIMITER: "@",
  AUTOMATIC_STATUS_INTERVAL: 60000,
  START_DELAY: 8000,
};


/***/ },

/***/ "./js/constants/TaskManagerStatus.js"
/*!*******************************************!*\
  !*** ./js/constants/TaskManagerStatus.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TASK_MANAGER_STATUS: () => (/* binding */ TASK_MANAGER_STATUS)
/* harmony export */ });
const TASK_MANAGER_STATUS = {
  OFFLINE: 'offline',
  ONLINE: 'online',
};


/***/ },

/***/ "./js/constants/TaskStatus.js"
/*!************************************!*\
  !*** ./js/constants/TaskStatus.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TASK_STATUS: () => (/* binding */ TASK_STATUS)
/* harmony export */ });
const TASK_STATUS = {
  INITIATED: 'initiated',
  STARTING: 'starting',
  WAITING: 'waiting',
  RUNNING: 'running',
  PAUSED: 'paused',
  TERMINATED: 'terminated',
  COMPLETED: 'completed',
};


/***/ },

/***/ "./js/constants/TaskTypes.js"
/*!***********************************!*\
  !*** ./js/constants/TaskTypes.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ORE_TASK_TYPES: () => (/* binding */ ORE_TASK_TYPES),
/* harmony export */   TASK_TYPES: () => (/* binding */ TASK_TYPES)
/* harmony export */ });
const TASK_TYPES = {
  RAID: 'RAID',
  BUILD: 'BUILD',
  MINE: 'MINE',
  REFINE: 'REFINE',
};

/**
 * Task types whose start block is a clock on the planet, shared by every
 * eligible struct standing on it, rather than one held by the struct itself.
 */
const ORE_TASK_TYPES = [TASK_TYPES.MINE, TASK_TYPES.REFINE];


/***/ },

/***/ "./js/events/TaskCompletedEvent.js"
/*!*****************************************!*\
  !*** ./js/events/TaskCompletedEvent.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaskCompletedEvent: () => (/* binding */ TaskCompletedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class TaskCompletedEvent extends CustomEvent {
  /**
   * @param {TaskState} state
   */
  constructor(state) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_COMPLETED);
    this.state = state;
  }
}


/***/ },

/***/ "./js/events/TaskManagerStatusChangedEvent.js"
/*!****************************************************!*\
  !*** ./js/events/TaskManagerStatusChangedEvent.js ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaskManagerStatusChangedEvent: () => (/* binding */ TaskManagerStatusChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class TaskManagerStatusChangedEvent extends CustomEvent {
  /**
   * @param {string} status
   */
  constructor(status) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_MANAGER_STATUS_CHANGED);
    this.status = status;
  }
}


/***/ },

/***/ "./js/events/TaskStateChangedEvent.js"
/*!********************************************!*\
  !*** ./js/events/TaskStateChangedEvent.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaskStateChangedEvent: () => (/* binding */ TaskStateChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class TaskStateChangedEvent extends CustomEvent {
  /**
   * @param {TaskState} state
   */
  constructor(state) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_STATE_CHANGED);
    this.state = state;
  }
}


/***/ },

/***/ "./js/events/TaskWorkerChangedEvent.js"
/*!*********************************************!*\
  !*** ./js/events/TaskWorkerChangedEvent.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaskWorkerChangedEvent: () => (/* binding */ TaskWorkerChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class TaskWorkerChangedEvent extends CustomEvent {
  /**
   * @param {TaskState} state
   */
  constructor(state) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_WORKER_CHANGED);
    this.state = state;
  }
}


/***/ },

/***/ "./js/factories/TaskStateFactory.js"
/*!******************************************!*\
  !*** ./js/factories/TaskStateFactory.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaskStateFactory: () => (/* binding */ TaskStateFactory)
/* harmony export */ });
/* harmony import */ var _models_TaskState__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/TaskState */ "./js/models/TaskState.js");
/* harmony import */ var _framework_AbstractFactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../framework/AbstractFactory */ "./js/framework/AbstractFactory.js");
/* harmony import */ var _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/TaskConstants */ "./js/constants/TaskConstants.js");
/* harmony import */ var _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/TaskTypes */ "./js/constants/TaskTypes.js");
/* harmony import */ var _constants_ObjectTypes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../constants/ObjectTypes */ "./js/constants/ObjectTypes.js");






class TaskStateFactory extends _framework_AbstractFactory__WEBPACK_IMPORTED_MODULE_1__.AbstractFactory {

  /**
   * @param {object} obj
   * @return {TaskState}
   */
  make(obj) {
    const task_state = new _models_TaskState__WEBPACK_IMPORTED_MODULE_0__.TaskState();
    Object.assign(task_state, obj);

    return task_state;
  }


  /**
   * @param {string} fleet_id
   * @param {string} planet_id
   * @param {number} block_start
   * @param {number} difficulty_target
   * @return {TaskState}
   */
  initRaidTask(fleet_id, planet_id, block_start, difficulty_target){

    const task_state = new _models_TaskState__WEBPACK_IMPORTED_MODULE_0__.TaskState();

    task_state.task_type = _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.RAID;
    task_state.object_type = _constants_ObjectTypes__WEBPACK_IMPORTED_MODULE_4__.OBJECT_TYPES.FLEET;
    task_state.object_id = fleet_id;
    task_state.target_id = planet_id;
    task_state.block_start = block_start;
    task_state.difficulty_target = difficulty_target;

    task_state.prefix = task_state.object_id + _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_2__.TASK.TARGET_DELIMITER + task_state.target_id + task_state.task_type + task_state.block_start + _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_2__.TASK.NONCE_PREFIX;
    task_state.postfix = '';

    return task_state;
  }



  /**
   * @param {string} struct_id
   * @param {string} task_type
   * @param {number} block_start
   * @param {number} difficulty_target
   * @return {TaskState}
   */
  initStructTask(struct_id, task_type, block_start, difficulty_target){

    const task_state = new _models_TaskState__WEBPACK_IMPORTED_MODULE_0__.TaskState();

    task_state.task_type = task_type;
    task_state.object_type = _constants_ObjectTypes__WEBPACK_IMPORTED_MODULE_4__.OBJECT_TYPES.STRUCT;
    task_state.object_id = struct_id;
    task_state.block_start = block_start;
    task_state.difficulty_target = difficulty_target;

    task_state.prefix = task_state.object_id  + task_state.task_type + task_state.block_start + _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_2__.TASK.NONCE_PREFIX;
    task_state.postfix = '';

    return task_state;
  }

  /**
   * @param {Work} work
   * @return {TaskState}
   */
  initTaskFromWork(work) {
    switch(work.category) {
      case _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.RAID:
        return this.initRaidTask(work.object_id, work.target_id, work.block_start, work.difficulty_target);
      case _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.BUILD:
      case _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE:
      case _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.REFINE:
        return this.initStructTask(work.object_id, work.category, work.block_start, work.difficulty_target);
      default:
        throw new Error(`Unknown task type: ${work.category}`);
    }
  }


}

/***/ },

/***/ "./js/framework/AbstractFactory.js"
/*!*****************************************!*\
  !*** ./js/framework/AbstractFactory.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractFactory: () => (/* binding */ AbstractFactory)
/* harmony export */ });
/* harmony import */ var _NotImplementedError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NotImplementedError */ "./js/framework/NotImplementedError.js");


class AbstractFactory {

  make(obj) {
    throw new _NotImplementedError__WEBPACK_IMPORTED_MODULE_0__.NotImplementedError();
  }

  parseList(list) {
    return list.map(this.make);
  }
}

/***/ },

/***/ "./js/framework/DTestFramework.js"
/*!****************************************!*\
  !*** ./js/framework/DTestFramework.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DTest: () => (/* binding */ DTest),
/* harmony export */   DTestAssertError: () => (/* binding */ DTestAssertError),
/* harmony export */   DTestSuite: () => (/* binding */ DTestSuite)
/* harmony export */ });
class DTestAssertError extends Error {
  constructor(message) {
    super(message);
    this.name = "DTestAssertError";
  }
}

class DTest {
  constructor(testName, test, provider = null) {
    this.numAssertions = 0;
    this.testName = testName;
    this.test = test.bind(this);
    this.provider = provider;
  }

  assertEquals(a, b) {
    if (a !== b) {
      throw new DTestAssertError(`${JSON.stringify(a)} is not equal to ${JSON.stringify(b)}`);
    }
    this.numAssertions++;
  }

  assertArrayEquals(a, b) {
    if (a.length !== b.length) {
      throw new DTestAssertError(`${JSON.stringify(a)} is not equal to ${JSON.stringify(b)}`);
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        throw new DTestAssertError(`${JSON.stringify(a)} is not equal to ${JSON.stringify(b)}`);
      }
    }

    this.numAssertions++;
  }

  assertSetEquality(a, b) {
    if (!(a.every(element => b.includes(element)) && b.every(element => a.includes(element)))
        || a.length !== b.length) {
      throw new DTestAssertError(`${JSON.stringify(a)} is not equal to ${JSON.stringify(b)}`);
    }

    this.numAssertions++;
  }

  run() {
    let successfulProviderTests = 0;
    let totalProviderTests = 0;
    let providerMessage = '';

    try {

      if (typeof this.provider === 'function') {

        // Running a test with a provider
        const testParamSets = this.provider();
        totalProviderTests = testParamSets.length;

        for (let i = 0; i < totalProviderTests; i++) {
          providerMessage = `${successfulProviderTests}/${totalProviderTests} Provider Test(s) Passed -`;

          this.test(testParamSets[i]);

          successfulProviderTests++;
        }
      } else {
        // Running a test without a provider
        this.test();
      }

      // If a test has no assertions, it's considered a failure
      if (this.numAssertions === 0) {
        console.log(this.testName, ' - ', new DTestAssertError('Test has no assertions.'));
        return false;
      }

      // All assertions passed
      console.log(this.testName, ' - ', `${this.numAssertions} Assertion(s) Passed`);
      return true;

    } catch (err) {
      console.log(this.testName, ' - ', providerMessage, err);
      return false;
    }
  }
}

class DTestSuite {

  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * @param suiteName
   */
  printSuiteHeader(suiteName) {
    const horizontalBorder = '-'.repeat(suiteName.length + 4);
    console.log('');
    console.log(horizontalBorder);
    console.log(`| ${suiteName} |`);
    console.log(horizontalBorder);
  }

  run() {
    this.printSuiteHeader(this.name);

    for (const property in this) {
      if (this.hasOwnProperty(property) && this[property] instanceof DTest) {
        this[property].run();
      }
    }
  }
}


/***/ },

/***/ "./js/framework/NotImplementedError.js"
/*!*********************************************!*\
  !*** ./js/framework/NotImplementedError.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NotImplementedError: () => (/* binding */ NotImplementedError)
/* harmony export */ });
class NotImplementedError extends Error {
  constructor(message= 'Function not implemented') {
    super(message);
    this.name = "NotImplementedError";
  }
}


/***/ },

/***/ "./js/managers/PermissionManager.js"
/*!******************************************!*\
  !*** ./js/managers/PermissionManager.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PermissionManager: () => (/* binding */ PermissionManager)
/* harmony export */ });
/* harmony import */ var _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Permissions */ "./js/constants/Permissions.js");


class PermissionManager {

  /**
   * @return {number}
   */
  getDefaultPlayerPermissions() {
    return _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.PLAY
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.ASSETS_ALL
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.SOURCE_ALLOCATION
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.GUILD_MEMBERSHIP
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.SUBSTATION_CONNECTION
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.ALLOCATION_CONNECTION
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.GUILD_TOKEN_BURN
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.GUILD_TOKEN_MINT
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.GUILD_ENDPOINT_UPDATE
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.GUILD_JOIN_CONSTRAINTS_UPDATE
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.GUILD_SUBSTATION_UPDATE
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.PROVIDER_WITHDRAW
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.PROVIDER_OPEN
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.REACTOR_GUILD_CREATE
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.HASH_ALL
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.GUILD_UGC_UPDATE;
  }

  /**
   * @return {number}
   */
  getManageDevicesPermissions() {
    return _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.ADMIN
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.UPDATE
      | _constants_Permissions__WEBPACK_IMPORTED_MODULE_0__.PERMISSIONS.DELETE;
  }

  /**
   * @param {number} initialPermissions
   * @param {array} permissionsToAdd
   * @return {number}
   */
  addPermissions(initialPermissions, permissionsToAdd) {
    return permissionsToAdd.reduce((permissions, permissionToAdd) =>
      permissions | permissionToAdd
    , initialPermissions);
  }

  /**
   * @param initialPermissions
   * @param permissionsToRemove
   * @return {*}
   */
  removePermissions(initialPermissions, permissionsToRemove) {
    return permissionsToRemove.reduce((permissions, permissionToRemove) =>
      permissions & ~permissionToRemove
    , initialPermissions);
  }
}

/***/ },

/***/ "./js/managers/TaskManager.js"
/*!************************************!*\
  !*** ./js/managers/TaskManager.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaskManager: () => (/* binding */ TaskManager)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");
/* harmony import */ var _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/TaskConstants */ "./js/constants/TaskConstants.js");
/* harmony import */ var _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/TaskTypes */ "./js/constants/TaskTypes.js");
/* harmony import */ var _constants_TaskManagerStatus__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/TaskManagerStatus */ "./js/constants/TaskManagerStatus.js");
/* harmony import */ var _models_TaskProcess__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../models/TaskProcess */ "./js/models/TaskProcess.js");
/* harmony import */ var _events_TaskCompletedEvent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../events/TaskCompletedEvent */ "./js/events/TaskCompletedEvent.js");
/* harmony import */ var _events_TaskManagerStatusChangedEvent__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../events/TaskManagerStatusChangedEvent */ "./js/events/TaskManagerStatusChangedEvent.js");
/* harmony import */ var _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../constants/TaskStatus */ "./js/constants/TaskStatus.js");
/* harmony import */ var _constants_ObjectTypes__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../constants/ObjectTypes */ "./js/constants/ObjectTypes.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");
/* harmony import */ var _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../constants/RaidStatus */ "./js/constants/RaidStatus.js");













/*
 * The Task Manager
 */
class TaskManager {
    
    /**
     * @param {GameState} gameState
     * @param {GuildAPI} guildAPI
     * @param {SigningClientManager} signingClientManager
     * @param {TaskStateFactory} taskStateFactory
     */
    constructor(
      gameState,
      guildAPI,
      signingClientManager,
      taskStateFactory
    ) {
        this.gameState = gameState;
        this.guildAPI = guildAPI;
        this.signingClientManager = signingClientManager;
        this.taskStateFactory = taskStateFactory;

        this.status = _constants_TaskManagerStatus__WEBPACK_IMPORTED_MODULE_3__.TASK_MANAGER_STATUS.OFFLINE;

        this.processes = {};
        this.waiting_queue = [];
        this.running_queue = [];

        /** @type {Promise<void>|null} In-flight work lookup, shared by concurrent callers. */
        this.outstanding_work_lookup = null;

        /** @type {Promise<Work[]>|null} In-flight work request, shared by concurrent callers. */
        this.work_request = null;

        /** @type {Object<string, number>} Ore clocks that arrived while the planet was still raided. */
        this.held_ore_clocks = {};

        /*
            TASK_STATE_CHANGED used to propagate task state throughout. Can be
            used by UI elements for updating progress bars and estimates.

            TASK_WORKER_CHANGED is used by the Web Worker and likely shouldn't
            be used by UI elements as they may miss other events such
            as Pausing and Resuming.
         */
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_WORKER_CHANGED, function (event) {
            this.setState(event.state);
            console.log(this.processes[event.state.getPID()].state)
            if (event.state.isCompleted()) {

                event.state.setBlockCheckpoint(this.gameState.currentBlockHeight);
                // Make sure the hash is acceptable compared to the estimations performed in the worker
                if (event.state.checkResultHashDifficulty()) {
                    this.complete(event.state.getPID());
                } else {
                    event.state.setStatus(_constants_TaskStatus__WEBPACK_IMPORTED_MODULE_7__.TASK_STATUS.STARTING);
                    this.spawn(event.state);
                }

            }
        }.bind(this));

        // TASK_CMD_MANAGER_PAUSE
        // Can be dispatched anywhere to halt the Task Manager
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_MANAGER_PAUSE, function (event) {
            this.setManagerStatus(_constants_TaskManagerStatus__WEBPACK_IMPORTED_MODULE_3__.TASK_MANAGER_STATUS.OFFLINE);
            this.pauseAll();
        }.bind(this));

        // TASK_CMD_MANAGER_RESUME
        // Can be dispatched anywhere to resume the Task Manager
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_MANAGER_RESUME, function (event) {
            this.setManagerStatus(_constants_TaskManagerStatus__WEBPACK_IMPORTED_MODULE_3__.TASK_MANAGER_STATUS.ONLINE);
            this.resumeAll();
        }.bind(this));

        // TASK_CMD_FORCE_RUN
        // Can be dispatched anywhere to force a process in waiting to start running
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_FORCE_RUN, function (event) {
            this.forceRun(event.pid);
        }.bind(this));

        // TASK_CMD_KILL
        // Can be dispatched anywhere to kill tasks.
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_KILL, function (event) {
            this.terminate(event.pid);
        }.bind(this));

        // TASK_CMD_PAUSE
        // Can be dispatched anywhere to pause a job
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_PAUSE, function (event) {
            this.pause(event.pid);
        }.bind(this));

        // TASK_CMD_RESUME
        // Can be dispatched anywhere to resume a job
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_RESUME, function (event) {
            this.resume(event.pid);
        }.bind(this));

        // TASK_CMD_SPAWN
        // Can be dispatched anywhere to execute new tasks.
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_SPAWN, function (event) {
            this.spawn(event.state);
        }.bind(this));


        // TASK_CMD_RECONCILE
        // Can be dispatched anywhere the chain may have handed the player work
        // that no local task is covering yet.
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_RECONCILE, function (event) {
            this.spawnOutstandingWork();
        }.bind(this));

        // TASK_CMD_REFRESH_ORE
        // Dispatched when a planet's shared mine or refine clock changes, which
        // starts, restarts or stops the work of every eligible struct on it.
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_REFRESH_ORE, function (event) {
            this.refreshOreTasks(event.taskType, event.blockStart);
        }.bind(this));

        // TASK_CMD_SWEEP
        // Can be dispatched anywhere to remove a job from the processes object
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_SWEEP, function (event) {
            this.sweep(event.pid);
        }.bind(this));

        // TASK_CMD_SWEEP_ALL
        // Can be dispatched anywhere to remove all finished jobs from the processes object
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_SWEEP_ALL, function (event) {
            this.sweepAll();
        }.bind(this));

        // Handle a completed task
        window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_COMPLETED, async function (event) {
            console.log('It is done! \n ' + event.state.toLog());

            // TODO - restructure this to not be switch based
            // TODO - add result verification (check hash, difficulty, etc)
            // TODO - More complex result handling, currently assumes
            //          only processing your own work.
            //
                // If the Task belongs to this user
                    // Create a transactions
                // else
                    // submit to guild

            let msg;
            this.sweep(event.state.getPID());
            switch (event.state.task_type) {
                case _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_2__.TASK_TYPES.RAID:
                    await this.signingClientManager.queueMsgPlanetRaidComplete(
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;
                case _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_2__.TASK_TYPES.BUILD:
                    await this.signingClientManager.queueMsgStructBuildComplete(
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;

                case _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_2__.TASK_TYPES.MINE:
                    await this.signingClientManager.queueMsgStructOreMinerComplete(
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;

                case _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_2__.TASK_TYPES.REFINE:
                    await this.signingClientManager.queueMsgStructOreRefineryComplete(
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;
            }
        }.bind(this));

        // Add Console Utilities
        setInterval(() => this.StatusAll(), _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_1__.TASK.AUTOMATIC_STATUS_INTERVAL);

    }

    StatusAll() {
        console.log(this.processes);
        console.log(this.waiting_queue);
        console.log(this.running_queue);
        console.log('hashrate ' + this.getProcessAverageHashrate());
        console.log('percent est. ' + this.getProcessPercentCompleteEstimateAll());
        console.log('time est. ' + this.getProcessTimeRemainingEstimateAll()/1000.0);
    }

    canStartTask() {
        return this.isOnline() && this.running_queue.length < _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_1__.TASK.MAX_CONCURRENT_PROCESSES
    }

    // TODO I'd like to change this to === but I'm not sure if something will currently send it over
    isAtCapacity() {
        return this.running_queue.length >= _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_1__.TASK.MAX_CONCURRENT_PROCESSES
    }

    isOnline() {
        return this.status === _constants_TaskManagerStatus__WEBPACK_IMPORTED_MODULE_3__.TASK_MANAGER_STATUS.ONLINE;
    }

    /**
     * @param {string} new_status
     */
    setManagerStatus(new_status) {
        this.status = new_status;
        window.dispatchEvent(new _events_TaskManagerStatusChangedEvent__WEBPACK_IMPORTED_MODULE_6__.TaskManagerStatusChangedEvent(this.status));
    }

    /**
     * @param {TaskState} task_state
     * @return {string}
     */
    spawn(task_state) {
        const pid = task_state.getPID();

        task_state.setBlockCheckpoint(this.gameState.currentBlockHeight);

        if (this.processes[pid]) {
            this.processes[pid].replaceState(task_state);
        } else {
            this.processes[pid] = new _models_TaskProcess__WEBPACK_IMPORTED_MODULE_4__.TaskProcess(task_state);
            if (this.canStartTask()) {
                this.processes[pid].start(pid);
                this.running_queue.push(pid);
            } else {
                this.waiting_queue.push(pid);
            }
        }
        return pid;
    }

    runNext() {
        if (this.canStartTask()) {
            const next_pid = this.waiting_queue.pop()
            if (next_pid !== undefined) {
                console.log(next_pid)
                this.processes[next_pid].state.setBlockCheckpoint(this.gameState.currentBlockHeight);
                this.processes[next_pid].start(next_pid);
                this.running_queue.push(next_pid);
            }
        }
    }

    /**
     * @param {string} pid
     */
    forceRun(pid){
        if (this.processes[pid]) {
            if (this.processes[pid].isWaiting()) {
                this.processes[pid].setStatus(_constants_TaskStatus__WEBPACK_IMPORTED_MODULE_7__.TASK_STATUS.RUNNING);
                this.processes[pid].start();
            }
        }
    }

    /**
     * @param {string} pid
     */
    terminate(pid) {
        const running_index = this.running_queue.indexOf(pid);
        const waiting_index = this.waiting_queue.indexOf(pid);
        if ((running_index !== -1) || (waiting_index !== -1)) {
            this.processes[pid].terminate();

            this.runningQueueRemove(pid);
            this.waitingQueueRemove(pid);

            delete this.processes[pid];

            this.runNext();
        }
    }

    /**
     * @param {string} pid
     */
    complete(pid) {
       if (this.processes[pid]) {
           this.processes[pid].clearWorker();

           this.runningQueueRemove(pid);
           this.waitingQueueRemove(pid);

           window.dispatchEvent(new _events_TaskCompletedEvent__WEBPACK_IMPORTED_MODULE_5__.TaskCompletedEvent(this.processes[pid].state));

           this.runNext();
       }
    }


    /**
     * @param {string} pid
     */
    pause(pid) {
        if (this.processes[pid]) {
            if (this.processes[pid].canPause()) {

                const estimatedHashrate = this.getProcessAverageHashrate();
                const estimatedBlockStartOffset = this.getProcessBlockOffset(pid, estimatedHashrate);

                this.processes[pid].pause(estimatedHashrate, estimatedBlockStartOffset);
                this.runningQueueRemove(pid);

                this.waiting_queue.push(pid);

                this.runNext();
            }
        }
    }

    pauseAll() {
        let pause_list = [...this.running_queue];

        const estimatedHashrate = this.getProcessAverageHashrate();

        for (const pid of pause_list) {
            if (this.processes[pid].canPause()) {
                const estimatedBlockStartOffset = this.getProcessBlockOffset(pid, estimatedHashrate);

                this.processes[pid].pause(estimatedHashrate, estimatedBlockStartOffset);
                this.runningQueueRemove(pid);

                this.waiting_queue.push(pid);
            }
        }
    }

    /**
     * @param {string} pid
     */
    resume(pid) {
        if (this.processes[pid]
            && this.processes[pid].canResume()
        ) {
            // Pull it out of the waiting queue
            this.waitingQueueRemove(pid)

            if (this.canStartTask()) {
                this.running_queue.push(pid);
                this.processes[pid].state.setBlockCheckpoint(this.gameState.currentBlockHeight);
                this.processes[pid].start(pid);

            } else {
                // Add back to the next position of the waiting queue
                this.waiting_queue.push(pid);

                // Sleep the oldest
                // Which will automatically run the next in the queue after
                const sleep_pid = this.running_queue[0];
                this.pause(sleep_pid);
            }
        }
    }

    resumeAll() {
        let resume_list = [...this.waiting_queue];
        for (const pid of resume_list) {
            if (this.isAtCapacity()) {
                break;
            }
            this.resume(pid);
        }
    }

    /**
     * @param {string} pid
     */
    sweep(pid) {
        if (this.processes[pid]) {
            this.terminate(pid);
            delete this.processes[pid];
        }
    }

    sweepAll() {
        let sweep_list = [];
        for (const pid of Object.keys(this.processes)) {
            if (this.processes[pid].canSweep()) {
                sweep_list.push(pid);
            }
        }

        for (const pid of sweep_list) {
            delete this.processes[pid];
        }
    }

    /**
     * @param {string} pid
     */
    waitingQueueRemove(pid){
        const waiting_index = this.waiting_queue.indexOf(pid);
        if (waiting_index !== -1) {
            this.waiting_queue.splice(waiting_index, 1);
        }
    }

    /**
     * @param {string} pid
     */
    runningQueueRemove(pid) {
        const running_index = this.running_queue.indexOf(pid);
        if (running_index !== -1) {
            this.running_queue.splice(running_index, 1);
        }
    }

    /**
     * @param {TaskState} new_state
     */
    setState(new_state) {
        this.processes[new_state.getPID()].setState(new_state);
    }

    /**
     * @param {string} pid
     * @return {number}
     */
    getProcessPercentCompleteEstimate(pid) {
        const hashrate = this.getProcessAverageHashrate();
        const offsetBlock = this.getProcessBlockOffset(pid, hashrate);

        return this.processes[pid].state.getPercentCompleteEstimate(hashrate, offsetBlock);
    }

    /**
     * @return {number}
     */
    getProcessPercentCompleteEstimateAll() {
        const hashrate = this.getProcessAverageHashrate();

        let i = 0;
        let avg_complete = 0.0;
        for (const pid of Object.keys(this.processes)) {
            i++
            const offsetBlock = this.getProcessBlockOffset(pid, hashrate);
            avg_complete += this.processes[pid].state.getPercentCompleteEstimate(hashrate, offsetBlock);
        }

        if (i == 0) {
            return 1;
        }
        return avg_complete / (i);
    }

    /**
     * @param {string} pid
     * @return {number}
     */
    getProcessTimeRemainingEstimate(pid) {
        const hashrate = this.getProcessAverageHashrate();
        const offsetBlock = this.getProcessBlockOffset(pid, hashrate);

        if (this.processes[pid]) {
            return this.processes[pid].state.getTimeRemainingEstimate(hashrate, offsetBlock);
        }

        return 0;
    }

    /**
     * @param {string} queue_pid
     * @param {number} hashRate
     * @return {number}
     */
    getProcessBlockOffset(queue_pid, hashrate) {
        let longest_block = 0;
        let running_list = [...this.running_queue];
        for (const pid of running_list) {
            if (pid === queue_pid) { return 0; }
            const current_block_length = this.processes[pid].state.getTimeRemainingEstimate(hashrate, 0 );
            longest_block = (current_block_length > longest_block) ? current_block_length : longest_block;
        }

        // Only process the waiting list if the running list has any jobs
        // Otherwise we end up with a wonky estimate on initial jobs
        if (running_list.length > 0) {
            let waiting_list = [...this.waiting_queue];
            for (const pid of waiting_list) {
                if (pid === queue_pid) { break; }
                const current_block_length = this.processes[pid].state.getTimeRemainingEstimate(hashrate, longest_block );
                longest_block = (current_block_length > longest_block) ? current_block_length : longest_block;
            }
        }
        return longest_block;

    }



    /**
     * @return {number}
     */
    getProcessTimeRemainingEstimateAll() {
        const hashrate = this.getProcessAverageHashrate();

        let longest = 0;
        for (const pid of Object.keys(this.processes)) {
            const offsetBlock = this.getProcessBlockOffset(pid, hashrate);
            const estimate = this.processes[pid].state.getTimeRemainingEstimate(hashrate, offsetBlock);
            if (estimate > longest) {
                 longest = estimate;
            }
        }
        return longest;
    }

    /**
     * @param {string} pid
     * @return {number}
     */
    getProcessHashrate(pid) {
        return this.processes[pid].state.getHashrate();
    }

    /**
     * @return {number}
     */
    getProcessHashrateAll() {
        let total = 0;
        for (const pid of Object.keys(this.processes)) {
            total += this.processes[pid].state.getHashrate();
        }
        return total;
    }


    /**
     * @return {number}
     */
    getProcessAverageHashrate() {
        let average = 0;
        let iterations = 0;
        for (const pid of Object.keys(this.processes)) {
            // Make sure the state is actually running and not waiting
            if (this.processes[pid].state.isRunning()) {
                average += this.processes[pid].state.getHashrate();
                iterations++
            }
        }

        if (iterations == 0 || average == 0) {
            return _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_1__.TASK.HASHRATE_INITIAL_ESTIMATE;
        }
        return average / iterations;
    }

    /**
     * Searches for a build process by struct ID.
     *
     * @param {string} structId
     * @return {TaskProcess|null}
     */
    getBuildProcessByStructId(structId) {
        return this.getProcessByStructIdAndType(structId, _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_2__.TASK_TYPES.BUILD);
    }

    /**
     * Searches for a process associated with a given struct ID and task type.
     *
     * @param {string} structId
     * @param {string} taskType see TASK_TYPES
     * @return {TaskProcess|null}
     */
    getProcessByStructIdAndType(structId, taskType) {
        for (const pid of Object.keys(this.processes)) {
            const process = this.processes[pid];
            const state = process.state;
            if (
                state.task_type === taskType
                && state.object_type === _constants_ObjectTypes__WEBPACK_IMPORTED_MODULE_8__.OBJECT_TYPES.STRUCT
                && state.object_id === structId
            ) {
                return process;
            }
        }
        return null;
    }


    /**
     * Restores worker tasks for the logged in player from the database.
     *
     * @return {Promise<void>}
     */
    async restoreTasksFromDB() {

        // Only restore tasks, if the task manager is not already in use.
        if (Object.keys(this.processes).length || this.running_queue.length || this.waiting_queue.length) {
            return;
        }

        return this.spawnOutstandingWork();
    }

    /**
     * Collects the process IDs of every task of a given type.
     *
     * @param {string} taskType see TASK_TYPES
     * @return {string[]}
     */
    getProcessIdsByType(taskType) {
        return Object.keys(this.processes).filter(
            (pid) => this.processes[pid].state.task_type === taskType
        );
    }

    /**
     * @param {string} taskType see TASK_TYPES
     */
    terminateAllByType(taskType) {
        for (const pid of this.getProcessIdsByType(taskType)) {
            this.terminate(pid);
        }
    }

    /**
     * Mining and refining are refused by the chain for as long as a raider sits
     * on the planet, so no hash found during that window can be redeemed.
     *
     * @return {boolean}
     */
    isPlayerPlanetRaided() {
        return this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_9__.PLAYER_TYPES.PLAYER].planetRaidInfo.isRaidActive();
    }

    /**
     * Brings the running mine or refine tasks in line with a shared planet
     * clock, after fetching the structs that clock currently covers.
     *
     * @param {string} taskType see ORE_TASK_TYPES
     * @param {number} block_start Zero when the clock has been cleared.
     * @return {Promise<void>}
     */
    async refreshOreTasks(taskType, block_start) {
        // A cleared clock stops the work outright, and cancels anything held
        // over from a raid since there is no longer a clock to go back to.
        if (!block_start) {
            delete this.held_ore_clocks[taskType];
            this.terminateAllByType(taskType);
            return;
        }

        // The chain shifts the ore clocks forward the moment a raid ends, in the
        // same block as the raid result and ahead of it, so this can arrive
        // while the raid is still being played out on screen. Hold it rather
        // than drop it: the chain announces a given clock once, and the next
        // reconcile is what puts it back to work.
        if (this.isPlayerPlanetRaided()) {
            this.held_ore_clocks[taskType] = block_start;
            this.terminateAllByType(taskType);
            return;
        }

        delete this.held_ore_clocks[taskType];

        try {
            const work = await this.fetchWork();
            this.syncOreTasks(taskType, work, block_start);
        } catch (error) {
            console.warn('[TaskManager] could not refresh ore work:', error);
        }
    }

    /**
     * Starts, replaces and stops the tasks of one ore type so they match the
     * work the chain currently recognises.
     *
     * Every eligible struct on a planet shares that planet's clock, and the
     * chain no longer reports a per-struct stop: a rig going offline leaves the
     * clock untouched, so the work list is the only signal that it should no
     * longer be hashing.
     *
     * @param {string} taskType see ORE_TASK_TYPES
     * @param {Work[]} work
     * @param {number|null} block_start The clock as reported by GRASS, which
     *   leads the indexed work record. Falls back to the work record's own.
     */
    syncOreTasks(taskType, work, block_start = null) {
        const eligible = this.isPlayerPlanetRaided()
            ? []
            : work.filter((workTask) => workTask.category === taskType);
        const eligible_ids = eligible.map((workTask) => workTask.object_id);

        for (const pid of this.getProcessIdsByType(taskType)) {
            if (!eligible_ids.includes(pid)) {
                this.terminate(pid);
            }
        }

        for (const workTask of eligible) {
            const task_block_start = block_start ?? workTask.block_start;

            // Without a clock there is nothing to hash against.
            if (!task_block_start) {
                continue;
            }

            // Replacing a task restarts its worker and throws away every nonce
            // it has searched, so only do it once the clock has actually moved.
            const process = this.processes[workTask.object_id];
            if (
                process
                && process.state.task_type === taskType
                && process.state.block_start === task_block_start
            ) {
                continue;
            }

            this.spawn(this.taskStateFactory.initStructTask(
                workTask.object_id,
                taskType,
                task_block_start,
                workTask.difficulty_target
            ));
        }
    }

    /**
     * Requests the player's outstanding work, sharing one request between
     * concurrent callers so a block that changes both ore clocks, or a reconcile
     * landing alongside one, only asks once.
     *
     * @return {Promise<Work[]>}
     */
    fetchWork() {
        if (!this.work_request) {
            this.work_request = this.guildAPI
                .getWorkByPlayerId(this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_9__.PLAYER_TYPES.PLAYER].id)
                .finally(() => {
                    this.work_request = null;
                });
        }

        return this.work_request;
    }

    /**
     * Picks up outstanding work the player isn't running yet, such as refining
     * that only became possible once ore changed hands during a raid.
     *
     * Build and raid work is only ever started here, since the chain reports
     * those stopping with a start block of zero. Ore work has no such per-struct
     * signal, so it is reconciled in both directions.
     *
     * @return {Promise<void>}
     */
    async spawnOutstandingWork() {
        if (!this.outstanding_work_lookup) {
            this.outstanding_work_lookup = this.fetchAndSpawnOutstandingWork()
                .catch((error) => {
                    console.warn('[TaskManager] could not pick up outstanding work:', error);
                })
                .finally(() => {
                    this.outstanding_work_lookup = null;
                });
        }

        return this.outstanding_work_lookup;
    }

    /**
     * @return {Promise<void>}
     */
    async fetchAndSpawnOutstandingWork() {
        const work = await this.fetchWork();

        work.forEach((workTask) => {
            // Ore work runs off the planet's shared clock and is reconciled
            // below, where the stops this pass cannot see are handled too.
            if (_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_2__.ORE_TASK_TYPES.includes(workTask.category)) {
                return;
            }

            const task = this.taskStateFactory.initTaskFromWork(workTask);

            // Only fill in the gaps. A struct that already has a process is
            // being worked on, and respawning it would restart the worker and
            // throw away the progress it has made.
            if (this.processes[task.getPID()]) {
                return;
            }

            // A raid task may only run while the targeted planet's shield is
            // vulnerable. The backend work record can persist outside that
            // window, so don't restore a raid task whose planet is no longer
            // SHIELDS_VULNERABLE.
            if (
                task.task_type === _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_2__.TASK_TYPES.RAID
                && !this.isRaidTaskShieldVulnerable(task)
            ) {
                return;
            }

            this.spawn(task);
        });

        for (const taskType of _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_2__.ORE_TASK_TYPES) {
            this.syncOreTasks(taskType, work, this.consumeHeldOreClock(taskType));
        }
    }

    /**
     * Takes back the ore clock that was held while the planet was raided. The
     * chain announces a given clock once, so this is the only copy of it and it
     * leads whatever the indexer has written.
     *
     * @param {string} taskType see ORE_TASK_TYPES
     * @return {number|null}
     */
    consumeHeldOreClock(taskType) {
        const block_start = this.held_ore_clocks[taskType] ?? null;
        delete this.held_ore_clocks[taskType];

        return block_start;
    }

    /**
     * Determines whether the planet targeted by a raid task currently has a
     * vulnerable shield, which is the only state in which the raid task is
     * allowed to run.
     *
     * @param {TaskState} task
     * @return {boolean}
     */
    isRaidTaskShieldVulnerable(task) {
        const raidInfo = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_9__.PLAYER_TYPES.RAID_ENEMY].planetRaidInfo;
        return (
            raidInfo.planet_id === task.target_id
            && raidInfo.status === _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_10__.RAID_STATUS.SHIELDS_VULNERABLE
        );
    }
}


/***/ },

/***/ "./js/models/PlanetRaid.js"
/*!*********************************!*\
  !*** ./js/models/PlanetRaid.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlanetRaid: () => (/* binding */ PlanetRaid)
/* harmony export */ });
/* harmony import */ var _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/RaidStatus */ "./js/constants/RaidStatus.js");


class PlanetRaid {
  constructor() {
    this.planet_id = null;
    this.planet_owner = null;
    this.fleet_id = null;
    this.fleet_owner = null;
    this.status = null;
    this.updated_at = null;
  }

  isRaidActive() {
    return (
        this.status === _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_0__.RAID_STATUS.INITIATED
        || this.status === _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_0__.RAID_STATUS.ONGOING
        || this.status === _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_0__.RAID_STATUS.SHIELDS_VULNERABLE
    );
  }
}

/***/ },

/***/ "./js/models/TaskProcess.js"
/*!**********************************!*\
  !*** ./js/models/TaskProcess.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaskProcess: () => (/* binding */ TaskProcess)
/* harmony export */ });
/* harmony import */ var _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/TaskConstants */ "./js/constants/TaskConstants.js");
/* harmony import */ var _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/TaskStatus */ "./js/constants/TaskStatus.js");
/* harmony import */ var _factories_TaskStateFactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../factories/TaskStateFactory */ "./js/factories/TaskStateFactory.js");
/* harmony import */ var _TaskState__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TaskState */ "./js/models/TaskState.js");
/* harmony import */ var _events_TaskWorkerChangedEvent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../events/TaskWorkerChangedEvent */ "./js/events/TaskWorkerChangedEvent.js");
/* harmony import */ var _events_TaskStateChangedEvent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../events/TaskStateChangedEvent */ "./js/events/TaskStateChangedEvent.js");








class TaskProcess {

  /**
   * @param {TaskState} state
   */
  constructor(state) {
    this.worker = null;
    this.state = state;
  }

  start() {
    if (this.isCompleted()){
      console.log('Cannot start Completed state');
      return false;
    }

    if (this.isTerminated()){
      console.log('Cannot start Terminated state');
      return false;
    }

    if (this.hasWorker()) {
      this.worker.terminate();
    }

    this.worker = new Worker(_constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.WORKER_PATH);

    this.worker.onmessage = async function (result) {
      const taskStateFactory = new _factories_TaskStateFactory__WEBPACK_IMPORTED_MODULE_2__.TaskStateFactory();
      let state = taskStateFactory.make(result.data[0]);
      window.dispatchEvent(new _events_TaskWorkerChangedEvent__WEBPACK_IMPORTED_MODULE_4__.TaskWorkerChangedEvent(state));
    }

    // Send the initial state to the Worker
    if (!this.isRunning()) {
      this.state.status = _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.STARTING;
    }
    this.clearEstimatedBlockStartOffset();
    this.worker.postMessage([this.state]);
    return true
  }

  /**
   * @param {TaskState} new_state
   */
  replaceState(new_state) {
    switch (this.state.status) {
      case _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.INITIATED:
      case _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.PAUSED:
        new_state.setStatus(this.state.status);
        this.setState(new_state);
        break;

      case _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.STARTING:
      case _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.RUNNING:
      case _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.TERMINATED:
        this.setState(new_state);
        this.start();
        break;

      case _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.COMPLETED:
        console.log("Tried to spawn new state over completed task " + this.state.getPID());
        break;
    }
  }

  pause(estimatedHashrate, estimatedBlockStartOffset) {
    this.clearWorker();
    this.setEstimatedHashrateAndBlockStartOffset(estimatedHashrate, estimatedBlockStartOffset);
    this.setStatus(_constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.PAUSED);
  }

  terminate() {
    this.clearWorker();
    this.setStatus(_constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.TERMINATED);
  }

  clearWorker() {
    if (this.worker) {
      this.worker.terminate();
    }
    this.worker = null;
  }

  /**
   * @return {string}
   */
  getPID(){
    return this.state.getObjectId();
  }

  /**
   * @return {boolean}
   */
  hasWorker() {
    return (this.worker !== null);
  }

  /**
   * @return {boolean}
   */
  isInitiated() {
    return this.state.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.INITIATED;
  }

  /**
   * @return {boolean}
   */
  isStarting() {
    return this.state.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.STARTING;
  }

  /**
   * @return {boolean}
   */
  isWaiting() {
    return this.state.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.WAITING;
  }

  /**
   * @return {boolean}
   */
  isRunning() {
    return this.state.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.RUNNING;
  }

  /**
   * @return {boolean}
   */
  isPaused() {
    return this.state.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.PAUSED;
  }

  /**
   * @return {boolean}
   */
  isTerminated() {
    return this.state.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.TERMINATED;
  }

  /**
   * @return {boolean}
   */
  isCompleted() {
    return this.state.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.COMPLETED;
  }

  canStart() {
    return this.isInitiated() || this.isPaused();
  }

  canPause() {
    return this.isStarting() || this.isWaiting() || this.isRunning();
  }

  canResume() {
    return !(this.isRunning() || this.isWaiting() || this.isStarting() || this.isCompleted());
  }

  canSweep() {
    return this.isTerminated() || this.isCompleted();
  }

  /**
   * @param {string} new_status
   */
  setStatus(new_status) {
    this.state.status = new_status;
    this.dispatchProgress();
  }

  /**
   * @param {TaskState} new_state
   */
  setState(new_state) {
    this.state = new_state;
    this.dispatchProgress();
  }

  /**
   * @param {number} estimatedHashrate
   * @param {number} estimatedBlockStartOffset
   */
  setEstimatedHashrateAndBlockStartOffset(estimatedHashrate, estimatedBlockStartOffset){
    this.state.estimated_hashrate = estimatedHashrate;
    this.state.estimated_block_start_offset = estimatedBlockStartOffset;
  }

  clearEstimatedBlockStartOffset() {
    this.state.estimated_block_start_offset = 0;
  }

  dispatchProgress(){
    window.dispatchEvent(new _events_TaskStateChangedEvent__WEBPACK_IMPORTED_MODULE_5__.TaskStateChangedEvent(this.state));
  }
}


/***/ },

/***/ "./js/models/TaskState.js"
/*!********************************!*\
  !*** ./js/models/TaskState.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaskState: () => (/* binding */ TaskState)
/* harmony export */ });
/* harmony import */ var _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/TaskConstants */ "./js/constants/TaskConstants.js");
/* harmony import */ var _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/TaskStatus */ "./js/constants/TaskStatus.js");
/* harmony import */ var js_sha256__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! js-sha256 */ "./node_modules/js-sha256/src/sha256.js");
/* harmony import */ var js_sha256__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(js_sha256__WEBPACK_IMPORTED_MODULE_2__);





class TaskState {
  constructor() {
    this.status = _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.INITIATED;
    this.object_id = null;
    this.target_id = null;
    this.object_type = null;
    this.task_type = null;
    this.identity = null;

    this.prefix = null; // Entire string up to NONCE
    this.postfix = null; // Optional IDENTITY
    this.nonce_start = Math.floor(Math.random() * 10000000000);
    this.nonce_current = this.nonce_start;
    this.iterations = 0;
    this.iterations_since_last_start = 0;
    this.process_start_time = new Date();
    this.process_end_time = null;
    this.difficulty_start = null;
    this.difficulty_target = null;
    this.block_start = null;
    this.block_checkpoint = null;
    this.block_checkpoint_time = null;
    this.block_current_estimated = null;
    this.result_exists = false;
    this.result_message = null;
    this.result_nonce = null;
    this.result_hash = null;
    this.result_difficulty = 0;

    this.estimated_hashrate = _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.HASHRATE_INITIAL_ESTIMATE;
    this.estimated_block_start_offset = 0;
    this.last_status_change_time = new Date();
  }

  /**
   * @return {boolean}
   */
  isCompleted() {
    return this.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.COMPLETED;
  }

  /**
   * @return {boolean}
   */
  isWaiting() {
    return this.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.WAITING;
  }

  /**
   * @return {boolean}
   */
  isRunning() {
    return this.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.RUNNING;
  }

  /**
   * @return {string}
   */
  toLog(){
    return JSON.stringify(this, null, 2);
  }

  /**
   * @param {number} block
   */
  setBlockCheckpoint(block) {
    this.block_checkpoint_time = new Date();
    this.block_checkpoint = block;
    this.block_current_estimated = block;
  }

  /**
   * @param {string} status
   */
  setStatus(status) {
    this.last_status_change_time = new Date();
    this.status = status
  }

  /**
   * @param {string} nonce
   * @param {string} message
   * @param {string} hash
   * @param {number} difficulty
   */
  setResult(nonce, message, hash, difficulty) {
    this.status = _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.COMPLETED;
    this.process_end_time = new Date();
    this.result_exists = true;
    this.result_message = message;
    this.result_nonce = nonce + this.postfix;
    this.result_hash = hash;
    this.result_difficulty = difficulty;
  }

  /**
   * @param {number} difficulty
   */
  setPreviousResult(difficulty) {
    this.status = _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.COMPLETED;
    this.process_end_time = new Date();
    this.result_difficulty = difficulty;
  }

  getNextNonce() {
    this.iterations++;
    return ++this.nonce_current;
  }

  getObjectId() {
    return this.object_id;
  }

  /**
   * @return {string}
   */
  getPID() {
    return this.object_id;
  }

  /**
   * Calculate percent complete using getBlockRemainingEstimate.
   *
   * @param {number} hashrate
   * @param {number} blockStartOffset
   * @return {number} Percent complete (0.0 to 1.0)
   */
  getPercentCompleteEstimate(hashrate = this.getHashrate(), blockStartOffset = this.estimated_block_start_offset) {
    if (this.isCompleted()) {
      return 1.0;
    }

    // Age represents blocks processed since start
    const age = this.block_current_estimated - this.block_start;

    // Get the blocks remaining using current hash rate
    const blocksRemaining = this.getBlockRemainingEstimate(hashrate, blockStartOffset);

    // Total blocks needed = blocks already processed + blocks remaining
    const totalBlocks = age + blocksRemaining;

    // Percent complete = blocks processed / total blocks needed
    const percent = totalBlocks > 0 ? age / totalBlocks : 0.0;

    return Math.min(1.0, Math.max(0.0, percent));
  }


  /**
   * @param {number} hashrate
   * @param {number} blockStartOffset
   * @return {number}
   */
  getBlockRemainingEstimate(hashrate= this.getHashrate(), blockStartOffset = this.estimated_block_start_offset) {
    if (this.isCompleted()) {
      return 0;
    }

    const currentAge = this.getCurrentAgeEstimate()

    const baseDifficultyRange = this.difficulty_target;
    const maxBlocksToCheck =  _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.MAX_BLOCKS_WHEN_ESTIMATING;
    const blockTimeSeconds = _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.ESTIMATED_BLOCK_TIME;

    let cumulativeExpectedSuccesses = 0;
    let blocksAhead = 0;

    while (cumulativeExpectedSuccesses < 1 && blocksAhead < maxBlocksToCheck) {
      if (blocksAhead > blockStartOffset) {
        const ageAtBlock = currentAge + blocksAhead;
        const difficulty = this.getCalculatedDifficulty(ageAtBlock, baseDifficultyRange);
        const successProbability = 1 / Math.pow(16, difficulty);

        // Expected number of successful hashes in this block
        const expectedSuccessesInBlock = hashrate * blockTimeSeconds * successProbability;
        cumulativeExpectedSuccesses += expectedSuccessesInBlock;
      }
      blocksAhead++;
    }

    return Math.min(blocksAhead, maxBlocksToCheck);
  }


  /**
   * @param {number} hashrate
   * @param {number} blockStartOffset
   * @return {number}
   */
  getTimeRemainingEstimate(hashrate= this.getHashrate(), blockStartOffset = this.estimated_block_start_offset) {
    const blocksAhead = this.getBlockRemainingEstimate(hashrate, blockStartOffset);
    return blocksAhead * _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.ESTIMATED_BLOCK_TIME;
  }

  /**
   * @return {number}
   */
  getHashrate() {
    if (!this.isRunning()) {
      return this.estimated_hashrate;
    }

    const current_time = new Date();
    return this.iterations_since_last_start / (Math.floor((current_time - this.last_status_change_time)) * 1);
  }

  /**
   * @param {string} nonce
   * @return {string}
   */
  getMessage(nonce) {
    return this.prefix + nonce + this.postfix;
  }

  /**
   * @return {number}
   */
  getCurrentAgeEstimate() {
    const current_time = new Date();
    const estimated_blocks_past = Math.floor((current_time - this.block_checkpoint_time) / _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.ESTIMATED_BLOCK_TIME);
    this.block_current_estimated = Math.floor(this.block_checkpoint + estimated_blocks_past);

    return this.block_current_estimated - this.block_start;
  }

  /**
   * @return {number}
   */
  getCurrentDifficulty(){
    const age = this.getCurrentAgeEstimate();

    if (age <= 1) {
      return 64;
    }

    // Using logarithmic function to calculate difficulty
    let difficulty = 64 - Math.floor(Math.log10(age) / Math.log10(this.difficulty_target) * 63);

    return Math.max(1, difficulty)
  }

  /**
   * Calculate difficulty from age
   *
   * @param {number} age - Current age in blocks
   * @param {number} baseDifficultyRange - Base difficulty range
   * @returns {number} Difficulty (number of leading zeros required in hash)
   */
   getCalculatedDifficulty(age, baseDifficultyRange) {
    if (age <= 1) {
      return 64;
    }

    const difficulty = 64 - Math.floor(
        Math.log10(age) / Math.log10(baseDifficultyRange) * 63
    );

    return Math.max(1, difficulty);
  }

  /**
   * Check to see if Hash was built for an acceptable block height
   */
  checkResultHashDifficulty() {
    return this.result_difficulty >= this.getCurrentDifficulty();
  }
}

/***/ },

/***/ "./js/tests/NumberFormatterTest.js"
/*!*****************************************!*\
  !*** ./js/tests/NumberFormatterTest.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NumberFormatterTest: () => (/* binding */ NumberFormatterTest)
/* harmony export */ });
/* harmony import */ var _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/DTestFramework */ "./js/framework/DTestFramework.js");
/* harmony import */ var _util_NumberFormatter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/NumberFormatter */ "./js/util/NumberFormatter.js");



class NumberFormatterTest extends _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTestSuite {

  constructor() {
    super('NumberFormatterTest');
  }

  formatTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('formatTest', function(params) {
    const numberFormatter = new _util_NumberFormatter__WEBPACK_IMPORTED_MODULE_1__.NumberFormatter();
    this.assertEquals(numberFormatter.format(params.number), params.expected);
  }, function() {
    return [
      {
        number: '100',
        expected: '100'
      },
      {
        number: '100.10',
        expected: '100'
      },
      {
        number: '123456',
        expected: '123k'
      },
      {
        number: `12345678`,
        expected: `12M`
      },
      {
        number: `1234567801`,
        expected: `1G`
      },
    ];
  });
}


/***/ },

/***/ "./js/tests/PermissionManagerTest.js"
/*!*******************************************!*\
  !*** ./js/tests/PermissionManagerTest.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PermissionManagerTest: () => (/* binding */ PermissionManagerTest)
/* harmony export */ });
/* harmony import */ var _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/DTestFramework */ "./js/framework/DTestFramework.js");
/* harmony import */ var _managers_PermissionManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../managers/PermissionManager */ "./js/managers/PermissionManager.js");
/* harmony import */ var _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/Permissions */ "./js/constants/Permissions.js");




class PermissionManagerTest extends _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTestSuite {

  constructor() {
    super('PermissionManagerTest');
  }

  addPermissionsTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('addPermissionsTest', function(params) {
    const permissionManager = new _managers_PermissionManager__WEBPACK_IMPORTED_MODULE_1__.PermissionManager();
    this.assertEquals(
      permissionManager.addPermissions(
        params.initialPermissions,
        params.permissionsToAdd
      ),
      params.expected
    );
  }, function() {
    return [
      {
        initialPermissions: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SOURCE_ALLOCATION,
        permissionsToAdd: [],
        expected: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SOURCE_ALLOCATION
      },
      {
        initialPermissions: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SOURCE_ALLOCATION,
        permissionsToAdd: [_constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY],
        expected: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SOURCE_ALLOCATION
      },
      {
        initialPermissions: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY,
        permissionsToAdd: [_constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ADMIN],
        expected: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ADMIN
      },
      {
        initialPermissions: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY,
        permissionsToAdd: [_constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ASSETS_ALL],
        expected: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ASSETS_ALL
      },
      {
        initialPermissions: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.GUILD_MEMBERSHIP,
        permissionsToAdd: [
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ADMIN,
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.UPDATE,
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.DELETE
        ],
        expected: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.GUILD_MEMBERSHIP
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ADMIN
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.UPDATE
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.DELETE
      },
      {
        // TOKEN_TRANSFER is one of the bits ASSETS_ALL already covers, so it
        // contributes nothing beyond the composite.
        initialPermissions: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY,
        permissionsToAdd: [
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ASSETS_ALL,
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.TOKEN_TRANSFER,
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.HASH_ALL
        ],
        expected: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ASSETS_ALL
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.HASH_ALL
      },
    ];
  });

  removePermissionsTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('removePermissionsTest', function(params) {
    const permissionManager = new _managers_PermissionManager__WEBPACK_IMPORTED_MODULE_1__.PermissionManager();
    this.assertEquals(
      permissionManager.removePermissions(
        params.initialPermissions,
        params.permissionsToRemove
      ),
      params.expected
    );
  }, function() {
    return [
      {
        initialPermissions: 32509697,
        permissionsToRemove: [],
        expected: 32509697
      },
      {
        initialPermissions: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SOURCE_ALLOCATION
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.GUILD_MEMBERSHIP
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SUBSTATION_CONNECTION
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ALLOCATION_CONNECTION
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.HASH_ALL,
        permissionsToRemove: [_constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.GUILD_MEMBERSHIP],
        expected: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SOURCE_ALLOCATION
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SUBSTATION_CONNECTION
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ALLOCATION_CONNECTION
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.HASH_ALL
      },
      {
        initialPermissions: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ADMIN
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.UPDATE
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.DELETE
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ASSETS_ALL
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SOURCE_ALLOCATION
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.GUILD_MEMBERSHIP
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SUBSTATION_CONNECTION
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ALLOCATION_CONNECTION
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.HASH_ALL,
        permissionsToRemove: [
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.UPDATE,
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ASSETS_ALL,
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.HASH_ALL,
        ],
        expected: _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ADMIN
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.DELETE
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SOURCE_ALLOCATION
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.GUILD_MEMBERSHIP
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.SUBSTATION_CONNECTION
          | _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ALLOCATION_CONNECTION
      }
    ];
  });
}


/***/ },

/***/ "./js/tests/TaskManagerOreTest.js"
/*!****************************************!*\
  !*** ./js/tests/TaskManagerOreTest.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaskManagerOreTest: () => (/* binding */ TaskManagerOreTest)
/* harmony export */ });
/* harmony import */ var _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/DTestFramework */ "./js/framework/DTestFramework.js");
/* harmony import */ var _managers_TaskManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../managers/TaskManager */ "./js/managers/TaskManager.js");
/* harmony import */ var _factories_TaskStateFactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../factories/TaskStateFactory */ "./js/factories/TaskStateFactory.js");
/* harmony import */ var _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/TaskTypes */ "./js/constants/TaskTypes.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");
/* harmony import */ var _models_PlanetRaid__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../models/PlanetRaid */ "./js/models/PlanetRaid.js");
/* harmony import */ var _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../constants/RaidStatus */ "./js/constants/RaidStatus.js");








/**
 * Covers the decisions TaskManager makes about ore work, which since structsd
 * v0.21.0 runs off a clock shared by every rig on the planet instead of one
 * held by each struct.
 *
 * spawn and terminate are replaced with recorders so no Web Worker is started;
 * what is under test is which structs get started and stopped, and on what
 * clock.
 */
class TaskManagerOreTest extends _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTestSuite {

  constructor() {
    super('TaskManagerOreTest');
  }

  /**
   * @param {string|null} raidStatus
   * @return {TaskManager}
   */
  static makeTaskManager(raidStatus = null) {
    const planetRaidInfo = new _models_PlanetRaid__WEBPACK_IMPORTED_MODULE_5__.PlanetRaid();
    planetRaidInfo.status = raidStatus;

    const gameState = {
      currentBlockHeight: 1000,
      keyPlayers: {
        [_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__.PLAYER_TYPES.PLAYER]: {id: '1-1', planetRaidInfo: planetRaidInfo}
      }
    };

    const taskManager = new _managers_TaskManager__WEBPACK_IMPORTED_MODULE_1__.TaskManager(gameState, {}, {}, new _factories_TaskStateFactory__WEBPACK_IMPORTED_MODULE_2__.TaskStateFactory());

    taskManager.spawned = [];
    taskManager.terminated = [];

    taskManager.spawn = function (task_state) {
      this.spawned.push(task_state);
      return task_state.getPID();
    }.bind(taskManager);

    taskManager.terminate = function (pid) {
      this.terminated.push(pid);
      delete this.processes[pid];
    }.bind(taskManager);

    return taskManager;
  }

  /**
   * Stands in for a live process without starting a worker.
   *
   * @param {TaskManager} taskManager
   * @param {string} pid
   * @param {string} taskType
   * @param {number} block_start
   */
  static givenRunningTask(taskManager, pid, taskType, block_start) {
    taskManager.processes[pid] = {
      state: {task_type: taskType, block_start: block_start}
    };
    taskManager.running_queue.push(pid);
  }

  /**
   * @param {string} object_id
   * @param {string} category
   * @param {number} block_start
   * @return {object}
   */
  static makeWork(object_id, category, block_start) {
    return {
      object_id: object_id,
      player_id: '1-1',
      target_id: object_id,
      category: category,
      block_start: block_start,
      difficulty_target: 8
    };
  }

  // The clock on the event leads the work record, which the indexer may not
  // have caught up on yet, and every eligible rig hashes against that one clock.
  grassClockFansOutToEveryStructTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('grassClockFansOutToEveryStructTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    const work = [
      TaskManagerOreTest.makeWork('5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900),
      TaskManagerOreTest.makeWork('5-2', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900),
      TaskManagerOreTest.makeWork('5-3', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.REFINE, 900)
    ];

    taskManager.syncOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, work, 1234);

    this.assertEquals(taskManager.spawned.length, 2);
    this.assertArrayEquals(
      taskManager.spawned.map((task) => task.object_id),
      ['5-1', '5-2']
    );
    this.assertEquals(taskManager.spawned[0].block_start, 1234);
    this.assertEquals(taskManager.spawned[1].block_start, 1234);

    // The block is what the chain checks the hash against.
    this.assertEquals(taskManager.spawned[0].prefix, '5-1MINE1234NONCE');
  });

  // A reconcile has no event to work from, so the work record carries the clock.
  workRecordClockIsUsedWithoutGrassTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('workRecordClockIsUsedWithoutGrassTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    const work = [TaskManagerOreTest.makeWork('5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900)];

    taskManager.syncOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, work);

    this.assertEquals(taskManager.spawned.length, 1);
    this.assertEquals(taskManager.spawned[0].block_start, 900);
  });

  // Respawning restarts the worker and discards every nonce already searched.
  unchangedClockLeavesProgressAloneTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('unchangedClockLeavesProgressAloneTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenRunningTask(taskManager, '5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900);

    const work = [TaskManagerOreTest.makeWork('5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900)];

    taskManager.syncOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, work, 900);

    this.assertEquals(taskManager.spawned.length, 0);
    this.assertEquals(taskManager.terminated.length, 0);
  });

  movedClockRestartsTheTaskTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('movedClockRestartsTheTaskTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenRunningTask(taskManager, '5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900);

    const work = [TaskManagerOreTest.makeWork('5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900)];

    taskManager.syncOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, work, 1500);

    this.assertEquals(taskManager.spawned.length, 1);
    this.assertEquals(taskManager.spawned[0].block_start, 1500);
  });

  // The chain no longer reports a per-struct stop, so falling off the work list
  // is the only signal that a rig went offline or ran out of ore.
  structMissingFromWorkIsStoppedTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('structMissingFromWorkIsStoppedTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenRunningTask(taskManager, '5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900);
    TaskManagerOreTest.givenRunningTask(taskManager, '5-2', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900);

    const work = [TaskManagerOreTest.makeWork('5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900)];

    taskManager.syncOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, work, 900);

    this.assertArrayEquals(taskManager.terminated, ['5-2']);
    this.assertEquals(taskManager.spawned.length, 0);
  });

  // Build work shares the process table but is driven by a per-struct clock.
  otherTaskTypesAreLeftAloneTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('otherTaskTypesAreLeftAloneTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    TaskManagerOreTest.givenRunningTask(taskManager, '5-9', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.BUILD, 900);
    TaskManagerOreTest.givenRunningTask(taskManager, '5-8', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.REFINE, 900);

    taskManager.syncOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, [], 1234);

    this.assertEquals(taskManager.terminated.length, 0);
  });

  // The chain refuses ore work while a raider sits on the planet.
  raidStopsOreWorkTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('raidStopsOreWorkTest', function(params) {
    const taskManager = TaskManagerOreTest.makeTaskManager(params.raidStatus);
    TaskManagerOreTest.givenRunningTask(taskManager, '5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900);

    const work = [TaskManagerOreTest.makeWork('5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900)];

    taskManager.syncOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, work, 1234);

    this.assertArrayEquals(taskManager.terminated, ['5-1']);
    this.assertEquals(taskManager.spawned.length, 0);
  }, function() {
    return [
      {raidStatus: _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_6__.RAID_STATUS.INITIATED},
      {raidStatus: _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_6__.RAID_STATUS.ONGOING},
      {raidStatus: _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_6__.RAID_STATUS.SHIELDS_VULNERABLE}
    ];
  });

  // view.work has no block_start > 0 filter, and there is nothing to hash
  // against without a clock.
  zeroClockIsNotStartedTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('zeroClockIsNotStartedTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager();
    const work = [TaskManagerOreTest.makeWork('5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 0)];

    taskManager.syncOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, work);

    this.assertEquals(taskManager.spawned.length, 0);
  });

  // The regression this suite exists for. structsd shifts the ore clocks the
  // moment a raid ends, in the same block as the raid result and ahead of it, so
  // the clock lands while the victory dialogue is still up and local raid state
  // still reads active. The chain announces a clock once, so dropping it here
  // stranded mining until the player reloaded.
  clockArrivingDuringRaidSurvivesToReconcileTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('clockArrivingDuringRaidSurvivesToReconcileTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager(_constants_RaidStatus__WEBPACK_IMPORTED_MODULE_6__.RAID_STATUS.SHIELDS_VULNERABLE);
    TaskManagerOreTest.givenRunningTask(taskManager, '5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900);

    // The raid-end clock arrives while the raid is still playing out on screen.
    taskManager.refreshOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 1500);

    this.assertArrayEquals(taskManager.terminated, ['5-1']);
    this.assertEquals(taskManager.spawned.length, 0);

    // raidEndActions clears the raid, then reconciles.
    taskManager.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__.PLAYER_TYPES.PLAYER].planetRaidInfo = new _models_PlanetRaid__WEBPACK_IMPORTED_MODULE_5__.PlanetRaid();

    const work = [TaskManagerOreTest.makeWork('5-1', _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 900)];
    taskManager.syncOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, work, taskManager.consumeHeldOreClock(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE));

    // Mining restarts, and on the shifted clock rather than the stale one the
    // indexer may still be serving.
    this.assertEquals(taskManager.spawned.length, 1);
    this.assertEquals(taskManager.spawned[0].block_start, 1500);
  });

  // A held clock is only good once; a later reconcile must fall back to the
  // work record rather than replay a stale block.
  heldClockIsConsumedOnceTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('heldClockIsConsumedOnceTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager(_constants_RaidStatus__WEBPACK_IMPORTED_MODULE_6__.RAID_STATUS.ONGOING);

    taskManager.refreshOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 1500);

    this.assertEquals(taskManager.consumeHeldOreClock(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE), 1500);
    this.assertEquals(taskManager.consumeHeldOreClock(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE), null);
  });

  // A clock the chain actually cleared must not be resurrected later.
  clearedClockIsNotHeldTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('clearedClockIsNotHeldTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager(_constants_RaidStatus__WEBPACK_IMPORTED_MODULE_6__.RAID_STATUS.ONGOING);

    taskManager.refreshOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 1500);
    taskManager.refreshOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 0);

    this.assertEquals(taskManager.consumeHeldOreClock(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE), null);
  });

  // Each ore clock is held separately.
  heldClocksDoNotCrossTypesTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('heldClocksDoNotCrossTypesTest', function() {
    const taskManager = TaskManagerOreTest.makeTaskManager(_constants_RaidStatus__WEBPACK_IMPORTED_MODULE_6__.RAID_STATUS.ONGOING);

    taskManager.refreshOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE, 1500);
    taskManager.refreshOreTasks(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.REFINE, 1600);

    this.assertEquals(taskManager.consumeHeldOreClock(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.REFINE), 1600);
    this.assertEquals(taskManager.consumeHeldOreClock(_constants_TaskTypes__WEBPACK_IMPORTED_MODULE_3__.TASK_TYPES.MINE), 1500);
  });
}


/***/ },

/***/ "./js/util/NumberFormatter.js"
/*!************************************!*\
  !*** ./js/util/NumberFormatter.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NumberFormatter: () => (/* binding */ NumberFormatter)
/* harmony export */ });
class NumberFormatter {

  constructor() {
    this.scale = {
      '1': 'k',
      '2': 'M',
      '3': 'G',
      '4': 'T',
      '5': 'P',
      '6': 'E',
      '7': 'Z',
      '8': 'Y',
      '9': 'R',
      '10': 'Q'
    }
  }

  /**
   * @param {number|string} number
   * @return {string}
   */
  format(number) {
    const intString = `${parseInt(`${number}`)}`;
    const numDigits = intString.length;

    if (numDigits <= 3) {
      return intString;
    }

    let remainderDigits = numDigits % 3;
    remainderDigits = remainderDigits === 0 ? 3 : remainderDigits;
    const scaleIndex = ((numDigits - remainderDigits) / 3);
    const unit = this.scale[scaleIndex];

    return intString.substring(0, remainderDigits) + unit;
  }

  /**
   * @param {number} ms milliseconds
   * @return {string}
   */
  formatMilliseconds(ms) {
    const timeParts = [];

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      timeParts.push(`${hours}h`);
    }

    if (minutes > 0) {
      timeParts.push(`${minutes}m`);
    }

    return timeParts.join(' ');
  }
}


/***/ },

/***/ "./node_modules/js-sha256/src/sha256.js"
/*!**********************************************!*\
  !*** ./node_modules/js-sha256/src/sha256.js ***!
  \**********************************************/
(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.11.1
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2025
 * @license MIT
 */
/*jslint bitwise: true */
(function () {
  'use strict';

  var ERROR = 'input is invalid type';
  var WINDOW = typeof window === 'object';
  var root = WINDOW ? window : {};
  if (root.JS_SHA256_NO_WINDOW) {
    WINDOW = false;
  }
  var WEB_WORKER = !WINDOW && typeof self === 'object';
  var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node && process.type != 'renderer';
  if (NODE_JS) {
    root = __webpack_require__.g;
  } else if (WEB_WORKER) {
    root = self;
  }
  var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && "object" === 'object' && module.exports;
  var AMD =  true && __webpack_require__.amdO;
  var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
  var HEX_CHARS = '0123456789abcdef'.split('');
  var EXTRA = [-2147483648, 8388608, 32768, 128];
  var SHIFT = [24, 16, 8, 0];
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  var OUTPUT_TYPES = ['hex', 'array', 'digest', 'arrayBuffer'];

  var blocks = [];

  if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
    Array.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }

  if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
    ArrayBuffer.isView = function (obj) {
      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
    };
  }

  var createOutputMethod = function (outputType, is224) {
    return function (message) {
      return new Sha256(is224, true).update(message)[outputType]();
    };
  };

  var createMethod = function (is224) {
    var method = createOutputMethod('hex', is224);
    if (NODE_JS) {
      method = nodeWrap(method, is224);
    }
    method.create = function () {
      return new Sha256(is224);
    };
    method.update = function (message) {
      return method.create().update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createOutputMethod(type, is224);
    }
    return method;
  };

  var nodeWrap = function (method, is224) {
    var crypto = __webpack_require__(/*! crypto */ "?abf2")
    var Buffer = (__webpack_require__(/*! buffer */ "?69d9").Buffer);
    var algorithm = is224 ? 'sha224' : 'sha256';
    var bufferFrom;
    if (Buffer.from && !root.JS_SHA256_NO_BUFFER_FROM) {
      bufferFrom = Buffer.from;
    } else {
      bufferFrom = function (message) {
        return new Buffer(message);
      };
    }
    var nodeMethod = function (message) {
      if (typeof message === 'string') {
        return crypto.createHash(algorithm).update(message, 'utf8').digest('hex');
      } else {
        if (message === null || message === undefined) {
          throw new Error(ERROR);
        } else if (message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        }
      }
      if (Array.isArray(message) || ArrayBuffer.isView(message) ||
        message.constructor === Buffer) {
        return crypto.createHash(algorithm).update(bufferFrom(message)).digest('hex');
      } else {
        return method(message);
      }
    };
    return nodeMethod;
  };

  var createHmacOutputMethod = function (outputType, is224) {
    return function (key, message) {
      return new HmacSha256(key, is224, true).update(message)[outputType]();
    };
  };

  var createHmacMethod = function (is224) {
    var method = createHmacOutputMethod('hex', is224);
    method.create = function (key) {
      return new HmacSha256(key, is224);
    };
    method.update = function (key, message) {
      return method.create(key).update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createHmacOutputMethod(type, is224);
    }
    return method;
  };

  function Sha256(is224, sharedMemory) {
    if (sharedMemory) {
      blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      this.blocks = blocks;
    } else {
      this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (is224) {
      this.h0 = 0xc1059ed8;
      this.h1 = 0x367cd507;
      this.h2 = 0x3070dd17;
      this.h3 = 0xf70e5939;
      this.h4 = 0xffc00b31;
      this.h5 = 0x68581511;
      this.h6 = 0x64f98fa7;
      this.h7 = 0xbefa4fa4;
    } else { // 256
      this.h0 = 0x6a09e667;
      this.h1 = 0xbb67ae85;
      this.h2 = 0x3c6ef372;
      this.h3 = 0xa54ff53a;
      this.h4 = 0x510e527f;
      this.h5 = 0x9b05688c;
      this.h6 = 0x1f83d9ab;
      this.h7 = 0x5be0cd19;
    }

    this.block = this.start = this.bytes = this.hBytes = 0;
    this.finalized = this.hashed = false;
    this.first = true;
    this.is224 = is224;
  }

  Sha256.prototype.update = function (message) {
    if (this.finalized) {
      return;
    }
    var notString, type = typeof message;
    if (type !== 'string') {
      if (type === 'object') {
        if (message === null) {
          throw new Error(ERROR);
        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        } else if (!Array.isArray(message)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
            throw new Error(ERROR);
          }
        }
      } else {
        throw new Error(ERROR);
      }
      notString = true;
    }
    var code, index = 0, i, length = message.length, blocks = this.blocks;
    while (index < length) {
      if (this.hashed) {
        this.hashed = false;
        blocks[0] = this.block;
        this.block = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
          blocks[4] = blocks[5] = blocks[6] = blocks[7] =
          blocks[8] = blocks[9] = blocks[10] = blocks[11] =
          blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      }

      if (notString) {
        for (i = this.start; index < length && i < 64; ++index) {
          blocks[i >>> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < 64; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >>> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >>> 2] |= (0xc0 | (code >>> 6)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >>> 2] |= (0xe0 | (code >>> 12)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | ((code >>> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >>> 2] |= (0xf0 | (code >>> 18)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | ((code >>> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | ((code >>> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }

      this.lastByteIndex = i;
      this.bytes += i - this.start;
      if (i >= 64) {
        this.block = blocks[16];
        this.start = i - 64;
        this.hash();
        this.hashed = true;
      } else {
        this.start = i;
      }
    }
    if (this.bytes > 4294967295) {
      this.hBytes += this.bytes / 4294967296 << 0;
      this.bytes = this.bytes % 4294967296;
    }
    return this;
  };

  Sha256.prototype.finalize = function () {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    var blocks = this.blocks, i = this.lastByteIndex;
    blocks[16] = this.block;
    blocks[i >>> 2] |= EXTRA[i & 3];
    this.block = blocks[16];
    if (i >= 56) {
      if (!this.hashed) {
        this.hash();
      }
      blocks[0] = this.block;
      blocks[16] = blocks[1] = blocks[2] = blocks[3] =
        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
    }
    blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
    blocks[15] = this.bytes << 3;
    this.hash();
  };

  Sha256.prototype.hash = function () {
    var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6,
      h = this.h7, blocks = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;

    for (j = 16; j < 64; ++j) {
      // rightrotate
      t1 = blocks[j - 15];
      s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
      t1 = blocks[j - 2];
      s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
      blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
    }

    bc = b & c;
    for (j = 0; j < 64; j += 4) {
      if (this.first) {
        if (this.is224) {
          ab = 300032;
          t1 = blocks[0] - 1413257819;
          h = t1 - 150054599 << 0;
          d = t1 + 24177077 << 0;
        } else {
          ab = 704751109;
          t1 = blocks[0] - 210244248;
          h = t1 - 1521486534 << 0;
          d = t1 + 143694565 << 0;
        }
        this.first = false;
      } else {
        s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        ab = a & b;
        maj = ab ^ (a & c) ^ bc;
        ch = (e & f) ^ (~e & g);
        t1 = h + s1 + ch + K[j] + blocks[j];
        t2 = s0 + maj;
        h = d + t1 << 0;
        d = t1 + t2 << 0;
      }
      s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
      s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
      da = d & a;
      maj = da ^ (d & b) ^ ab;
      ch = (h & e) ^ (~h & f);
      t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
      t2 = s0 + maj;
      g = c + t1 << 0;
      c = t1 + t2 << 0;
      s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
      s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
      cd = c & d;
      maj = cd ^ (c & a) ^ da;
      ch = (g & h) ^ (~g & e);
      t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
      t2 = s0 + maj;
      f = b + t1 << 0;
      b = t1 + t2 << 0;
      s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
      s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
      bc = b & c;
      maj = bc ^ (b & d) ^ cd;
      ch = (f & g) ^ (~f & h);
      t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
      t2 = s0 + maj;
      e = a + t1 << 0;
      a = t1 + t2 << 0;
      this.chromeBugWorkAround = true;
    }

    this.h0 = this.h0 + a << 0;
    this.h1 = this.h1 + b << 0;
    this.h2 = this.h2 + c << 0;
    this.h3 = this.h3 + d << 0;
    this.h4 = this.h4 + e << 0;
    this.h5 = this.h5 + f << 0;
    this.h6 = this.h6 + g << 0;
    this.h7 = this.h7 + h << 0;
  };

  Sha256.prototype.hex = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
      h6 = this.h6, h7 = this.h7;

    var hex = HEX_CHARS[(h0 >>> 28) & 0x0F] + HEX_CHARS[(h0 >>> 24) & 0x0F] +
      HEX_CHARS[(h0 >>> 20) & 0x0F] + HEX_CHARS[(h0 >>> 16) & 0x0F] +
      HEX_CHARS[(h0 >>> 12) & 0x0F] + HEX_CHARS[(h0 >>> 8) & 0x0F] +
      HEX_CHARS[(h0 >>> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
      HEX_CHARS[(h1 >>> 28) & 0x0F] + HEX_CHARS[(h1 >>> 24) & 0x0F] +
      HEX_CHARS[(h1 >>> 20) & 0x0F] + HEX_CHARS[(h1 >>> 16) & 0x0F] +
      HEX_CHARS[(h1 >>> 12) & 0x0F] + HEX_CHARS[(h1 >>> 8) & 0x0F] +
      HEX_CHARS[(h1 >>> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
      HEX_CHARS[(h2 >>> 28) & 0x0F] + HEX_CHARS[(h2 >>> 24) & 0x0F] +
      HEX_CHARS[(h2 >>> 20) & 0x0F] + HEX_CHARS[(h2 >>> 16) & 0x0F] +
      HEX_CHARS[(h2 >>> 12) & 0x0F] + HEX_CHARS[(h2 >>> 8) & 0x0F] +
      HEX_CHARS[(h2 >>> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
      HEX_CHARS[(h3 >>> 28) & 0x0F] + HEX_CHARS[(h3 >>> 24) & 0x0F] +
      HEX_CHARS[(h3 >>> 20) & 0x0F] + HEX_CHARS[(h3 >>> 16) & 0x0F] +
      HEX_CHARS[(h3 >>> 12) & 0x0F] + HEX_CHARS[(h3 >>> 8) & 0x0F] +
      HEX_CHARS[(h3 >>> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
      HEX_CHARS[(h4 >>> 28) & 0x0F] + HEX_CHARS[(h4 >>> 24) & 0x0F] +
      HEX_CHARS[(h4 >>> 20) & 0x0F] + HEX_CHARS[(h4 >>> 16) & 0x0F] +
      HEX_CHARS[(h4 >>> 12) & 0x0F] + HEX_CHARS[(h4 >>> 8) & 0x0F] +
      HEX_CHARS[(h4 >>> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F] +
      HEX_CHARS[(h5 >>> 28) & 0x0F] + HEX_CHARS[(h5 >>> 24) & 0x0F] +
      HEX_CHARS[(h5 >>> 20) & 0x0F] + HEX_CHARS[(h5 >>> 16) & 0x0F] +
      HEX_CHARS[(h5 >>> 12) & 0x0F] + HEX_CHARS[(h5 >>> 8) & 0x0F] +
      HEX_CHARS[(h5 >>> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F] +
      HEX_CHARS[(h6 >>> 28) & 0x0F] + HEX_CHARS[(h6 >>> 24) & 0x0F] +
      HEX_CHARS[(h6 >>> 20) & 0x0F] + HEX_CHARS[(h6 >>> 16) & 0x0F] +
      HEX_CHARS[(h6 >>> 12) & 0x0F] + HEX_CHARS[(h6 >>> 8) & 0x0F] +
      HEX_CHARS[(h6 >>> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F];
    if (!this.is224) {
      hex += HEX_CHARS[(h7 >>> 28) & 0x0F] + HEX_CHARS[(h7 >>> 24) & 0x0F] +
        HEX_CHARS[(h7 >>> 20) & 0x0F] + HEX_CHARS[(h7 >>> 16) & 0x0F] +
        HEX_CHARS[(h7 >>> 12) & 0x0F] + HEX_CHARS[(h7 >>> 8) & 0x0F] +
        HEX_CHARS[(h7 >>> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F];
    }
    return hex;
  };

  Sha256.prototype.toString = Sha256.prototype.hex;

  Sha256.prototype.digest = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
      h6 = this.h6, h7 = this.h7;

    var arr = [
      (h0 >>> 24) & 0xFF, (h0 >>> 16) & 0xFF, (h0 >>> 8) & 0xFF, h0 & 0xFF,
      (h1 >>> 24) & 0xFF, (h1 >>> 16) & 0xFF, (h1 >>> 8) & 0xFF, h1 & 0xFF,
      (h2 >>> 24) & 0xFF, (h2 >>> 16) & 0xFF, (h2 >>> 8) & 0xFF, h2 & 0xFF,
      (h3 >>> 24) & 0xFF, (h3 >>> 16) & 0xFF, (h3 >>> 8) & 0xFF, h3 & 0xFF,
      (h4 >>> 24) & 0xFF, (h4 >>> 16) & 0xFF, (h4 >>> 8) & 0xFF, h4 & 0xFF,
      (h5 >>> 24) & 0xFF, (h5 >>> 16) & 0xFF, (h5 >>> 8) & 0xFF, h5 & 0xFF,
      (h6 >>> 24) & 0xFF, (h6 >>> 16) & 0xFF, (h6 >>> 8) & 0xFF, h6 & 0xFF
    ];
    if (!this.is224) {
      arr.push((h7 >>> 24) & 0xFF, (h7 >>> 16) & 0xFF, (h7 >>> 8) & 0xFF, h7 & 0xFF);
    }
    return arr;
  };

  Sha256.prototype.array = Sha256.prototype.digest;

  Sha256.prototype.arrayBuffer = function () {
    this.finalize();

    var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
    var dataView = new DataView(buffer);
    dataView.setUint32(0, this.h0);
    dataView.setUint32(4, this.h1);
    dataView.setUint32(8, this.h2);
    dataView.setUint32(12, this.h3);
    dataView.setUint32(16, this.h4);
    dataView.setUint32(20, this.h5);
    dataView.setUint32(24, this.h6);
    if (!this.is224) {
      dataView.setUint32(28, this.h7);
    }
    return buffer;
  };

  function HmacSha256(key, is224, sharedMemory) {
    var i, type = typeof key;
    if (type === 'string') {
      var bytes = [], length = key.length, index = 0, code;
      for (i = 0; i < length; ++i) {
        code = key.charCodeAt(i);
        if (code < 0x80) {
          bytes[index++] = code;
        } else if (code < 0x800) {
          bytes[index++] = (0xc0 | (code >>> 6));
          bytes[index++] = (0x80 | (code & 0x3f));
        } else if (code < 0xd800 || code >= 0xe000) {
          bytes[index++] = (0xe0 | (code >>> 12));
          bytes[index++] = (0x80 | ((code >>> 6) & 0x3f));
          bytes[index++] = (0x80 | (code & 0x3f));
        } else {
          code = 0x10000 + (((code & 0x3ff) << 10) | (key.charCodeAt(++i) & 0x3ff));
          bytes[index++] = (0xf0 | (code >>> 18));
          bytes[index++] = (0x80 | ((code >>> 12) & 0x3f));
          bytes[index++] = (0x80 | ((code >>> 6) & 0x3f));
          bytes[index++] = (0x80 | (code & 0x3f));
        }
      }
      key = bytes;
    } else {
      if (type === 'object') {
        if (key === null) {
          throw new Error(ERROR);
        } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
          key = new Uint8Array(key);
        } else if (!Array.isArray(key)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
            throw new Error(ERROR);
          }
        }
      } else {
        throw new Error(ERROR);
      }
    }

    if (key.length > 64) {
      key = (new Sha256(is224, true)).update(key).array();
    }

    var oKeyPad = [], iKeyPad = [];
    for (i = 0; i < 64; ++i) {
      var b = key[i] || 0;
      oKeyPad[i] = 0x5c ^ b;
      iKeyPad[i] = 0x36 ^ b;
    }

    Sha256.call(this, is224, sharedMemory);

    this.update(iKeyPad);
    this.oKeyPad = oKeyPad;
    this.inner = true;
    this.sharedMemory = sharedMemory;
  }
  HmacSha256.prototype = new Sha256();

  HmacSha256.prototype.finalize = function () {
    Sha256.prototype.finalize.call(this);
    if (this.inner) {
      this.inner = false;
      var innerHash = this.array();
      Sha256.call(this, this.is224, this.sharedMemory);
      this.update(this.oKeyPad);
      this.update(innerHash);
      Sha256.prototype.finalize.call(this);
    }
  };

  var exports = createMethod();
  exports.sha256 = exports;
  exports.sha224 = createMethod(true);
  exports.sha256.hmac = createHmacMethod();
  exports.sha224.hmac = createHmacMethod(true);

  if (COMMON_JS) {
    module.exports = exports;
  } else {
    root.sha256 = exports.sha256;
    root.sha224 = exports.sha224;
    if (AMD) {
      !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
        return exports;
      }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
  }
})();


/***/ },

/***/ "?69d9"
/*!************************!*\
  !*** buffer (ignored) ***!
  \************************/
() {

/* (ignored) */

/***/ },

/***/ "?abf2"
/*!************************!*\
  !*** crypto (ignored) ***!
  \************************/
() {

/* (ignored) */

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd options */
/******/ 	(() => {
/******/ 		__webpack_require__.amdO = {};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			const getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter/value functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			if(Array.isArray(definition)) {
/******/ 				var i = 0;
/******/ 				while(i < definition.length) {
/******/ 					var key = definition[i++];
/******/ 					var binding = definition[i++];
/******/ 					if(!__webpack_require__.o(exports, key)) {
/******/ 						if(binding === 0) {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 						} else {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 						}
/******/ 					} else if(binding === 0) { i++; }
/******/ 				}
/******/ 			} else {
/******/ 				for(var key in definition) {
/******/ 					if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!**************************!*\
  !*** ./js/tests/test.js ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _NumberFormatterTest__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NumberFormatterTest */ "./js/tests/NumberFormatterTest.js");
/* harmony import */ var _PermissionManagerTest__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PermissionManagerTest */ "./js/tests/PermissionManagerTest.js");
/* harmony import */ var _TaskManagerOreTest__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TaskManagerOreTest */ "./js/tests/TaskManagerOreTest.js");




(new _NumberFormatterTest__WEBPACK_IMPORTED_MODULE_0__.NumberFormatterTest()).run();
(new _PermissionManagerTest__WEBPACK_IMPORTED_MODULE_1__.PermissionManagerTest()).run();
(new _TaskManagerOreTest__WEBPACK_IMPORTED_MODULE_2__.TaskManagerOreTest()).run();

})();

/******/ })()
;
//# sourceMappingURL=test.js.map