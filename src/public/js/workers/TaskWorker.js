/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

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
/*!**********************************!*\
  !*** ./js/workers/TaskWorker.js ***!
  \**********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/TaskConstants */ "./js/constants/TaskConstants.js");
/* harmony import */ var _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/TaskStatus */ "./js/constants/TaskStatus.js");
/* harmony import */ var _factories_TaskStateFactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../factories/TaskStateFactory */ "./js/factories/TaskStateFactory.js");
/* harmony import */ var js_sha256__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! js-sha256 */ "./node_modules/js-sha256/src/sha256.js");
/* harmony import */ var js_sha256__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(js_sha256__WEBPACK_IMPORTED_MODULE_3__);





let state = null;

const taskStateFactory = new _factories_TaskStateFactory__WEBPACK_IMPORTED_MODULE_2__.TaskStateFactory();

onmessage =  async function(process_request) {
    state = taskStateFactory.make(process_request.data[0]);

    /*
        If the state is starting, then start the task in a waiting state.
        Otherwise, if it's been passed as "Running" already, then force it
        to begin hashing even if difficulty is too high.
     */
    if (state.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.STARTING){
        state.setStatus(_constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.WAITING);
        postMessage([state]);
    }
    console.log('Start Process Request ' + state.getPID());
    await work();
}

async function work() {
    let difficulty = state.getCurrentDifficulty();

    if (state.status === _constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.WAITING){
        while (difficulty > _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.DIFFICULTY_START) {
            console.log('Web Worker chilling because difficulty of task is too high: ' + difficulty + ' > ' + _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.DIFFICULTY_START);
            await new Promise(r => setTimeout(r, _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.DIFFICULTY_START_SLEEP_DELAY));
            difficulty = state.getCurrentDifficulty();
        }
        state.setStatus(_constants_TaskStatus__WEBPACK_IMPORTED_MODULE_1__.TASK_STATUS.RUNNING);
        postMessage([state]);
    }

    let sessionIterations = 1;
    while (true) {
        const nonce = state.getNextNonce();
        const message = state.getMessage(nonce);
        const hash = (0,js_sha256__WEBPACK_IMPORTED_MODULE_3__.sha256)(message);

        if (difficultyCheck(hash, difficulty)){
            state.setResult(nonce, message, hash, difficulty);
            postMessage([state]);
            break;
        }

        if (state.iterations % _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.CHECKPOINT_COMMIT === 0) {
            state.iterations_since_last_start = sessionIterations;
            postMessage([state]);
        }

        if (state.iterations % _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.DIFFICULTY_RECALCULATE === 0) {
            difficulty = state.getCurrentDifficulty();

            // Check to see if a previous hash result is now relevant again
            if (state.result_exists && state.result_difficulty >= difficulty) {
                state.setPreviousResult(difficulty);
                postMessage([state]);
                break;
            }
        }
        sessionIterations++;
    }
}

function difficultyCheck(hash, difficulty) {
    //console.log('dif' + difficulty + ' hash ' + hash)
    for (let position = 1; position <= difficulty; position++) {
        if (hash[position - 1] !== "0") {
            return false;
        }
    }
    return true;
}
})();

/******/ })()
;
//# sourceMappingURL=TaskWorker.js.map