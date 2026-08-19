/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/constants/Permissions.js"
/*!*************************************!*\
  !*** ./js/constants/Permissions.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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

/***/ "./js/framework/DTestFramework.js"
/*!****************************************!*\
  !*** ./js/framework/DTestFramework.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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

/***/ "./js/managers/PermissionManager.js"
/*!******************************************!*\
  !*** ./js/managers/PermissionManager.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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

/***/ "./js/tests/NumberFormatterTest.js"
/*!*****************************************!*\
  !*** ./js/tests/NumberFormatterTest.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
        permissionManager.getDefaultPlayerPermissions(),
        params.permissionsToAdd
      ),
      params.expected
    );
  }, function() {
    return [
      {
        permissionsToAdd: [],
        expected: 32509697
      },
      {
        permissionsToAdd: [_constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.PLAY],
        expected: 32509697
      },
      {
        permissionsToAdd: [_constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ASSETS_ALL],
        expected: 32509937
      },
      {
        permissionsToAdd: [_constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ADMIN],
        expected: 32509699
      },
      {
        permissionsToAdd: [
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ASSETS_ALL,
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ADMIN
        ],
        expected: 32509939
      },
      {
        permissionsToAdd: [
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ASSETS_ALL,
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.ADMIN,
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.UPDATE,
          _constants_Permissions__WEBPACK_IMPORTED_MODULE_2__.PERMISSIONS.DELETE
        ],
        expected: 32509951
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

/***/ "./js/util/NumberFormatter.js"
/*!************************************!*\
  !*** ./js/util/NumberFormatter.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./js/tests/test.js ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _NumberFormatterTest__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NumberFormatterTest */ "./js/tests/NumberFormatterTest.js");
/* harmony import */ var _PermissionManagerTest__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PermissionManagerTest */ "./js/tests/PermissionManagerTest.js");



(new _NumberFormatterTest__WEBPACK_IMPORTED_MODULE_0__.NumberFormatterTest()).run();
(new _PermissionManagerTest__WEBPACK_IMPORTED_MODULE_1__.PermissionManagerTest()).run();

})();

/******/ })()
;
//# sourceMappingURL=test.js.map