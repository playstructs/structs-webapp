/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./js/builders/StructStillBuilder.js"
/*!*******************************************!*\
  !*** ./js/builders/StructStillBuilder.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StructStillBuilder: () => (/* binding */ StructStillBuilder)
/* harmony export */ });
/* harmony import */ var _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../view_models/components/StructStillRenderer */ "./js/view_models/components/StructStillRenderer.js");
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/StructConstants */ "./js/constants/StructConstants.js");
/* harmony import */ var _models_StructType__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../models/StructType */ "./js/models/StructType.js");
/* harmony import */ var _StructTypeArtSetBuilder__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./StructTypeArtSetBuilder */ "./js/builders/StructTypeArtSetBuilder.js");





class StructStillBuilder {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
    this.structTypeArtSetBuilder = new _StructTypeArtSetBuilder__WEBPACK_IMPORTED_MODULE_3__.StructTypeArtSetBuilder();
  }
  
  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildBattleship(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      '',
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildCommandShip(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildCruiser(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WATER_RIPPLE]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildDestroyer(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WATER_RIPPLE]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildOreExtractor(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_EQUIPMENT.PLANETARY_MINING],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildFrigate(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      '',
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildFieldGenerator(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_EQUIPMENT.POWER_GENERATION],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildHighAltitudeInterceptor(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      '',
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildJammingSatellite(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_EQUIPMENT.PLANETARY_DEFENSES],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildMobileArtillery(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildOrbitalShieldGenerator(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_EQUIPMENT.ORE_RESERVE_DEFENSES],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildOreBunker(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_EQUIPMENT.ORE_RESERVE_DEFENSES],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildPlanetaryDefenseCannon(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_EQUIPMENT.PLANETARY_DEFENSES],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildPursuitFighter(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      '',
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildOreRefinery(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_EQUIPMENT.PLANETARY_REFINERY],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildSAMLauncher(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildStarfighter(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildStealthBomber(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      '',
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildSubmersible(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    const renderer = new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WATER_RIPPLE]
    );
    renderer.structVariantHidden = art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_HIDDEN];

    return renderer;
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildTank(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new _view_models_components_StructStillRenderer__WEBPACK_IMPORTED_MODULE_0__.StructStillRenderer(
      this.gameState,
      structType,
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }
  
  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  build(structType) {
    const structTypeClean = structType.type.replace(/[^a-zA-Z0-9]/g, '');

    if (!this[`build${structTypeClean}`]) {
      throw new Error(`No struct still for struct type ${structType.type}`);
    }

    return this[`build${structTypeClean}`](structType);
  }
}


/***/ },

/***/ "./js/builders/StructTypeArtSetBuilder.js"
/*!************************************************!*\
  !*** ./js/builders/StructTypeArtSetBuilder.js ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StructTypeArtSetBuilder: () => (/* binding */ StructTypeArtSetBuilder)
/* harmony export */ });
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/StructConstants */ "./js/constants/StructConstants.js");
/* harmony import */ var _models_StructType__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../models/StructType */ "./js/models/StructType.js");
/* harmony import */ var _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../models/StructTypeArtSet */ "./js/models/StructTypeArtSet.js");




class StructTypeArtSetBuilder {

  constructor() {
    this.structImageDir = '/img/structs';
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}
   */
  buildBattleship(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/battleship/battleship-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/battleship/battleship-struct-dmg.png';
    
    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildCommandShip(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/cmd-ship/cmd-ship-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/cmd-ship/cmd-ship-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/cmd-ship/cmd-ship-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildCruiser(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/cruiser/cruiser-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/cruiser/cruiser-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/cruiser/cruiser-top-weapon-ballistic.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON] = this.structImageDir + '/cruiser/cruiser-top-weapon-smart.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WATER_RIPPLE] = this.structImageDir + '/cruiser/cruiser-bottom-ripples.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildDestroyer(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/destroyer/destroyer-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/destroyer/destroyer-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/destroyer/destroyer-top-weapon.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WATER_RIPPLE] = this.structImageDir + '/destroyer/destroyer-bottom-ripples.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildOreExtractor(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/extractor/extractor-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/extractor/extractor-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.PLANETARY_MINING] = this.structImageDir + '/extractor/extractor-top-drill.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildFrigate(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/frigate/frigate-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/frigate/frigate-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/frigate/frigate-bottom-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildFieldGenerator(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/generator/generator-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/generator/generator-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.POWER_GENERATION] = this.structImageDir + '/generator/generator-top-tube.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildHighAltitudeInterceptor(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/interceptor/interceptor-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/interceptor/interceptor-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/interceptor/interceptor-bottom-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildJammingSatellite(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/jamming-sat/jamming-sat-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/jamming-sat/jamming-sat-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.PLANETARY_DEFENSES] = this.structImageDir + '/jamming-sat/jamming-sat-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildMobileArtillery(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/mobile-artillery/mobile-artillery-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/mobile-artillery/mobile-artillery-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/mobile-artillery/mobile-artillery-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildOrbitalShieldGenerator(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);
    
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/orb-shield/orb-shield-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/orb-shield/orb-shield-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.ORE_RESERVE_DEFENSES] = this.structImageDir + '/orb-shield/orb-shield-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildOreBunker(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/ore-bunker/ore-bunker-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/ore-bunker/ore-bunker-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.ORE_RESERVE_DEFENSES] = this.structImageDir + '/ore-bunker/ore-bunker-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildPlanetaryDefenseCannon(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/pdc/pdc-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/pdc/pdc-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.PLANETARY_DEFENSES] = this.structImageDir + '/pdc/pdc-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildPursuitFighter(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/pursuit-fighter/pursuit-fighter-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/pursuit-fighter/pursuit-fighter-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/pursuit-fighter/pursuit-fighter-bottom-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildOreRefinery(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/refinery/refinery-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/refinery/refinery-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.PLANETARY_REFINERY] = this.structImageDir + '/refinery/refinery-top-bays.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildStarfighter(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/starfighter/starfighter-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/starfighter/starfighter-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/starfighter/starfighter-bottom-weapon-smart.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON] = this.structImageDir + '/starfighter/starfighter-top-weapon-ballistic.png'

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildSAMLauncher(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/sam-launcher/sam-launcher-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/sam-launcher/sam-launcher-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/sam-launcher/sam-launcher-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildStealthBomber(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/stealth-bomber/stealth-bomber-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/stealth-bomber/stealth-bomber-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/stealth-bomber/stealth-bomber-bottom-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildSubmersible(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/submersible/submersible-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/submersible/submersible-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_HIDDEN] = this.structImageDir + '/submersible/submersible-struct-hidden.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/submersible/submersible-top-weapon.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WATER_RIPPLE] = this.structImageDir + '/submersible/submersible-bottom-ripples.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildTank(structType) {
    const art = new _models_StructTypeArtSet__WEBPACK_IMPORTED_MODULE_2__.StructTypeArtSet(structType);

    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/tank/tank-struct-base.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/tank/tank-struct-dmg.png';
    art[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/tank/tank-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  build(structType) {
    const structTypeClean = structType.type.replace(/[^a-zA-Z0-9]/g, '');

    if (!this[`build${structTypeClean}`]) {
      throw new Error(`No struct art set for struct type ${structType.type}`);
    }

    return this[`build${structTypeClean}`](structType);
  }
}


/***/ },

/***/ "./js/constants/Ambits.js"
/*!********************************!*\
  !*** ./js/constants/Ambits.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AMBITS: () => (/* binding */ AMBITS),
/* harmony export */   AMBIT_ENUM: () => (/* binding */ AMBIT_ENUM),
/* harmony export */   AMBIT_ORDER: () => (/* binding */ AMBIT_ORDER)
/* harmony export */ });
const
  AMBITS = {
    LAND: 'LAND',
    AIR: 'AIR',
    SPACE: 'SPACE',
    WATER: 'WATER',
  },

  AMBIT_ORDER = [
    AMBITS.SPACE,
    AMBITS.AIR,
    AMBITS.LAND,
    AMBITS.WATER
  ],

  AMBIT_ENUM = {
    'NONE': 0,
    'WATER': 1,
    'LAND': 2,
    'AIR': 3,
    'SPACE': 4,
    'LOCAL': 5
  }
;

/***/ },

/***/ "./js/constants/AnimationConstants.js"
/*!********************************************!*\
  !*** ./js/constants/AnimationConstants.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ANIMATION: () => (/* binding */ ANIMATION)
/* harmony export */ });
const
  ANIMATION = {
    NAMES: {
      ACTIVE_LOOP: 'ACTIVE_LOOP',
      ATTACK: {
        PRIMARY_WEAPON: 'ATTACK_PRIMARY_WEAPON',
        SECONDARY_WEAPON: 'ATTACK_SECONDARY_WEAPON',
      },
      DEPLOYMENT: {
        SPACE: 'DEPLOYMENT_SPACE',
        AIR: 'DEPLOYMENT_AIR',
        LAND: 'DEPLOYMENT_LAND',
        WATER: 'DEPLOYMENT_WATER',
      },
      DESTROY: {
        SPACE: 'DESTROY_SPACE',
        AIR: 'DESTROY_AIR',
        LAND: 'DESTROY_LAND',
        WATER: 'DESTROY_WATER',
      },
      FIRST: 'FIRST',
      LAST: 'LAST',
      MOVE: {
        ARRIVE: 'MOVE_ARRIVE',
        DEPART: 'MOVE_DEPART',
      },
      STEALTH: {
        ACTIVATE: 'STEALTH_ACTIVATE',
        DEACTIVATE: 'STEALTH_DEACTIVATE',
      },
      IMPACT: {
        ANGLED: {
          DOWN: {
            CANNON: 'IMPACT_ANGLED_DOWN_CANNON',
            MISSILE: 'IMPACT_ANGLED_DOWN_MISSILE',
            TORPEDO: 'IMPACT_ANGLED_DOWN_TORPEDO'
          },
          UP: {
            CANNON: 'IMPACT_ANGLED_UP_CANNON',
            GATLING: 'IMPACT_ANGLED_UP_GATLING',
            MISSILE: 'IMPACT_ANGLED_UP_MISSILE',
            TORPEDO: 'IMPACT_ANGLED_UP_TORPEDO'
          },
        },
        HORIZONTAL: {
          CANNON: 'IMPACT_HORIZONTAL_CANNON',
          GATLING: 'IMPACT_HORIZONTAL_GATLING',
          MISSILE: 'IMPACT_HORIZONTAL_MISSILE',
          TORPEDO: 'IMPACT_HORIZONTAL_TORPEDO',
        }
      },
      EVADE: 'EVADE',
      SHAKE: {
        ANGLED: {
          DOWN: {
            DEFAULT: {
              FIRST: 'SHAKE_ANGLED_DOWN_DEFAULT_FIRST',
              LAST: 'SHAKE_ANGLED_DOWN_DEFAULT_LAST',
            }
          },
          UP: {
            DEFAULT: {
              FIRST: 'SHAKE_ANGLED_UP_DEFAULT_FIRST',
              LAST: 'SHAKE_ANGLED_UP_DEFAULT_LAST',
            },
            GATLING: {
              FIRST: 'SHAKE_ANGLED_UP_GATLING_FIRST',
              LAST: 'SHAKE_ANGLED_UP_GATLING_LAST',
            }
          },
        },
        HORIZONTAL: {
          DEFAULT: {
            FIRST: 'SHAKE_HORIZONTAL_DEFAULT_FIRST',
            LAST: 'SHAKE_HORIZONTAL_DEFAULT_LAST',
          },
          GATLING: {
            FIRST: 'SHAKE_HORIZONTAL_GATLING_FIRST',
            LAST: 'SHAKE_HORIZONTAL_GATLING_LAST',
          }
        },
        ATTACK: {
          PRIMARY_WEAPON: 'ATTACK_PRIMARY_WEAPON',
          SECONDARY_WEAPON: 'ATTACK_SECONDARY_WEAPON',
        }
      }
    },
    PROJECTILES: {
      CANNON: 'CANNON',
      GATLING: 'GATLING',
      MISSILE: 'MISSILE',
      TORPEDO: 'TORPEDO',
    }
  }
;


/***/ },

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
  FLEET_CHANGED: 'FLEET_CHANGED',
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

/***/ "./js/constants/HUDConstants.js"
/*!**************************************!*\
  !*** ./js/constants/HUDConstants.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HUD_IDS: () => (/* binding */ HUD_IDS)
/* harmony export */ });
const
  HUD_IDS = {
    ACTION_BAR_PLAYER: 'action-bar-player',
    ACTION_BAR_ALPHA_BASE_ENEMY: 'action-bar-alpha-base-enemy',
    ACTION_BAR_RAID_ENEMY: 'action-bar-raid-enemy',
    STATUS_BAR_TOP_LEFT: 'status-bar-top-left',
    STATUS_BAR_TOP_RIGHT_ALPHA_BASE: 'status-bar-top-right-alpha-base',
    STATUS_BAR_TOP_RIGHT_RAID: 'status-bar-top-right-raid'
  }
;

/***/ },

/***/ "./js/constants/MapConstants.js"
/*!**************************************!*\
  !*** ./js/constants/MapConstants.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MAP_COL_ATTACKER_COMMAND: () => (/* binding */ MAP_COL_ATTACKER_COMMAND),
/* harmony export */   MAP_COL_ATTACKER_FLEET: () => (/* binding */ MAP_COL_ATTACKER_FLEET),
/* harmony export */   MAP_COL_COUNT_PROPS: () => (/* binding */ MAP_COL_COUNT_PROPS),
/* harmony export */   MAP_COL_DEFENDER_COMMAND: () => (/* binding */ MAP_COL_DEFENDER_COMMAND),
/* harmony export */   MAP_COL_DEFENDER_FLEET: () => (/* binding */ MAP_COL_DEFENDER_FLEET),
/* harmony export */   MAP_COL_DEFENDER_PLANETARY: () => (/* binding */ MAP_COL_DEFENDER_PLANETARY),
/* harmony export */   MAP_COL_DIVIDER: () => (/* binding */ MAP_COL_DIVIDER),
/* harmony export */   MAP_COL_ORDER: () => (/* binding */ MAP_COL_ORDER),
/* harmony export */   MAP_CONTAINER_IDS: () => (/* binding */ MAP_CONTAINER_IDS),
/* harmony export */   MAP_DEFAULT_COMMAND_COL_COUNT: () => (/* binding */ MAP_DEFAULT_COMMAND_COL_COUNT),
/* harmony export */   MAP_DEFAULT_DIVIDER_COL_COUNT: () => (/* binding */ MAP_DEFAULT_DIVIDER_COL_COUNT),
/* harmony export */   MAP_DEFAULT_FLEET_COL_COUNT: () => (/* binding */ MAP_DEFAULT_FLEET_COL_COUNT),
/* harmony export */   MAP_DEFAULT_PLANETARY_COL_COUNT: () => (/* binding */ MAP_DEFAULT_PLANETARY_COL_COUNT),
/* harmony export */   MAP_NAMED_TRANSITIONS: () => (/* binding */ MAP_NAMED_TRANSITIONS),
/* harmony export */   MAP_ORNAMENTS: () => (/* binding */ MAP_ORNAMENTS),
/* harmony export */   MAP_TILE_ROWS_PER_AMBIT: () => (/* binding */ MAP_TILE_ROWS_PER_AMBIT),
/* harmony export */   MAP_TILE_SIZE: () => (/* binding */ MAP_TILE_SIZE),
/* harmony export */   MAP_TILE_TYPES: () => (/* binding */ MAP_TILE_TYPES),
/* harmony export */   MAP_TILE_TYPE_ICONS: () => (/* binding */ MAP_TILE_TYPE_ICONS),
/* harmony export */   MAP_TRANSITION_HEIGHT: () => (/* binding */ MAP_TRANSITION_HEIGHT),
/* harmony export */   MAP_TRANSITION_TILE_LABELS: () => (/* binding */ MAP_TRANSITION_TILE_LABELS),
/* harmony export */   MAP_TYPES: () => (/* binding */ MAP_TYPES)
/* harmony export */ });
const
  MAP_COL_DEFENDER_COMMAND = 'DEFENDER_COMMAND',
  MAP_COL_DEFENDER_PLANETARY = 'DEFENDER_PLANETARY',
  MAP_COL_DEFENDER_FLEET = 'DEFENDER_FLEET',
  MAP_COL_DIVIDER = 'DIVIDER',
  MAP_COL_ATTACKER_FLEET = 'ATTACKER_FLEET',
  MAP_COL_ATTACKER_COMMAND = 'ATTACKER_COMMAND',

  MAP_DEFAULT_COMMAND_COL_COUNT = 1,
  MAP_DEFAULT_PLANETARY_COL_COUNT = 2,
  MAP_DEFAULT_FLEET_COL_COUNT = 2,
  MAP_DEFAULT_DIVIDER_COL_COUNT = 1,

  MAP_TILE_ROWS_PER_AMBIT = 2,

  MAP_COL_ORDER = [
    MAP_COL_DEFENDER_COMMAND,
    MAP_COL_DEFENDER_PLANETARY,
    MAP_COL_DEFENDER_FLEET,
    MAP_COL_DIVIDER,
    MAP_COL_ATTACKER_FLEET,
    MAP_COL_ATTACKER_COMMAND
  ],

  MAP_COL_COUNT_PROPS = {
    DEFENDER_COMMAND: 'defenderCommandColCount',
    DEFENDER_PLANETARY: 'defenderPlanetaryColCount',
    DEFENDER_FLEET: 'defenderFleetColCount',
    DIVIDER: 'dividerColCount',
    ATTACKER_FLEET: 'attackerFleetColCount',
    ATTACKER_COMMAND: 'attackerCommandColCount'
  },

  MAP_TILE_SIZE = 128,

  MAP_TRANSITION_HEIGHT = 128,

  MAP_NAMED_TRANSITIONS = {
    HORIZON: 'HORIZON'
  },

  MAP_TRANSITION_TILE_LABELS = {
    ATMOSPHERE: 'ATMOSPHERE',
    HORIZON: 'HORIZON',
    SHORE: 'SHORE'
  },

  MAP_TILE_TYPES = {
    FOG_OF_WAR: 'FOG_OF_WAR',
    TRANSITION: 'TRANSITION',
    COMMAND: 'COMMAND',
    COMMAND_BLOCKED: 'COMMAND_BLOCKED',
    PLANETARY_SLOT: 'PLANETARY_SLOT',
    PLANETARY_BLOCKED: 'PLANETARY_BLOCKED',
    FLEET: 'FLEET',
    DIVIDER: 'DIVIDER',
  },

  MAP_TILE_TYPE_ICONS = {
    FOG_OF_WAR: 'icon-unknown-territory',
    TRANSITION: 'icon-blocked',
    COMMAND: 'icon-cmd-post',
    COMMAND_BLOCKED: 'icon-blocked',
    PLANETARY_SLOT: 'icon-beacon',
    PLANETARY_BLOCKED: 'icon-blocked',
    FLEET: 'icon-fleet-tile',
    DIVIDER: 'icon-blocked',
    ENEMY_TERRITORY: 'icon-enemy-tile',
  },

  MAP_ORNAMENTS = {
    SPACE_MONSTER: 'SPACE_MONSTER'
  },

  MAP_CONTAINER_IDS = {
    ALPHA_BASE: 'alpha-base-map-container',
    RAID: 'raid-map-container',
    PREVIEW: 'preview-map-container'
  },

  MAP_TYPES = {
    ALPHA_BASE: 'alphaBaseMap',
    RAID: 'raidMap'
  }
;

/***/ },

/***/ "./js/constants/MenuPageRouterModes.js"
/*!*********************************************!*\
  !*** ./js/constants/MenuPageRouterModes.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MENU_PAGE_ROUTER_MODES: () => (/* binding */ MENU_PAGE_ROUTER_MODES)
/* harmony export */ });
const MENU_PAGE_ROUTER_MODES = {
  DEFAULT: 'DEFAULT',
  PREVIEW: 'PREVIEW'
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

/***/ "./js/constants/PfpConstants.js"
/*!**************************************!*\
  !*** ./js/constants/PfpConstants.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PFP_PART_COUNTS: () => (/* binding */ PFP_PART_COUNTS)
/* harmony export */ });
const
  PFP_PART_COUNTS = {
    head: 87,
    neck: 10,
    body: 57,
    arms: 34,
    background: 6,
  }
;


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

/***/ "./js/constants/SettingConstants.js"
/*!******************************************!*\
  !*** ./js/constants/SettingConstants.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SETTING: () => (/* binding */ SETTING)
/* harmony export */ });
const
  SETTING = {
    PLANETARY_SHIELD_BASE: 'PLANETARY_SHIELD_BASE',
    PLANET_STARTING_ORE: 'PLANET_STARTING_ORE',
    PLANET_STARTING_SLOTS: 'PLANET_STARTING_SLOTS',
    PLAYER_PASSIVE_DRAW: 'PLAYER_PASSIVE_DRAW',
    PLAYER_RESUME_CHARGE: 'PLAYER_RESUME_CHARGE',
    REACTOR_RATIO: 'REACTOR_RATIO',
    STRUCT_SWEEP_DELAY: 'STRUCT_SWEEP_DELAY'
  }
;


/***/ },

/***/ "./js/constants/StructConstants.js"
/*!*****************************************!*\
  !*** ./js/constants/StructConstants.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   STRUCT_ACTIONS: () => (/* binding */ STRUCT_ACTIONS),
/* harmony export */   STRUCT_CATEGORIES: () => (/* binding */ STRUCT_CATEGORIES),
/* harmony export */   STRUCT_DESCRIPTIONS: () => (/* binding */ STRUCT_DESCRIPTIONS),
/* harmony export */   STRUCT_EQUIPMENT: () => (/* binding */ STRUCT_EQUIPMENT),
/* harmony export */   STRUCT_EQUIPMENT_ICON_MAP: () => (/* binding */ STRUCT_EQUIPMENT_ICON_MAP),
/* harmony export */   STRUCT_ORE_RESERVE_DEFENSES: () => (/* binding */ STRUCT_ORE_RESERVE_DEFENSES),
/* harmony export */   STRUCT_PASSIVE_WEAPONRY: () => (/* binding */ STRUCT_PASSIVE_WEAPONRY),
/* harmony export */   STRUCT_PLANETARY_DEFENSES: () => (/* binding */ STRUCT_PLANETARY_DEFENSES),
/* harmony export */   STRUCT_PLANETARY_MINING: () => (/* binding */ STRUCT_PLANETARY_MINING),
/* harmony export */   STRUCT_PLANETARY_REFINERY: () => (/* binding */ STRUCT_PLANETARY_REFINERY),
/* harmony export */   STRUCT_POWER_GENERATION: () => (/* binding */ STRUCT_POWER_GENERATION),
/* harmony export */   STRUCT_PRIMARY_WEAPON: () => (/* binding */ STRUCT_PRIMARY_WEAPON),
/* harmony export */   STRUCT_SECONDARY_WEAPON: () => (/* binding */ STRUCT_SECONDARY_WEAPON),
/* harmony export */   STRUCT_STATUS_FLAGS: () => (/* binding */ STRUCT_STATUS_FLAGS),
/* harmony export */   STRUCT_STILL_LAYERS: () => (/* binding */ STRUCT_STILL_LAYERS),
/* harmony export */   STRUCT_TYPES: () => (/* binding */ STRUCT_TYPES),
/* harmony export */   STRUCT_UNIT_DEFENSES: () => (/* binding */ STRUCT_UNIT_DEFENSES),
/* harmony export */   STRUCT_WATER_RIPPLE: () => (/* binding */ STRUCT_WATER_RIPPLE),
/* harmony export */   STRUCT_WEAPON_CONTROL: () => (/* binding */ STRUCT_WEAPON_CONTROL),
/* harmony export */   STRUCT_WEAPON_CONTROL_LABELS: () => (/* binding */ STRUCT_WEAPON_CONTROL_LABELS),
/* harmony export */   STRUCT_WEAPON_SYSTEM: () => (/* binding */ STRUCT_WEAPON_SYSTEM)
/* harmony export */ });
const
  STRUCT_TYPES = {
    BATTLESHIP: 'Battleship',
    COMMAND_SHIP: 'Command Ship',
    CONTINENTAL_POWER_PLANT: 'Continental Power Plant',
    CRUISER: 'Cruiser',
    DESTROYER: 'Destroyer',
    FIELD_GENERATOR: 'Field Generator',
    FRIGATE: 'Frigate',
    HIGH_ALTITUDE_INTERCEPTOR: 'High Altitude Interceptor',
    JAMMING_SATELLITE: 'Jamming Satellite',
    MOBILE_ARTILLERY: 'Mobile Artillery',
    ORBITAL_SHIELD_GENERATOR: 'Orbital Shield Generator',
    ORE_BUNKER: 'Ore Bunker',
    ORE_EXTRACTOR: 'Ore Extractor',
    ORE_REFINERY: 'Ore Refinery',
    PLANETARY_DEFENSE_CANNON: 'Planetary Defense Cannon',
    PURSUIT_FIGHTER: 'Pursuit Fighter',
    SAM_LAUNCHER: 'SAM Launcher',
    STARFIGHTER: 'Starfighter',
    STEALTH_BOMBER: 'Stealth Bomber',
    SUBMERSIBLE: 'Submersible',
    TANK: 'Tank',
    WORLD_ENGINE: 'World Engine',
  },
  STRUCT_CATEGORIES = {
    FLEET: 'fleet',
    PLANET: 'planet'
  },
  STRUCT_PRIMARY_WEAPON = {
    UNGUIDED_WEAPONRY: 'unguidedWeaponry',
    GUIDED_WEAPONRY: 'guidedWeaponry',
    NO_ACTIVE_WEAPONRY: 'noActiveWeaponry'
  },
  STRUCT_SECONDARY_WEAPON = {
    UNGUIDED_WEAPONRY: 'unguidedWeaponry',
    ATTACK_RUN: 'attackRun',
    NO_ACTIVE_WEAPONRY: 'noActiveWeaponry'
  },
  STRUCT_PASSIVE_WEAPONRY = {
    COUNTER_ATTACK: 'counterAttack',
    STRONG_COUNTER_ATTACK: 'strongCounterAttack',
    ADVANCED_COUNTER_ATTACK: 'advancedCounterAttack',
    NO_PASSIVE_WEAPONRY: 'noPassiveWeaponry'
  },
  STRUCT_UNIT_DEFENSES = {
    ARMOUR: 'armour',
    DEFENSIVE_MANEUVER: 'defensiveManeuver',
    INDIRECT_COMBAT_MODULE: 'indirectCombatModule',
    SIGNAL_JAMMING: 'signalJamming',
    STEALTH_MODE: 'stealthMode',
    NO_UNIT_DEFENSES: 'noUnitDefenses'
  },
  STRUCT_ORE_RESERVE_DEFENSES = {
    COORDINATED_RESERVE_RESPONSE_TRACKER: 'coordinatedReserveResponseTracker',
    MONITORING_STATION: 'monitoringStation',
    ORE_BUNKER: 'oreBunker',
    NO_ORE_RESERVE_DEFENSES: 'noOreReserveDefenses'
  },
  STRUCT_PLANETARY_DEFENSES = {
    DEFENSIVE_CANNON: 'defensiveCannon',
    LOW_ORBIT_BALLISTIC_INTERCEPTOR_NETWORK: 'lowOrbitBallisticInterceptorNetwork',
    NO_PLANETARY_DEFENSE: 'noPlanetaryDefense'
  },
  STRUCT_PLANETARY_MINING = {
    ORE_MINING_RIG: 'oreMiningRig',
    NO_PLANETARY_MINING: 'noPlanetaryMining'
  },
  STRUCT_PLANETARY_REFINERY = {
    ORE_REFINERY: 'oreRefinery',
    NO_PLANETARY_REFINERY: 'noPlanetaryRefinery'
  },
  STRUCT_POWER_GENERATION = {
    SMALL_GENERATOR: 'smallGenerator',
    MEDIUM_GENERATOR: 'mediumGenerator',
    LARGE_GENERATOR: 'largeGenerator',
    NO_POWER_GENERATION: 'noPowerGeneration'
  },
  STRUCT_EQUIPMENT_ICON_MAP = {
    [STRUCT_SECONDARY_WEAPON.ATTACK_RUN]: 'icon-ballistic-weapon',
    [STRUCT_PRIMARY_WEAPON.GUIDED_WEAPONRY]: 'icon-smart-weapon',
    [STRUCT_PRIMARY_WEAPON.UNGUIDED_WEAPONRY]: 'icon-ballistic-weapon',

    [STRUCT_PASSIVE_WEAPONRY.ADVANCED_COUNTER_ATTACK]: 'icon-adv-counter',
    [STRUCT_PASSIVE_WEAPONRY.COUNTER_ATTACK]: 'icon-counter',
    [STRUCT_PASSIVE_WEAPONRY.STRONG_COUNTER_ATTACK]: 'icon-adv-counter',

    [STRUCT_UNIT_DEFENSES.ARMOUR]: 'icon-armour',
    [STRUCT_UNIT_DEFENSES.DEFENSIVE_MANEUVER]: 'icon-kinetic-barrier',
    [STRUCT_UNIT_DEFENSES.INDIRECT_COMBAT_MODULE]: 'icon-indirect',
    [STRUCT_UNIT_DEFENSES.SIGNAL_JAMMING]: 'icon-signal-jam',
    [STRUCT_UNIT_DEFENSES.STEALTH_MODE]: 'icon-stealth',

    [STRUCT_ORE_RESERVE_DEFENSES.COORDINATED_RESERVE_RESPONSE_TRACKER]: 'icon-planetary-shield',
    [STRUCT_PLANETARY_DEFENSES.DEFENSIVE_CANNON]: 'icon-counter',
    [STRUCT_PLANETARY_DEFENSES.LOW_ORBIT_BALLISTIC_INTERCEPTOR_NETWORK]: 'icon-signal-jam',
    [STRUCT_ORE_RESERVE_DEFENSES.MONITORING_STATION]: 'icon-planetary-shield',
    [STRUCT_ORE_RESERVE_DEFENSES.ORE_BUNKER]: 'icon-planetary-shield',
    [STRUCT_POWER_GENERATION.SMALL_GENERATOR]: 'icon-refine'
  },
  STRUCT_DESCRIPTIONS = {
    [STRUCT_TYPES.BATTLESHIP]: "",
    [STRUCT_TYPES.COMMAND_SHIP]: "",
    [STRUCT_TYPES.CONTINENTAL_POWER_PLANT]: "Consumes Alpha Matter to generate Energy.",
    [STRUCT_TYPES.CRUISER]: "",
    [STRUCT_TYPES.DESTROYER]: "",
    [STRUCT_TYPES.FIELD_GENERATOR]: "Consumes Alpha Matter to generate Energy.",
    [STRUCT_TYPES.FRIGATE]: "",
    [STRUCT_TYPES.HIGH_ALTITUDE_INTERCEPTOR]: "",
    [STRUCT_TYPES.JAMMING_SATELLITE]: "Applies Signal Jamming to all enemy Smart Attacks.",
    [STRUCT_TYPES.MOBILE_ARTILLERY]: "",
    [STRUCT_TYPES.ORBITAL_SHIELD_GENERATOR]: "Improves Planetary Defense.",
    [STRUCT_TYPES.ORE_BUNKER]: "Massively improves Planetary Defense by storing Ore underground.",
    [STRUCT_TYPES.ORE_EXTRACTOR]: "Extracts Alpha Ore from the planet.",
    [STRUCT_TYPES.ORE_REFINERY]: "Refines Ore into usable Alpha Matter.",
    [STRUCT_TYPES.PLANETARY_DEFENSE_CANNON]: "Launches Counter-Attacks against attacking Structs.",
    [STRUCT_TYPES.PURSUIT_FIGHTER]: "",
    [STRUCT_TYPES.SAM_LAUNCHER]: "",
    [STRUCT_TYPES.STARFIGHTER]: "",
    [STRUCT_TYPES.STEALTH_BOMBER]: "",
    [STRUCT_TYPES.SUBMERSIBLE]: "",
    [STRUCT_TYPES.TANK]: "",
    [STRUCT_TYPES.WORLD_ENGINE]: "Consumes Alpha Matter to generate Energy."
  },
  STRUCT_WEAPON_SYSTEM = {
    PRIMARY_WEAPON: 'primaryWeapon',
    SECONDARY_WEAPON: 'secondaryWeapon'
  },
  STRUCT_WEAPON_CONTROL = {
    GUIDED: 'guided',
    UNGUIDED: 'unguided'
  },
  STRUCT_WEAPON_CONTROL_LABELS = {
    [STRUCT_WEAPON_CONTROL.GUIDED]: 'Smart Weapon',
    [STRUCT_WEAPON_CONTROL.UNGUIDED]: 'Ballistic Weapon'
  },
  STRUCT_STATUS_FLAGS = {
    MATERIALIZED: 1,
    BUILT: 2,
    ONLINE: 4,
    STORED: 8,
    HIDDEN: 16,
    DESTROYED: 32,
    LOCKED: 64
  },
  STRUCT_ACTIONS = {
    ACTIVATE: 'ACTIVATE',
    DEACTIVATE: 'DEACTIVATE',
    ATTACK_PRIMARY_WEAPON: 'ATTACK_PRIMARY_WEAPON',
    ATTACK_SECONDARY_WEAPON: 'ATTACK_SECONDARY_WEAPON',
    DEFENSE_SET: 'DEFENSE_SET',
    DEFENSE_CLEAR: 'DEFENSE_CLEAR',
    MOVE: 'MOVE',
    STEALTH_ACTIVATE: 'STEALTH_ACTIVATE',
    STEALTH_DEACTIVATE: 'STEALTH_DEACTIVATE',
    CONSUME_ALPHA: 'CONSUME_ALPHA',
    BUILD_CANCEL: 'BUILD_CANCEL',
  },
  STRUCT_WATER_RIPPLE = 'waterRipple',
  STRUCT_EQUIPMENT = {
    PASSIVE_WEAPONRY: 'passiveWeaponry',
    UNIT_DEFENSES: 'unitDefenses',
    ORE_RESERVE_DEFENSES: 'oreReserveDefenses',
    PLANETARY_DEFENSES: 'planetaryDefenses',
    PLANETARY_MINING: 'planetaryMining',
    PLANETARY_REFINERY: 'planetaryRefinery',
    POWER_GENERATION: 'powerGeneration',
  },
  STRUCT_STILL_LAYERS = {
    STRUCT_VARIANT_BASE: 'structVariantBase',
    STRUCT_VARIANT_DMG: 'structVariantDmg',
    STRUCT_VARIANT_HIDDEN: 'structVariantHidden',
  }
;


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

/***/ "./js/dtos/MapStructTileRenderParamsDTO.js"
/*!*************************************************!*\
  !*** ./js/dtos/MapStructTileRenderParamsDTO.js ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MapStructTileRenderParamsDTO: () => (/* binding */ MapStructTileRenderParamsDTO)
/* harmony export */ });
class MapStructTileRenderParamsDTO {
  constructor() {
    this.tileElement = null;
    this.struct = null;
  }
}

/***/ },

/***/ "./js/dtos/NavItemDTO.js"
/*!*******************************!*\
  !*** ./js/dtos/NavItemDTO.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NavItemDTO: () => (/* binding */ NavItemDTO)
/* harmony export */ });
class NavItemDTO {
  constructor(id, label, actionHandler = () => {}) {
    this.id = id;
    this.label = label;
    this.actionHandler = actionHandler;
  }
}

/***/ },

/***/ "./js/dtos/PlanetaryShieldInfoDTO.js"
/*!*******************************************!*\
  !*** ./js/dtos/PlanetaryShieldInfoDTO.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlanetaryShieldInfoDTO: () => (/* binding */ PlanetaryShieldInfoDTO)
/* harmony export */ });
class PlanetaryShieldInfoDTO {
  constructor() {
    this.planet_id = null;
    this.planetary_shield = null;
    this.block_start_raid = null;
  }
}

/***/ },

/***/ "./js/errors/AnimationError.js"
/*!*************************************!*\
  !*** ./js/errors/AnimationError.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnimationError: () => (/* binding */ AnimationError)
/* harmony export */ });
class AnimationError extends Error {
  constructor(message, detail = {}) {
    super(message);
    this.detail = detail;
  }
}

/***/ },

/***/ "./js/events/AlphaCountChangedEvent.js"
/*!*********************************************!*\
  !*** ./js/events/AlphaCountChangedEvent.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AlphaCountChangedEvent: () => (/* binding */ AlphaCountChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class AlphaCountChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.ALPHA_COUNT_CHANGED);
    this.playerType = playerType;
  }
}


/***/ },

/***/ "./js/events/AnimationEvent.js"
/*!*************************************!*\
  !*** ./js/events/AnimationEvent.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnimationEvent: () => (/* binding */ AnimationEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class AnimationEvent extends CustomEvent {

  /**
   * @param {string} structId the subject of the animation
   * @param {string[]} animationNames the names of the animations to play simultaneously
   * @param {boolean} showStructStillDuringAnimation whether or not to show the still struct image while the animation plays
   * @param {boolean} showStructStillAfterAnimation whether or not the still struct image should still be shown after the animations ends
   * @param {object} options optional parameters such which projectile to use in the animation
   * @param {string|null} mapId the id of the map the animation should play on; used by
   * map layer listeners to ignore events not intended for them
   */
  constructor(
    structId,
    animationNames,
    showStructStillDuringAnimation = false,
    showStructStillAfterAnimation = true,
    options = {},
    mapId = null
  ) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.ANIMATION);

    this.structId = structId;
    this.animationNames = animationNames;
    this.showStructStillDuringAnimation = showStructStillDuringAnimation;
    this.showStructStillAfterAnimation = showStructStillAfterAnimation;
    this.options = options;
    this.mapId = mapId;

    /** @type {function(): (void|Promise<void>)} */
    this.onAnimationEnd = null;
  }

}


/***/ },

/***/ "./js/events/ChargeLevelChangedEvent.js"
/*!**********************************************!*\
  !*** ./js/events/ChargeLevelChangedEvent.js ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChargeLevelChangedEvent: () => (/* binding */ ChargeLevelChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class ChargeLevelChangedEvent extends CustomEvent {
  constructor(playerId, chargeLevel) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.CHARGE_LEVEL_CHANGED);
    this.playerId = playerId;
    this.chargeLevel = chargeLevel;
  }
}


/***/ },

/***/ "./js/events/ClearAttackTargetsEvent.js"
/*!**********************************************!*\
  !*** ./js/events/ClearAttackTargetsEvent.js ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClearAttackTargetsEvent: () => (/* binding */ ClearAttackTargetsEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class ClearAttackTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.CLEAR_ATTACK_TARGETS);
    this.mapId = mapId;
  }
}


/***/ },

/***/ "./js/events/ClearDefendTargetsEvent.js"
/*!**********************************************!*\
  !*** ./js/events/ClearDefendTargetsEvent.js ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClearDefendTargetsEvent: () => (/* binding */ ClearDefendTargetsEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class ClearDefendTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.CLEAR_DEFEND_TARGETS);
    this.mapId = mapId;
  }
}


/***/ },

/***/ "./js/events/ClearMoveTargetsEvent.js"
/*!********************************************!*\
  !*** ./js/events/ClearMoveTargetsEvent.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClearMoveTargetsEvent: () => (/* binding */ ClearMoveTargetsEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class ClearMoveTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.CLEAR_MOVE_TARGETS);
    this.mapId = mapId;
  }
}


/***/ },

/***/ "./js/events/ClearStructTileEvent.js"
/*!*******************************************!*\
  !*** ./js/events/ClearStructTileEvent.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClearStructTileEvent: () => (/* binding */ ClearStructTileEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class ClearStructTileEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   */
  constructor(mapId, tileType, ambit, slot, playerId) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.CLEAR_STRUCT_TILE);
    this.mapId = mapId;
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
  }
}



/***/ },

/***/ "./js/events/EnergyUsageChangedEvent.js"
/*!**********************************************!*\
  !*** ./js/events/EnergyUsageChangedEvent.js ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EnergyUsageChangedEvent: () => (/* binding */ EnergyUsageChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class EnergyUsageChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.ENERGY_USAGE_CHANGED);
    this.playerType = playerType;
  }
}


/***/ },

/***/ "./js/events/FleetChangedEvent.js"
/*!****************************************!*\
  !*** ./js/events/FleetChangedEvent.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FleetChangedEvent: () => (/* binding */ FleetChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class FleetChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.FLEET_CHANGED);
    this.playerType = playerType;
  }
}


/***/ },

/***/ "./js/events/OreCountChangedEvent.js"
/*!*******************************************!*\
  !*** ./js/events/OreCountChangedEvent.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OreCountChangedEvent: () => (/* binding */ OreCountChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class OreCountChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.ORE_COUNT_CHANGED);
    this.playerType = playerType;
  }
}


/***/ },

/***/ "./js/events/PendingBuildAddedEvent.js"
/*!*********************************************!*\
  !*** ./js/events/PendingBuildAddedEvent.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PendingBuildAddedEvent: () => (/* binding */ PendingBuildAddedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class PendingBuildAddedEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @param {StructType} structType
   */
  constructor(mapId, tileType, ambit, slot, playerId, structType) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.PENDING_BUILD_ADDED);
    this.mapId = mapId;
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
    this.structType = structType;
  }
}



/***/ },

/***/ "./js/events/PlanetRaidStatusChangedEvent.js"
/*!***************************************************!*\
  !*** ./js/events/PlanetRaidStatusChangedEvent.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlanetRaidStatusChangedEvent: () => (/* binding */ PlanetRaidStatusChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class PlanetRaidStatusChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.PLANET_RAID_STATUS_CHANGED);
    this.playerType = playerType;
  }
}


/***/ },

/***/ "./js/events/RefreshActionBarEvent.js"
/*!********************************************!*\
  !*** ./js/events/RefreshActionBarEvent.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RefreshActionBarEvent: () => (/* binding */ RefreshActionBarEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class RefreshActionBarEvent extends CustomEvent {

  constructor() {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.REFRESH_ACTION_BAR);
  }
}


/***/ },

/***/ "./js/events/RefreshActionBarIfSelectedEvent.js"
/*!******************************************************!*\
  !*** ./js/events/RefreshActionBarIfSelectedEvent.js ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RefreshActionBarIfSelectedEvent: () => (/* binding */ RefreshActionBarIfSelectedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class RefreshActionBarIfSelectedEvent extends CustomEvent {
  /**
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @param {string} structId
   */
  constructor(tileType, ambit, slot, playerId, structId) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.REFRESH_ACTION_BAR_IF_SELECTED);
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
    this.structId = structId;
  }
}



/***/ },

/***/ "./js/events/RenderDeploymentIndicatorEvent.js"
/*!*****************************************************!*\
  !*** ./js/events/RenderDeploymentIndicatorEvent.js ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderDeploymentIndicatorEvent: () => (/* binding */ RenderDeploymentIndicatorEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class RenderDeploymentIndicatorEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   */
  constructor(mapId, tileType, ambit, slot, playerId) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.RENDER_DEPLOYMENT_INDICATOR);
    this.mapId = mapId;
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
  }
}



/***/ },

/***/ "./js/events/RenderPlayerPfpEvent.js"
/*!*******************************************!*\
  !*** ./js/events/RenderPlayerPfpEvent.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderPlayerPfpEvent: () => (/* binding */ RenderPlayerPfpEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class RenderPlayerPfpEvent extends CustomEvent {
  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.RENDER_PLAYER_PFP);
    this.playerType = playerType;
  }
}



/***/ },

/***/ "./js/events/RenderStructEvent.js"
/*!****************************************!*\
  !*** ./js/events/RenderStructEvent.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderStructEvent: () => (/* binding */ RenderStructEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");
/* harmony import */ var _models_Struct__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../models/Struct */ "./js/models/Struct.js");



class RenderStructEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {Struct} struct
   * @param {AnimationEvent} animationToAutoplay
   */
  constructor(mapId, struct, animationToAutoplay = null) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.RENDER_STRUCT);
    this.mapId = mapId;
    this.struct = struct;
    this.animationToAutoplay = animationToAutoplay;
  }
}



/***/ },

/***/ "./js/events/RenderStructHUDEvent.js"
/*!*******************************************!*\
  !*** ./js/events/RenderStructHUDEvent.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderStructHUDEvent: () => (/* binding */ RenderStructHUDEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");
/* harmony import */ var _models_Struct__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../models/Struct */ "./js/models/Struct.js");



class RenderStructHUDEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {Struct} struct
   */
  constructor(mapId, struct) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.RENDER_STRUCT_HUD);
    this.mapId = mapId;
    this.struct = struct;
  }
}


/***/ },

/***/ "./js/events/SaveGameStateEvent.js"
/*!*****************************************!*\
  !*** ./js/events/SaveGameStateEvent.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SaveGameStateEvent: () => (/* binding */ SaveGameStateEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class SaveGameStateEvent extends CustomEvent {
  constructor() {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.SAVE_GAME_STATE);
  }
}


/***/ },

/***/ "./js/events/ShieldHealthChangedEvent.js"
/*!***********************************************!*\
  !*** ./js/events/ShieldHealthChangedEvent.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ShieldHealthChangedEvent: () => (/* binding */ ShieldHealthChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class ShieldHealthChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.SHIELD_HEALTH_CHANGED);
    this.playerType = playerType;
  }
}


/***/ },

/***/ "./js/events/ShowAttackTargetsEvent.js"
/*!*********************************************!*\
  !*** ./js/events/ShowAttackTargetsEvent.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ShowAttackTargetsEvent: () => (/* binding */ ShowAttackTargetsEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class ShowAttackTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {string[]} weaponAmbitsArray - Valid ambits for the weapon (e.g. ["space", "air"])
   */
  constructor(mapId, weaponAmbitsArray) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.SHOW_ATTACK_TARGETS);
    this.mapId = mapId;
    this.weaponAmbitsArray = weaponAmbitsArray;
  }
}


/***/ },

/***/ "./js/events/ShowDefendTargetsEvent.js"
/*!*********************************************!*\
  !*** ./js/events/ShowDefendTargetsEvent.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ShowDefendTargetsEvent: () => (/* binding */ ShowDefendTargetsEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class ShowDefendTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.SHOW_DEFEND_TARGETS);
    this.mapId = mapId;
  }
}


/***/ },

/***/ "./js/events/ShowMoveTargetsEvent.js"
/*!*******************************************!*\
  !*** ./js/events/ShowMoveTargetsEvent.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ShowMoveTargetsEvent: () => (/* binding */ ShowMoveTargetsEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class ShowMoveTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.SHOW_MOVE_TARGETS);
    this.mapId = mapId;
  }
}


/***/ },

/***/ "./js/events/ShowStructStillEvent.js"
/*!*******************************************!*\
  !*** ./js/events/ShowStructStillEvent.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ShowStructStillEvent: () => (/* binding */ ShowStructStillEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class ShowStructStillEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {string} structId
   */
  constructor(mapId, structId) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.SHOW_STRUCT_STILL);
    this.mapId = mapId;
    this.structId = structId;
  }
}


/***/ },

/***/ "./js/events/StructCountChangedEvent.js"
/*!**********************************************!*\
  !*** ./js/events/StructCountChangedEvent.js ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StructCountChangedEvent: () => (/* binding */ StructCountChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class StructCountChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.STRUCT_COUNT_CHANGED);
    this.playerType = playerType;
  }
}


/***/ },

/***/ "./js/events/StructSelectionChangedEvent.js"
/*!**************************************************!*\
  !*** ./js/events/StructSelectionChangedEvent.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StructSelectionChangedEvent: () => (/* binding */ StructSelectionChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class StructSelectionChangedEvent extends CustomEvent {

  /**
   * @param {string|null} structId the ID of the struct on the newly selected tile or null when
   *   the selection was cleared or the selected tile holds no struct
   */
  constructor(structId = null) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.STRUCT_SELECTION_CHANGED);
    this.structId = structId;
  }
}


/***/ },

/***/ "./js/events/TaskCmdKillEvent.js"
/*!***************************************!*\
  !*** ./js/events/TaskCmdKillEvent.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaskCmdKillEvent: () => (/* binding */ TaskCmdKillEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class TaskCmdKillEvent extends CustomEvent {
  /**
   * @param {string} pid
   */
  constructor(pid) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TASK_CMD_KILL);
    this.pid = pid;
  }
}


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

/***/ "./js/events/TrackDestroyedStructEvent.js"
/*!************************************************!*\
  !*** ./js/events/TrackDestroyedStructEvent.js ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TrackDestroyedStructEvent: () => (/* binding */ TrackDestroyedStructEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class TrackDestroyedStructEvent extends CustomEvent {

  /**
   * @param {string} playerType
   * @param {string} structId
   */
  constructor(playerType, structId) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TRACK_DESTROYED_STRUCT);
    this.playerType = playerType;
    this.structId = structId;
  }
}



/***/ },

/***/ "./js/events/TrackDestroyedStructsEvent.js"
/*!*************************************************!*\
  !*** ./js/events/TrackDestroyedStructsEvent.js ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TrackDestroyedStructsEvent: () => (/* binding */ TrackDestroyedStructsEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class TrackDestroyedStructsEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.TRACK_DESTROYED_STRUCTS);
    this.playerType = playerType;
  }
}



/***/ },

/***/ "./js/events/UndiscoveredOreCountChangedEvent.js"
/*!*******************************************************!*\
  !*** ./js/events/UndiscoveredOreCountChangedEvent.js ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UndiscoveredOreCountChangedEvent: () => (/* binding */ UndiscoveredOreCountChangedEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class UndiscoveredOreCountChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.UNDISCOVERED_ORE_COUNT_CHANGED);
    this.playerType = playerType;
  }
}


/***/ },

/***/ "./js/events/UpdateTileStructIdEvent.js"
/*!**********************************************!*\
  !*** ./js/events/UpdateTileStructIdEvent.js ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UpdateTileStructIdEvent: () => (/* binding */ UpdateTileStructIdEvent)
/* harmony export */ });
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");


class UpdateTileStructIdEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @param {string} structId
   */
  constructor(mapId, tileType, ambit, slot, playerId, structId) {
    super(_constants_Events__WEBPACK_IMPORTED_MODULE_0__.EVENTS.UPDATE_TILE_STRUCT_ID);
    this.mapId = mapId;
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
    this.structId = structId;
  }
}



/***/ },

/***/ "./js/factories/AnimationEventFactory.js"
/*!***********************************************!*\
  !*** ./js/factories/AnimationEventFactory.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnimationEventFactory: () => (/* binding */ AnimationEventFactory)
/* harmony export */ });
/* harmony import */ var _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/AnimationConstants */ "./js/constants/AnimationConstants.js");
/* harmony import */ var _events_AnimationEvent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../events/AnimationEvent */ "./js/events/AnimationEvent.js");
/* harmony import */ var _util_CaseConverter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/CaseConverter */ "./js/util/CaseConverter.js");
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/StructConstants */ "./js/constants/StructConstants.js");
/* harmony import */ var _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../constants/Ambits */ "./js/constants/Ambits.js");
/* harmony import */ var _errors_AnimationError__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../errors/AnimationError */ "./js/errors/AnimationError.js");







class AnimationEventFactory {

  constructor() {
    this.caseConverter = new _util_CaseConverter__WEBPACK_IMPORTED_MODULE_2__.CaseConverter();
  }

  /**
   * @param {string} structId the id of the struct that activated stealth mode
   * @param {string|null} mapId the id of the map the animation should play on
   * @return {AnimationEvent} an event specifying the animation to play when stealth mode is activated
   */
  makeStealthActivateAnimationEvent(structId, mapId = null) {
    return new _events_AnimationEvent__WEBPACK_IMPORTED_MODULE_1__.AnimationEvent(
      structId,
      [_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.STEALTH.ACTIVATE],
      false,
      true,
      {},
      mapId
    );
  }

  /**
   * @param {string} structId the id of the struct that deactivated stealth mode
   * @param {string|null} mapId the id of the map the animation should play on
   * @return {AnimationEvent} an event specifying the animation to play when stealth mode is deactivated
   */
  makeStealthDeactivateAnimationEvent(structId, mapId = null) {
    return new _events_AnimationEvent__WEBPACK_IMPORTED_MODULE_1__.AnimationEvent(
      structId,
      [_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.STEALTH.DEACTIVATE],
      false,
      true,
      {},
      mapId
    );
  }

  /**
   * @param {string} attackStructId the id of the attacking struct
   * @param {string} weaponSystem the weapon system being used by the attacking struct such as primaryWeapon, secondaryWeapon or planetaryDefenses
   * @param {string|null} mapId the id of the map the animation should play on
   * @param {number|null} attackStructHealthAfter the attacking struct's health at
   * the point in the sequence at which this animation ends; when provided, the
   * still/HUD will render at this partial value instead of falling back to
   * gameState (which already holds the final post-attack value)
   * @return {AnimationEvent} an event specifying the animation to play for the attacking struct
   */
  makeAttackAnimationEvent(attackStructId, weaponSystem, mapId = null, attackStructHealthAfter = null) {
    const weaponSystemFormatted = this.caseConverter.convert(weaponSystem, _util_CaseConverter__WEBPACK_IMPORTED_MODULE_2__.UPPER_SNAKE_CASE);
    const options = {};
    if (attackStructHealthAfter !== null && attackStructHealthAfter !== undefined) {
      options.healthAfter = parseInt('' + attackStructHealthAfter);
    }
    return new _events_AnimationEvent__WEBPACK_IMPORTED_MODULE_1__.AnimationEvent(
      attackStructId,
      [_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.ATTACK[weaponSystemFormatted]],
      false,
      true,
      options,
      mapId
    );
  }

  /**
   * @param {string} targetStructId the id of the struct being targeted
   * @param {string} attackStructType the StructType.type of the attacking struct
   * @param {string} attackStructOperatingAmbit the current ambit of the attacking struct
   * @param {string} weaponSystem the weapon system being used by the attacking struct such as primaryWeapon, secondaryWeapon or planetaryDefenses
   * @param {string} targetStructType the StructType.type of the struct being targeted
   * @param {string} targetStructOperatingAmbit the current ambit of the struct being targeted
   * @param {string} targetStructCategory whether the struct being targeted is fleet or planetary
   * @param {string|number} targetHealthBefore the health of the struct being targeted before receiving damage
   * @param {string|number} targetHealthAfter the health of the struct being targeted after receiving damage
   * @param {boolean} evaded whether or not the struct being targeted evaded the attack
   * @param {string} evadedCause the unit defenses used to evade the attack
   * @param {string|null} mapId the id of the map the animation should play on
   * @return {AnimationEvent|null} an event specifying the animation to play for the target struct
   */
  makeReceiveDamageAnimationEvent(
    targetStructId,
    attackStructType,
    attackStructOperatingAmbit,
    weaponSystem,
    targetStructType,
    targetStructOperatingAmbit,
    targetStructCategory,
    targetHealthBefore,
    targetHealthAfter,
    evaded = false,
    evadedCause = '',
    mapId = null
  ) {

    attackStructOperatingAmbit = attackStructOperatingAmbit.toUpperCase();
    targetStructOperatingAmbit = targetStructOperatingAmbit.toUpperCase();
    targetHealthBefore = parseInt('' + targetHealthBefore);
    targetHealthAfter = parseInt('' + targetHealthAfter);

    const options = {
      healthAfter: targetHealthAfter,
    };

    // --- Evasion cases ---

    if (evaded && evadedCause === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_UNIT_DEFENSES.SIGNAL_JAMMING) {
      return new _events_AnimationEvent__WEBPACK_IMPORTED_MODULE_1__.AnimationEvent(
        targetStructId,
        [
          _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.EVADE,
        ],
        true,
        true,
        { ...options, projectile: _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.TORPEDO },
        mapId
      );
    } else if (evaded) {
      return new _events_AnimationEvent__WEBPACK_IMPORTED_MODULE_1__.AnimationEvent(
        targetStructId,
        [_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.EVADE],
        true,
        true,
        options,
        mapId
      );
    }

    let animationNames = [];
    let firstOrLast = (targetHealthAfter > 0) ? _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.FIRST : _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.LAST;
    let projectile = '';

    // --- Horizontal cases ---

    // - Horizontal Cannon -
    if (
      (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.BATTLESHIP
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON // TODO: For backwards compatibility, remove when Battleship has two weapons
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.TANK
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND
        && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.IMPACT.HORIZONTAL.CANNON);
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.SHAKE.HORIZONTAL.DEFAULT[firstOrLast]);

      projectile = _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.CANNON;
    }

    // - Horizontal Missile -
    else if (
      (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.STARFIGHTER
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.FRIGATE
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.PURSUIT_FIGHTER
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
        && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.BATTLESHIP
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.COMMAND_SHIP
        && attackStructOperatingAmbit === targetStructOperatingAmbit
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.IMPACT.HORIZONTAL.MISSILE);
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.SHAKE.HORIZONTAL.DEFAULT[firstOrLast]);

      projectile = _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.MISSILE;
    }

    // - Horizontal Torpedo -
    else if (
      attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.HIGH_ALTITUDE_INTERCEPTOR
      && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
      && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
      && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
    ) {
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.IMPACT.HORIZONTAL.TORPEDO);
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.SHAKE.HORIZONTAL.DEFAULT[firstOrLast]);

      projectile = _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.TORPEDO;
    }

    // - Horizontal Gatling -
    else if (
      attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.STARFIGHTER
      && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
      && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
      && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON
    ) {
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.IMPACT.HORIZONTAL.GATLING);
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.SHAKE.HORIZONTAL.GATLING[firstOrLast]);

      projectile = _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.GATLING;
    }

    // --- Angled down cases ---

    // - Angled down missile -
    else if (
      (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.CRUISER
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
        && (
          targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND
          || targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
        )
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.SUBMERSIBLE
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
        && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.FRIGATE
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.IMPACT.ANGLED.DOWN.MISSILE);
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.SHAKE.ANGLED.DOWN.DEFAULT[firstOrLast]);

      projectile = _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.MISSILE;
    }

    // - Angled down torpedo -
    else if (
      (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.DESTROYER
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
        && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.STEALTH_BOMBER
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
        && (
          targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
          || targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND
        )
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.IMPACT.ANGLED.DOWN.TORPEDO);
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.SHAKE.ANGLED.DOWN.DEFAULT[firstOrLast]);

      projectile = _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.TORPEDO;
    }

    // - Angled down cannon -
    else if (
      (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.MOBILE_ARTILLERY
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND
        && (
          targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
          || targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND
        )
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.BATTLESHIP
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        && (
          targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
          || targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND
        )
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.PLANETARY_DEFENSE_CANNON
        && (
          attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND
          || attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
        )
        && (
          targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
          || targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND
        )
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.IMPACT.ANGLED.DOWN.CANNON);
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.SHAKE.ANGLED.DOWN.DEFAULT[firstOrLast]);

      projectile = _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.CANNON;
    }

    // --- Angled up cases ---

    // - Angled up cannon -
    else if (
      attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.PLANETARY_DEFENSE_CANNON
      && (
        attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND
        || attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
      )
      && (
        targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        || targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
      )
      && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
    ) {
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.IMPACT.ANGLED.UP.CANNON);
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.SHAKE.ANGLED.UP.DEFAULT[firstOrLast]);

      projectile = _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.CANNON;
    }

    // - Angled up missile -
    else if (
      (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.SAM_LAUNCHER
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND
        && (
          targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
          || targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        )
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.SUBMERSIBLE
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
        && (
          targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
          || targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        )
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.IMPACT.ANGLED.UP.MISSILE);
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.SHAKE.ANGLED.UP.DEFAULT[firstOrLast]);

      projectile = _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.MISSILE;
    }

    // - Angled up torpedo -
    else if (
      (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.DESTROYER
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
        && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
      || (
        attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.HIGH_ALTITUDE_INTERCEPTOR
        && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
        && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.SPACE
        && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON
      )
    ) {
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.IMPACT.ANGLED.UP.TORPEDO);
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.SHAKE.ANGLED.UP.DEFAULT[firstOrLast]);

      projectile = _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.TORPEDO;
    }

    // - Angled up gatling -
    else if (
      attackStructType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_TYPES.CRUISER
      && attackStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER
      && targetStructOperatingAmbit === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.AIR
      && weaponSystem === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON
    ) {
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.IMPACT.ANGLED.UP.GATLING);
      animationNames.push(_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.SHAKE.ANGLED.UP.GATLING[firstOrLast]);

      projectile = _constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.PROJECTILES.GATLING;
    }

    if (!animationNames.length) {
      throw new _errors_AnimationError__WEBPACK_IMPORTED_MODULE_5__.AnimationError(
        'No receive damage animation matching parameters. See detail.',
      {
          targetStructId: targetStructId,
          attackStructType: attackStructType,
          attackStructOperatingAmbit: attackStructOperatingAmbit,
          weaponSystem: weaponSystem,
          targetStructType: targetStructType,
          targetStructOperatingAmbit: targetStructOperatingAmbit,
          targetStructCategory: targetStructCategory,
          targetHealthBefore: targetHealthBefore,
          targetHealthAfter: targetHealthAfter,
          evaded: evaded,
          evadedCause: evadedCause,
        }
      );
    }

    return new _events_AnimationEvent__WEBPACK_IMPORTED_MODULE_1__.AnimationEvent(
      targetStructId,
      animationNames,
      false,
      true,
      { ...options, projectile: projectile },
      mapId
    );
  }

  /**
   * @param {string} structId the id of the struct that was destroyed
   * @param {string} ambit the current ambit of the struct that was destroyed
   * @param {string} locationType whether the struct is in a fleet or the planet
   * @param {string|null} mapId the id of the map the animation should play on
   * @return {AnimationEvent} an event specifying the animation to play for the struct that was destroyed
   */
  makeDestroyAnimationEvent(structId, ambit, locationType, mapId = null) {
    let ambitFormatted = ambit.toUpperCase();

    // Water based planetary structs sit on platforms and need to show the destroy animation for land
    if (locationType === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_3__.STRUCT_CATEGORIES.PLANET && ambitFormatted === _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.WATER) {
      ambitFormatted = _constants_Ambits__WEBPACK_IMPORTED_MODULE_4__.AMBITS.LAND;
    }

    return new _events_AnimationEvent__WEBPACK_IMPORTED_MODULE_1__.AnimationEvent(
      structId,
      [_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.DESTROY[ambitFormatted]],
      false,
      false,
      { healthAfter: 0 },
      mapId
    );
  }

  /**
   * @param {string} structId the id of the struct that was deployed
   * @param {string} ambit the current ambit of the struct that was deployed
   * @param {string|null} mapId the id of the map the animation should play on
   * @return {AnimationEvent} an event specifying the animation to play for the struct that was deployed
   */
  makeDeploymentAnimationEvent(structId, ambit, mapId = null) {
    const ambitFormatted = ambit.toUpperCase();
    return new _events_AnimationEvent__WEBPACK_IMPORTED_MODULE_1__.AnimationEvent(
      structId,
      [_constants_AnimationConstants__WEBPACK_IMPORTED_MODULE_0__.ANIMATION.NAMES.DEPLOYMENT[ambitFormatted]],
      false,
      true,
      {},
      mapId
    );
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

/***/ "./js/framework/AbstractGrassListener.js"
/*!***********************************************!*\
  !*** ./js/framework/AbstractGrassListener.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractGrassListener: () => (/* binding */ AbstractGrassListener)
/* harmony export */ });
/* harmony import */ var _NotImplementedError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NotImplementedError */ "./js/framework/NotImplementedError.js");


class AbstractGrassListener {

  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
  }

  handler(messageData) {
    throw new _NotImplementedError__WEBPACK_IMPORTED_MODULE_0__.NotImplementedError();
  }

  shouldUnregister() {
    return false;
  }
}

/***/ },

/***/ "./js/framework/AbstractViewModel.js"
/*!*******************************************!*\
  !*** ./js/framework/AbstractViewModel.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractViewModel: () => (/* binding */ AbstractViewModel)
/* harmony export */ });
/* harmony import */ var _NotImplementedError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NotImplementedError */ "./js/framework/NotImplementedError.js");


class AbstractViewModel {
  render() {
    throw new _NotImplementedError__WEBPACK_IMPORTED_MODULE_0__.NotImplementedError();
  }
}


/***/ },

/***/ "./js/framework/AbstractViewModelComponent.js"
/*!****************************************************!*\
  !*** ./js/framework/AbstractViewModelComponent.js ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractViewModelComponent: () => (/* binding */ AbstractViewModelComponent)
/* harmony export */ });
/* harmony import */ var _NotImplementedError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NotImplementedError */ "./js/framework/NotImplementedError.js");
/* harmony import */ var _util_NumberFormatter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/NumberFormatter */ "./js/util/NumberFormatter.js");



class AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
    this.numberFormatter = new _util_NumberFormatter__WEBPACK_IMPORTED_MODULE_1__.NumberFormatter();
  }

  initPageCode() {
    throw new _NotImplementedError__WEBPACK_IMPORTED_MODULE_0__.NotImplementedError();
  }

  renderHTML() {
    throw new _NotImplementedError__WEBPACK_IMPORTED_MODULE_0__.NotImplementedError();
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

/***/ "./js/framework/MenuPage.js"
/*!**********************************!*\
  !*** ./js/framework/MenuPage.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MenuPage: () => (/* binding */ MenuPage)
/* harmony export */ });
/* harmony import */ var _MenuPageRouter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MenuPageRouter */ "./js/framework/MenuPageRouter.js");
/* harmony import */ var _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../dtos/NavItemDTO */ "./js/dtos/NavItemDTO.js");
/* harmony import */ var _sui_SUI__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../sui/SUI */ "./js/sui/SUI.js");
/* harmony import */ var _view_models_components_EnergyUsageComponent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../view_models/components/EnergyUsageComponent */ "./js/view_models/components/EnergyUsageComponent.js");
/* harmony import */ var _view_models_components_AlphaOwnedComponent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../view_models/components/AlphaOwnedComponent */ "./js/view_models/components/AlphaOwnedComponent.js");
/* harmony import */ var _constants_MenuPageRouterModes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants/MenuPageRouterModes */ "./js/constants/MenuPageRouterModes.js");







class MenuPage {

  /** @type {GameState} */
  static gameState;

  /** @type {MapManager} */
  static mapManager;

  /* Element IDs Start */

  static pageLayoutId = 'menu-page-layout';

  static panelChunkId = 'menu-page-panel-chunk';

  static navId = 'menu-page-nav';

  static navItemsId = 'menu-page-nav-items';

  static closeBtnId = 'menu-page-nav-close';

  static screenBodyId = 'menu-page-screen-body';

  static bodyId = 'menu-page-body-content';

  static dialoguePanelId = 'menu-page-dialogue';

  static dialogueIndicatorId = 'menu-page-dialogue-indicator';

  static dialogueIndicatorContentId = 'menu-page-dialogue-indicator-content';

  static dialogueScreenId = 'menu-page-dialogue-screen';

  static dialogueScreenContentId = 'menu-page-dialogue-screen-content';

  static dialogueBtnChunkBId = 'menu-page-dialogue-btn-chunk-b';

  static dialogueBtnAId = 'menu-page-dialogue-btn-a';

  static dialogueBtnBId = 'menu-page-dialogue-btn-b';

  static pageTemplateNavBtnId = 'menu-page-template-nav-btn';

  static resourceEnergyUsageId = 'menu-page-resource-energy-usage';

  static resourceAlphaOwnedId = 'menu-page-resource-alpha-owned';

  static pageTemplateContentId = 'menu-page-template-content';

  static navItemFleetId = 'nav-item-fleet';

  static navItemGuildId = 'nav-item-guild';

  static navItemAccountId = 'nav-item-Account';

  static loadingScreenId = 'loading-screen';

  /* Element IDs End */

  static router = new _MenuPageRouter__WEBPACK_IMPORTED_MODULE_0__.MenuPageRouter();

  static sui = new _sui_SUI__WEBPACK_IMPORTED_MODULE_2__.SUI();

  static menuNavItems = [
    new _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
      MenuPage.navItemFleetId,
      'FLEET',
      () => { MenuPage.router.goto('Fleet', 'index') }
    ),
    new _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
      MenuPage.navItemGuildId,
      'GUILD',
      () => { MenuPage.router.goto('Guild', 'index') }
    ),
    new _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
      MenuPage.navItemAccountId,
      'ACCOUNT',
      () => { MenuPage.router.goto('Account', 'index') }
    )
  ];

  /* Dynamic Handlers Start */

  static dialogueBtnAHandler = () => {};

  static dialogueBtnBHandler = () => {};

  static pageTemplateNavBtnHandler = () => {};

  /* Dynamic Handlers End */

  /**
   * @param {NavItemDTO[]}items
   * @param {string|null} activeId the ID of the active nav item
   */
  static setNavItems(items, activeId = null) {

    let itemsHtml = '';
    const isPreviewMode = MenuPage.router.mode === _constants_MenuPageRouterModes__WEBPACK_IMPORTED_MODULE_5__.MENU_PAGE_ROUTER_MODES.PREVIEW;
    let activeNavItemIndex = 0;

    for (let i = 0; i < items.length; i++) {
      let activeClass= '';

      if (activeId === items[i].id || (!activeId && i === 0)) {
        activeClass = 'sui-mod-active';
        activeNavItemIndex = i;
      }

      if (!isPreviewMode || activeClass) {
        itemsHtml += `<a 
          id="${items[i].id}"
          class="sui-screen-nav-item ${activeClass}"
          href="javascript:void(0)"
        >${items[i].label}</a>`;
      }
    }

    document.getElementById(MenuPage.navItemsId).innerHTML = itemsHtml;

    for (let i = 0; !isPreviewMode && (i < items.length); i++) {
      document.getElementById(items[i].id).addEventListener('click', items[i].actionHandler);
    }
  }

  static disableCloseBtn() {
    document.getElementById(MenuPage.closeBtnId).classList.add('hidden');
  }

  static enableCloseBtn() {
    document.getElementById(MenuPage.closeBtnId).classList.remove('hidden');
  }

  static hideAndClearNav() {
    const navItems = [
      new _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
        'nav-item-structs',
        'Structs'
      )
    ];
    MenuPage.setNavItems(navItems, 'nav-item-structs');
    document.getElementById(MenuPage.navId).classList.add('hidden');
  }

  static showNav() {
    document.getElementById(MenuPage.navId).classList.remove('hidden');
  }

  static setBodyContent(content) {
    document.getElementById(MenuPage.bodyId).innerHTML = content;
  }

  static setDialogueIndicatorContent(content, useFadeAnimation = false) {
    const dialogueIndicatorContent = document.getElementById(MenuPage.dialogueIndicatorContentId);
    dialogueIndicatorContent.innerHTML = content;

    if (useFadeAnimation) {
      MenuPage.applyFadeInFadeOutAnimation(dialogueIndicatorContent);
    }
  }

  static applyFadeInFadeOutAnimation(element) {
    element.classList.add('fade-in-fade-out');
    element.addEventListener('animationend', () => {
      element.classList.remove('fade-in-fade-out');
    });
  }

  static setDialogueScreenContent(content, useFadeAnimation = false) {
    const dialogueScreenContent = document.getElementById(MenuPage.dialogueScreenContentId);
    dialogueScreenContent.innerHTML = content;

    if (useFadeAnimation) {
      MenuPage.applyFadeInFadeOutAnimation(dialogueScreenContent);
    }
  }

  static setDialogueScreenTheme(theme) {
    const dialogueScreen = document.getElementById(MenuPage.dialogueScreenId);
    dialogueScreen.classList.remove(...dialogueScreen.classList);
    dialogueScreen.classList.add('sui-screen-dialogue');
    dialogueScreen.classList.add(theme);
  }

  static setDialogueScreenThemeToNeutral() {
    MenuPage.setDialogueScreenTheme('sui-theme-neutral');
  }

  static setDialogueScreenThemeToEnemy() {
    MenuPage.setDialogueScreenTheme('sui-theme-enemy');
  }

  static enableDialogueBtnA() {
    document.getElementById(MenuPage.dialogueBtnAId).classList.remove('hidden');
  }

  static disableDialogueBtnA() {
    document.getElementById(MenuPage.dialogueBtnAId).classList.add('hidden');
  }

  static enableDialogueBtnB() {
    document.getElementById(MenuPage.dialogueBtnChunkBId).classList.remove('hidden');
  }

  static disableDialogueBtnB() {
    document.getElementById(MenuPage.dialogueBtnChunkBId).classList.add('hidden');
  }

  static clearDialogueScreen() {
    document.getElementById(MenuPage.dialogueScreenContentId).innerHTML = '';
  }

  static clearDialogueBtnAHandler() {
    MenuPage.dialogueBtnAHandler = () => {};
  }

  static clearDialogueBtnBHandler() {
    MenuPage.dialogueBtnBHandler = () => {};
  }

  static clearPageTemplateNavBtnHandler() {
    MenuPage.pageTemplateNavBtnHandler = () => {};
  }

  static hideAndClearDialoguePanel() {
    document.getElementById(MenuPage.dialoguePanelId).classList.add('hidden');
    MenuPage.clearDialogueScreen();
    MenuPage.setDialogueScreenThemeToNeutral();
    MenuPage.clearDialogueBtnAHandler();
    MenuPage.clearDialogueBtnBHandler();
  }

  static showDialoguePanel() {
    document.getElementById(MenuPage.dialoguePanelId).classList.remove('hidden');
  }

  static closeBtnHandler() {
    document.getElementById(MenuPage.pageLayoutId).classList.add('hidden');
  }

  static close() {
    MenuPage.mapManager.showActiveMap();
    console.log(MenuPage.gameState.activeMapContainerId)
    MenuPage.closeBtnHandler();
  }

  static open() {
    document.getElementById(MenuPage.pageLayoutId).classList.remove('hidden');
  }

  static initCloseBtnListener() {
    document.getElementById(MenuPage.closeBtnId).addEventListener('click', MenuPage.close);
  }

  static initDialogueBtnAListener() {
    const dialogueBtnA = document.getElementById(MenuPage.dialogueBtnAId);
    dialogueBtnA.addEventListener('click', () => {
      MenuPage.dialogueBtnAHandler();
    });
  }

  static initDialogueBtnBListener() {
    const dialogueBtnB = document.getElementById(MenuPage.dialogueBtnBId);
    dialogueBtnB.addEventListener('click', () => {
      MenuPage.dialogueBtnBHandler();
    });
  }

  static initPageTemplateNavBtnListener() {
    const pageTemplateNavBtn = document.getElementById(MenuPage.pageTemplateNavBtnId);
    pageTemplateNavBtn.addEventListener('click', () => {
      MenuPage.pageTemplateNavBtnHandler();
    });
  }

  static initListeners() {
    MenuPage.initCloseBtnListener();
    MenuPage.initDialogueBtnAListener();
    MenuPage.initDialogueBtnBListener();
  }

  static enablePageTemplate(
    activeNavItemId = null,
    showResources = true,
    useTransparentBackground = false,
    useCustomResources = false,
    customResourcesHTML = '',
    initCustomPageTemplateCode = () => {}
  ) {

    MenuPage.setNavItems(MenuPage.menuNavItems, activeNavItemId);
    MenuPage.enableCloseBtn();

    let headerResourcesHTML = useCustomResources ? customResourcesHTML : '';
    let energyUsageComponent;
    let alphaOwnedComponent;
    const isPreviewMode = MenuPage.router.mode === _constants_MenuPageRouterModes__WEBPACK_IMPORTED_MODULE_5__.MENU_PAGE_ROUTER_MODES.PREVIEW;

    showResources = !isPreviewMode && showResources;

    if (!useCustomResources && showResources) {

      energyUsageComponent = new _view_models_components_EnergyUsageComponent__WEBPACK_IMPORTED_MODULE_3__.EnergyUsageComponent(
        MenuPage.gameState,
        MenuPage.resourceEnergyUsageId
      );

      alphaOwnedComponent = new _view_models_components_AlphaOwnedComponent__WEBPACK_IMPORTED_MODULE_4__.AlphaOwnedComponent(
        MenuPage.gameState,
        MenuPage.resourceAlphaOwnedId,
      );

      headerResourcesHTML = `
        <div class="sui-page-header-resources">
          ${energyUsageComponent.renderHTML()}
          ${alphaOwnedComponent.renderHTML()}
        </div>
      `;

    }

    const pageTemplate = `
      <div class="sui-page-body-screen-content">
  
        <!-- Page Header Start -->
  
        <div class="sui-page-header">
          <a id="${this.pageTemplateNavBtnId}" href="javascript: void(0)" class="sui-nav-btn">
            <i class="sui-icon-sm icon-chevron-left sui-text-secondary"></i>
            Member Roster
          </a>
  
          ${headerResourcesHTML}
        </div>
  
        <!-- Page Header End -->
  
        <div id="${this.pageTemplateContentId}" class="sui-screen-body">
  
          <!-- Content -->
  
        </div>
      </div>
    `;

    MenuPage.setBodyContent(pageTemplate);

    MenuPage.useOpaqueBackground();

    if (useTransparentBackground) {
      MenuPage.useTransparentBackground();
    }

    if (!useCustomResources && showResources) {
      energyUsageComponent.initPageCode();
      alphaOwnedComponent.initPageCode();
    }

    MenuPage.initPageTemplateNavBtnListener();

    initCustomPageTemplateCode();
  }

  static setPageTemplateHeaderBtn(label, showBackIcon = false, handler = () => {}) {
    if (MenuPage.router.mode === _constants_MenuPageRouterModes__WEBPACK_IMPORTED_MODULE_5__.MENU_PAGE_ROUTER_MODES.PREVIEW) {
      showBackIcon = false;
      handler = () => {};
    }

    const backIcon = showBackIcon ? '<i class="sui-icon-sm icon-chevron-left sui-text-secondary"></i>' : '';
    document.getElementById(this.pageTemplateNavBtnId).innerHTML = `${backIcon} ${label}`;
    this.pageTemplateNavBtnHandler = handler;
  }

  static setPageTemplateContent(content) {
    document.getElementById(this.pageTemplateContentId).innerHTML = content;
  }

  static useTransparentBackground() {
    document.getElementById(this.screenBodyId).classList.add('hidden-background');
    document.getElementById(this.panelChunkId).classList.add('hidden-background');
  }

  static useOpaqueBackground() {
    document.getElementById(this.screenBodyId).classList.remove('hidden-background');
    document.getElementById(this.panelChunkId).classList.remove('hidden-background');
  }

  static hideLoadingScreen() {
    document.getElementById(MenuPage.loadingScreenId).classList.add('hidden');
  }
}


/***/ },

/***/ "./js/framework/MenuPageRouter.js"
/*!****************************************!*\
  !*** ./js/framework/MenuPageRouter.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MenuPageRouter: () => (/* binding */ MenuPageRouter)
/* harmony export */ });
/* harmony import */ var _constants_MenuPageRouterModes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/MenuPageRouterModes */ "./js/constants/MenuPageRouterModes.js");


class MenuPageRouter {
  constructor() {
    this.controllers = new Map();

    this.currentController = null;
    this.currentPage = null;
    this.currentOptions = {};

    this.lastController = null;
    this.lastPage = null;
    this.lastOptions = {};

    this.mode = _constants_MenuPageRouterModes__WEBPACK_IMPORTED_MODULE_0__.MENU_PAGE_ROUTER_MODES.DEFAULT;

    /**
     * Incremented on every navigation. Async work started during one navigation
     * can compare a snapshot of this value against the current one to detect
     * whether the user has since navigated away.
     */
    this.navigationId = 0;

    /**
     * Pages that depend on in-flight async work or function-valued options
     * (which JSON serialization drops), so they cannot be restored after a reload.
     */
    this.nonRestorablePages = new Set([
      'Generic.menuWaiting'
    ]);
  }

  /**
   * @param {{controller: string, page: string}|null} menuPage
   * @return {boolean}
   */
  isRestorable(menuPage) {
    return !!menuPage
      && !this.nonRestorablePages.has(`${menuPage.controller}.${menuPage.page}`);
  }

  registerController(controller) {
    this.controllers.set(controller.name, controller);
  }

  goto(controllerName, pageName, options = {}) {
    this.navigationId++;

    if (this.mode !== _constants_MenuPageRouterModes__WEBPACK_IMPORTED_MODULE_0__.MENU_PAGE_ROUTER_MODES.PREVIEW) {
      if (!(
        this.currentController === controllerName
        && this.currentPage === pageName
        && JSON.stringify(this.currentOptions) === JSON.stringify(options)
      )) {
        this.lastController = this.currentController;
        this.lastPage = this.currentPage;
        this.lastOptions = this.currentOptions;

        this.currentController = controllerName;
        this.currentPage = pageName;
        this.currentOptions = options;
      }

      localStorage.setItem("lastMenuPage", JSON.stringify({
        controller: this.lastController,
        page: this.lastPage,
        options: this.lastOptions
      }))
      localStorage.setItem("currentMenuPage", JSON.stringify({
        controller: controllerName,
        page: pageName,
        options: options
      }));
    }

    this.controllers.get(controllerName)[pageName](options);
  }

  back() {
    this.goto(this.lastController, this.lastPage, this.lastOptions);
  }

  restore(defaultController, defaultPage, defaultOptions = {}) {
    const lastMenuPage = JSON.parse(localStorage.getItem("lastMenuPage"));
    const currentMenuPage = JSON.parse(localStorage.getItem("currentMenuPage"));

    if (!currentMenuPage || !lastMenuPage || !this.isRestorable(currentMenuPage)) {
      this.goto(defaultController, defaultPage, defaultOptions);
    } else {
      if (this.isRestorable(lastMenuPage)) {
        this.currentPage = lastMenuPage.page;
        this.currentController = lastMenuPage.controller;
        this.currentOptions = lastMenuPage.options;
      }

      this.goto(currentMenuPage.controller, currentMenuPage.page, currentMenuPage.options);
    }
  }

  enablePreviewMode() {
    this.mode = _constants_MenuPageRouterModes__WEBPACK_IMPORTED_MODULE_0__.MENU_PAGE_ROUTER_MODES.PREVIEW;
  }

  enableDefaultMode() {
    this.mode = _constants_MenuPageRouterModes__WEBPACK_IMPORTED_MODULE_0__.MENU_PAGE_ROUTER_MODES.DEFAULT;
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

/***/ "./js/grass_listeners/ConsumeAlphaChangeListener.js"
/*!**********************************************************!*\
  !*** ./js/grass_listeners/ConsumeAlphaChangeListener.js ***!
  \**********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConsumeAlphaChangeListener: () => (/* binding */ ConsumeAlphaChangeListener)
/* harmony export */ });
/* harmony import */ var _framework_AbstractGrassListener__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/AbstractGrassListener */ "./js/framework/AbstractGrassListener.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");



class ConsumeAlphaChangeListener extends _framework_AbstractGrassListener__WEBPACK_IMPORTED_MODULE_0__.AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {string} structId
   */
  constructor(gameState, structId) {
    super(`CONSUME_ALPHA_CHANGE_${structId}`);
    this.gameState = gameState;
    this.structId = structId;
  }

  handler(messageData) {
    const subjectPrefix = `structs.inventory.ualpha.infused.${this.gameState.thisGuild.id}.${this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_1__.PLAYER_TYPES.PLAYER].id}`;

    if (
      messageData.category === 'infused'
      && messageData.counterparty === this.structId
      && (messageData.subject === subjectPrefix || messageData.subject.startsWith(`${subjectPrefix}.`))
    ) {
      this.shouldUnregister = () => true;

      this.gameState.guildAPI.getPlayer(this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_1__.PLAYER_TYPES.PLAYER].id).then(player => {
        this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_1__.PLAYER_TYPES.PLAYER].setAlpha(player.alpha); // Refresh owned alpha count
      });
    }
  }
}


/***/ },

/***/ "./js/grass_listeners/GridStructListener.js"
/*!**************************************************!*\
  !*** ./js/grass_listeners/GridStructListener.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GridStructListener: () => (/* binding */ GridStructListener)
/* harmony export */ });
/* harmony import */ var _framework_AbstractGrassListener__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/AbstractGrassListener */ "./js/framework/AbstractGrassListener.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/StructConstants */ "./js/constants/StructConstants.js");




class GridStructListener extends _framework_AbstractGrassListener__WEBPACK_IMPORTED_MODULE_0__.AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {string} structId
   */
  constructor(gameState, structId) {
    super(`GRID_STRUCT_${structId}`);
    this.gameState = gameState;
    this.structId = structId;
  }

  handleFuel(messageData) {
    if (messageData.category === 'fuel') {
      this.shouldUnregister = () => true;

      this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_1__.PLAYER_TYPES.PLAYER].structs[this.structId].fuel = parseInt(messageData.value);

      if (
        this.gameState.actionBarLock.getCurrentAction() === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_2__.STRUCT_ACTIONS.CONSUME_ALPHA
        && this.gameState.actionBarLock.isLocked()
      ) {
        this.gameState.actionBarLock.clear();
      }
    }
  }

  handler(messageData) {
    if (messageData.subject === `structs.grid.struct.${this.structId}.${this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_1__.PLAYER_TYPES.PLAYER].id}`) {
      this.handleFuel(messageData);
    }
  }
}

/***/ },

/***/ "./js/managers/DestroyedStructManager.js"
/*!***********************************************!*\
  !*** ./js/managers/DestroyedStructManager.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DestroyedStructManager: () => (/* binding */ DestroyedStructManager)
/* harmony export */ });
/* harmony import */ var _models_Struct__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/Struct */ "./js/models/Struct.js");
/* harmony import */ var _constants_SettingConstants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/SettingConstants */ "./js/constants/SettingConstants.js");
/* harmony import */ var _events_ClearStructTileEvent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../events/ClearStructTileEvent */ "./js/events/ClearStructTileEvent.js");
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");





class DestroyedStructManager {

  /**
   * @param {GameState} gameState
   * @param {StructManager} structManager
   */
  constructor(gameState, structManager) {
    this.gameState = gameState;
    this.structManager = structManager;
    this.destroyedStructs = {};
  }

  /**
   * @param {string} playerType
   * @param {Struct} struct
   */
  track(playerType, struct) {
    if (struct.isDestroyed()) {
      this.destroyedStructs[struct.id] = {
        playerType: playerType,
        struct: struct
      };
    }
  }

  /**
   * @param {string} playerType
   */
  trackAll(playerType) {
    Object.keys(this.gameState.keyPlayers[playerType].structs).forEach((structId) => {
      this.track(playerType, this.gameState.keyPlayers[playerType].structs[structId]);
    });
  }

  sweep() {
    const sweepDelay = this.gameState.settings.get(_constants_SettingConstants__WEBPACK_IMPORTED_MODULE_1__.SETTING.STRUCT_SWEEP_DELAY);
    const currentBlock = this.gameState.currentBlockHeight;
    const keys = Object.keys(this.destroyedStructs);

    for (let i = 0; i < keys.length; i++) {

      const item = this.destroyedStructs[keys[i]];

      if (item.struct.destroyed_block + sweepDelay < currentBlock) {

        delete(this.destroyedStructs[keys[i]]);
        delete this.gameState.keyPlayers[item.playerType].structs[item.struct.id];

        const mapId = this.structManager.getMapIdByPlayerTypeAndStruct(item.struct, item.playerType);
        const tileType = this.structManager.getTileTypeFromStruct(item.struct);

        // An abandoned struct's old position belongs to whatever is on the new planet now.
        if (mapId && tileType && !this.structManager.isAbandonedPlanetaryStruct(item.struct)) {

          window.dispatchEvent(new _events_ClearStructTileEvent__WEBPACK_IMPORTED_MODULE_2__.ClearStructTileEvent(
            mapId,
            tileType,
            item.struct.operating_ambit.toUpperCase(),
            item.struct.slot,
            item.struct.owner
          ));

        }

      }
    }
  }

  init() {
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_3__.EVENTS.BLOCK_HEIGHT_CHANGED, () => {
      this.sweep();
    });

    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_3__.EVENTS.TRACK_DESTROYED_STRUCTS, (event) => {
      this.trackAll(event.playerType);
    });

    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_3__.EVENTS.TRACK_DESTROYED_STRUCT, (event) => {
      const struct = this.structManager.getStructById(event.structId);
      if (struct) {
        this.track(event.playerType, struct);
      }
    });
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

/***/ "./js/managers/StructManager.js"
/*!**************************************!*\
  !*** ./js/managers/StructManager.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StructManager: () => (/* binding */ StructManager)
/* harmony export */ });
/* harmony import */ var _models_Struct__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/Struct */ "./js/models/Struct.js");
/* harmony import */ var _models_StructType__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../models/StructType */ "./js/models/StructType.js");
/* harmony import */ var _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/MapConstants */ "./js/constants/MapConstants.js");
/* harmony import */ var _events_TaskCmdKillEvent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../events/TaskCmdKillEvent */ "./js/events/TaskCmdKillEvent.js");
/* harmony import */ var _events_ClearStructTileEvent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../events/ClearStructTileEvent */ "./js/events/ClearStructTileEvent.js");
/* harmony import */ var _events_UpdateTileStructIdEvent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../events/UpdateTileStructIdEvent */ "./js/events/UpdateTileStructIdEvent.js");
/* harmony import */ var _view_models_HUDViewModel__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../view_models/HUDViewModel */ "./js/view_models/HUDViewModel.js");
/* harmony import */ var _events_RefreshActionBarEvent__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../events/RefreshActionBarEvent */ "./js/events/RefreshActionBarEvent.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../constants/StructConstants */ "./js/constants/StructConstants.js");
/* harmony import */ var _events_RefreshActionBarIfSelectedEvent__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../events/RefreshActionBarIfSelectedEvent */ "./js/events/RefreshActionBarIfSelectedEvent.js");
/* harmony import */ var _events_RenderStructEvent__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../events/RenderStructEvent */ "./js/events/RenderStructEvent.js");
/* harmony import */ var _events_RenderStructHUDEvent__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../events/RenderStructHUDEvent */ "./js/events/RenderStructHUDEvent.js");
/* harmony import */ var _events_ShowStructStillEvent__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../events/ShowStructStillEvent */ "./js/events/ShowStructStillEvent.js");
/* harmony import */ var _models_Fleet__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../models/Fleet */ "./js/models/Fleet.js");
/* harmony import */ var _factories_AnimationEventFactory__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../factories/AnimationEventFactory */ "./js/factories/AnimationEventFactory.js");

















class StructManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {SigningClientManager} signingClientManager
   */
  constructor(
    gameState,
    guildAPI,
    signingClientManager
  ) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.signingClientManager = signingClientManager;
    this.animationEventFactory = new _factories_AnimationEventFactory__WEBPACK_IMPORTED_MODULE_15__.AnimationEventFactory();
  }

  /**
   * @param {Struct} struct
   * @return {boolean}
   */
  isCommandStruct(struct) {
    const structType = this.gameState.structTypes.getStructTypeById(struct.type);
    return !!structType?.is_command;
  }

  /**
   * @param {Struct} struct
   * @param {string} planetId
   * @param {Fleet} fleet
   * @return {boolean}
   */
  isStructOnPlanet(struct, planetId, fleet = null) {
    return (struct.location_type === 'planet' && struct.location_id === planetId)
      || (struct.location_type === 'fleet' && fleet?.location_id === planetId);
  }

  /**
   * Whether the struct is a planetary struct left behind on a planet its owner
   * has since moved away from.
   *
   * @param {Struct} struct
   * @return {boolean}
   */
  isAbandonedPlanetaryStruct(struct) {
    if (struct.location_type !== 'planet') {
      return false;
    }

    const owner = Object.values(this.gameState.keyPlayers).find(keyPlayer => keyPlayer.id === struct.owner);
    const ownerPlanetId = owner?.player?.planet_id;

    return !!ownerPlanetId && struct.location_id !== ownerPlanetId;
  }

  /**
   * Get a struct by its owner, and it's position on planet or in fleet
   * @param {string} playerId - The id of the struct owner
   * @param {string} locationType - "fleet" or "planet"
   * @param {string} locationId - Fleet ID or Planet ID
   * @param {string} mapPlanetId - the planet to look for the struct on
   * @param {string} ambit - "space", "air", "land", "water"
   * @param {number} slot - Slot number
   * @param {boolean} isCommandSlot - Whether the slot is a command slot or just a planetary or fleet slot
   * @param {Fleet} fleet - The fleet belonging to the player, required for fleet structs
   * @return {Struct|null}
   */
  getStructByPositionAndPlayerId(
    playerId,
    locationType,
    locationId,
    mapPlanetId,
    ambit,
    slot,
    isCommandSlot,
    fleet
  ) {

    /**
     * @type {Struct[]}
     */
    const allStructs = [
      ...Object.values(this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].structs),
      ...Object.values(this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLANET_RAIDER].structs),
      ...Object.values(this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.RAID_ENEMY].structs),
      ...Object.values(this.gameState.previewDefenderStructs),
      ...Object.values(this.gameState.previewAttackerStructs)
    ];

    return allStructs.find(struct =>
      struct.owner === playerId
      && struct.location_type === locationType
      && struct.location_id === locationId
      && struct.operating_ambit.toLowerCase() === ambit.toLowerCase()
      && `${struct.slot}` === `${slot}`
      && this.isCommandStruct(struct) === isCommandSlot
      && this.isStructOnPlanet(struct, mapPlanetId, fleet)
    ) || null;
  }

  /**
   * Get a struct id by its owner, and it's position on planet or in fleet
   * @param {string} playerId - The id of the struct owner
   * @param {string} locationType - "fleet" or "planet"
   * @param {string} locationId - Fleet ID or Planet ID
   * @param {string} mapPlanetId - the planet to look for the struct on
   * @param {string} ambit - "space", "air", "land", "water"
   * @param {string|number} slot - Slot number
   * @param {boolean} isCommandSlot - Whether the slot is a command slot or just a planetary or fleet slot
   * @param {Fleet} fleet - The fleet belonging to the player, required for fleet structs
   * @return {string}
   */
  getStructIdByPositionAndPlayerId(
    playerId,
    locationType,
    locationId,
    mapPlanetId,
    ambit,
    slot,
    isCommandSlot,
    fleet
  ) {
    if (slot === "") {
      return "";
    }

    const struct = this.getStructByPositionAndPlayerId(playerId, locationType, locationId, mapPlanetId, ambit, parseInt(slot), isCommandSlot, fleet);
    return struct ? struct.id : '';
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  getDeploymentBlockerBuildLimitReached(structType) {
    if (structType.build_limit > 0) {
      const structTypeCount = Object.values(this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].structs).filter(struct =>
        struct.type === structType.id
      ).length;

      if (structTypeCount >= structType.build_limit) {
        return 'Already deployed';
      }
    }

    return '';
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  getDeploymentBlockerInsufficientCharge(structType) {
    const playerCharge = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].getCharge(this.gameState.currentBlockHeight);
    return this.gameState.chargeCalculator.isChargeLevelSufficient(playerCharge, structType.build_charge)
      ? ''
      : 'Insufficient battery';
  }

  /**
   * @return {number}
   */
  getEnergySupply() {
    let totalLoad = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].player.load + this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].player.structs_load;
    let totalCapacity = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].player.capacity + this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].player.connection_capacity;

    return totalCapacity - totalLoad;
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  getDeploymentBlockerInsufficientEnergySupply(structType) {
    const energySupply = this.getEnergySupply();
    return (energySupply < structType.build_draw || energySupply < structType.passive_draw)
      ? 'Insufficient energy supply'
      : '';
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  getDeploymentBlockerNoCommandShip(structType) {
    if (structType.is_command) {
      return '';
    }

    return !this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].isCommandStructAlive()
      ? 'Requires command ship'
      : '';
  }

  /**
   * @param {StructType} structType
   * @return {string|string}
   */
  getDeploymentBlockerCommandShipAway(structType) {
    if (structType.is_command) {
      return '';
    }

    return this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].fleet.status === 'away'
      ? 'Command ship is away'
      : '';
  }

  /**
   * Checks if the logged in player is eligible to deploy the select struct type and returns any blockers.
   *
   * @param {StructType} structType
   * @return {string}
   */
  getDeploymentBlocker(structType) {
    return this.getDeploymentBlockerNoCommandShip(structType)
      || this.getDeploymentBlockerBuildLimitReached(structType)
      || this.getDeploymentBlockerInsufficientEnergySupply(structType)
      || this.getDeploymentBlockerInsufficientCharge(structType)
      || this.getDeploymentBlockerCommandShipAway(structType);
  }

  /**
   * Gets a struct by ID from all available struct objects. O(1) lookup.
   *
   * @param {string} structId
   * @return {Struct|null}
   */
  getStructById(structId) {
    if (!structId) {
      return null;
    }

    return this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].structs[structId]
      || this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLANET_RAIDER].structs[structId]
      || this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.RAID_ENEMY].structs[structId]
      || this.gameState.previewDefenderStructs[structId]
      || this.gameState.previewAttackerStructs[structId]
      || null;
  }

  /**
   * Determine tile type from struct location and type
   * @param {Struct} struct
   * @return {string|null}
   */
  getTileTypeFromStruct(struct) {
    if (struct.location_type === 'planet') {
      return _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_TILE_TYPES.PLANETARY_SLOT;
    }
    if (struct.location_type === 'fleet') {
      return this.isCommandStruct(struct)
        ? _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_TILE_TYPES.COMMAND
        : _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_TILE_TYPES.FLEET;
    }
    return null;
  }

  /**
   * Requests cancellation of a struct build.
   *
   * @param {Struct} struct
   */
  cancelStructBuild(struct) {
    if (struct.isDestroyed()) {
      return;
    }

    this.gameState.actionBarLock.setCurrentAction(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_9__.STRUCT_ACTIONS.BUILD_CANCEL);
    this.gameState.actionBarLock.lock();

    this.signingClientManager.queueMsgStructBuildCancel(
      struct.id
    ).then();
  }

  /**
   * Finalizes a build cancel once the chain confirms it.
   *
   * @param {string} structId
   * @param {string|null} mapId
   */
  finalizeBuildCancel(structId, mapId) {
    const struct = this.getStructById(structId);
    let isOwnStruct = true;

    if (struct) {
      const tileType = this.getTileTypeFromStruct(struct);
      const ambit = struct.operating_ambit.toUpperCase();
      const slot = struct.slot;
      const playerId = struct.owner;
      isOwnStruct = playerId === this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].id;

      // Kill the build task worker
      window.dispatchEvent(new _events_TaskCmdKillEvent__WEBPACK_IMPORTED_MODULE_3__.TaskCmdKillEvent(structId));

      this.gameState.removeStruct(structId);

      if (tileType) {
        this.gameState.removePendingBuild(tileType, ambit, slot, playerId);
      }

      // Clear the struct layer tile
      window.dispatchEvent(new _events_ClearStructTileEvent__WEBPACK_IMPORTED_MODULE_4__.ClearStructTileEvent(
        mapId,
        tileType,
        ambit,
        slot,
        playerId
      ));

      // Clear the tile selection's data-struct-id
      window.dispatchEvent(new _events_UpdateTileStructIdEvent__WEBPACK_IMPORTED_MODULE_5__.UpdateTileStructIdEvent(
        mapId,
        tileType,
        ambit,
        slot,
        playerId,
        ''  // Empty string to clear the struct ID
      ));

      if (
        _view_models_HUDViewModel__WEBPACK_IMPORTED_MODULE_6__.HUDViewModel.currentSelectedTile
        && _view_models_HUDViewModel__WEBPACK_IMPORTED_MODULE_6__.HUDViewModel.currentSelectedTile.structId === structId
      ) {
        _view_models_HUDViewModel__WEBPACK_IMPORTED_MODULE_6__.HUDViewModel.currentSelectedTile.structId = null;
      }
    }

    // Release the lock only for the player's own pending cancel; clearing
    // refreshes the action bar, which now resolves to the empty tile state.
    if (
      isOwnStruct
      && this.gameState.actionBarLock.getCurrentAction() === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_9__.STRUCT_ACTIONS.BUILD_CANCEL
      && this.gameState.actionBarLock.isLocked()
    ) {
      this.gameState.actionBarLock.clear();
    } else {
      window.dispatchEvent(new _events_RefreshActionBarEvent__WEBPACK_IMPORTED_MODULE_7__.RefreshActionBarEvent());
    }
  }

  /**
   * @param {String} playerType
   * @return {Object<string, Struct>}
   */
  getStructsByPlayerType(playerType) {
    switch (playerType) {
      case _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER:
        return this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].structs;
      case _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLANET_RAIDER:
        return this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLANET_RAIDER].structs;
      case _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.RAID_ENEMY:
        return this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.RAID_ENEMY].structs;
      default:
        throw new Error(`No such player type ${playerType}`);
    }
  }

  /**
   * @param {string} playerType
   * @return {string}
   */
  getStructCountByPlayerType(playerType) {
    const structs = this.getStructsByPlayerType(playerType);
    const isFleetAway = this.gameState.keyPlayers[playerType]?.fleet?.status === 'away';
    let planetaryStructCount = 0;
    let fleetStructCount = 0;
    for (const struct of Object.values(structs)) {
      if (struct.location_type === 'planet') {
        planetaryStructCount++;
      } else if (struct.location_type === 'fleet' && !isFleetAway) {
        fleetStructCount++;
      }
    }
    return `${fleetStructCount}+${planetaryStructCount}`;
  }

  /**
   * @param {string} structId
   * @param {string} mapType
   * @param {boolean} removePendingBuild
   * @param {boolean} renderStruct
   * @param {AnimationEvent} animationToAutoplay
   * @return {Promise<Struct|null>}
   */
  async refreshStruct(
    structId,
    mapType,
    removePendingBuild = false,
    renderStruct = true,
    animationToAutoplay = null
  ) {
    const oldStruct = this.getStructById(structId);
    const wasOnline = oldStruct ? oldStruct.isOnline() : null;

    const struct = await this.guildAPI.getStruct(structId);

    // Departing a planet abandons its planetary structs, and their status
    // changes can still be arriving after the owner has reached a new planet.
    if (this.isAbandonedPlanetaryStruct(struct)) {
      this.gameState.removeStruct(struct.id);
      return null;
    }

    this.gameState.setStruct(struct);

    const tileType = this.getTileTypeFromStruct(struct);
    const ambit = struct.operating_ambit.toUpperCase();
    const mapId = this.gameState[mapType]?.mapId ?? null;

    // Remove pending build from gameState
    if (tileType && removePendingBuild) {
      this.gameState.removePendingBuild(tileType, ambit, struct.slot, struct.owner);

      if (!animationToAutoplay) {
        animationToAutoplay = this.animationEventFactory.makeDeploymentAnimationEvent(
          struct.id,
          ambit,
          mapId
        );
      }
    }

    // Dispatch event to update the struct layer
    if (renderStruct) {
      const renderStructEvent = new _events_RenderStructEvent__WEBPACK_IMPORTED_MODULE_11__.RenderStructEvent(
        this.gameState[mapType].mapId,
        struct,
        animationToAutoplay
      );
      window.dispatchEvent(renderStructEvent);
    } else if (
      tileType
      && mapId
      && wasOnline !== null
      && wasOnline !== struct.isOnline()
      && !this.gameState.animationEventQueue?.isStructAnimating(struct.id)
    ) {
      // ONLINE/OFFLINE transitions swap the struct still for an active-loop
      // animation on extractors/refineries; refresh the viewer without a full
      // re-render so in-flight animations aren't torn down. Skip while this
      // struct has a current or queued animation — showStructStill() runs again
      // when that animation completes (showStructStillAfterAnimation).
      window.dispatchEvent(new _events_ShowStructStillEvent__WEBPACK_IMPORTED_MODULE_13__.ShowStructStillEvent(mapId, struct.id));
    }

    const renderStructHUDEvent = new _events_RenderStructHUDEvent__WEBPACK_IMPORTED_MODULE_12__.RenderStructHUDEvent(this.gameState[mapType].mapId, struct);
    window.dispatchEvent(renderStructHUDEvent);

    // Dispatch event to update the tile selection layer's struct ID
    if (tileType) {
      const updateTileEvent = new _events_UpdateTileStructIdEvent__WEBPACK_IMPORTED_MODULE_5__.UpdateTileStructIdEvent(
        this.gameState[mapType].mapId,
        tileType,
        ambit,
        struct.slot,
        struct.owner,
        struct.id
      );
      window.dispatchEvent(updateTileEvent);

      // Dispatch event to refresh action bar if this struct's tile is currently selected
      const refreshActionBarEvent = new _events_RefreshActionBarIfSelectedEvent__WEBPACK_IMPORTED_MODULE_10__.RefreshActionBarIfSelectedEvent(
        tileType,
        ambit,
        struct.slot,
        struct.owner,
        struct.id
      );
      window.dispatchEvent(refreshActionBarEvent);
    }

    return struct;
  }

  /**
   * @param {Struct} struct
   * @param {string} playerType
   */
  getMapIdByPlayerTypeAndStruct(struct, playerType) {

    let onPlanet = (struct.location_type === 'fleet')
      ? this.gameState.keyPlayers[playerType].fleet?.location_id
      : struct.location_id;

    if (this.gameState.alphaBaseMap.planet && onPlanet === this.gameState.alphaBaseMap.planet.id) {
      return this.gameState.alphaBaseMap.mapId;
    }

    if (this.gameState.raidMap.planet && onPlanet === this.gameState.raidMap.planet.id) {
      return this.gameState.raidMap.mapId;
    }

    return null;
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

/***/ "./js/models/Fleet.js"
/*!****************************!*\
  !*** ./js/models/Fleet.js ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Fleet: () => (/* binding */ Fleet)
/* harmony export */ });
class Fleet {
   constructor() {
     this.id = null;
     this.owner = null;
     this.map = null;
     this.space_slots = null;
     this.air_slots = null;
     this.land_slots = null;
     this.water_slots = null;
     this.location_type = null;
     this.location_id = null;
     this.status = null;
     this.location_list_forward = null;
     this.location_list_backward = null;
     this.command_struct = null;
     this.created_at = null;
     this.updated_at = null;
   }

  /**
   * @return {boolean}
   */
  isOnStation() {
    return this.status === 'onStation';
  }
}



/***/ },

/***/ "./js/models/KeyPlayer.js"
/*!********************************!*\
  !*** ./js/models/KeyPlayer.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KeyPlayer: () => (/* binding */ KeyPlayer)
/* harmony export */ });
/* harmony import */ var _dtos_PlanetaryShieldInfoDTO__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dtos/PlanetaryShieldInfoDTO */ "./js/dtos/PlanetaryShieldInfoDTO.js");
/* harmony import */ var _PlanetRaid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PlanetRaid */ "./js/models/PlanetRaid.js");
/* harmony import */ var _events_ChargeLevelChangedEvent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../events/ChargeLevelChangedEvent */ "./js/events/ChargeLevelChangedEvent.js");
/* harmony import */ var _util_ChargeCalculator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/ChargeCalculator */ "./js/util/ChargeCalculator.js");
/* harmony import */ var _events_SaveGameStateEvent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../events/SaveGameStateEvent */ "./js/events/SaveGameStateEvent.js");
/* harmony import */ var _events_StructCountChangedEvent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../events/StructCountChangedEvent */ "./js/events/StructCountChangedEvent.js");
/* harmony import */ var _Player__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Player */ "./js/models/Player.js");
/* harmony import */ var _events_AlphaCountChangedEvent__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../events/AlphaCountChangedEvent */ "./js/events/AlphaCountChangedEvent.js");
/* harmony import */ var _events_EnergyUsageChangedEvent__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../events/EnergyUsageChangedEvent */ "./js/events/EnergyUsageChangedEvent.js");
/* harmony import */ var _events_OreCountChangedEvent__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../events/OreCountChangedEvent */ "./js/events/OreCountChangedEvent.js");
/* harmony import */ var _util_DifficultyEstimator__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../util/DifficultyEstimator */ "./js/util/DifficultyEstimator.js");
/* harmony import */ var _events_ShieldHealthChangedEvent__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../events/ShieldHealthChangedEvent */ "./js/events/ShieldHealthChangedEvent.js");
/* harmony import */ var _events_UndiscoveredOreCountChangedEvent__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../events/UndiscoveredOreCountChangedEvent */ "./js/events/UndiscoveredOreCountChangedEvent.js");
/* harmony import */ var _events_PlanetRaidStatusChangedEvent__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../events/PlanetRaidStatusChangedEvent */ "./js/events/PlanetRaidStatusChangedEvent.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");
/* harmony import */ var _Fleet__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./Fleet */ "./js/models/Fleet.js");
/* harmony import */ var _events_TrackDestroyedStructsEvent__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../events/TrackDestroyedStructsEvent */ "./js/events/TrackDestroyedStructsEvent.js");
/* harmony import */ var _events_TrackDestroyedStructEvent__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../events/TrackDestroyedStructEvent */ "./js/events/TrackDestroyedStructEvent.js");
/* harmony import */ var _util_DateFormatter__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../util/DateFormatter */ "./js/util/DateFormatter.js");
/* harmony import */ var _events_RenderPlayerPfpEvent__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../events/RenderPlayerPfpEvent */ "./js/events/RenderPlayerPfpEvent.js");
/* harmony import */ var _events_FleetChangedEvent__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../events/FleetChangedEvent */ "./js/events/FleetChangedEvent.js");






















class KeyPlayer {

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

    this.chargeCalculator = new _util_ChargeCalculator__WEBPACK_IMPORTED_MODULE_3__.ChargeCalculator();
    this.difficultyEstimator = new _util_DifficultyEstimator__WEBPACK_IMPORTED_MODULE_10__.DifficultyEstimator();
    this.dateFormatter = new _util_DateFormatter__WEBPACK_IMPORTED_MODULE_18__.DateFormatter();

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
    this.planetShieldInfo = new _dtos_PlanetaryShieldInfoDTO__WEBPACK_IMPORTED_MODULE_0__.PlanetaryShieldInfoDTO();

    /** @type {PlanetRaid} */
    this.planetRaidInfo = new _PlanetRaid__WEBPACK_IMPORTED_MODULE_1__.PlanetRaid();

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

  setAlpha(alpha) {
    if (this.player && this.player.hasOwnProperty('alpha')) {
      this.player.alpha = parseInt(alpha);

      window.dispatchEvent(new _events_SaveGameStateEvent__WEBPACK_IMPORTED_MODULE_4__.SaveGameStateEvent());
      window.dispatchEvent(new _events_AlphaCountChangedEvent__WEBPACK_IMPORTED_MODULE_7__.AlphaCountChangedEvent(this.playerType));
    }
  }

  /**
   * @param {number} connectionCapacity
   */
  setConnectionCapacity(connectionCapacity) {
    if (this.player && this.player.hasOwnProperty('connection_capacity')) {
      this.player.connection_capacity = connectionCapacity;

      window.dispatchEvent(new _events_SaveGameStateEvent__WEBPACK_IMPORTED_MODULE_4__.SaveGameStateEvent());
      window.dispatchEvent(new _events_EnergyUsageChangedEvent__WEBPACK_IMPORTED_MODULE_8__.EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * @param {Fleet} fleet
   */
  setFleet(fleet) {
    this.fleet = fleet;

    window.dispatchEvent(new _events_FleetChangedEvent__WEBPACK_IMPORTED_MODULE_20__.FleetChangedEvent(this.playerType));
  }

  /**
   * @param {string} id
   */
  setId(id) {
    this.id = id;

    window.dispatchEvent(new _events_SaveGameStateEvent__WEBPACK_IMPORTED_MODULE_4__.SaveGameStateEvent());
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

    window.dispatchEvent(new _events_SaveGameStateEvent__WEBPACK_IMPORTED_MODULE_4__.SaveGameStateEvent());
    window.dispatchEvent(new _events_ChargeLevelChangedEvent__WEBPACK_IMPORTED_MODULE_2__.ChargeLevelChangedEvent(this.id, this.chargeLevel));
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

    window.dispatchEvent(new _events_SaveGameStateEvent__WEBPACK_IMPORTED_MODULE_4__.SaveGameStateEvent());
    window.dispatchEvent(new _events_ChargeLevelChangedEvent__WEBPACK_IMPORTED_MODULE_2__.ChargeLevelChangedEvent(this.id, this.chargeLevel));
  }

  /**
   * @param {number} load
   */
  setLoad(load) {
    if (this.player && this.player.hasOwnProperty('load')) {
      this.player.load = load;

      window.dispatchEvent(new _events_SaveGameStateEvent__WEBPACK_IMPORTED_MODULE_4__.SaveGameStateEvent());
      window.dispatchEvent(new _events_EnergyUsageChangedEvent__WEBPACK_IMPORTED_MODULE_8__.EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * @param {number|string} ore
   */
  setOre(ore) {
    if (this.player && this.player.hasOwnProperty('ore')) {
      this.player.ore = parseInt(ore);

      window.dispatchEvent(new _events_SaveGameStateEvent__WEBPACK_IMPORTED_MODULE_4__.SaveGameStateEvent());
      window.dispatchEvent(new _events_OreCountChangedEvent__WEBPACK_IMPORTED_MODULE_9__.OreCountChangedEvent(this.playerType));
    }
  }

  /**
   * @param {Planet} planet
   */
  setPlanet(planet) {
    this.planet = planet;

    window.dispatchEvent(new _events_UndiscoveredOreCountChangedEvent__WEBPACK_IMPORTED_MODULE_12__.UndiscoveredOreCountChangedEvent(this.playerType));
  }

  /**
   * @param {string} status
   * @param dispatchEvent
   */
  setPlanetRaidStatus(status, dispatchEvent = true) {
    this.planetRaidInfo.status = status;
    window.dispatchEvent(new _events_SaveGameStateEvent__WEBPACK_IMPORTED_MODULE_4__.SaveGameStateEvent());

    if (dispatchEvent) {
      window.dispatchEvent(new _events_PlanetRaidStatusChangedEvent__WEBPACK_IMPORTED_MODULE_13__.PlanetRaidStatusChangedEvent(this.playerType));
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

    window.dispatchEvent(new _events_ShieldHealthChangedEvent__WEBPACK_IMPORTED_MODULE_11__.ShieldHealthChangedEvent(this.playerType));
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

    window.dispatchEvent(new _events_AlphaCountChangedEvent__WEBPACK_IMPORTED_MODULE_7__.AlphaCountChangedEvent(this.playerType));
    window.dispatchEvent(new _events_EnergyUsageChangedEvent__WEBPACK_IMPORTED_MODULE_8__.EnergyUsageChangedEvent(this.playerType));
    window.dispatchEvent(new _events_OreCountChangedEvent__WEBPACK_IMPORTED_MODULE_9__.OreCountChangedEvent(this.playerType));
    window.dispatchEvent(new _events_RenderPlayerPfpEvent__WEBPACK_IMPORTED_MODULE_19__.RenderPlayerPfpEvent(this.playerType));
  }

  /**
   * @param {number} capacity
   */
  setPlayerCapacity(capacity) {
    if (this.player && this.player.hasOwnProperty('capacity')) {
      this.player.capacity = capacity;

      window.dispatchEvent(new _events_SaveGameStateEvent__WEBPACK_IMPORTED_MODULE_4__.SaveGameStateEvent());
      window.dispatchEvent(new _events_EnergyUsageChangedEvent__WEBPACK_IMPORTED_MODULE_8__.EnergyUsageChangedEvent(this.playerType));
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

    window.dispatchEvent(new _events_StructCountChangedEvent__WEBPACK_IMPORTED_MODULE_5__.StructCountChangedEvent(this.playerType));
    window.dispatchEvent(new _events_TrackDestroyedStructsEvent__WEBPACK_IMPORTED_MODULE_16__.TrackDestroyedStructsEvent(this.playerType));
  }

  /**
   * @param {number} structsLoad
   */
  setStructsLoad(structsLoad) {
    if (this.player && this.player.hasOwnProperty('structs_load')) {
      this.player.structs_load = structsLoad;

      window.dispatchEvent(new _events_SaveGameStateEvent__WEBPACK_IMPORTED_MODULE_4__.SaveGameStateEvent());
      window.dispatchEvent(new _events_EnergyUsageChangedEvent__WEBPACK_IMPORTED_MODULE_8__.EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * @param {Struct} struct
   */
  setStruct(struct) {
    this.structs[struct.id] = struct;

    window.dispatchEvent(new _events_StructCountChangedEvent__WEBPACK_IMPORTED_MODULE_5__.StructCountChangedEvent(this.playerType));
    window.dispatchEvent(new _events_TrackDestroyedStructEvent__WEBPACK_IMPORTED_MODULE_17__.TrackDestroyedStructEvent(this.playerType, struct.id));
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
    return this.playerType !== _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_14__.PLAYER_TYPES.PLAYER;
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


/***/ },

/***/ "./js/models/PfpClientRenderAttributes.js"
/*!************************************************!*\
  !*** ./js/models/PfpClientRenderAttributes.js ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PfpClientRenderAttributes: () => (/* binding */ PfpClientRenderAttributes)
/* harmony export */ });
class PfpClientRenderAttributes {

  /**
   * @param {number|null} head
   * @param {number|null} neck
   * @param {number|null} body
   * @param {number|null} arms
   * @param {number|null} background
   */
  constructor(
    head = null,
    neck = null,
    body = null,
    arms = null,
    background = null
  ) {
    this.head = head;
    this.neck = neck;
    this.body = body;
    this.arms = arms;
    this.background = background;
  }

  /**
   * Builds a PfpClientRenderAttributes instance from a JSON string, a plain
   * object, or null. Returns null when the input is empty or cannot be parsed.
   *
   * @param {string|object|null} value
   * @return {PfpClientRenderAttributes|null}
   */
  static fromJson(value) {
    if (value === null || value === undefined) {
      return null;
    }

    let obj = value;

    if (typeof value === 'string') {
      if (value.trim().length === 0) {
        return null;
      }
      try {
        obj = JSON.parse(value);
      } catch (e) {
        return null;
      }
    }

    if (!obj || typeof obj !== 'object') {
      return null;
    }

    return new PfpClientRenderAttributes(
      obj.head ?? null,
      obj.neck ?? null,
      obj.body ?? null,
      obj.arms ?? null,
      obj.background ?? null
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

/***/ "./js/models/Player.js"
/*!*****************************!*\
  !*** ./js/models/Player.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Player: () => (/* binding */ Player)
/* harmony export */ });
class Player {
  constructor() {
    this.id = null;
    this.primary_address = null;
    this.guild_id = null;
    this.substation_id = null;
    this.planet_id = null;
    this.fleet_id = null;
    this.username = null;
    this.pfp = null;
    this.pfp_client_render_attributes = null;
    this.guild_name = null;
    this.tag = null;
    this.alpha = null;
    this.ore = null;
    this.load = null;
    this.structs_load = null;
    this.capacity = null;
    this.connection_capacity = null;
  }

  /**
   * @return {string}
   */
  getTag() {
    return (this.tag && this.tag.length > 0) ? `[${this.tag}]` : '';
  }

  /**
   * @return {string}
   */
  getUsername() {
    return (this.username && this.username.length > 0) ? `${this.username}` : 'Name Redacted';
  }

  /**
   * @return {boolean}
   */
  isOverloaded() {
    const load = this.load ?? 0;
    const structsLoad = this.structs_load ?? 0;
    const capacity = this.capacity ?? 0;
    const connectionCapacity = this.connection_capacity ?? 0;

    let totalLoad = load + structsLoad;
    let totalCapacity = capacity + connectionCapacity;

    return totalLoad > totalCapacity;
  }
}

/***/ },

/***/ "./js/models/SigningTransaction.js"
/*!*****************************************!*\
  !*** ./js/models/SigningTransaction.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SigningTransaction: () => (/* binding */ SigningTransaction),
/* harmony export */   TX_STATUS: () => (/* binding */ TX_STATUS)
/* harmony export */ });
/* harmony import */ var _util_UuidUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/UuidUtil */ "./js/util/UuidUtil.js");


/**
 * Lifecycle states for a queued signing transaction.
 *
 * Retryable failures do NOT get a persistent `failed` status — they return to
 * `queued` (with `attempts` / `error` set) until they either `succeeded` or are
 * `dropped` (no retries left).
 *
 * @readonly
 * @enum {string}
 */
const TX_STATUS = {
  QUEUED: 'queued',
  IN_FLIGHT: 'in_flight',
  SUCCEEDED: 'succeeded',
  DROPPED: 'dropped',
  CANCELLED: 'cancelled',
};

/**
 * Terminal states — once a transaction reaches one of these it never moves again.
 *
 * @type {string[]}
 */
const TERMINAL_STATUSES = [TX_STATUS.SUCCEEDED, TX_STATUS.DROPPED, TX_STATUS.CANCELLED];

/**
 * Fields persisted to localStorage via {@link SigningTransaction#toJSON}. The
 * in-memory-only `msgResponses` snapshot is intentionally excluded (it can be
 * large and is rebuildable from chain), and there are no function fields to
 * strip (callbacks were removed in favour of the Promise + event model).
 *
 * @type {string[]}
 */
const PERSISTED_FIELDS = [
  'id',
  'message',
  'accountAddress',
  'isAction',
  'chargeCost',
  'status',
  'createdAt',
  'enqueuedAtBlock',
  'broadcastAtBlock',
  'attempts',
  'retryLimit',
  'response',
  'error',
];

/**
 * A single queued transaction tracked by SigningQueueManager.
 *
 * The cosmos message is stored as `{ typeUrl, payload }` where `payload` is a
 * plain, JSON-serializable object WITHOUT `creator`. The signing address is
 * injected at broadcast time from {@link SigningTransaction#accountAddress} so a
 * wallet switch mid-queue can never sign with the wrong key.
 */
class SigningTransaction {
  /**
   * @param {object} fields - Pre-validated field bag (see {@link SigningTransaction.create} / {@link SigningTransaction.fromJSON}).
   */
  constructor(fields) {
    /** @type {string} */
    this.id = fields.id;
    /** @type {{ typeUrl: string, payload: object }} */
    this.message = fields.message;
    /** @type {string} Owning signer address; persisted; used as `creator` at broadcast. */
    this.accountAddress = fields.accountAddress;
    /** @type {boolean} True when this tx belongs to the ordered action lane. */
    this.isAction = fields.isAction;
    /** @type {number|null} Charge gate for action-lane txs; 0 = ordered but free. */
    this.chargeCost = fields.chargeCost;
    /** @type {string} See {@link TX_STATUS}. */
    this.status = fields.status;
    /** @type {number} */
    this.createdAt = fields.createdAt;
    /** @type {number|null} */
    this.enqueuedAtBlock = fields.enqueuedAtBlock;
    /** @type {number|null} */
    this.broadcastAtBlock = fields.broadcastAtBlock;
    /** @type {number} */
    this.attempts = fields.attempts;
    /** @type {number} Per-tx retry policy: -1 infinite, 0 one-shot, n>0 up to 1+n attempts. */
    this.retryLimit = fields.retryLimit;
    /** @type {object|null} Serializable snapshot of the broadcast response. */
    this.response = fields.response;
    /** @type {string|null} */
    this.error = fields.error;
    /** @type {Array<object>|null} In-memory only; never persisted. */
    this.msgResponses = fields.msgResponses ?? null;
  }

  /**
   * Build a fresh transaction for enqueue.
   *
   * @param {object} args
   * @param {string} args.typeUrl
   * @param {object} args.payload - Plain JSON object, no `creator`.
   * @param {boolean} args.isAction - True for the ordered action lane.
   * @param {number|null} args.chargeCost - Charge gate; 0 = ordered but free.
   * @param {number} args.retryLimit
   * @param {string} args.accountAddress
   * @param {number} args.enqueuedAtBlock
   * @return {SigningTransaction}
   */
  static create({ typeUrl, payload, isAction, chargeCost, retryLimit, accountAddress, enqueuedAtBlock }) {
    return new SigningTransaction({
      id: _util_UuidUtil__WEBPACK_IMPORTED_MODULE_0__.UuidUtil.generate(),
      message: { typeUrl, payload },
      accountAddress,
      isAction: !!isAction,
      chargeCost: isAction ? chargeCost : null,
      status: TX_STATUS.QUEUED,
      createdAt: Date.now(),
      enqueuedAtBlock,
      broadcastAtBlock: null,
      attempts: 0,
      retryLimit,
      response: null,
      error: null,
      msgResponses: null,
    });
  }

  /**
   * Encode to a cosmjs-ready message. `creator` is injected here (broadcast
   * time) from {@link SigningTransaction#accountAddress}, never stored in the
   * persisted payload.
   *
   * @param {import('@cosmjs/proto-signing').Registry} registry
   * @return {{ typeUrl: string, value: object }}
   */
  toCosmosMsg(registry) {
    const type = registry.lookupType(this.message.typeUrl);
    if (!type) {
      throw new Error(`Unknown typeUrl in registry: ${this.message.typeUrl}`);
    }
    return {
      typeUrl: this.message.typeUrl,
      value: type.fromPartial({ ...this.message.payload, creator: this.accountAddress }),
    };
  }

  /**
   * @return {boolean}
   */
  isTerminal() {
    return TERMINAL_STATUSES.includes(this.status);
  }

  /**
   * Serializable snapshot — allowlisted fields only. Omits in-memory-only
   * `msgResponses`.
   *
   * @return {object}
   */
  toJSON() {
    const out = {};
    for (const field of PERSISTED_FIELDS) {
      out[field] = this[field];
    }
    return out;
  }

  /**
   * Rebuild from a persisted snapshot. Returns null if the object is missing
   * the structural fields needed to ever broadcast (caller quarantines).
   *
   * @param {object} obj
   * @return {SigningTransaction|null}
   */
  static fromJSON(obj) {
    if (
      !obj
      || typeof obj !== 'object'
      || typeof obj.id !== 'string'
      || !obj.message
      || typeof obj.message.typeUrl !== 'string'
      || typeof obj.message.payload !== 'object'
      || obj.message.payload === null
    ) {
      return null;
    }

    return new SigningTransaction({
      id: obj.id,
      message: { typeUrl: obj.message.typeUrl, payload: obj.message.payload },
      accountAddress: typeof obj.accountAddress === 'string' ? obj.accountAddress : null,
      isAction: !!obj.isAction,
      chargeCost: typeof obj.chargeCost === 'number' ? obj.chargeCost : null,
      status: typeof obj.status === 'string' ? obj.status : TX_STATUS.QUEUED,
      createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : Date.now(),
      enqueuedAtBlock: typeof obj.enqueuedAtBlock === 'number' ? obj.enqueuedAtBlock : null,
      broadcastAtBlock: typeof obj.broadcastAtBlock === 'number' ? obj.broadcastAtBlock : null,
      attempts: typeof obj.attempts === 'number' ? obj.attempts : 0,
      retryLimit: typeof obj.retryLimit === 'number' ? obj.retryLimit : 0,
      response: obj.response ?? null,
      error: typeof obj.error === 'string' ? obj.error : null,
      msgResponses: null,
    });
  }
}


/***/ },

/***/ "./js/models/Struct.js"
/*!*****************************!*\
  !*** ./js/models/Struct.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Struct: () => (/* binding */ Struct)
/* harmony export */ });
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/StructConstants */ "./js/constants/StructConstants.js");


class Struct {
  constructor() {
    /** @type {string|null} */
    this.id = null;

    /** @type {number|null} */
    this.index = null;

    /** @type {number|null} - FK to struct_type.id */
    this.type = null;

    /** @type {string|null} */
    this.creator = null;

    /** @type {string|null} - Player ID who owns this struct */
    this.owner = null;

    /** @type {string|null} - "fleet" or "planet" */
    this.location_type = null;

    /** @type {string|null} - Fleet ID or Planet ID */
    this.location_id = null;

    /** @type {string|null} - "space", "air", "land", "water" */
    this.operating_ambit = null;

    /** @type {number|null} */
    this.slot = null;

    /** @type {number|null} */
    this.health = null;

    /** @type {number|null} */
    this.status = null;

    /** @type {string|null} the ID of the struct that this struct is protecting => */
    this.protected_struct_id = null;

    /** @type {string[]} the IDs of the structs that are defending this struct <=> */
    this.defending_struct_ids = [];

    /** @type {number|null} */
    this.destroyed_block = null;

    /** @type {number|null} amount of alpha infused in the struct */
    this.fuel = null;
  }

  /**
   * @return {boolean}
   */
  isMaterialized() {
    return (this.status & _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STATUS_FLAGS.MATERIALIZED) > 0;
  }

  /**
   * @return {boolean}
   */
  isBuilt() {
    return (this.status & _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STATUS_FLAGS.BUILT) > 0;
  }

  /**
   * @return {boolean}
   */
  isOnline() {
    return (this.status & _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STATUS_FLAGS.ONLINE) > 0;
  }

  /**
   * @return {boolean}
   */
  isStored() {
    return (this.status & _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STATUS_FLAGS.STORED) > 0;
  }

  /**
   * @return {boolean}
   */
  isDefending() {
    return !!this.protected_struct_id;
  }

  /**
   * @return {boolean}
   */
  isDefended() {
    return this.defending_struct_ids.length > 0;
  }

  /**
   * @return {boolean}
   */
  isHidden() {
    return (this.status & _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STATUS_FLAGS.HIDDEN) > 0;
  }

  /**
   * @return {boolean}
   */
  isDestroyed() {
    return (this.status & _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STATUS_FLAGS.DESTROYED) > 0;
  }

  /**
   * @return {boolean}
   */
  isLocked() {
    return (this.status & _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STATUS_FLAGS.LOCKED) > 0;
  }

  /**
   * @param {number} flag see STRUCT_STATUS_FLAGS
   */
  addStatusFlag(flag) {
    this.status |= flag;
  }

  /**
   * @param {number} flag see STRUCT_STATUS_FLAGS
   */
  removeStatusFlag(flag) {
    this.status &= ~flag;
  }
}



/***/ },

/***/ "./js/models/StructType.js"
/*!*********************************!*\
  !*** ./js/models/StructType.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StructType: () => (/* binding */ StructType)
/* harmony export */ });
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/StructConstants */ "./js/constants/StructConstants.js");


class StructType {

  constructor() {
    this.id = null;
    this.type = null;

    /** @type {string|null} */
    this.category = null;

    this.build_limit = null;
    this.build_difficulty = null;
    this.build_draw = null;
    this.max_health = null;
    this.passive_draw = null;
    this.possible_ambit = null;
    this.movable = null;
    this.slot_bound = null;
    this.primary_weapon = null;
    this.primary_weapon_label = null;
    this.primary_weapon_description = null;
    this.primary_weapon_control = null;
    this.primary_weapon_charge = null;
    this.primary_weapon_ambits = null;
    this.primary_weapon_ambits_array = null;
    this.primary_weapon_targets = null;
    this.primary_weapon_shots = null;
    this.primary_weapon_damage = null;
    this.primary_weapon_blockable = null;
    this.primary_weapon_counterable = null;
    this.primary_weapon_recoil_damage = null;
    this.primary_weapon_shot_success_rate_numerator = null;
    this.primary_weapon_shot_success_rate_denominator = null;
    this.primary_weapon_armour_piercing = null;
    this.secondary_weapon = null;
    this.secondary_weapon_label = null;
    this.secondary_weapon_description = null;
    this.secondary_weapon_control = null;
    this.secondary_weapon_charge = null;
    this.secondary_weapon_ambits = null;
    this.secondary_weapon_ambits_array = null;
    this.secondary_weapon_targets = null;
    this.secondary_weapon_shots = null;
    this.secondary_weapon_damage = null;
    this.secondary_weapon_blockable = null;
    this.secondary_weapon_counterable = null;
    this.secondary_weapon_recoil_damage = null;
    this.secondary_weapon_shot_success_rate_numerator = null;
    this.secondary_weapon_shot_success_rate_denominator = null;
    this.secondary_weapon_armour_piercing = null;
    this.passive_weaponry = null;
    this.passive_weaponry_label = null;
    this.passive_weaponry_description = null;
    this.unit_defenses = null;
    this.unit_defenses_label = null;
    this.unit_defenses_description = null;
    this.ore_reserve_defenses = null;
    this.ore_reserve_defenses_label = null;
    this.ore_reserve_defenses_description = null;
    this.planetary_defenses = null;
    this.planetary_defenses_label = null;
    this.planetary_defenses_description = null;
    this.planetary_mining = null;
    this.planetary_mining_label = null;
    this.planetary_mining_description = null;
    this.planetary_refinery = null;
    this.planetary_refinery_label = null;
    this.planetary_refinery_description = null;
    this.power_generation = null;
    this.power_generation_label = null;
    this.power_generation_description = null;
    this.activate_charge = null;
    this.build_charge = null;
    this.defend_change_charge = null;
    this.move_charge = null;
    this.ore_mining_charge = null;
    this.ore_refining_charge = null;
    this.stealth_activate_charge = null;
    this.attack_reduction = null;
    this.attack_counterable = null;
    this.stealth_systems = null;
    this.counter_attack = null;
    this.counter_attack_same_ambit = null;
    this.post_destruction_damage = null;
    this.generating_rate = null;
    this.planetary_shield_contribution = null;
    this.ore_mining_difficulty = null;
    this.ore_refining_difficulty = null;
    this.unguided_defensive_success_rate_numerator = null;
    this.unguided_defensive_success_rate_denominator = null;
    this.guided_defensive_success_rate_numerator = null;
    this.guided_defensive_success_rate_denominator = null;
    this.trigger_raid_defeat_by_destruction = null;
    this.updated_at = null;
    this.possible_ambit_array = null;
    this.is_command = null;
    this.drive_label = null;
    this.drive_description = null;
    this['class'] = null;
    this.class_abbreviation = null;
    this.default_cosmetic_model_number = null;
    this.default_cosmetic_name = null;
  }

  /**
   * Checks if the struct type has a primary weapon.
   * @return {boolean}
   */
  hasPrimaryWeapon() {
    return this.primary_weapon
      && this.primary_weapon !== _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_PRIMARY_WEAPON.NO_ACTIVE_WEAPONRY;
  }

  /**
   * Checks if the struct type has a secondary weapon.
   * @return {boolean}
   */
  hasSecondaryWeapon() {
    return this.secondary_weapon
      && this.secondary_weapon !== _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_SECONDARY_WEAPON.NO_ACTIVE_WEAPONRY;
  }

  /**
   * Checks if the struct type has passive weaponry.
   * @return {boolean}
   */
  hasPassiveWeaponry() {
    return this.passive_weaponry
      && this.passive_weaponry !== _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_PASSIVE_WEAPONRY.NO_PASSIVE_WEAPONRY;
  }

  /**
   * Checks if the struct type has unit defenses.
   * @return {boolean}
   */
  hasUnitDefenses() {
    return this.unit_defenses
      && this.unit_defenses !== _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_UNIT_DEFENSES.NO_UNIT_DEFENSES;
  }

  /**
   * Checks if the struct type has ore reserve defenses.
   * @return {boolean}
   */
  hasOreReserveDefenses() {
    return this.ore_reserve_defenses
      && this.ore_reserve_defenses !== _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_ORE_RESERVE_DEFENSES.NO_ORE_RESERVE_DEFENSES;
  }

  /**
   * Checks if the struct type has planetary defenses.
   * @return {boolean}
   */
  hasPlanetaryDefenses() {
    return this.planetary_defenses
      && this.planetary_defenses !== _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_PLANETARY_DEFENSES.NO_PLANETARY_DEFENSE;
  }

  /**
   * Checks if the struct type has planetary mining capability.
   * @return {boolean}
   */
  hasPlanetaryMining() {
    return this.planetary_mining
      && this.planetary_mining !== _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_PLANETARY_MINING.NO_PLANETARY_MINING;
  }

  /**
   * Checks if the struct type has planetary refinery capability.
   * @return {boolean}
   */
  hasPlanetaryRefinery() {
    return this.planetary_refinery
      && this.planetary_refinery !== _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_PLANETARY_REFINERY.NO_PLANETARY_REFINERY;
  }

  /**
   * Checks if the struct type has power generation capability.
   * @return {boolean}
   */
  hasPowerGeneration() {
    return this.power_generation
      && this.power_generation !== _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_POWER_GENERATION.NO_POWER_GENERATION;
  }

  /**
   * Checks if the struct type has the ability to move.
   * @return {boolean}
   */
  isMovable() {
    return this.movable;
  }

  /**
   * Checks if the struct type has defensive maneuver capability.
   * @return {boolean}
   */
  hasDefensiveManeuver() {
    return this.unit_defenses
      && this.unit_defenses === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_UNIT_DEFENSES.DEFENSIVE_MANEUVER;
  }

  /**
   * Checks if the struct type has signal jamming capability.
   * @return {boolean}
   */
  hasSignalJamming() {
    return this.unit_defenses
      && this.unit_defenses === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_UNIT_DEFENSES.SIGNAL_JAMMING;
  }

  /**
   * Checks if the struct type has low orbit ballistic interceptor network capability.
   * @return {boolean}
   */
  hasLowOrbitBallisticInterceptorNetwork() {
    return this.planetary_defenses
      && this.planetary_defenses === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_PLANETARY_DEFENSES.LOW_ORBIT_BALLISTIC_INTERCEPTOR_NETWORK;
  }

  /**
   * Checks if the struct type has an associated active loop animation that runs while it is online.
   * @return {boolean}
   */
  hasActiveLoopAnimation() {
    return this.hasPlanetaryMining()
      || this.hasPlanetaryRefinery()
      || this.hasPowerGeneration()
      || this.type === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_TYPES.ORBITAL_SHIELD_GENERATOR
      || this.type === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_TYPES.ORE_BUNKER
      || this.type === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_TYPES.JAMMING_SATELLITE;
  }
}

/***/ },

/***/ "./js/models/StructTypeArtSet.js"
/*!***************************************!*\
  !*** ./js/models/StructTypeArtSet.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StructTypeArtSet: () => (/* binding */ StructTypeArtSet)
/* harmony export */ });
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/StructConstants */ "./js/constants/StructConstants.js");


class StructTypeArtSet {
  constructor(structType) {
    this.structType = structType;
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_HIDDEN] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.PASSIVE_WEAPONRY] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.UNIT_DEFENSES] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.ORE_RESERVE_DEFENSES] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.PLANETARY_DEFENSES] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.PLANETARY_MINING] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.PLANETARY_REFINERY] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_EQUIPMENT.POWER_GENERATION] = '';
    this[_constants_StructConstants__WEBPACK_IMPORTED_MODULE_0__.STRUCT_WATER_RIPPLE] = '';
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

/***/ "./js/sui/SUI.js"
/*!***********************!*\
  !*** ./js/sui/SUI.js ***!
  \***********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SUI: () => (/* binding */ SUI)
/* harmony export */ });
/* harmony import */ var _SUIInputStepper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SUIInputStepper.js */ "./js/sui/SUIInputStepper.js");
/* harmony import */ var _SUITooltip_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SUITooltip.js */ "./js/sui/SUITooltip.js");
/* harmony import */ var _SUICheatsheet_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SUICheatsheet.js */ "./js/sui/SUICheatsheet.js");
/* harmony import */ var _SUIOffcanvas__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./SUIOffcanvas */ "./js/sui/SUIOffcanvas.js");





class SUI {

  constructor() {
    this.inputStepper = new _SUIInputStepper_js__WEBPACK_IMPORTED_MODULE_0__.SUIInputStepper();
    this.tooltip = new _SUITooltip_js__WEBPACK_IMPORTED_MODULE_1__.SUITooltip();
    this.cheatsheet = new _SUICheatsheet_js__WEBPACK_IMPORTED_MODULE_2__.SUICheatsheet();
    this.offcanvas = new _SUIOffcanvas__WEBPACK_IMPORTED_MODULE_3__.SUIOffcanvas();

    this.autoInitClasses = [
      this.inputStepper,
      this.tooltip,
      this.cheatsheet,
      this.offcanvas
    ];
  }

  /**
   * Auto initialize all SUI features
   */
  autoInitAll() {
    this.autoInitClasses.forEach(suiFeature => {
      suiFeature.autoInitAll();
    });
  }

}


/***/ },

/***/ "./js/sui/SUICheatsheet.js"
/*!*********************************!*\
  !*** ./js/sui/SUICheatsheet.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SUICheatsheet: () => (/* binding */ SUICheatsheet)
/* harmony export */ });
/* harmony import */ var _SUIFeature_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SUIFeature.js */ "./js/sui/SUIFeature.js");
/* harmony import */ var _SUIUtil_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SUIUtil.js */ "./js/sui/SUIUtil.js");



class SUICheatsheet extends _SUIFeature_js__WEBPACK_IMPORTED_MODULE_0__.SUIFeature {

  /**
   * Used to track how long the mouse or touch screen is pressed.
   *
   * @type {number|null} a timeout ID
   */
  static pointerPressedTimer = null;

  /**
   * Set to true once the long-press timer fires and the cheatsheet is
   * actually shown. Used to suppress the synthetic `click` event that
   * browsers fire on release, so that releasing a long-press is not
   * treated as a click on the underlying element (e.g. an action bar
   * button).
   *
   * @type {boolean}
   */
  static cheatsheetWasShown = false;

  static OPEN_DELAY = 500;

  constructor() {
    super();
    this.util = new _SUIUtil_js__WEBPACK_IMPORTED_MODULE_1__.SUIUtil();
    this.suiThemes = [
      'sui-theme-player',
      'sui-theme-enemy',
      'sui-theme-neutral'
    ];

    /** @type {SUICheatsheetContentBuilder} */
    this.contentBuilder = null;
  }

  /**
   * @param {SUICheatsheetContentBuilder} contentBuilder
   */
  setContentBuilder(contentBuilder) {
    this.contentBuilder = contentBuilder;
  }

  /**
   * @param {HTMLElement} cheatsheetElm
   */
  clearPointerPressedTimer(cheatsheetElm) {

    // If there is an existing cheatsheet, remove it.
    if (cheatsheetElm.parentElement) {
      cheatsheetElm.parentElement.removeChild(cheatsheetElm);
    }

    clearTimeout(SUICheatsheet.pointerPressedTimer);
  }

  /**
   * @param {HTMLElement} cheatsheetElm
   * @param {HTMLElement} cheatsheetTriggerElm
   */
  pointerPressed(cheatsheetElm, cheatsheetTriggerElm) {
    clearTimeout(SUICheatsheet.pointerPressedTimer);
    SUICheatsheet.cheatsheetWasShown = false;

    // If there is an existing cheatsheet, remove it.
    if (cheatsheetElm.parentElement) {
      cheatsheetElm.parentElement.removeChild(cheatsheetElm);
    }

    SUICheatsheet.pointerPressedTimer = setTimeout(function() {

      this.suiThemes.forEach(themeClass => {
        cheatsheetElm.classList.remove(themeClass);
      });

      if (cheatsheetTriggerElm.dataset.suiTheme) {
        cheatsheetElm.classList.add(`sui-theme-${cheatsheetTriggerElm.dataset.suiTheme}`);
      } else {
        cheatsheetElm.classList.add(this.suiThemes[0]);
      }

      // Append to body so cheatsheet is not clipped by ancestor overflow
      document.body.appendChild(cheatsheetElm);

      // Use the triggering elements data attribute as key to which cheatsheet to show.
      cheatsheetElm.innerHTML = this.contentBuilder.build({...cheatsheetTriggerElm.dataset});

      // Get viewport-relative coordinates for fixed positioning
      const triggerRect = cheatsheetTriggerElm.getBoundingClientRect();

      // Position cheatsheet in best fitting location (tries: top, right, bottom, left)
      this.util.positionBestFitFixed(cheatsheetElm, triggerRect);

      SUICheatsheet.cheatsheetWasShown = true;

    }.bind(this), SUICheatsheet.OPEN_DELAY);
  }

  /**
   * Initialize all cheatsheets on the page.
   */
  autoInitAll() {

    const cheatsheetElm = document.createElement('div');
    cheatsheetElm.id = `sui-cheatsheet-container`;
    cheatsheetElm.classList.add('sui-cheatsheet');
    cheatsheetElm.style.position = 'fixed';

    let pressedEvent = 'mousedown';
    let releasedEvent = 'mouseup';

    if (window.matchMedia("(pointer: coarse)").matches) {
      pressedEvent = 'touchstart';
      releasedEvent = 'touchend';

      // Press and hold on mobile also fires a contextmenu event which we need to block
      // because it can obscure the cheatsheet and also cause inadvertent actions.
      document.body.addEventListener('contextmenu', (e) => {
        if (e.target.closest('[data-sui-cheatsheet]')) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    document.body.addEventListener(pressedEvent, function (e) {
      const cheatsheetTriggerElm = e.target.closest('[data-sui-cheatsheet]');
      if (cheatsheetTriggerElm) {
        this.pointerPressed(cheatsheetElm, cheatsheetTriggerElm);
      }
    }.bind(this), { passive: true });

    // Suppress the synthetic `click` event that follows the release of a
    // long-press, so that long-pressing an element to view its cheatsheet
    // does not also trigger that element's click handler. Capture phase is
    // used so we run before any handler attached directly to the trigger.
    document.body.addEventListener('click', function (e) {
      if (
        SUICheatsheet.cheatsheetWasShown
        && e.target.closest('[data-sui-cheatsheet]')
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Clear immediately on the success path so a subsequent quick
        // click on the same (or another) trigger is not also suppressed.
        SUICheatsheet.cheatsheetWasShown = false;
      }
    }, true);

    window.addEventListener(releasedEvent, function () {
      this.clearPointerPressedTimer(cheatsheetElm);
      // Fallback flag-clear in case no synthetic `click` follows the
      // release (e.g. touchcancel, user dragged off the trigger, or the
      // browser otherwise does not dispatch a click). The delay is long
      // enough to outlast platform synthetic-click latency (historically
      // up to ~300ms on touch) but short enough not to interfere with a
      // subsequent intentional tap.
      setTimeout(() => {
        SUICheatsheet.cheatsheetWasShown = false;
      }, 350);
    }.bind(this), { passive: true });
  }
}


/***/ },

/***/ "./js/sui/SUIFeature.js"
/*!******************************!*\
  !*** ./js/sui/SUIFeature.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SUIFeature: () => (/* binding */ SUIFeature)
/* harmony export */ });
/* harmony import */ var _SUINotImplementedError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SUINotImplementedError.js */ "./js/sui/SUINotImplementedError.js");


class SUIFeature {

  /**
   * Auto initialize feature
   */
  autoInitAll() {
    throw new _SUINotImplementedError_js__WEBPACK_IMPORTED_MODULE_0__.SUINotImplementedError();
  }

}


/***/ },

/***/ "./js/sui/SUIInputStepper.js"
/*!***********************************!*\
  !*** ./js/sui/SUIInputStepper.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SUIInputStepper: () => (/* binding */ SUIInputStepper)
/* harmony export */ });
/* harmony import */ var _SUIFeature_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SUIFeature.js */ "./js/sui/SUIFeature.js");


class SUIInputStepper extends _SUIFeature_js__WEBPACK_IMPORTED_MODULE_0__.SUIFeature {

  /**
   * Ensure that the number is a number between the min or max value or the empty string.
   *
   * @param {string|number} value
   * @param {number} min
   * @param {number} max
   * @return {number|string}
   */
  filterNumberInput(value, min, max) {
    let cleanValue = `${value}`.replace(/^[^0-9]*$/, '');

    if (cleanValue === '') {
      return cleanValue;
    }

    cleanValue = parseInt(cleanValue);
    cleanValue = Math.max(cleanValue, min);
    cleanValue = Math.min(cleanValue, max);

    return cleanValue;
  }

  /**
   * Initialize all input steppers on the page.
   */
  autoInitAll() {
    let inputSteppers = document.querySelectorAll('.sui-input-stepper input[type=number]');

    if (inputSteppers.length === 0) {
      return;
    }

    inputSteppers.forEach(inputStepper => {
      const decreaseBtn = inputStepper.previousElementSibling;
      const increaseBtn = inputStepper.nextElementSibling;

      const enableDisableButtons = () => {
        decreaseBtn.disabled = inputStepper.disabled || (inputStepper.value <= inputStepper.min);
        increaseBtn.disabled = inputStepper.disabled || (inputStepper.value >= inputStepper.max);
      };

      decreaseBtn.addEventListener('click', function(event) {
        event.preventDefault();
        inputStepper.stepDown();
        enableDisableButtons();
      });

      increaseBtn.addEventListener('click', function(event) {
        event.preventDefault();
        inputStepper.stepUp();
        enableDisableButtons();
      });

      inputStepper.addEventListener('input', function() {
        inputStepper.value = this.filterNumberInput(inputStepper.value, inputStepper.min, inputStepper.max);
        enableDisableButtons();
      }.bind(this));

      enableDisableButtons();
    });
  }
}


/***/ },

/***/ "./js/sui/SUINotImplementedError.js"
/*!******************************************!*\
  !*** ./js/sui/SUINotImplementedError.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SUINotImplementedError: () => (/* binding */ SUINotImplementedError)
/* harmony export */ });
class SUINotImplementedError extends Error {

  /**
   * @param {string} message
   */
  constructor(message= '') {
    super(message);
    this.name = "SUINotImplementedError";
    this.message = message ? message : 'Method not implemented';
  }
}


/***/ },

/***/ "./js/sui/SUIOffcanvas.js"
/*!********************************!*\
  !*** ./js/sui/SUIOffcanvas.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SUIOffcanvas: () => (/* binding */ SUIOffcanvas)
/* harmony export */ });
/* harmony import */ var _SUIFeature_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SUIFeature.js */ "./js/sui/SUIFeature.js");


class SUIOffcanvas extends _SUIFeature_js__WEBPACK_IMPORTED_MODULE_0__.SUIFeature {

  constructor() {
    super();

    this.offcanvasElm = null;
    this.placement = 'left';
    this.theme = 'player';
    this.narrow = 'narrow';

    // Closes the offcanvas when a click occurs outside of it. Bound here so
    // the same reference can be added/removed from the document listener.
    this.handleOutsideClick = (e) => {
      if (this.offcanvasElm && !this.offcanvasElm.contains(e.target)) {
        this.close();
      }
    };
  }

  setPlacement(placement) {
    this.placement = placement;
    this.offcanvasElm.classList.remove(`sui-mod-${this.placement}`);
    this.offcanvasElm.classList.add(`sui-mod-${this.placement}`);
  }

  setTheme(theme) {
    this.theme = theme;
    this.offcanvasElm.classList.remove(`sui-theme-${this.theme}`);
    this.offcanvasElm.classList.add(`sui-theme-${this.theme}`);
  }

  hide() {
    this.offcanvasElm.classList.add('hidden');
    this.offcanvasElm.classList.remove(`sui-mod-${this.narrow}`);
  }

  unhide() {
    this.offcanvasElm.classList.remove('hidden');
    this.offcanvasElm.classList.remove(`sui-mod-${this.narrow}`);
  }

  open(qualitativeWidth = '') {
    this.unhide();

    if (qualitativeWidth) {
      this.offcanvasElm.classList.add(`sui-mod-${this[qualitativeWidth]}`);
    }

    // Defer attaching so the click that triggered open() does not bubble up
    // to the document listener and immediately close the offcanvas. The
    // browser de-duplicates identical (listener, options) pairs, so repeated
    // open() calls remain safe.
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
    }, 0);
  }

  close() {
    this.hide();
    document.removeEventListener('click', this.handleOutsideClick);
  }

  setHeader(header) {
    this.offcanvasElm.querySelector('.sui-offcanvas-header').innerHTML = header;
  }

  setContent(content) {
    this.offcanvasElm.querySelector('.sui-offcanvas-body').innerHTML = content;
  }

  renderOffcanvasInnerHTML() {
    return `
      <div class="sui-panel-edge-left"></div>
      <div class="sui-panel-chunk sui-mod-grow sui-mod-shrink">
  
          <!-- Nav Start -->
  
          <div class="sui-screen sui-screen-full-width">
              <div class="sui-screen-nav">
                  <div class="sui-screen-nav-items">
                      <div class="sui-offcanvas-header sui-screen-nav-item sui-mod-header">HEADER</div>
                  </div>
                  <a class="sui-offcanvas-close-btn sui-screen-nav-close" href="javascript: void(0)">
                      <i class="sui-icon-sm icon-close"></i>
                  </a>
              </div>
          </div>
  
          <!-- Nav End -->
  
          <!-- Page Screen Body Start -->
  
          <div class="height-100 sui-screen sui-screen-full-width sui-screen-shrink">
              <div class="height-100 sui-page-body-screen">
                  <div class="sui-page-body-screen-content">
  
                      <!-- Screen Body Start -->
  
                      <div class="sui-offcanvas-body sui-screen-body">
  
                          <!-- Content Goes Here -->
  
                      </div>
  
                      <!-- Screen Body End -->
  
                  </div>
              </div>
          </div>
  
          <!-- Page Screen Body End -->
  
      </div>
      <div class="sui-panel-edge-right"></div>
    `;
  }

  /**
   * Initialize the offcanvas element. There can only be one offcanvas at a time.
   */
  autoInitAll() {

    this.offcanvasElm = document.createElement('div');
    this.offcanvasElm.id = `sui-offcanvas`;
    this.hide();
    this.offcanvasElm.classList.add('sui-panel');
    this.setPlacement(this.placement);
    this.setTheme(this.theme);
    this.offcanvasElm.innerHTML = this.renderOffcanvasInnerHTML();

    document.body.appendChild(this.offcanvasElm);

    if (this.offcanvasElm) {
      this.offcanvasElm.querySelector('.sui-offcanvas-close-btn').addEventListener('click', () => {
        this.close();
      });
    }

  }
}


/***/ },

/***/ "./js/sui/SUITooltip.js"
/*!******************************!*\
  !*** ./js/sui/SUITooltip.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SUITooltip: () => (/* binding */ SUITooltip)
/* harmony export */ });
/* harmony import */ var _SUIFeature_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SUIFeature.js */ "./js/sui/SUIFeature.js");
/* harmony import */ var _SUIUtil_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SUIUtil.js */ "./js/sui/SUIUtil.js");



class SUITooltip extends _SUIFeature_js__WEBPACK_IMPORTED_MODULE_0__.SUIFeature {

  /**
   * Used to track how long the mouse or touch screen is pressed.
   *
   * @type {number|null} a timeout ID
   */
  static pointerPressedTimer = null;

  constructor() {
    super();
    this.util = new _SUIUtil_js__WEBPACK_IMPORTED_MODULE_1__.SUIUtil();
  }

  /**
   * @param {HTMLElement} tooltipHtmlElement
   */
  clearPointerPressedTimer(tooltipHtmlElement) {
    tooltipHtmlElement.classList.remove('sui-mod-show');

    // If there is an existing tooltip, remove it.
    if (tooltipHtmlElement.parentElement) {
      tooltipHtmlElement.parentElement.removeChild(tooltipHtmlElement);
    }

    clearTimeout(SUITooltip.pointerPressedTimer);
  }

  /**
   * @param {HTMLElement} tooltipElm
   * @param {HTMLElement} tooltipTriggerElm
   */
  pointerPressed(tooltipElm, tooltipTriggerElm) {
    clearTimeout(SUITooltip.pointerPressedTimer);

    // If there is an existing tooltip, remove it.
    if (tooltipElm.parentElement) {
      tooltipElm.parentElement.removeChild(tooltipElm);
    }

    SUITooltip.pointerPressedTimer = setTimeout(function() {

      // To position the tooltip the parent also must have position defined.
      const parentStyle = getComputedStyle(tooltipTriggerElm.parentElement);
      if (parentStyle.getPropertyValue('position') === 'static') {
        tooltipTriggerElm.parentElement.style.position = 'relative';
      }

      // Add the tooltip to the triggering element's parent, so that the tool tip stays relative to the target.
      tooltipTriggerElm.parentElement.appendChild(tooltipElm);

      // Set the tooltip content based on the triggering elements data attribute
      tooltipElm.innerHTML = tooltipTriggerElm.dataset.suiTooltip;

      // Show the tool tip
      tooltipElm.classList.add('sui-mod-show');

      this.util.horizontallyCenter(tooltipElm, tooltipTriggerElm);

      if (tooltipTriggerElm.dataset.suiModPlacement === 'bottom') {
        this.util.positionBelow(tooltipElm, tooltipTriggerElm);
      } else {
        this.util.positionAbove(tooltipElm, tooltipTriggerElm);
      }

    }.bind(this), 100);
  }

  /**
   * Initialize all tooltips on the page.
   */
  autoInitAll() {

    const tooltipElm = document.createElement('div');
    tooltipElm.id = `sui-tooltip-container`;
    tooltipElm.classList.add('sui-tooltip');
    tooltipElm.style.position = 'absolute';

    let pressedEvent = 'mousedown';
    let releasedEvent = 'mouseup';

    if (window.matchMedia("(pointer: coarse)").matches) {
      pressedEvent = 'touchstart';
      releasedEvent = 'touchend';

      // Press and hold on mobile also fires a contextmenu event which we need to block
      // because it can obscure the tooltip and also cause inadvertent actions.
      document.body.addEventListener('contextmenu', (e) => {
        if (
          e.target.matches('[data-sui-tooltip]')
          || e.target.parentElement.matches('[data-sui-tooltip]')
        ) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    document.body.addEventListener(pressedEvent, function (e) {
      if (e.target.matches('[data-sui-tooltip]')) {
        this.pointerPressed(tooltipElm, e.target);
      }
      if (e.target.parentElement.matches('[data-sui-tooltip]')) {
        this.pointerPressed(tooltipElm, e.target.parentElement);
      }

    }.bind(this), { passive: true });

    window.addEventListener(releasedEvent, function () {
      this.clearPointerPressedTimer(tooltipElm);
    }.bind(this), { passive: true });
  }
}


/***/ },

/***/ "./js/sui/SUIUtil.js"
/*!***************************!*\
  !*** ./js/sui/SUIUtil.js ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SUIUtil: () => (/* binding */ SUIUtil)
/* harmony export */ });
class SUIUtil {
  /**
   * @param {HTMLElement} dynamicElm
   * @param {HTMLElement} originElm
   */
  positionAbove(dynamicElm, originElm) {
    const originRect = originElm.getBoundingClientRect();

    // If dynamic element would end up offscreen, place it below
    if (
      originRect.top < dynamicElm.offsetHeight
      && (window.innerHeight - originRect.bottom) >= dynamicElm.offsetHeight
    ) {
      this.positionBelow(dynamicElm, originElm);
    } else {
      dynamicElm.style.top = `${originElm.offsetTop - dynamicElm.offsetHeight}px`;
    }
  }

  /**
   * @param {HTMLElement} dynamicElm
   * @param {HTMLElement} originElm
   */
  positionBelow(dynamicElm, originElm) {
    const originRect = originElm.getBoundingClientRect();

    // If dynamic element would end up offscreen, place it above
    if (
      (window.innerHeight - originRect.bottom) < dynamicElm.offsetHeight
      && originRect.top > dynamicElm.offsetHeight
    ) {
      this.positionAbove(dynamicElm, originElm);
    } else {
      dynamicElm.style.top = `${originElm.offsetTop + originElm.offsetHeight}px`;
    }
  }

  /**
   * @param {HTMLElement} dynamicElm
   * @param {HTMLElement} originElm
   */
  horizontallyCenter(dynamicElm, originElm) {
    const originRect = originElm.getBoundingClientRect();

    // If the dynamic element will go offscreen on the left,
    // align the dynamic element up to the left edge.
    if (originRect.left - (originElm.offsetWidth / 2) < dynamicElm.offsetWidth / 2) {
      dynamicElm.style.left = `${originElm.offsetLeft}px`;

    // If the dynamic element will go offscreen on the right,
    // align the dynamic element up to the right edge.
    } else if ((originElm.offsetWidth / 2) + (window.innerWidth - originRect.right) < dynamicElm.offsetWidth / 2) {
      dynamicElm.style.left = `${(originElm.offsetLeft + originElm.offsetWidth) - dynamicElm.offsetWidth}px`;

    } else {
      dynamicElm.style.left = `${originElm.offsetLeft - (dynamicElm.offsetWidth - originElm.offsetWidth) / 2}px`;
    }
  }

  /**
   * Read the effective uniform scale factor from an element's computed
   * `transform`. Returns 1 when no transform is applied (or it can't be parsed).
   *
   * The cheatsheet (and similar elements) opt in to viewport scaling via media
   * queries that apply `transform: scale(N)`. Their `style.top`/`style.left`
   * stay in unscaled (logical) pixel space, so positioning math has to use the
   * post-scale visual size to land correctly.
   *
   * @param {HTMLElement} elm
   * @return {number}
   */
  getEffectiveScale(elm) {
    const transform = window.getComputedStyle(elm).transform;
    if (!transform || transform === 'none') {
      return 1;
    }
    const match = transform.match(/matrix\(\s*([^,)]+)/);
    if (!match) {
      return 1;
    }
    const scale = parseFloat(match[1]);
    return Number.isFinite(scale) && scale > 0 ? scale : 1;
  }

  /**
   * Position element above the origin using fixed positioning (viewport-relative).
   * Falls back to below if there's not enough space above.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  positionAboveFixed(dynamicElm, originRect, scale = 1) {
    const visualHeight = dynamicElm.offsetHeight * scale;

    // If dynamic element would go offscreen above, place it below instead
    if (
      originRect.top < visualHeight
      && (window.innerHeight - originRect.bottom) >= visualHeight
    ) {
      this.positionBelowFixed(dynamicElm, originRect, scale);
    } else {
      dynamicElm.style.top = `${originRect.top - visualHeight}px`;
    }
  }

  /**
   * Position element below the origin using fixed positioning (viewport-relative).
   * Falls back to above if there's not enough space below.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  positionBelowFixed(dynamicElm, originRect, scale = 1) {
    const visualHeight = dynamicElm.offsetHeight * scale;

    // If dynamic element would go offscreen below, place it above instead
    if (
      (window.innerHeight - originRect.bottom) < visualHeight
      && originRect.top > visualHeight
    ) {
      this.positionAboveFixed(dynamicElm, originRect, scale);
    } else {
      dynamicElm.style.top = `${originRect.bottom}px`;
    }
  }

  /**
   * Horizontally center element relative to origin using fixed positioning (viewport-relative).
   * Adjusts to keep element within viewport bounds.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  horizontallyCenterFixed(dynamicElm, originRect, scale = 1) {
    const visualWidth = dynamicElm.offsetWidth * scale;
    const originCenterX = originRect.left + (originRect.width / 2);
    let leftPos = originCenterX - (visualWidth / 2);

    // If element would go offscreen on the left, align to left edge
    if (leftPos < 0) {
      leftPos = originRect.left;

    // If element would go offscreen on the right, align to right edge
    } else if (leftPos + visualWidth > window.innerWidth) {
      leftPos = originRect.right - visualWidth;
    }

    dynamicElm.style.left = `${leftPos}px`;
  }

  /**
   * Vertically center element relative to origin using fixed positioning (viewport-relative).
   * Adjusts to keep element within viewport bounds.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  verticallyCenterFixed(dynamicElm, originRect, scale = 1) {
    const visualHeight = dynamicElm.offsetHeight * scale;
    const originCenterY = originRect.top + (originRect.height / 2);
    let topPos = originCenterY - (visualHeight / 2);

    // If element would go offscreen on the top, align to top edge
    if (topPos < 0) {
      topPos = 0;

    // If element would go offscreen on the bottom, align to bottom edge
    } else if (topPos + visualHeight > window.innerHeight) {
      topPos = window.innerHeight - visualHeight;
    }

    dynamicElm.style.top = `${topPos}px`;
  }

  /**
   * Position element to the right of the origin using fixed positioning (viewport-relative).
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  positionRightFixed(dynamicElm, originRect, scale = 1) {
    dynamicElm.style.left = `${originRect.right}px`;
    this.verticallyCenterFixed(dynamicElm, originRect, scale);
  }

  /**
   * Position element to the left of the origin using fixed positioning (viewport-relative).
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  positionLeftFixed(dynamicElm, originRect, scale = 1) {
    const visualWidth = dynamicElm.offsetWidth * scale;
    dynamicElm.style.left = `${originRect.left - visualWidth}px`;
    this.verticallyCenterFixed(dynamicElm, originRect, scale);
  }

  /**
   * Position element in the best fitting position relative to origin.
   * Tries positions in order: top, right, bottom, left.
   * Falls back to the side with the most available space.
   *
   * If `scale` is omitted it is read from the element's computed transform so
   * the math accounts for any media-query driven scaling applied to dynamicElm.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale] visual scale factor applied to dynamicElm
   */
  positionBestFitFixed(dynamicElm, originRect, scale) {
    if (scale === undefined) {
      scale = this.getEffectiveScale(dynamicElm);
    }

    const visualWidth = dynamicElm.offsetWidth * scale;
    const visualHeight = dynamicElm.offsetHeight * scale;

    // Calculate available space on each side
    const spaceTop = originRect.top;
    const spaceRight = window.innerWidth - originRect.right;
    const spaceBottom = window.innerHeight - originRect.bottom;
    const spaceLeft = originRect.left;

    // Check if element fits on each side (in order: top, right, bottom, left)
    const fitsTop = spaceTop >= visualHeight;
    const fitsRight = spaceRight >= visualWidth;
    const fitsBottom = spaceBottom >= visualHeight;
    const fitsLeft = spaceLeft >= visualWidth;

    // Try positions in order: top, right, bottom, left
    if (fitsTop) {
      dynamicElm.style.top = `${originRect.top - visualHeight}px`;
      this.horizontallyCenterFixed(dynamicElm, originRect, scale);
      return;
    }

    if (fitsRight) {
      this.positionRightFixed(dynamicElm, originRect, scale);
      return;
    }

    if (fitsBottom) {
      dynamicElm.style.top = `${originRect.bottom}px`;
      this.horizontallyCenterFixed(dynamicElm, originRect, scale);
      return;
    }

    if (fitsLeft) {
      this.positionLeftFixed(dynamicElm, originRect, scale);
      return;
    }

    // None fit - find the side with the most space
    const spaces = [
      { side: 'top', space: spaceTop },
      { side: 'right', space: spaceRight },
      { side: 'bottom', space: spaceBottom },
      { side: 'left', space: spaceLeft }
    ];

    spaces.sort((a, b) => b.space - a.space);
    const bestSide = spaces[0].side;

    switch (bestSide) {
      case 'top':
        dynamicElm.style.top = `${originRect.top - visualHeight}px`;
        this.horizontallyCenterFixed(dynamicElm, originRect, scale);
        break;
      case 'right':
        this.positionRightFixed(dynamicElm, originRect, scale);
        break;
      case 'bottom':
        dynamicElm.style.top = `${originRect.bottom}px`;
        this.horizontallyCenterFixed(dynamicElm, originRect, scale);
        break;
      case 'left':
        this.positionLeftFixed(dynamicElm, originRect, scale);
        break;
    }
  }
}


/***/ },

/***/ "./js/tests/AbandonedPlanetaryStructTest.js"
/*!**************************************************!*\
  !*** ./js/tests/AbandonedPlanetaryStructTest.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbandonedPlanetaryStructTest: () => (/* binding */ AbandonedPlanetaryStructTest)
/* harmony export */ });
/* harmony import */ var _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/DTestFramework */ "./js/framework/DTestFramework.js");
/* harmony import */ var _managers_StructManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../managers/StructManager */ "./js/managers/StructManager.js");
/* harmony import */ var _managers_DestroyedStructManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../managers/DestroyedStructManager */ "./js/managers/DestroyedStructManager.js");
/* harmony import */ var _view_models_components_map_GenericMapLayerComponent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../view_models/components/map/GenericMapLayerComponent */ "./js/view_models/components/map/GenericMapLayerComponent.js");
/* harmony import */ var _models_KeyPlayer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../models/KeyPlayer */ "./js/models/KeyPlayer.js");
/* harmony import */ var _models_Struct__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../models/Struct */ "./js/models/Struct.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");
/* harmony import */ var _constants_MapConstants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../constants/MapConstants */ "./js/constants/MapConstants.js");
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../constants/StructConstants */ "./js/constants/StructConstants.js");











/**
 * Covers the planetary structs a player leaves behind when they depart a fully
 * mined planet. The chain keeps reporting on those structs after the player has
 * arrived somewhere new, and the map matches tiles by owner, ambit and slot
 * alone, so the old structs were drawn as destroyed on the new planet's tiles
 * in the same positions.
 */
class AbandonedPlanetaryStructTest extends _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTestSuite {

  static OLD_PLANET_ID = '2-1';
  static NEW_PLANET_ID = '2-2';
  static PLAYER_ID = '1-1';

  constructor() {
    super('AbandonedPlanetaryStructTest');
  }

  /**
   * @return {object}
   */
  static givenGameStateAfterArrival() {
    const keyPlayers = {};

    Object.values(_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES).forEach(playerType => {
      keyPlayers[playerType] = new _models_KeyPlayer__WEBPACK_IMPORTED_MODULE_4__.KeyPlayer(playerType, true, _constants_MapConstants__WEBPACK_IMPORTED_MODULE_8__.MAP_TYPES.ALPHA_BASE);
    });

    keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER].id = AbandonedPlanetaryStructTest.PLAYER_ID;
    keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER].player = {planet_id: AbandonedPlanetaryStructTest.NEW_PLANET_ID};

    return {
      keyPlayers: keyPlayers,
      currentBlockHeight: 100,
      settings: {get: () => 5}
    };
  }

  /**
   * @param {string} planetId
   * @param {boolean} destroyed
   * @return {Struct}
   */
  static makePlanetaryStruct(planetId, destroyed = false) {
    const struct = new _models_Struct__WEBPACK_IMPORTED_MODULE_5__.Struct();
    struct.id = '5-9';
    struct.owner = AbandonedPlanetaryStructTest.PLAYER_ID;
    struct.location_type = 'planet';
    struct.location_id = planetId;
    struct.operating_ambit = 'land';
    struct.slot = 0;
    struct.status = destroyed
      ? _constants_StructConstants__WEBPACK_IMPORTED_MODULE_9__.STRUCT_STATUS_FLAGS.BUILT | _constants_StructConstants__WEBPACK_IMPORTED_MODULE_9__.STRUCT_STATUS_FLAGS.DESTROYED
      : _constants_StructConstants__WEBPACK_IMPORTED_MODULE_9__.STRUCT_STATUS_FLAGS.BUILT;
    struct.destroyed_block = destroyed ? 1 : 0;
    return struct;
  }

  /**
   * Stands up the one tile a planetary struct in the land ambit's first slot
   * would be drawn on.
   *
   * @return {object}
   */
  static givenTileOnTheMap() {
    const tile = {};
    __webpack_require__.g.document = {
      getElementById: () => ({querySelector: () => tile})
    };
    return tile;
  }

  structLeftOnTheOldPlanetIsAbandonedTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('structLeftOnTheOldPlanetIsAbandonedTest', function() {
    const structManager = new _managers_StructManager__WEBPACK_IMPORTED_MODULE_1__.StructManager(AbandonedPlanetaryStructTest.givenGameStateAfterArrival(), null, null);

    this.assertEquals(
      structManager.isAbandonedPlanetaryStruct(
        AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.OLD_PLANET_ID)
      ),
      true
    );
    this.assertEquals(
      structManager.isAbandonedPlanetaryStruct(
        AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.NEW_PLANET_ID)
      ),
      false
    );
  });

  // The raid enemy key player is wiped when a raid ends, while its structs may
  // still be waiting to be swept.
  structWithAnOwnerNoLongerTrackedIsNotAbandonedTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('structWithAnOwnerNoLongerTrackedIsNotAbandonedTest', function() {
    const structManager = new _managers_StructManager__WEBPACK_IMPORTED_MODULE_1__.StructManager(AbandonedPlanetaryStructTest.givenGameStateAfterArrival(), null, null);
    const struct = AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.OLD_PLANET_ID);
    struct.owner = '1-99';

    this.assertEquals(structManager.isAbandonedPlanetaryStruct(struct), false);
  });

  // The regression: the old struct was drawn onto the new planet's tile.
  mapDoesNotDrawAStructFromAnotherPlanetTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('mapDoesNotDrawAStructFromAnotherPlanetTest', function() {
    const gameState = AbandonedPlanetaryStructTest.givenGameStateAfterArrival();
    const tile = AbandonedPlanetaryStructTest.givenTileOnTheMap();
    const mapLayer = new _view_models_components_map_GenericMapLayerComponent__WEBPACK_IMPORTED_MODULE_3__.GenericMapLayerComponent(
      gameState,
      'row',
      'tile',
      new _managers_StructManager__WEBPACK_IMPORTED_MODULE_1__.StructManager(gameState, null, null),
      [_constants_MapConstants__WEBPACK_IMPORTED_MODULE_8__.MAP_COL_DIVIDER],
      {id: AbandonedPlanetaryStructTest.NEW_PLANET_ID},
      null,
      null
    );

    this.assertEquals(
      mapLayer.buildMapStructTilRenderParamsFromStruct(
        AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.OLD_PLANET_ID, true)
      ),
      null
    );
    this.assertEquals(
      mapLayer.buildMapStructTilRenderParamsFromStruct(
        AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.NEW_PLANET_ID)
      ).tileElement,
      tile
    );
  });

  // A struct destroyed on the old planet just before departing is still being
  // tracked, and sweeping it must not clear what now sits in its old slot.
  sweepingAnAbandonedStructLeavesTheNewPlanetsTileAloneTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('sweepingAnAbandonedStructLeavesTheNewPlanetsTileAloneTest', function() {
    const gameState = AbandonedPlanetaryStructTest.givenGameStateAfterArrival();
    gameState[_constants_MapConstants__WEBPACK_IMPORTED_MODULE_8__.MAP_TYPES.ALPHA_BASE] = {mapId: 'alpha-base-map'};
    const structManager = new _managers_StructManager__WEBPACK_IMPORTED_MODULE_1__.StructManager(gameState, null, null);
    structManager.getMapIdByPlayerTypeAndStruct = () => 'alpha-base-map';

    const destroyedStructManager = new _managers_DestroyedStructManager__WEBPACK_IMPORTED_MODULE_2__.DestroyedStructManager(gameState, structManager);
    destroyedStructManager.track(
      _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER,
      AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.OLD_PLANET_ID, true)
    );

    let tilesCleared = 0;
    const countClear = () => tilesCleared++;
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_7__.EVENTS.CLEAR_STRUCT_TILE, countClear);

    destroyedStructManager.sweep();

    window.removeEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_7__.EVENTS.CLEAR_STRUCT_TILE, countClear);

    this.assertEquals(tilesCleared, 0);
    this.assertEquals(Object.keys(destroyedStructManager.destroyedStructs).length, 0);
  });
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

/***/ "./js/tests/ShieldStatusTest.js"
/*!**************************************!*\
  !*** ./js/tests/ShieldStatusTest.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ShieldStatusTest: () => (/* binding */ ShieldStatusTest)
/* harmony export */ });
/* harmony import */ var _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/DTestFramework */ "./js/framework/DTestFramework.js");
/* harmony import */ var _view_models_components_ShieldStatusComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../view_models/components/ShieldStatusComponent */ "./js/view_models/components/ShieldStatusComponent.js");
/* harmony import */ var _models_KeyPlayer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../models/KeyPlayer */ "./js/models/KeyPlayer.js");
/* harmony import */ var _models_Fleet__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../models/Fleet */ "./js/models/Fleet.js");
/* harmony import */ var _models_Struct__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../models/Struct */ "./js/models/Struct.js");
/* harmony import */ var _models_PlanetRaid__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../models/PlanetRaid */ "./js/models/PlanetRaid.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");
/* harmony import */ var _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../constants/RaidStatus */ "./js/constants/RaidStatus.js");
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../constants/StructConstants */ "./js/constants/StructConstants.js");
/* harmony import */ var _constants_MapConstants__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../constants/MapConstants */ "./js/constants/MapConstants.js");











/**
 * Covers the shield status shown on the map HUD, which reads secure while the
 * command ship holds station over the planet, vulnerable once it leaves or is
 * destroyed, and breached when that happens with a raid underway.
 *
 * The status is derived from state the player never edits directly (the fleet,
 * the command struct and the raid), so each of those has to announce itself for
 * the HUD to keep up. The regression these tests exist for is the fleet: it was
 * assigned straight onto the key player, so leaving for a raid and coming home
 * both left the icon showing whatever it showed before.
 */
class ShieldStatusTest extends _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTestSuite {

  constructor() {
    super('ShieldStatusTest');
  }

  /**
   * The suites run under Node with only the sliver of the DOM they touch, so
   * the three elements the component writes to are stood up by hand.
   *
   * @param {string} elementId
   * @return {Object<string, object>}
   */
  static givenDocument(elementId) {
    const elements = {
      [elementId]: {dataset: {}},
      [`${elementId}-icon-wrapper`]: {innerHTML: ''},
      [`${elementId}-value`]: {
        innerText: '',
        classList: {add: () => {}, remove: () => {}}
      }
    };

    __webpack_require__.g.document = {
      getElementById: (id) => elements[id] ?? null
    };

    return elements;
  }

  /**
   * @param {string} playerType
   * @param {boolean} commandShipOnStation
   * @param {boolean} commandShipAlive
   * @param {string|null} raidStatus
   * @return {KeyPlayer}
   */
  static makePlanetOwner(
    playerType,
    commandShipOnStation,
    commandShipAlive,
    raidStatus = null
  ) {
    const keyPlayer = new _models_KeyPlayer__WEBPACK_IMPORTED_MODULE_2__.KeyPlayer(
      playerType,
      true,
      playerType === _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER ? _constants_MapConstants__WEBPACK_IMPORTED_MODULE_9__.MAP_TYPES.ALPHA_BASE : _constants_MapConstants__WEBPACK_IMPORTED_MODULE_9__.MAP_TYPES.RAID
    );

    keyPlayer.id = '1-1';
    keyPlayer.planetRaidInfo = new _models_PlanetRaid__WEBPACK_IMPORTED_MODULE_5__.PlanetRaid();
    keyPlayer.planetRaidInfo.status = raidStatus;

    const commandStruct = new _models_Struct__WEBPACK_IMPORTED_MODULE_4__.Struct();
    commandStruct.id = '5-1';
    commandStruct.status = commandShipAlive
      ? _constants_StructConstants__WEBPACK_IMPORTED_MODULE_8__.STRUCT_STATUS_FLAGS.BUILT
      : _constants_StructConstants__WEBPACK_IMPORTED_MODULE_8__.STRUCT_STATUS_FLAGS.BUILT | _constants_StructConstants__WEBPACK_IMPORTED_MODULE_8__.STRUCT_STATUS_FLAGS.DESTROYED;
    keyPlayer.structs = {'5-1': commandStruct};

    keyPlayer.fleet = ShieldStatusTest.makeFleet(commandShipOnStation);

    return keyPlayer;
  }

  /**
   * @param {boolean} onStation
   * @return {Fleet}
   */
  static makeFleet(onStation) {
    const fleet = new _models_Fleet__WEBPACK_IMPORTED_MODULE_3__.Fleet();
    fleet.id = '4-1';
    fleet.command_struct = '5-1';
    fleet.status = onStation ? 'onStation' : 'away';
    return fleet;
  }

  /**
   * Builds a component wired to a single planet owner and renders it once, the
   * way the HUD does when the page first loads.
   *
   * @param {KeyPlayer} planetOwner
   * @return {{elements: Object<string, object>, component: ShieldStatusComponent}}
   */
  static givenRenderedComponent(planetOwner) {
    const elementId = `${planetOwner.playerType}-hud-shield-status`;
    const elements = ShieldStatusTest.givenDocument(elementId);

    const gameState = {keyPlayers: {[planetOwner.playerType]: planetOwner}};
    const component = new _view_models_components_ShieldStatusComponent__WEBPACK_IMPORTED_MODULE_1__.ShieldStatusComponent(gameState, planetOwner.playerType, elementId);
    component.initPageCode();

    return {elements: elements, component: component};
  }

  /**
   * @param {Object<string, object>} elements
   * @param {string} elementId
   * @return {string}
   */
  static shownStatus(elements, elementId) {
    return elements[elementId].dataset.suiCheatsheet;
  }

  // The six states the status is specified to show, read straight off a
  // rendered component.
  shownStatusFollowsTheCommandShipAndRaidTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('shownStatusFollowsTheCommandShipAndRaidTest', function(params) {
    const planetOwner = ShieldStatusTest.makePlanetOwner(
      params.playerType,
      params.commandShipOnStation,
      params.commandShipAlive,
      params.raidStatus
    );
    const {elements} = ShieldStatusTest.givenRenderedComponent(planetOwner);

    this.assertEquals(
      ShieldStatusTest.shownStatus(elements, `${params.playerType}-hud-shield-status`),
      `shield-${params.expected}`
    );
  }, function() {
    return [
      // Alpha base: the command ship is home, so the shield holds either way.
      {
        playerType: _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER,
        commandShipOnStation: true,
        commandShipAlive: true,
        raidStatus: null,
        expected: 'secure'
      },
      {
        playerType: _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER,
        commandShipOnStation: true,
        commandShipAlive: true,
        raidStatus: _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_7__.RAID_STATUS.ONGOING,
        expected: 'secure'
      },
      // Alpha base: the command ship is away or dead, and nobody is raiding.
      {
        playerType: _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER,
        commandShipOnStation: false,
        commandShipAlive: true,
        raidStatus: null,
        expected: 'vulnerable'
      },
      {
        playerType: _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER,
        commandShipOnStation: true,
        commandShipAlive: false,
        raidStatus: null,
        expected: 'vulnerable'
      },
      // Alpha base: the command ship is away or dead with a raid underway.
      {
        playerType: _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER,
        commandShipOnStation: false,
        commandShipAlive: true,
        raidStatus: _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_7__.RAID_STATUS.SHIELDS_VULNERABLE,
        expected: 'breached'
      },
      {
        playerType: _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER,
        commandShipOnStation: true,
        commandShipAlive: false,
        raidStatus: _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_7__.RAID_STATUS.SHIELDS_VULNERABLE,
        expected: 'breached'
      },
      // Raid map: the defender's command ship decides it, and the raid the
      // player is running is by definition underway.
      {
        playerType: _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.RAID_ENEMY,
        commandShipOnStation: true,
        commandShipAlive: true,
        raidStatus: _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_7__.RAID_STATUS.ONGOING,
        expected: 'secure'
      },
      {
        playerType: _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.RAID_ENEMY,
        commandShipOnStation: false,
        commandShipAlive: true,
        raidStatus: _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_7__.RAID_STATUS.ONGOING,
        expected: 'breached'
      },
      {
        playerType: _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.RAID_ENEMY,
        commandShipOnStation: true,
        commandShipAlive: false,
        raidStatus: _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_7__.RAID_STATUS.ONGOING,
        expected: 'breached'
      }
    ];
  });

  // The regression. The fleet is refreshed from the API when the raid starts,
  // and nothing about that told the HUD, so the alpha base kept reading secure
  // until the player reloaded the page.
  departingForARaidTurnsTheAlphaBaseVulnerableTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('departingForARaidTurnsTheAlphaBaseVulnerableTest', function() {
    const elementId = `${_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER}-hud-shield-status`;
    const player = ShieldStatusTest.makePlanetOwner(_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER, true, true);
    const {elements} = ShieldStatusTest.givenRenderedComponent(player);

    this.assertEquals(ShieldStatusTest.shownStatus(elements, elementId), 'shield-secure');

    player.setFleet(ShieldStatusTest.makeFleet(false));

    this.assertEquals(ShieldStatusTest.shownStatus(elements, elementId), 'shield-vulnerable');
  });

  // The other half of the same regression: the fleet comes home when the raid
  // ends, and the icon has to come back with it.
  returningFromARaidTurnsTheAlphaBaseSecureTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('returningFromARaidTurnsTheAlphaBaseSecureTest', function() {
    const elementId = `${_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER}-hud-shield-status`;
    const player = ShieldStatusTest.makePlanetOwner(_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER, false, true);
    const {elements} = ShieldStatusTest.givenRenderedComponent(player);

    this.assertEquals(ShieldStatusTest.shownStatus(elements, elementId), 'shield-vulnerable');

    player.setFleet(ShieldStatusTest.makeFleet(true));

    this.assertEquals(ShieldStatusTest.shownStatus(elements, elementId), 'shield-secure');
  });

  // The raid map's defender is a different key player, so a fleet change on one
  // planet must not redraw the other.
  aFleetChangeOnlyRedrawsItsOwnPlanetTest = new _framework_DTestFramework__WEBPACK_IMPORTED_MODULE_0__.DTest('aFleetChangeOnlyRedrawsItsOwnPlanetTest', function() {
    const elementId = `${_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER}-hud-shield-status`;
    const player = ShieldStatusTest.makePlanetOwner(_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.PLAYER, true, true);
    const raidEnemy = ShieldStatusTest.makePlanetOwner(_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_6__.PLAYER_TYPES.RAID_ENEMY, true, true, _constants_RaidStatus__WEBPACK_IMPORTED_MODULE_7__.RAID_STATUS.ONGOING);
    const {elements} = ShieldStatusTest.givenRenderedComponent(player);

    raidEnemy.setFleet(ShieldStatusTest.makeFleet(false));

    this.assertEquals(ShieldStatusTest.shownStatus(elements, elementId), 'shield-secure');
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

/***/ "./js/util/CaseConverter.js"
/*!**********************************!*\
  !*** ./js/util/CaseConverter.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CAMEL_CASE: () => (/* binding */ CAMEL_CASE),
/* harmony export */   CaseConverter: () => (/* binding */ CaseConverter),
/* harmony export */   KEBAB_CASE: () => (/* binding */ KEBAB_CASE),
/* harmony export */   LOWER_SNAKE_CASE: () => (/* binding */ LOWER_SNAKE_CASE),
/* harmony export */   SPACE_SEPARATED_WORDS: () => (/* binding */ SPACE_SEPARATED_WORDS),
/* harmony export */   UPPER_SNAKE_CASE: () => (/* binding */ UPPER_SNAKE_CASE)
/* harmony export */ });
const CAMEL_CASE = 'CAMEL_CASE';
const KEBAB_CASE = 'KEBAB_CASE';
const LOWER_SNAKE_CASE = 'LOWER_SNAKE_CASE';
const UPPER_SNAKE_CASE = 'UPPER_SNAKE_CASE';
const SPACE_SEPARATED_WORDS = 'SPACE_SEPARATED_WORDS';

class CaseConverter {

  /**
   * Converts a string into the specified case.
   *
   * @param {string} source the source string which can be space separate words, or in camel case, kebab case, lower snake case, or upper snake case
   * @param {string} targetCase the case to convert the source to
   * @return {string} the source string formatted in the given case
   */
  convert(source, targetCase) {
    const words = this.tokenize(source);

    switch (targetCase) {
      case CAMEL_CASE:
        return words
          .map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
          .join('');
      case KEBAB_CASE:
        return words.join('-');
      case LOWER_SNAKE_CASE:
        return words.join('_');
      case UPPER_SNAKE_CASE:
        return words.map(w => w.toUpperCase()).join('_');
      case SPACE_SEPARATED_WORDS:
        return words.join(' ');
      default:
        return source;
    }
  }

  /**
   * @param {string} source
   * @return {string[]}
   */
  tokenize(source) {
    return source
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 0);
  }
}


/***/ },

/***/ "./js/util/ChargeCalculator.js"
/*!*************************************!*\
  !*** ./js/util/ChargeCalculator.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChargeCalculator: () => (/* binding */ ChargeCalculator)
/* harmony export */ });
class ChargeCalculator {
  constructor() {
    this.chargeLevelThresholds = [
      0,
      1,
      2,
      3,
      5,
      8
    ];
  }

  /**
   * @param {number} charge
   * @return {number}
   */
  calcChargeLevelByCharge(charge) {
    for (let i = 0; i < this.chargeLevelThresholds.length; i++) {
      if (charge <= this.chargeLevelThresholds[i]) {
        return i;
      }
    }

    return this.chargeLevelThresholds.length - 1;
  }

  /**
   * @param {number} currentBlockHeight
   * @param {number} lastActionBlockHeight
   * @return {number}
   */
  calcCharge(currentBlockHeight, lastActionBlockHeight) {
    return currentBlockHeight - (lastActionBlockHeight + 1);
  }

  /**
   * @param {number} availableCharge - raw charge available
   * @param {number} requiredCharge - raw charge cost
   * @return {boolean}
   */
  isChargeLevelSufficient(availableCharge, requiredCharge) {
    return this.calcChargeLevelByCharge(availableCharge) >= this.calcChargeLevelByCharge(requiredCharge);
  }

  /**
   * @param {number} currentBlockHeight
   * @param {number} lastActionBlockHeight
   * @return {number}
   */
  calc(currentBlockHeight, lastActionBlockHeight) {
    const charge = this.calcCharge(currentBlockHeight, lastActionBlockHeight);
    return this.calcChargeLevelByCharge(charge);
  }
}

/***/ },

/***/ "./js/util/DateFormatter.js"
/*!**********************************!*\
  !*** ./js/util/DateFormatter.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DateFormatter: () => (/* binding */ DateFormatter)
/* harmony export */ });
class DateFormatter {

  /**
   * @param datetimeString
   * @return {string}
   */
  formatDate(datetimeString) {
    return new Date(datetimeString).toLocaleDateString(
      'default',
      {
        month:"long",
        day:"numeric",
        year:"numeric"
      }
    );
  }

  formatTime(datetimeString) {
    return new Date(datetimeString).toLocaleTimeString(
      'default',
      {
        hour : "2-digit",
        minute : "2-digit",
        second : "2-digit"
      }
    );
  }

  formatDatetime(datetimeString) {
    return `${this.formatTime(datetimeString)} ${this.formatDate(datetimeString)}` ;
  }

  /**
   * @param {number} millisecondsRemaining
   */
  formatDuration(millisecondsRemaining) {
    const seconds = Math.floor(millisecondsRemaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h`;
    }
    if (minutes > 0) {
        return `${minutes}m`;
    }
    return `${seconds}s`;
  }
}

/***/ },

/***/ "./js/util/DifficultyEstimator.js"
/*!****************************************!*\
  !*** ./js/util/DifficultyEstimator.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DifficultyEstimator: () => (/* binding */ DifficultyEstimator)
/* harmony export */ });
/* harmony import */ var _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/TaskConstants */ "./js/constants/TaskConstants.js");


class DifficultyEstimator {

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
   * Calculate total blocks needed at hash rate 1 (worst case) to break the shield
   *
   * @param {number} blockStartRaid - Block when raid started
   * @param {number} difficultyTarget - Difficulty target (base difficulty range)
   * @return {number} Total blocks needed
   */
  getTotalBlocksNeededAtHashRate1(blockStartRaid, difficultyTarget) {
    const baseDifficultyRange = Math.max(difficultyTarget, 1);
    const maxBlocksToCheck = _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.MAX_BLOCKS_WHEN_ESTIMATING;
    const blockTimeSeconds = _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.ESTIMATED_BLOCK_TIME;
    const hashrate = 1; // Worst case

    let cumulativeExpectedSuccesses = 0;
    let blocksAhead = 0;

    // Start from age 0 (blockStartRaid) and calculate forward
    while (cumulativeExpectedSuccesses < 1 && blocksAhead < maxBlocksToCheck) {
      const ageAtBlock = blocksAhead; // Age starts at 0
      const difficulty = this.getCalculatedDifficulty(ageAtBlock, baseDifficultyRange);
      const successProbability = 1 / Math.pow(16, difficulty);

      // Expected number of successful hashes in this block
      const expectedSuccessesInBlock = hashrate * blockTimeSeconds * successProbability;
      cumulativeExpectedSuccesses += expectedSuccessesInBlock;
      blocksAhead++;
    }

    return Math.min(blocksAhead, maxBlocksToCheck);
  }

  /**
   * @param {number} difficultyTarget
   * @param {number} blockStartRaid
   * @param {number} currentBlock
   * @return {number}
   */
  getRemainingPercent(
    difficultyTarget,
    blockStartRaid,
    currentBlock
  ) {
    // Age represents blocks processed since raid started
    const age = currentBlock - blockStartRaid;

    // If no blocks have passed, shield is at 100%
    if (age <= 0) {
      return 100;
    }

    // Calculate total blocks needed at hash rate 1 (worst case) to break shield
    const totalBlocksNeeded = this.getTotalBlocksNeededAtHashRate1(blockStartRaid, difficultyTarget);

    // Calculate percent complete
    const percentComplete = totalBlocksNeeded > 0 ? age / totalBlocksNeeded : 1.0;

    const remainingPercent = (1 - percentComplete) * 100;

    return Math.ceil(Math.max(remainingPercent, 0));
  }

  /**
   * Estimate the number of blocks remaining before the shield breaks.
   *
   * Mirrors TaskState.getBlockRemainingEstimate: total blocks needed minus the
   * blocks already elapsed since the raid started.
   *
   * @param {number} difficultyTarget
   * @param {number} blockStartRaid
   * @param {number} currentBlock
   * @return {number} Blocks remaining (0 once the shield is broken)
   */
  getBlockRemainingEstimate(
    difficultyTarget,
    blockStartRaid,
    currentBlock
  ) {
    // Age represents blocks processed since the raid started
    const age = Math.max(currentBlock - blockStartRaid, 0);

    const totalBlocksNeeded = this.getTotalBlocksNeededAtHashRate1(blockStartRaid, difficultyTarget);

    return Math.max(totalBlocksNeeded - age, 0);
  }

  /**
   * Estimate the time remaining before the shield breaks.
   *
   * Mirrors TaskState.getTimeRemainingEstimate by converting the blocks
   * remaining into milliseconds using the estimated block time.
   *
   * @param {number} difficultyTarget
   * @param {number} blockStartRaid
   * @param {number} currentBlock
   * @return {number} Time remaining in milliseconds (0 once the shield is broken)
   */
  getTimeRemainingEstimate(
    difficultyTarget,
    blockStartRaid,
    currentBlock
  ) {
    const blocksRemaining = this.getBlockRemainingEstimate(difficultyTarget, blockStartRaid, currentBlock);
    return blocksRemaining * _constants_TaskConstants__WEBPACK_IMPORTED_MODULE_0__.TASK.ESTIMATED_BLOCK_TIME;
  }
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

/***/ "./js/util/UuidUtil.js"
/*!*****************************!*\
  !*** ./js/util/UuidUtil.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UuidUtil: () => (/* binding */ UuidUtil)
/* harmony export */ });
class UuidUtil {

  /**
   * Generates a unique-enough id for client-side queue items.
   * Works in insecure contexts (plain http) and old browsers, unlike
   * crypto.randomUUID which requires a secure context.
   *
   * @return {string}
   */
  static generate() {
    const time = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 10);
    const rand2 = Math.random().toString(36).slice(2, 10);
    return `${time}-${rand}-${rand2}`;
  }
}


/***/ },

/***/ "./js/view_models/HUDViewModel.js"
/*!****************************************!*\
  !*** ./js/view_models/HUDViewModel.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HUDViewModel: () => (/* binding */ HUDViewModel)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/AbstractViewModel */ "./js/framework/AbstractViewModel.js");
/* harmony import */ var _components_hud_StatusBarTopLeftComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/hud/StatusBarTopLeftComponent */ "./js/view_models/components/hud/StatusBarTopLeftComponent.js");
/* harmony import */ var _components_hud_StatusBarTopRightComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/hud/StatusBarTopRightComponent */ "./js/view_models/components/hud/StatusBarTopRightComponent.js");
/* harmony import */ var _components_hud_ActionBarComponent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/hud/ActionBarComponent */ "./js/view_models/components/hud/ActionBarComponent.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants/Events */ "./js/constants/Events.js");
/* harmony import */ var _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../framework/MenuPage */ "./js/framework/MenuPage.js");
/* harmony import */ var _constants_HUDConstants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../constants/HUDConstants */ "./js/constants/HUDConstants.js");
/* harmony import */ var _constants_MapConstants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../constants/MapConstants */ "./js/constants/MapConstants.js");
/* harmony import */ var _constants_MenuPageRouterModes__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../constants/MenuPageRouterModes */ "./js/constants/MenuPageRouterModes.js");
/* harmony import */ var _events_ClearMoveTargetsEvent__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../events/ClearMoveTargetsEvent */ "./js/events/ClearMoveTargetsEvent.js");
/* harmony import */ var _events_ClearAttackTargetsEvent__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../events/ClearAttackTargetsEvent */ "./js/events/ClearAttackTargetsEvent.js");
/* harmony import */ var _events_ClearDefendTargetsEvent__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../events/ClearDefendTargetsEvent */ "./js/events/ClearDefendTargetsEvent.js");
/* harmony import */ var _events_StructSelectionChangedEvent__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../events/StructSelectionChangedEvent */ "./js/events/StructSelectionChangedEvent.js");
/* harmony import */ var _models_SigningTransaction__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../models/SigningTransaction */ "./js/models/SigningTransaction.js");
















class HUDViewModel extends _framework_AbstractViewModel__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModel {

  /** @type {GameState} */
  static gameState;

  /** @type {SigningClientManager} */
  static signingClientManager;

  static containerId = 'hud-container';

  /** @type {StatusBarTopLeftComponent} */
  static topLeftStatusBar;

  /** @type {StatusBarTopRightComponent} */
  static topRightStatusBarAlphaBase;

  /** @type {StatusBarTopRightComponent} */
  static topRightStatusBarRaid;

  /** @type {ActionBarComponent} */
  static bottomLeftActionBar;

  /** @type {ActionBarComponent} */
  static bottomRightActionBarAlphaBase;

  /** @type {ActionBarComponent} */
  static bottomRightActionBarRaid;

  /**
   * Currently selected tile data for action bar refresh.
   * @type {{tileType: string, ambit: string, slot: number|null, playerId: string, side: string, structId: string|null, tileLabel: string}|null}
   */
  static currentSelectedTile = null;

  /**
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   * @param {StructManager} structManager
   * @param {TaskManager} taskManager
   * @param {AlphaManager} alphaManager
   * @param {GrassManager} grassManager
   */
  static init(
    gameState,
    signingClientManager,
    structManager,
    taskManager,
    alphaManager,
    grassManager
  ) {
    HUDViewModel.gameState = gameState;
    HUDViewModel.signingClientManager = signingClientManager;

    HUDViewModel.topLeftStatusBar = new _components_hud_StatusBarTopLeftComponent__WEBPACK_IMPORTED_MODULE_1__.StatusBarTopLeftComponent(
      gameState,
      _constants_HUDConstants__WEBPACK_IMPORTED_MODULE_7__.HUD_IDS.STATUS_BAR_TOP_LEFT
    );

    HUDViewModel.topRightStatusBarAlphaBase = new _components_hud_StatusBarTopRightComponent__WEBPACK_IMPORTED_MODULE_2__.StatusBarTopRightComponent(
      gameState,
      false,
      _constants_HUDConstants__WEBPACK_IMPORTED_MODULE_7__.HUD_IDS.STATUS_BAR_TOP_RIGHT_ALPHA_BASE,
      _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__.PLAYER_TYPES.PLAYER
    );

    HUDViewModel.topRightStatusBarRaid = new _components_hud_StatusBarTopRightComponent__WEBPACK_IMPORTED_MODULE_2__.StatusBarTopRightComponent(
      gameState,
      true,
      _constants_HUDConstants__WEBPACK_IMPORTED_MODULE_7__.HUD_IDS.STATUS_BAR_TOP_RIGHT_RAID,
      _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__.PLAYER_TYPES.RAID_ENEMY
    );

    HUDViewModel.bottomLeftActionBar = new _components_hud_ActionBarComponent__WEBPACK_IMPORTED_MODULE_3__.ActionBarComponent(
      gameState,
      signingClientManager,
      structManager,
      taskManager,
      alphaManager,
      grassManager,
      _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__.PLAYER_TYPES.PLAYER,
      'left',
      _constants_HUDConstants__WEBPACK_IMPORTED_MODULE_7__.HUD_IDS.ACTION_BAR_PLAYER
    );

    HUDViewModel.bottomRightActionBarAlphaBase = new _components_hud_ActionBarComponent__WEBPACK_IMPORTED_MODULE_3__.ActionBarComponent(
      gameState,
      signingClientManager,
      structManager,
      taskManager,
      alphaManager,
      grassManager,
      _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__.PLAYER_TYPES.PLANET_RAIDER,
      'right',
      _constants_HUDConstants__WEBPACK_IMPORTED_MODULE_7__.HUD_IDS.ACTION_BAR_ALPHA_BASE_ENEMY
    );

    HUDViewModel.bottomRightActionBarRaid = new _components_hud_ActionBarComponent__WEBPACK_IMPORTED_MODULE_3__.ActionBarComponent(
      gameState,
      signingClientManager,
      structManager,
      taskManager,
      alphaManager,
      grassManager,
      _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__.PLAYER_TYPES.RAID_ENEMY,
      'right',
      _constants_HUDConstants__WEBPACK_IMPORTED_MODULE_7__.HUD_IDS.ACTION_BAR_RAID_ENEMY
    );

    HUDViewModel.bottomLeftActionBar.profileClickHandler = function () {
      const allowedControllers = [
        'Fleet',
        'Guild',
        'Account',
      ];
      if (!allowedControllers.includes(_framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.currentController)) {
        _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.goto('Fleet', 'index');
      } else {
        if (_framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.mode !== _constants_MenuPageRouterModes__WEBPACK_IMPORTED_MODULE_9__.MENU_PAGE_ROUTER_MODES.DEFAULT) {
          _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.enableDefaultMode();
        }
        _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.goto(_framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.currentController, _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.currentPage, _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.currentOptions);
      }
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.open();
    };

    HUDViewModel.bottomRightActionBarAlphaBase.profileClickHandler = () => {
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.enablePreviewMode();
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.goto('Account', 'profile', {playerId: this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__.PLAYER_TYPES.PLANET_RAIDER].player.id});
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.open();
    };

    HUDViewModel.bottomRightActionBarRaid.profileClickHandler = () => {
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.enablePreviewMode();
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.router.goto('Account', 'profile', {playerId: this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__.PLAYER_TYPES.RAID_ENEMY].player.id});
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_6__.MenuPage.open();
    };
  }

  static initPageCode() {
    HUDViewModel.topLeftStatusBar.initPageCode();
    HUDViewModel.topRightStatusBarAlphaBase.initPageCode();
    HUDViewModel.topRightStatusBarRaid.initPageCode();
    HUDViewModel.bottomLeftActionBar.initPageCode();
    HUDViewModel.bottomRightActionBarAlphaBase.initPageCode();
    HUDViewModel.bottomRightActionBarRaid.initPageCode();

    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_5__.EVENTS.REFRESH_ACTION_BAR, () => {
      console.log('Refreshing action bar');
      HUDViewModel.refreshActionBar();
    });

    // A change in energy supply can disable or re-enable a struct's abilities,
    // so the action bar has to be rebuilt. Skip while an action is in flight so
    // an in-progress targeting mode is not torn down underneath the player.
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_5__.EVENTS.ENERGY_USAGE_CHANGED, () => {
      if (!HUDViewModel.gameState.actionBarLock.getCurrentAction()) {
        HUDViewModel.refreshActionBar();
      }
    });

    // Listen for REFRESH_ACTION_BAR events (when a struct arrives at a position)
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_5__.EVENTS.REFRESH_ACTION_BAR_IF_SELECTED, (event) => {
      HUDViewModel.refreshActionBarIfSelected(
        event.tileType,
        event.ambit,
        event.slot,
        event.playerId,
        event.structId
      );
    });

    // Listen for PENDING_BUILD_ADDED events to refresh action bar if the tile is selected
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_5__.EVENTS.PENDING_BUILD_ADDED, (event) => {
      if (HUDViewModel.currentSelectedTile) {
        const current = HUDViewModel.currentSelectedTile;
        if (
          current.tileType === event.tileType
          && current.ambit.toUpperCase() === event.ambit.toUpperCase()
          && current.slot === event.slot
          && current.playerId === event.playerId
        ) {
          // Refresh the action bar to show the pending build
          const actionBar = HUDViewModel.whichActionBar(current.side);
          HUDViewModel[actionBar].showActionBarFor(
            current.tileType,
            current.tileLabel,
            current.side,
            current.slot,
            current.structId
          );
        }
      }
    });

    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_5__.EVENTS.CLEAR_TILE_SELECTION, () => {
      HUDViewModel.hideActionBarActionChunks();
      HUDViewModel.currentSelectedTile = null;
      window.dispatchEvent(new _events_StructSelectionChangedEvent__WEBPACK_IMPORTED_MODULE_13__.StructSelectionChangedEvent());

      // Drop each action bar's cached struct reference too.
      HUDViewModel.bottomLeftActionBar.clearSelectedStruct();
      HUDViewModel.bottomRightActionBarAlphaBase.clearSelectedStruct();
      HUDViewModel.bottomRightActionBarRaid.clearSelectedStruct();

      const mapIds = [
        HUDViewModel.gameState.alphaBaseMap.mapId,
        HUDViewModel.gameState.raidMap.mapId,
      ];
      mapIds.forEach((mapId) => {
        window.dispatchEvent(new _events_ClearMoveTargetsEvent__WEBPACK_IMPORTED_MODULE_10__.ClearMoveTargetsEvent(mapId));
        window.dispatchEvent(new _events_ClearAttackTargetsEvent__WEBPACK_IMPORTED_MODULE_11__.ClearAttackTargetsEvent(mapId));
        window.dispatchEvent(new _events_ClearDefendTargetsEvent__WEBPACK_IMPORTED_MODULE_12__.ClearDefendTargetsEvent(mapId));
      });

      HUDViewModel.gameState.actionBarLock.clear(false);
    });

    // The lock is normally released by the GRASS frame confirming the action
    // landed on chain. A transaction that never lands produces no such frame, so
    // without this the executing progress bar runs until the player clicks away.
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_5__.EVENTS.SIGNING_TRANSACTION_SETTLED, (event) => {
      if (event.status === _models_SigningTransaction__WEBPACK_IMPORTED_MODULE_14__.TX_STATUS.SUCCEEDED || !HUDViewModel.gameState.actionBarLock.isLocked()) {
        return;
      }

      // The lock is global but the queue is not: a lock held for a transaction
      // sitting behind this one is not ours to release.
      if (HUDViewModel.signingClientManager.hasQueuedTransactions()) {
        return;
      }

      console.warn(`[HUDViewModel] releasing the action bar lock, transaction ${event.id} settled as ${event.status}.`);
      HUDViewModel.gameState.actionBarLock.clear();
    });
  }

  static render() {
    return `
      ${HUDViewModel.topLeftStatusBar.renderHTML()}
      ${HUDViewModel.topRightStatusBarAlphaBase.renderHTML()}
      ${HUDViewModel.topRightStatusBarRaid.renderHTML()}
      ${HUDViewModel.bottomLeftActionBar.renderHTML()}
      ${HUDViewModel.bottomRightActionBarAlphaBase.renderHTML()}
      ${HUDViewModel.bottomRightActionBarRaid.renderHTML()}
    `;
  }

  /**
   * @param {string} sideClicked left or right or empty string
   * @return {string}
   */
  static whichActionBar(sideClicked) {
    let actionBar = 'bottomLeftActionBar';

    if (sideClicked === 'right') {
      if (this.gameState.activeMapContainerId === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_8__.MAP_CONTAINER_IDS.RAID) {
        actionBar = 'bottomRightActionBarRaid';
      }
      if (
        this.gameState.activeMapContainerId === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_8__.MAP_CONTAINER_IDS.ALPHA_BASE
        && this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_4__.PLAYER_TYPES.PLANET_RAIDER].player
      ) {
        actionBar = 'bottomRightActionBarAlphaBase';
      }
    }

    return actionBar;
  }

  static hideActionBarActionChunks() {
    HUDViewModel.bottomLeftActionBar.hideActionChunk();
    HUDViewModel.bottomRightActionBarAlphaBase.hideActionChunk();
    HUDViewModel.bottomRightActionBarRaid.hideActionChunk();
  }

  /**
   * @param {HTMLElement} clickedDomElement
   * @return {boolean}
   */
  static isCurrentSelectedTile(clickedDomElement) {
    const current = HUDViewModel.currentSelectedTile;
    if (!current) {
      return false;
    }

    let slot = parseInt(clickedDomElement.dataset.slot, 10);
    if (isNaN(slot)) {
      slot = null;
    }

    return (
      current.tileType === clickedDomElement.dataset.tileType
      && current.ambit.toUpperCase() === clickedDomElement.dataset.ambit.toUpperCase()
      && current.slot === slot
      && current.playerId === clickedDomElement.dataset.playerId
    );
  }

  /**
   * Point selection at a new tile without opening the action bar (e.g. while it is locked during a move).
   *
   * @param {HTMLElement} clickedDomElement
   * @param {string|null} structId when set, kept on the selection (destination tiles may not have data-struct-id yet)
   */
  static updateSelectedTilePosition(clickedDomElement, structId = null) {
    let slot = parseInt(clickedDomElement.dataset.slot, 10);
    if (isNaN(slot)) {
      slot = null;
    }

    const tileType = clickedDomElement.dataset.tileType;
    const tileLabel = clickedDomElement.dataset.tileLabel || clickedDomElement.dataset.ambit;

    HUDViewModel.currentSelectedTile = {
      tileType: tileType,
      ambit: clickedDomElement.dataset.ambit,
      slot: slot,
      playerId: clickedDomElement.dataset.playerId,
      side: clickedDomElement.dataset.side,
      structId: structId ?? clickedDomElement.dataset.structId ?? null,
      tileLabel: tileLabel
    };
  }

  /**
   * @param {HTMLElement|object} clickedDomElement
   */
  static showActionBar(clickedDomElement) {
    HUDViewModel.hideActionBarActionChunks();

    const actionBar = HUDViewModel.whichActionBar(clickedDomElement.dataset.side);
    const structId = clickedDomElement.dataset.structId;

    let slot = parseInt(clickedDomElement.dataset.slot, 10);
    if (isNaN(slot)) {
      slot = null;
    }

    const tileType = clickedDomElement.dataset.tileType;
    const tileLabel = clickedDomElement.dataset.tileLabel || clickedDomElement.dataset.ambit;
    const side = clickedDomElement.dataset.side;
    const playerId = clickedDomElement.dataset.playerId;

    // Store the currently selected tile for action bar refresh
    HUDViewModel.currentSelectedTile = {
      tileType: tileType,
      ambit: clickedDomElement.dataset.ambit,
      slot: slot,
      playerId: playerId,
      side: side,
      structId: structId || null,
      tileLabel: tileLabel
    };

    window.dispatchEvent(new _events_StructSelectionChangedEvent__WEBPACK_IMPORTED_MODULE_13__.StructSelectionChangedEvent(structId || null));

    // Show action bar for both empty and occupied tiles
    // Pass structId to determine if deploy button should be disabled
    HUDViewModel[actionBar].showActionBarFor(
      tileType,
      tileLabel,
      side,
      slot,
      structId || null
    );
  }

  /**
   * Refresh the action bar for the currently selected tile.
   * Called when a struct arrives at the selected position.
   *
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @param {string} structId
   */
  static refreshActionBarIfSelected(tileType, ambit, slot, playerId, structId) {
    if (!HUDViewModel.currentSelectedTile) {
      return;
    }

    const current = HUDViewModel.currentSelectedTile;

    // Check if the event matches the currently selected tile
    if (
      current.tileType === tileType
      && current.ambit.toUpperCase() === ambit.toUpperCase()
      && current.slot === slot
      && current.playerId === playerId
    ) {
      // Update the stored struct ID
      HUDViewModel.currentSelectedTile.structId = structId;
      window.dispatchEvent(new _events_StructSelectionChangedEvent__WEBPACK_IMPORTED_MODULE_13__.StructSelectionChangedEvent(structId || null));

      // Refresh the action bar
      const actionBar = HUDViewModel.whichActionBar(current.side);
      HUDViewModel[actionBar].showActionBarFor(
        current.tileType,
        current.tileLabel,
        current.side,
        current.slot,
        structId
      );
    }
  }

  static refreshActionBar() {
    if (!HUDViewModel.currentSelectedTile) {
      return;
    }

    const current = HUDViewModel.currentSelectedTile;
    const actionBar = HUDViewModel.whichActionBar(current.side);
    HUDViewModel[actionBar].showActionBarFor(
      current.tileType,
      current.tileLabel,
      current.side,
      current.slot,
      current.structId
    );
  }

  static hide() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.classList.add('hidden')
    }
  }

  static show() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.classList.remove('hidden')
    }
  }
}


/***/ },

/***/ "./js/view_models/components/AlphaOwnedComponent.js"
/*!**********************************************************!*\
  !*** ./js/view_models/components/AlphaOwnedComponent.js ***!
  \**********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AlphaOwnedComponent: () => (/* binding */ AlphaOwnedComponent)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../framework/AbstractViewModelComponent */ "./js/framework/AbstractViewModelComponent.js");
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../constants/Events */ "./js/constants/Events.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");




class AlphaOwnedComponent extends _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModelComponent {

  constructor(gameState, elementId) {
    super(gameState);
    this.elementId = elementId;
    this.alphaOwnedClass = 'alpha-owned';

    this.alphaOwnedHandler = this.alphaOwnedHandler.bind(this);
  }

  getAlphaOwned() {
    let alpha = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player ? this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player.alpha : 0;
    return this.numberFormatter.format(alpha);
  }

  alphaOwnedHandler(event) {
    if (event.playerType !== _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER) {
      return;
    }

    const alphaOwnedLinkElm = document.getElementById(this.elementId);

    if (!alphaOwnedLinkElm) {
      window.removeEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.ALPHA_COUNT_CHANGED, this.alphaOwnedHandler);
      return;
    }

    const alphaOwnedNumbersContainer = alphaOwnedLinkElm.querySelector(`.${this.alphaOwnedClass}`);
    alphaOwnedNumbersContainer.innerText = this.getAlphaOwned();
  }

  initPageCode() {
    const alphaOwnedLinkElm = document.getElementById(this.elementId);
    const alphaOwnedNumbersContainer = alphaOwnedLinkElm.querySelector(`.${this.alphaOwnedClass}`);
    alphaOwnedNumbersContainer.innerText = this.getAlphaOwned();

    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.ALPHA_COUNT_CHANGED, this.alphaOwnedHandler);
  }

  renderHTML() {
    return `
      <a 
        id="${this.elementId}"
        class="sui-resource"
        href="javascript: void(0)" 
        data-sui-tooltip="Alpha Matter"
        data-sui-mod-placement="bottom"
      >
        <span class="${this.alphaOwnedClass}"></span>
        <i class="sui-icon sui-icon-alpha-matter"></i>
      </a>
    `;
  }
}

/***/ },

/***/ "./js/view_models/components/EnergyUsageComponent.js"
/*!***********************************************************!*\
  !*** ./js/view_models/components/EnergyUsageComponent.js ***!
  \***********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EnergyUsageComponent: () => (/* binding */ EnergyUsageComponent)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../framework/AbstractViewModelComponent */ "./js/framework/AbstractViewModelComponent.js");
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../constants/Events */ "./js/constants/Events.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");




class EnergyUsageComponent extends _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModelComponent {

  constructor(gameState, elementId) {
    super(gameState);
    this.elementId = elementId;
    this.textClassEnergyInsufficient = 'sui-text-warning';
    this.cheatsheetEnergySufficient = 'energy-supply-sufficient';
    this.cheatsheetEnergyInsufficient = 'energy-supply-insufficient';
    this.iconEnergySufficient = 'sui-icon-energy';
    this.iconEnergyInsufficient = 'sui-icon-energy-insufficient';

    this.energyUsageHandler = this.energyUsageHandler.bind(this);
  }

  getEnergyUsage() {
    const load = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player ? this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player.load : 0;
    const structsLoad = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player ? this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player.structs_load : 0;
    const capacity = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player ? this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player.capacity : 0;
    const connectionCapacity = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player ? this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player.connection_capacity : 0;

    let totalLoad = load + structsLoad;
    let totalCapacity = capacity + connectionCapacity;
    totalLoad = this.numberFormatter.format(totalLoad);
    totalCapacity = this.numberFormatter.format(totalCapacity);

    return `${totalLoad}/${totalCapacity}`;
  }

  /**
   * @return {boolean}
   */
  isPlayerOverloaded() {
    const player = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player;
    return !!player && player.isOverloaded();
  }

  /**
   * @param {HTMLElement} energyUsageLinkElm
   */
  renderEnergyUsage(energyUsageLinkElm) {
    const energyUsageNumbersElm = energyUsageLinkElm.querySelector('span');
    const energyUsageIconElm = energyUsageLinkElm.querySelector('i');
    const isOverloaded = this.isPlayerOverloaded();

    energyUsageLinkElm.dataset.suiCheatsheet = isOverloaded
      ? this.cheatsheetEnergyInsufficient
      : this.cheatsheetEnergySufficient;

    energyUsageNumbersElm.classList.toggle(this.textClassEnergyInsufficient, isOverloaded);
    energyUsageIconElm.classList.toggle(this.iconEnergyInsufficient, isOverloaded);
    energyUsageIconElm.classList.toggle(this.iconEnergySufficient, !isOverloaded);

    energyUsageNumbersElm.innerText = this.getEnergyUsage();
  }

  energyUsageHandler(event) {
    if (event.playerType !== _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER) {
      return;
    }

    const energyUsageLinkElm = document.getElementById(this.elementId);

    if (!energyUsageLinkElm) {
      window.removeEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.ENERGY_USAGE_CHANGED, this.energyUsageHandler);
      return;
    }

    this.renderEnergyUsage(energyUsageLinkElm);
  }

  initPageCode() {
    this.renderEnergyUsage(document.getElementById(this.elementId));

    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.ENERGY_USAGE_CHANGED, this.energyUsageHandler);
  }

  renderHTML() {
    let cheatsheet = this.cheatsheetEnergySufficient;
    let icon = this.iconEnergySufficient;
    let textClass = '';

    if (this.isPlayerOverloaded()) {
      cheatsheet = this.cheatsheetEnergyInsufficient;
      icon = this.iconEnergyInsufficient;
      textClass = this.textClassEnergyInsufficient;
    }

    return `
      <a 
        id="${this.elementId}"
        class="sui-resource"
        href="javascript: void(0)" 
        data-sui-cheatsheet="${cheatsheet}"
      >
        <span class="${textClass}"></span>
        <i class="sui-icon ${icon}"></i>
      </a>
    `;
  }
}

/***/ },

/***/ "./js/view_models/components/GenericResourceComponent.js"
/*!***************************************************************!*\
  !*** ./js/view_models/components/GenericResourceComponent.js ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GenericResourceComponent: () => (/* binding */ GenericResourceComponent)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../framework/AbstractViewModelComponent */ "./js/framework/AbstractViewModelComponent.js");


class GenericResourceComponent extends _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModelComponent {

  constructor(gameState) {
    super(gameState);
  }

  renderHTML(
    elementId,
    iconClass,
    toolTipText,
    value,
    iconFirst = false
  ) {
    let iconPos1 = '';
    let iconPos2 = `<i class="sui-icon ${iconClass}"></i>`;

    if (iconFirst) {
      iconPos1 = iconPos2;
      iconPos2 = '';
    }

    return `
      <a 
        id="${elementId}"
        class="sui-resource"
        href="javascript: void(0)" 
        data-sui-tooltip="${toolTipText}"
        data-sui-mod-placement="bottom"
      >
        ${iconPos1}
        <span id="${elementId}-value">${value}</span>
        ${iconPos2}
      </a>
    `;
  }
}

/***/ },

/***/ "./js/view_models/components/PfpViewerComponent.js"
/*!*********************************************************!*\
  !*** ./js/view_models/components/PfpViewerComponent.js ***!
  \*********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PfpViewerComponent: () => (/* binding */ PfpViewerComponent)
/* harmony export */ });
/* harmony import */ var _constants_PfpConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants/PfpConstants */ "./js/constants/PfpConstants.js");
/* harmony import */ var _models_PfpClientRenderAttributes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../models/PfpClientRenderAttributes */ "./js/models/PfpClientRenderAttributes.js");



/**
 * Composes and displays a player's profile picture from its layered render
 * attributes. The picture is built from 5 image layers of identical
 * dimensions, painted from back to front in the following order:
 *   background, arms, body, neck, head.
 *
 * When no render attributes are available (and none are being generated) the
 * portrait placeholder image is shown instead.
 */
class PfpViewerComponent {

  /**
   * @param {PfpClientRenderAttributes|null} pfpClientRenderAttributes
   * @param {boolean} generateRandom Whether to randomly generate a configuration.
   */
  constructor(pfpClientRenderAttributes = null, generateRandom = false) {
    this.pfp = generateRandom
      ? this.generateRandomPfp()
      : (pfpClientRenderAttributes || null);
    this.containerElement = null;
  }

  /**
   * @return {string|null}
   */
  getPfpJson() {
    if (this.pfp && typeof this.pfp === "object") {
      return JSON.stringify(this.pfp);
    }

    return null;
  }

  /**
   * Generates a random profile picture configuration.
   *
   * @return {PfpClientRenderAttributes}
   */
  generateRandomPfp() {
    const randomPart = (count) => Math.floor(Math.random() * count) + 1;

    return new _models_PfpClientRenderAttributes__WEBPACK_IMPORTED_MODULE_1__.PfpClientRenderAttributes(
      randomPart(_constants_PfpConstants__WEBPACK_IMPORTED_MODULE_0__.PFP_PART_COUNTS.head),
      randomPart(_constants_PfpConstants__WEBPACK_IMPORTED_MODULE_0__.PFP_PART_COUNTS.neck),
      randomPart(_constants_PfpConstants__WEBPACK_IMPORTED_MODULE_0__.PFP_PART_COUNTS.body),
      randomPart(_constants_PfpConstants__WEBPACK_IMPORTED_MODULE_0__.PFP_PART_COUNTS.arms),
      randomPart(_constants_PfpConstants__WEBPACK_IMPORTED_MODULE_0__.PFP_PART_COUNTS.background)
    );
  }

  /**
   * Returns the inner HTML for the profile picture, intended to be placed
   * inside one of the portrait container elements.
   *
   * @return {string}
   */
  renderHTML() {
    if (!this.pfp) {
      return `<img class="pfp-viewer-layer" src="/img/portrait-placeholder.png" alt="Profile picture">`;
    }

    // Back to front so that the head layer paints on top.
    const layers = [
      ['background', this.pfp.background],
      ['arms', this.pfp.arms],
      ['body', this.pfp.body],
      ['neck', this.pfp.neck],
      ['head', this.pfp.head],
    ];

    return layers
      .filter(([, index]) => index !== null && index !== undefined)
      .map(([part, index]) =>
        `<img class="pfp-viewer-layer" src="/img/pfp/${part}/pfp_${part}_${index}.png" alt="">`
      )
      .join('');
  }

  /**
   * Binds the component to a container element and renders into it.
   *
   * @param {HTMLElement} containerElement
   * @return {PfpViewerComponent}
   */
  mount(containerElement) {
    this.containerElement = containerElement;
    this.render();
    return this;
  }

  /**
   * Renders the current profile picture into the bound container element.
   */
  render() {
    if (this.containerElement) {
      this.containerElement.innerHTML = this.renderHTML();
    }
  }

  /**
   * Re-renders the profile picture, optionally regenerating a new random
   * configuration first.
   *
   * @param {boolean} regenerate Whether to generate a new random configuration.
   */
  rerender(regenerate = false) {
    if (regenerate) {
      this.pfp = this.generateRandomPfp();
    }
    this.render();
  }
}


/***/ },

/***/ "./js/view_models/components/ShieldStatusComponent.js"
/*!************************************************************!*\
  !*** ./js/view_models/components/ShieldStatusComponent.js ***!
  \************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ShieldStatusComponent: () => (/* binding */ ShieldStatusComponent)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../framework/AbstractViewModelComponent */ "./js/framework/AbstractViewModelComponent.js");
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../constants/Events */ "./js/constants/Events.js");



class ShieldStatusComponent extends _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModelComponent {

  /**
   * Tracks the window listeners registered per element id so that rebuilding a
   * component bound to the same element doesn't accumulate duplicate listeners.
   *
   * @type {Object<string, Object<string, function>>}
   */
  static registeredListeners = {};

  constructor(
    gameState,
    planetOwnerPlayerType,
    elementId,
    showTextStatus = false
  ) {
    super(gameState);
    this.planetOwnerPlayerType = planetOwnerPlayerType;
    this.elementId = elementId;
    this.elementIconWrapperId = `${this.elementId}-icon-wrapper`;
    this.elementValueContainerId = `${this.elementId}-value`;
    this.showTextStatus = showTextStatus;
  }

  initPageCode() {
    this.removeStaleListeners();

    this.loginCompleteHandler = () => {
      this.renderShieldStatusIcon();
    };

    this.shieldHealthChangedHandler = (event) => {
      if (event.playerType !== this.planetOwnerPlayerType) {
        return;
      }
      this.renderShieldStatusValue(this.gameState.keyPlayers[event.playerType].planetShieldHealth);
      this.renderShieldStatusIcon();
    };

    // The shield status also depends on whether the command struct is alive,
    // whether the fleet is holding station over the planet, and whether a raid
    // is active, so refresh the icon when any of those inputs change.
    this.defensesChangedHandler = (event) => {
      if (event.playerType !== this.planetOwnerPlayerType) {
        return;
      }
      this.renderShieldStatusIcon();
    };

    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.LOGIN_COMPLETE, this.loginCompleteHandler);
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.SHIELD_HEALTH_CHANGED, this.shieldHealthChangedHandler);
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.STRUCT_COUNT_CHANGED, this.defensesChangedHandler);
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.PLANET_RAID_STATUS_CHANGED, this.defensesChangedHandler);
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.FLEET_CHANGED, this.defensesChangedHandler);

    ShieldStatusComponent.registeredListeners[this.elementId] = {
      [_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.LOGIN_COMPLETE]: this.loginCompleteHandler,
      [_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.SHIELD_HEALTH_CHANGED]: this.shieldHealthChangedHandler,
      [_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.STRUCT_COUNT_CHANGED]: this.defensesChangedHandler,
      [_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.PLANET_RAID_STATUS_CHANGED]: this.defensesChangedHandler,
      [_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.FLEET_CHANGED]: this.defensesChangedHandler,
    };

    this.renderShieldStatusIcon();
  }

  /**
   * Removes window listeners registered by a previous component instance bound
   * to the same element id, preventing listener accumulation as cards rebuild.
   */
  removeStaleListeners() {
    const existing = ShieldStatusComponent.registeredListeners[this.elementId];
    if (!existing) {
      return;
    }

    Object.entries(existing).forEach(([eventName, handler]) => {
      window.removeEventListener(eventName, handler);
    });

    delete ShieldStatusComponent.registeredListeners[this.elementId];
  }

  renderHTML() {
    return `
      <a 
        id="${this.elementId}"
        class="sui-resource"
        href="javascript: void(0)" 
        data-sui-mod-placement="bottom"
      >
        <div id="${this.elementIconWrapperId}" class="planetary-shield-symbol-wrapper"></div>
        <span id="${this.elementValueContainerId}" class="sui-text-warning"></span>
      </a>
    `;
  }

  renderShieldStatusIcon() {
    const elm = document.getElementById(this.elementId);
    const iconElm = document.getElementById(this.elementIconWrapperId);

    if (!elm || !iconElm) {
      return;
    }

    const planetOwner = this.gameState.keyPlayers[this.planetOwnerPlayerType];

    let status = 'secure';

    if (planetOwner?.arePlanetaryDefensesBreached()) {
      status = 'breached';
    } else if (planetOwner?.arePlanetaryDefensesVulnerable()) {
      status = 'vulnerable';
    }

    let cheatsheet = `shield-${status}`;

    // Only swap the icon if the status changed
    if (elm.dataset.suiCheatsheet !== cheatsheet) {
      iconElm.innerHTML = `<img src="/img/non_standard_icons/shield_${status}_${this.planetOwnerPlayerType}.png" alt="${status}" />`;
      elm.dataset.suiCheatsheet = cheatsheet;
    }

    // Always refresh the breach time as it depends on the planetary shield
    // info, which can load/change independently of the status.
    elm.dataset.projectedBreachTime = planetOwner?.getProjectedShieldBreachTime() ?? 'N/A';

    this.renderShieldStatusValue();
  }

  /**
   * @param {string|null} health
   */
  renderShieldStatusValue(health = null) {
    const valueElm = document.getElementById(this.elementValueContainerId);

    if (!valueElm) {
      return;
    }

    const planetOwner = this.gameState.keyPlayers[this.planetOwnerPlayerType];

    if (health === null) {
      health = valueElm.innerText;
    }

    if (planetOwner && ['', 'Vulnerable', 'Secure'].includes(health) && this.showTextStatus) {
      if (planetOwner.arePlanetaryDefensesVulnerable()) {
        health = 'Vulnerable';
      } else {
        health = 'Secure';
      }

      valueElm.classList.remove('sui-text-warning');
      valueElm.innerText = health;
    } else {
      valueElm.classList.add('sui-text-warning');
      valueElm.innerText = health;
    }
  }
}

/***/ },

/***/ "./js/view_models/components/StructStillRenderer.js"
/*!**********************************************************!*\
  !*** ./js/view_models/components/StructStillRenderer.js ***!
  \**********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StructStillRenderer: () => (/* binding */ StructStillRenderer)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../framework/AbstractViewModelComponent */ "./js/framework/AbstractViewModelComponent.js");
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../constants/StructConstants */ "./js/constants/StructConstants.js");
/* harmony import */ var _models_StructType__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../models/StructType */ "./js/models/StructType.js");
/* harmony import */ var _errors_AnimationError__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../errors/AnimationError */ "./js/errors/AnimationError.js");





class StructStillRenderer extends _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {StructType} structType
   * @param {string} topDetailLayer1
   * @param {string} topDetailLayer2
   * @param {string} structVariantBase
   * @param {string} structVariantDmg
   * @param {string} bottomDetailLayer1
   */
  constructor(
    gameState,
    structType,
    topDetailLayer1,
    topDetailLayer2,
    structVariantBase,
    structVariantDmg,
    bottomDetailLayer1
  ) {
    super(gameState);

    this.structType = structType;
    this.topDetailLayer1 = topDetailLayer1;
    this.topDetailLayer2 = topDetailLayer2;
    this.structVariantBase = structVariantBase;
    this.structVariantDmg = structVariantDmg;
    this.structVariantHidden = '';
    this.bottomDetailLayer1 = bottomDetailLayer1;
  }

  /**
   * @param {string} layerPath path to the image file
   * @param {string|null} position top or bottom
   * @return {string}
   */
  renderLayerHtml(layerPath, position = null) {
    if (!layerPath) {
      return '';
    }

    const positionClass = position
      ? ` struct-${position}-detail`
      : '';

    return `<img src="${layerPath}" class="${positionClass}" alt=""/>`;
  }

  /**
   * @param {string} structVariant
   * @return {string}
   */
  renderTopDetailLayers(structVariant) {
    if (structVariant === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_HIDDEN) {
      return '';
    }
    return this.renderLayerHtml(this.topDetailLayer1, 'top')
      + this.renderLayerHtml(this.topDetailLayer2, 'top');
  }

  /**
   * @param {string} structVariant
   * @return {string}
   */
  renderBottomDetailLayers(structVariant) {
    if (structVariant === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_HIDDEN) {
      return '';
    }
    return this.renderLayerHtml(this.bottomDetailLayer1, 'bottom');
  }

  /**
   * @param {string} variant
   * @return {string}
   */
  renderStructVariant(variant) {
    if (!this.hasOwnProperty(variant)) {
      throw new _errors_AnimationError__WEBPACK_IMPORTED_MODULE_3__.AnimationError(`Struct variant does not exist ${variant}`);
    }
    return this.renderLayerHtml(this[variant]);
  }

  /**
   * @param {number} currentHealth
   * @param {string} structVariant
   * @return {string}
   */
  renderHTML(currentHealth = -1, structVariant = '') {

    if (currentHealth === 0) {
      return `<div class="struct-still"></div>`;
    }

    if (structVariant === '') {
      structVariant = (0 < currentHealth && currentHealth < this.structType.max_health)
        ? _constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG
        : _constants_StructConstants__WEBPACK_IMPORTED_MODULE_1__.STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE;
    }

    return `
      <div class="struct-still">
        ${this.renderTopDetailLayers(structVariant)}
        ${this.renderStructVariant(structVariant)}
        ${this.renderBottomDetailLayers(structVariant)}
      </div>
    `;
  }

}

/***/ },

/***/ "./js/view_models/components/hud/ActionBarComponent.js"
/*!*************************************************************!*\
  !*** ./js/view_models/components/hud/ActionBarComponent.js ***!
  \*************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ActionBarComponent: () => (/* binding */ ActionBarComponent)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../framework/AbstractViewModelComponent */ "./js/framework/AbstractViewModelComponent.js");
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../constants/Events */ "./js/constants/Events.js");
/* harmony import */ var _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../constants/MapConstants */ "./js/constants/MapConstants.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");
/* harmony import */ var _offcanvas_DeployOffcanvas__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../offcanvas/DeployOffcanvas */ "./js/view_models/components/offcanvas/DeployOffcanvas.js");
/* harmony import */ var _models_Struct__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../models/Struct */ "./js/models/Struct.js");
/* harmony import */ var _models_StructType__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../models/StructType */ "./js/models/StructType.js");
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../constants/StructConstants */ "./js/constants/StructConstants.js");
/* harmony import */ var _events_ShowMoveTargetsEvent__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../events/ShowMoveTargetsEvent */ "./js/events/ShowMoveTargetsEvent.js");
/* harmony import */ var _events_ClearMoveTargetsEvent__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../events/ClearMoveTargetsEvent */ "./js/events/ClearMoveTargetsEvent.js");
/* harmony import */ var _events_ShowDefendTargetsEvent__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../events/ShowDefendTargetsEvent */ "./js/events/ShowDefendTargetsEvent.js");
/* harmony import */ var _events_ClearDefendTargetsEvent__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../events/ClearDefendTargetsEvent */ "./js/events/ClearDefendTargetsEvent.js");
/* harmony import */ var _events_ShowAttackTargetsEvent__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../events/ShowAttackTargetsEvent */ "./js/events/ShowAttackTargetsEvent.js");
/* harmony import */ var _events_ClearAttackTargetsEvent__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../events/ClearAttackTargetsEvent */ "./js/events/ClearAttackTargetsEvent.js");
/* harmony import */ var _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../constants/TaskTypes */ "./js/constants/TaskTypes.js");
/* harmony import */ var _util_NumberFormatter__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../util/NumberFormatter */ "./js/util/NumberFormatter.js");
/* harmony import */ var _events_ShowStructStillEvent__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../../events/ShowStructStillEvent */ "./js/events/ShowStructStillEvent.js");
/* harmony import */ var _offcanvas_ConsumeAlphaOffcanvas__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../offcanvas/ConsumeAlphaOffcanvas */ "./js/view_models/components/offcanvas/ConsumeAlphaOffcanvas.js");
/* harmony import */ var _PfpViewerComponent__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../PfpViewerComponent */ "./js/view_models/components/PfpViewerComponent.js");




















class ActionBarComponent extends _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   * @param {StructManager} structManager
   * @param {TaskManager} taskManager
   * @param {AlphaManager} alphaManager
   * @param {GrassManager} grassManager
   * @param {string} playerType
   * @param {string} align left or right
   * @param {string} id
   */
  constructor(
    gameState,
    signingClientManager,
    structManager,
    taskManager,
    alphaManager,
    grassManager,
    playerType,
    align,
    id
  ) {
    super(gameState);

    this.playerType = playerType;
    this.signingClientManager = signingClientManager;
    this.structManager = structManager;
    this.taskManager = taskManager;
    this.alphaManager = alphaManager;
    this.grassManager = grassManager;
    this.numberFormatter = new _util_NumberFormatter__WEBPACK_IMPORTED_MODULE_15__.NumberFormatter();

    /* Style */
    this.themeClass = `sui-theme-${this.playerType === _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER ? 'player' : 'enemy'}`;
    this.align = align;

    /* IDs */
    this.id = id;
    this.playerChunkId = `${this.playerType}-action-bar-player-chunk`;
    this.playerChunkPortraitId = `${this.playerType}-action-bar-portrait`;
    this.playerChunkPortraitImageId = `${this.playerType}-action-bar-portrait-image`;
    this.playerChunkBatteryId = `${this.playerType}-action-bar-battery`;
    this.connectorId = `${this.playerType}-action-bar-connector`;
    this.actionChunkId = `${this.playerType}-action-bar-action-chunk`;
    this.headerScreenId = `${this.playerType}-action-bar-header`;
    this.propertiesScreenId = `${this.playerType}-action-bar-properties-screen`;
    this.progressBarId = `${this.playerType}-action-bar-progress-bar`;
    this.undiscoveredOreContainerId = `${this.playerType}-action-bar-undiscovered-or-container`;
    this.oreReadyContainerId = `${this.playerType}-action-bar-ore-ready-container`;
    this.inProgressValueContainerId = `${this.playerType}-action-bar-progress-bar-in-progress-value`;
    this.panelSwitchId = `${this.playerType}-action-bar-panel-switch`;

    /* Profile Chunk */
    this.profileClickHandler = function () {};
    this.batteryfilledClass = 'sui-mod-filled';

    /** @type {string|null} Signature of the pfp currently rendered in the portrait. */
    this.renderedPfpSignature = undefined;

    /**
     * Currently selected struct
     * @type {Struct|null}
     */
    this.selectedStruct = null;
  }

  /**
   * Currently selected struct ID if there is one.
   * @return {string|null}
   */
  getSelectedStructId() {
    return this.selectedStruct ? this.selectedStruct.id : null;
  }

  clearSelectedStruct() {
    this.selectedStruct = null;
  }

  /**
   * @param {string} playerType See PLAYER_TYPES
   * @return {boolean}
   */
  isKeyPlayerOverloaded(playerType) {
    const player = this.gameState.keyPlayers[playerType].player;
    return !!player && player.isOverloaded();
  }

  /**
   * @param {ChargeLevelChangedEvent} event
   */
  updateActionButtons(event) {
    if (
      this.playerType === _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER
      && event.playerId === this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER].id
      && !this.isKeyPlayerOverloaded(_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER)
      && this.selectedStruct
      && this.selectedStruct.isOnline()
    ) {
      const charge = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER].getCharge(this.gameState.currentBlockHeight);
      const actionButtons = document.getElementById(this.actionChunkId).querySelectorAll('.sui-action-bar-btn-group a.sui-panel-btn');
      actionButtons.forEach(actionButton => {
        if (
          this.gameState.chargeCalculator.isChargeLevelSufficient(charge, parseInt(actionButton.getAttribute('data-action-charge')))
          && actionButton.classList.contains('sui-mod-disabled')
        ) {
          const isActive = parseInt(actionButton.getAttribute('data-active-defense') || 0);
          if (isActive) {
            actionButton.classList.add('sui-mod-active-defense');
          } else {
            actionButton.classList.add('sui-mod-default');
          }
          actionButton.classList.remove('sui-mod-disabled');
        }
      });
    }
  }

  initPageCode() {
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.CHARGE_LEVEL_CHANGED, function (event) {
      if (event.playerId === this.gameState.getPlayerIdByType(this.playerType)) {
        this.renderChargeLevel(event.chargeLevel);
      }

      if (this.selectedStruct && !this.selectedStruct.isOnline()) {
        const panelSwitchElm = document.getElementById(this.panelSwitchId);

        if (panelSwitchElm && panelSwitchElm.dataset.state === 'disabled') {
          const structType = this.gameState.structTypes.getStructTypeById(this.selectedStruct.type);
          const panelSwitchState = this.getPanelSwitchState(this.selectedStruct, structType);

          if (panelSwitchState.canToggle) {
            this.showStructActionBar(this.selectedStruct);
          }
        }

      }

      this.updateActionButtons(event);

    }.bind(this));

    document.getElementById(this.playerChunkPortraitId).addEventListener('click', this.profileClickHandler.bind(this));

    // The portrait is first rendered before the key player is loaded, so refresh
    // it once the player's data (and pfp) becomes available or changes.
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.RENDER_PLAYER_PFP, (event) => {
      if (event.playerType === this.playerType) {
        this.renderPortraitImage();
      }
    });

    // Listen for task worker changes to update progress bar
    window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.TASK_WORKER_CHANGED, (event) => {
      if (!this.getSelectedStructId() || event.state.object_id !== this.getSelectedStructId()) {
        return;
      }
      if (event.state.task_type === _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_14__.TASK_TYPES.BUILD) {
        this.updateProgressBar(event.state.getPercentCompleteEstimate());
      } else if (event.state.task_type === _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_14__.TASK_TYPES.MINE || event.state.task_type === _constants_TaskTypes__WEBPACK_IMPORTED_MODULE_14__.TASK_TYPES.REFINE) {
        const estInMS = event.state.getTimeRemainingEstimate();
        const estFormatted = this.numberFormatter.formatMilliseconds(estInMS);
        this.updateInProgressValue(estFormatted);
      }
    });

    const undiscoveredOreContainer = document.getElementById(this.undiscoveredOreContainerId);
    if (undiscoveredOreContainer) {
      window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.UNDISCOVERED_ORE_COUNT_CHANGED, (event) => {
        if (event.playerType === this.playerType) {
          undiscoveredOreContainer.innerHTML = this.gameState.keyPlayers[this.playerType].planet.undiscovered_ore;
        }
      });
    }

    const oreReadyContainer = document.getElementById(this.oreReadyContainerId);
    if (oreReadyContainer) {
      window.addEventListener(_constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.ORE_COUNT_CHANGED, (event) => {
        if (event.playerType === this.playerType) {
          oreReadyContainer.innerHTML = this.gameState.keyPlayers[this.playerType].player.ore;
        }
      });
    }
  }

  /**
   * Update the progress bar contents without re-rendering the entire action bar.
   *
   * @param {number} percentageToComplete
   */
  updateProgressBar(percentageToComplete) {
    const progressBarWrapper = document.getElementById(this.progressBarId);
    if (progressBarWrapper) {
      progressBarWrapper.innerHTML = this.renderProgressBar(percentageToComplete);
    }
  }

  /**
   * Update the in progress time estimate without re-rendering the entire action bar.
   *
   * @param {string} value
   */
  updateInProgressValue(value) {
    const inProgressValueContainer = document.getElementById(this.inProgressValueContainerId);
    if (inProgressValueContainer) {
      inProgressValueContainer.innerHTML = value;
    }
  }

  renderChargeLevel(level) {
    const battery = document.getElementById(this.playerChunkBatteryId);
    const batteryChunks = battery.children;

    for (let i = 0; i < batteryChunks.length; i++) {
      if (i + 1 > level) {
        batteryChunks[i].classList.remove(this.batteryfilledClass);
      } else {
        batteryChunks[i].classList.add(this.batteryfilledClass);
      }
    }
  }

  /**
   * @return {PfpClientRenderAttributes|null}
   */
  getCurrentPfpAttributes() {
    const keyPlayer = this.gameState.keyPlayers[this.playerType];
    return keyPlayer && keyPlayer.player
      ? keyPlayer.player.pfp_client_render_attributes
      : null;
  }

  /**
   * Renders the portrait image layers for the current key player and records
   * the rendered pfp signature so redundant re-renders can be skipped.
   *
   * @return {string}
   */
  renderPortraitImageHTML() {
    const pfpAttributes = this.getCurrentPfpAttributes();
    this.renderedPfpSignature = pfpAttributes ? JSON.stringify(pfpAttributes) : null;
    return new _PfpViewerComponent__WEBPACK_IMPORTED_MODULE_18__.PfpViewerComponent(pfpAttributes).renderHTML();
  }

  /**
   * Updates the portrait image in place when the key player's pfp changes.
   * Skips the DOM write when the pfp has not changed to avoid flicker.
   */
  renderPortraitImage() {
    const pfpAttributes = this.getCurrentPfpAttributes();
    const signature = pfpAttributes ? JSON.stringify(pfpAttributes) : null;

    if (signature === this.renderedPfpSignature) {
      return;
    }

    const portraitImage = document.getElementById(this.playerChunkPortraitImageId);
    if (portraitImage) {
      portraitImage.innerHTML = new _PfpViewerComponent__WEBPACK_IMPORTED_MODULE_18__.PfpViewerComponent(pfpAttributes).renderHTML();
      this.renderedPfpSignature = signature;
    }
  }

  renderPortraitChunkHTML() {
    const hoverIcon = this.playerType === _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER ? 'icon-menu' : 'icon-info';
    return `
      <div id="${this.playerChunkId}" class="sui-panel-chunk">
  
        <div class="sui-screen">
          <a id="${this.playerChunkPortraitId}" href="javascript: void(0)" class="sui-screen-portrait">
            <div id="${this.playerChunkPortraitImageId}" class="sui-screen-portrait-image">${this.renderPortraitImageHTML()}</div>
            <i class="sui-icon-md ${hoverIcon}"></i>
          </a>
        </div>
        <div class="sui-screen">
          <div id="${this.playerChunkBatteryId}" class="sui-screen-battery">
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
          </div>
        </div>

      </div>
    `;
  }

  showActionChunk() {
    document.getElementById(this.connectorId).classList.remove('hidden');
    document.getElementById(this.actionChunkId).classList.remove('hidden');
  }

  hideActionChunk() {
    document.getElementById(this.connectorId).classList.add('hidden');
    document.getElementById(this.actionChunkId).classList.add('hidden');
  }

  /**
   *
   * @param {string} tileType see MAP_TILE_TYPES
   * @return {string} icon class
   */
  getPropertyIconForTileType(tileType) {
    if (
      this.align === 'right'
      && (
        tileType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_TILE_TYPES.COMMAND
        || tileType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_TILE_TYPES.PLANETARY_SLOT
        || tileType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_TILE_TYPES.FLEET
      )
    ) {
      return _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_TILE_TYPE_ICONS.ENEMY_TERRITORY;
    }

    return _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_TILE_TYPE_ICONS[tileType];
  }

  /**
   * Renders the progress bar chunks HTML without the wrapper.
   *
   * @param {number} percentageToComplete - A number from 0 to 1 representing completion percentage
   * @return {string} HTML for the progress bar chunks
   */
  renderProgressBar(percentageToComplete) {
    const totalChunks = 10;
    const filledChunks = Math.floor(percentageToComplete * totalChunks);

    let chunksHTML = '';
    for (let i = 0; i < totalChunks; i++) {
      const filledClass = i < filledChunks ? ' sui-mod-filled' : '';
      chunksHTML += `<div class="sui-action-bar-progress-bar-chunk${filledClass}"></div>`;
    }

    return `
      <div class="sui-action-bar-progress-bar">
        ${chunksHTML}
      </div>
    `;
  }

  /**
   * @param {string} tileType
   * @param {string} ambitOrTileLabel
   * @param {string} side right or left
   * @param {number|null} slot
   * @param {string|null} structId - ID of struct occupying the tile, null if empty
   */
  showActionBarFor(
    tileType,
    ambitOrTileLabel,
    side,
    slot = null,
    structId = null
  ) {
    if (side === 'left' && this.gameState.actionBarLock.isLocked()) {
      this.showExecutingActionBar();
      return;
    }

    const struct = this.structManager.getStructById(structId);

    // If the struct is building, show the building action bar
    if (struct && !struct.isBuilt()) {
      this.showBuildingActionBar(struct);
      return;
    }

    // If the struct is built, show the built struct action bar
    if (struct && struct.isBuilt()) {
      this.showStructActionBar(struct);
      return;
    }

    // Check if there's a pending build at this position
    const playerId = this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER].id;
    const pendingBuild = this.gameState.getPendingBuild(tileType, ambitOrTileLabel, slot, playerId);

    if (pendingBuild) {
      this.showPendingBuildActionBar(pendingBuild.structType);
    } else {
      this.showEmptyTileActionBar(tileType, ambitOrTileLabel, side, slot);
    }
  }

  showExecutingActionBar() {
    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">Executing</div>
      </div>

      <div class="sui-action-bar-bottom-row">

        <div id="${this.propertiesScreenId}" class="sui-screen">
          <div class="sui-screen-properties">
            <div id="${this.progressBarId}" class="sui-action-bar-progress-bar-wrapper">
              <div class="sui-action-bar-progress-bar sui-mod-animated"></div>
            </div>
          </div>
        </div>

      </div>
    `;

    this.showActionChunk();
  }

  /**
   * Shows the action bar for a pending build (before struct ID is known).
   *
   * @param {StructType} structType
   */
  showPendingBuildActionBar(structType) {
    // Clear current building struct ID (pending builds don't have one yet)
    this.selectedStruct = null;

    const header = structType.class_abbreviation;

    // Pending builds start at 0% progress
    const percentageToComplete = 0;

    const cancelBtnId = `${this.playerType}-action-bar-cancel-btn`;

    const cancelBtn = `
      <div class="sui-action-bar-btn-group">
        <a 
          id="${cancelBtnId}"
          href="javascript: void(0)"
          class="sui-panel-btn sui-mod-disabled"
        >
          <i class="sui-icon-md icon-close"></i>
        </a>
      </div>
    `;

    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">${header}</div>
      </div>

      <div class="sui-action-bar-bottom-row">

        <div id="${this.propertiesScreenId}" class="sui-screen">
          <div class="sui-screen-properties">
            <div id="${this.progressBarId}" class="sui-action-bar-progress-bar-wrapper">
              ${this.renderProgressBar(percentageToComplete)}
            </div>
          </div>
        </div>

        ${cancelBtn}

      </div>
    `;

    this.showActionChunk();
  }

  /**
   * @param {string} tileType
   * @param {string} ambitOrTileLabel
   * @param {string} side right or left
   * @param {number|null} slot
   */
  showEmptyTileActionBar(
    tileType,
    ambitOrTileLabel,
    side,
    slot = null,
  ) {
    // Clear current building struct ID
    this.selectedStruct = null;

    const header = ambitOrTileLabel.toUpperCase();

    const propertyIcon = this.getPropertyIconForTileType(tileType);
    const propertyIconLinkId = `${this.playerType}-action-bar-property-tile-type`;

    const hasDeployButton = tileType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_TILE_TYPES.PLANETARY_SLOT
      || tileType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_TILE_TYPES.FLEET
      || tileType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_TILE_TYPES.COMMAND;
    let deployBtn = '';
    const deployBtnId = `${this.playerType}-action-bar-deploy-btn`;
    let attachDeployBtnHandler = () => {};
    let btnTypeClass = 'sui-mod-disabled';

    if (hasDeployButton) {
      // Only enable deploy button if:
      // 1. It's on the left side (player's side)
      // 2. The map is the alpha base map
      // TODO 3. The player's command ship is on the alpha base
      if (
        side === 'left'
        && this.gameState.activeMapContainerId === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_CONTAINER_IDS.ALPHA_BASE
      ) {
        btnTypeClass = 'sui-mod-default';
        attachDeployBtnHandler = () => {
          document.getElementById(deployBtnId).addEventListener('click', function () {
            const deployOffcanvas = new _offcanvas_DeployOffcanvas__WEBPACK_IMPORTED_MODULE_4__.DeployOffcanvas(
              this.gameState,
              this.signingClientManager,
              this.structManager,
              tileType,
              ambitOrTileLabel,
              slot
            );
            deployOffcanvas.render();
          }.bind(this));
        };
      }

      deployBtn = `
        <div class="sui-action-bar-btn-group">
          <a 
            id="${deployBtnId}"
            href="javascript: void(0)"
            class="sui-panel-btn ${btnTypeClass}"
          >
            <i class="sui-icon-md icon-deploy"></i>
          </a>
        </div>
      `;
    }

    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">${header}</div>
      </div>

      <div class="sui-action-bar-bottom-row">

        <div id="${this.propertiesScreenId}" class="sui-screen">
          <div class="sui-screen-properties">
            <a id="${propertyIconLinkId}" href="javascript: void(0)" data-sui-cheatsheet="${propertyIcon}">
              <i class="sui-icon-md ${propertyIcon}"></i>
            </a>
          </div>
        </div>

        ${deployBtn}

      </div>
    `;

    attachDeployBtnHandler();

    this.showActionChunk();
  }

  /**
   * Shows the action bar for a struct that is currently being built.
   *
   * @param {Struct} struct
   */
  showBuildingActionBar(struct) {
    // Store current building struct ID for progress bar updates
    this.selectedStruct = struct;

    const structType = this.gameState.structTypes.getStructTypeById(struct.type);
    const header = structType.class_abbreviation;

    // Get the build progress
    let percentageToComplete = 0;

    const buildProcess = this.taskManager.getBuildProcessByStructId(struct.id);
    if (buildProcess) {
      percentageToComplete = this.taskManager.getProcessPercentCompleteEstimate(buildProcess.state.getPID());
      console.log(`Build progress: ${percentageToComplete}`);
    }

    const cancelBtnId = `${this.playerType}-action-bar-cancel-btn`;

    // Only the owning player can cancel a build in progress
    const isOwnedByPlayer = struct.owner === this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER].id;

    const cancelBtn = isOwnedByPlayer
      ? `
        <div class="sui-action-bar-btn-group">
          <a 
            id="${cancelBtnId}"
            href="javascript: void(0)"
            class="sui-panel-btn sui-mod-default"
          >
            <i class="sui-icon-md icon-close"></i>
          </a>
        </div>
      `
      : '' ;

    const propertyIconLinkId = `${this.playerType}-action-bar-property-tile-type`;

    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">${header}</div>
      </div>

      <div class="sui-action-bar-bottom-row">

        <div id="${this.propertiesScreenId}" class="sui-screen">
          <div class="sui-screen-properties">
           ${ isOwnedByPlayer
              ? `
                <div id="${this.progressBarId}" class="sui-action-bar-progress-bar-wrapper">
                  ${this.renderProgressBar(percentageToComplete)}
                </div>
              `
              : `
                <a id="${propertyIconLinkId}" href="javascript: void(0)" data-sui-cheatsheet="enemy-struct-deploying">
                  <i class="sui-icon-md icon-wreckage"></i>
                </a>
              `
            }
          </div>
        </div>

        ${cancelBtn}

      </div>
    `;

    if (isOwnedByPlayer) {
      document.getElementById(cancelBtnId).addEventListener('click', function () {
        this.structManager.cancelStructBuild(struct);
      }.bind(this));
    }

    this.showActionChunk();
  }

  /**
   * Determines the panel switch state based on struct online status and player charge.
   *
   * @param {Struct} struct
   * @param {StructType} structType
   * @return {{image: string, state: string, canToggle: boolean}}
   */
  getPanelSwitchState(struct, structType) {
    if (this.isActionAvailable(struct, 0, true, false)) {
      return {
        image: '/img/sui/panel/panel-switch-on.png',
        state: 'on',
        canToggle: true
      };
    }

    if (this.isActionAvailable(struct, structType.activate_charge, false, false)) {
      return {
        image: '/img/sui/panel/panel-switch-off.png',
        state: 'off',
        canToggle: true
      };
    }

    return {
      image: '/img/sui/panel/panel-switch-disabled.png',
      state: 'disabled',
      canToggle: false
    };
  }

  /**
   * Handles panel switch click to toggle struct online/offline state.
   *
   * @param {Struct} struct
   * @param {StructType} structType
   */
  handlePanelSwitchClick(struct, structType) {
    this.releaseConflictingAction([_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ACTIVATE, _constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.DEACTIVATE]);

    if (this.isActionAvailable(struct, 0, true, false)) {
      // Turn off: deactivate the struct
      this.gameState.actionBarLock.setCurrentAction(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.DEACTIVATE);
      this.gameState.actionBarLock.lock();
      this.signingClientManager.queueMsgStructDeactivate(struct.id).then(() => {
        struct.removeStatusFlag(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_STATUS_FLAGS.ONLINE);
        this.showStructActionBar(struct);
        window.dispatchEvent(new _events_ShowStructStillEvent__WEBPACK_IMPORTED_MODULE_16__.ShowStructStillEvent(this.gameState.getActiveMapId(), struct.id));
      });
    } else if (this.isActionAvailable(struct, structType.activate_charge, false, false)){
      // Turn on: activate the struct
      this.gameState.actionBarLock.setCurrentAction(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ACTIVATE);
      this.gameState.actionBarLock.lock();
      this.signingClientManager.queueMsgStructActivate(struct.id, structType.activate_charge).then(() => {
        struct.addStatusFlag(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_STATUS_FLAGS.ONLINE);
        this.showStructActionBar(struct);
        window.dispatchEvent(new _events_ShowStructStillEvent__WEBPACK_IMPORTED_MODULE_16__.ShowStructStillEvent(this.gameState.getActiveMapId(), struct.id));
      });
    }
  }

  /**
   * Shows the action bar for a built (completed) struct.
   *
   * @param {Struct} struct
   */
  showStructActionBar(struct) {
    this.selectedStruct = struct;

    const structType = this.gameState.structTypes.getStructTypeById(struct.type);
    const header = structType.class_abbreviation;

    const isOnline = struct.isOnline();

    // Determine panel switch state
    const panelSwitchState = this.getPanelSwitchState(struct, structType);
    const panelSwitchCursor = panelSwitchState.canToggle ? 'pointer' : 'not-allowed';

    // Build list of property icons based on struct type capabilities and online state
    let propertyIcons;
    if (isOnline && this.isKeyPlayerOverloaded(this.playerType)) {
      propertyIcons = `
        <a href="javascript: void(0)" data-sui-cheatsheet="icon-disabled">
          <i class="sui-icon-md icon-disabled"></i>
        </a>
      `;
    } else if (isOnline) {
      propertyIcons = this.buildStructPropertyIcons(struct, structType);
    } else {
      // Show unpowered icon when offline
      propertyIcons = `
        <a href="javascript: void(0)" data-sui-cheatsheet="icon-unpowered">
          <i class="sui-icon-md icon-unpowered"></i>
        </a>
      `;
    }

    // Build action buttons based on struct type capabilities
    const actionButtons = this.buildStructActionButtons(struct, structType);

    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">${header}</div>
      </div>

      <div class="sui-action-bar-bottom-row">
      
        <div class="sui-action-bar-panel-switch-group">
          <img 
            id="${this.panelSwitchId}" 
            src="${panelSwitchState.image}" 
            alt="panel switch" 
            data-state="${panelSwitchState.state}"
            style="height: 48px; cursor: ${panelSwitchCursor}"
          >
        </div>

        <div id="${this.propertiesScreenId}" class="sui-screen">
          <div class="sui-screen-properties">
            ${propertyIcons}
          </div>
        </div>

        ${
          actionButtons
            ? `
              <div class="sui-action-bar-btn-group">
                ${actionButtons}
              </div>
            `
            : ''
        }

      </div>
    `;

    // Attach panel switch handler if it can be toggled
    if (panelSwitchState.canToggle) {
      document.getElementById(this.panelSwitchId).addEventListener('click', () => {
        this.handlePanelSwitchClick(struct, structType);
      });
    }

    // Attach action button handlers (only functional when online)
    if (isOnline) {
      this.attachStructActionButtonHandlers(struct, structType);
    }

    this.showActionChunk();
  }

  /**
   * @param {string} iconClass
   * @param {string} selectedProperty
   * @param {string} structTypeId
   * @return {string}
   */
  structPropertyIconHtml(iconClass, selectedProperty, structTypeId) {
    return `
      <a href="javascript: void(0)" data-sui-cheatsheet="${structTypeId}" data-selected-property="${selectedProperty}">
        <i class="sui-icon-md ${iconClass}"></i>
      </a>
    `;
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   * @return {string[]}
   */
  buildExtractorPropertyIcons(struct, structType) {
    if (!structType.hasPlanetaryMining()) {
      return [];
    }

    const icons = [];

    icons.push(`
      <a href="javascript: void(0)" data-sui-cheatsheet="icon-undiscovered-ore" data-undiscovered-ore="${this.gameState.keyPlayers[this.playerType].planet.undiscovered_ore}">
        <i class="sui-icon-md icon-undiscovered-ore"></i><span id="${this.undiscoveredOreContainerId}" class="sui-icon-value">${this.gameState.keyPlayers[this.playerType].planet.undiscovered_ore}</span>
      </a> 
    `);

    if (struct.isOnline()) {
      const estInMS = this.taskManager.getProcessTimeRemainingEstimate(this.getSelectedStructId());
      const estFormatted = this.numberFormatter.formatMilliseconds(estInMS);

      icons.push(`
        <a href="javascript: void(0)" data-sui-cheatsheet="extractor-active" data-est-time="${estFormatted}">
          <i class="sui-icon-md icon-in-progress"></i><span id="${this.inProgressValueContainerId}" class="sui-icon-value">${estFormatted}</span>
        </a>
      `);
    }

    return icons;
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   * @return {string[]}
   */
  buildRefineryPropertyIcons(struct, structType) {
    if (!structType.hasPlanetaryRefinery()) {
      return [];
    }

    const icons = [];

    icons.push(`
      <a href="javascript: void(0)" data-sui-cheatsheet="icon-ore-ready" data-ore-ready="${this.gameState.keyPlayers[this.playerType].player.ore}">
        <i class="sui-icon-md icon-ore-ready"></i><span id="${this.oreReadyContainerId}" class="sui-icon-value">${this.gameState.keyPlayers[this.playerType].player.ore}</span>
      </a> 
    `);

    if (struct.isOnline()) {
      const estInMS = this.taskManager.getProcessTimeRemainingEstimate(this.getSelectedStructId());
      const estFormatted = this.numberFormatter.formatMilliseconds(estInMS);

      icons.push(`
        <a href="javascript: void(0)" data-sui-cheatsheet="refinery-active" data-est-time="${estFormatted}">
          <i class="sui-icon-md icon-in-progress"></i><span id="${this.inProgressValueContainerId}" class="sui-icon-value">${estFormatted}</span>
        </a>
      `);
    }

    return icons;
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   * @return {string[]}
   */
  buildPowerGeneratorPropertyIcons(struct, structType) {
    if (!structType.hasPowerGeneration() || !struct.isOnline()) {
      return [];
    }

    const icons = [];

    if (struct.isOnline()) {
      const icon = struct.fuel < 1 ? 'icon-attention' : 'icon-refine';
      icons.push(`
        <a href="javascript: void(0)" data-sui-cheatsheet="${icon}" data-fuel="${struct.fuel}" data-energy="${struct.fuel * structType.generating_rate}">
          <i class="sui-icon-md ${icon}"></i><span class="sui-icon-value">${struct.fuel}</span>
        </a> 
      `);
    }

    return icons;
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   * @return {string}
   */
  buildStructPropertyIcons(struct, structType) {
    const standardPropsMap = {
      'hasPassiveWeaponry': 'passive_weaponry',
      'hasUnitDefenses': 'unit_defenses',
      'hasOreReserveDefenses': 'ore_reserve_defenses',
      'hasPlanetaryDefenses': 'planetary_defenses',
    };
    let icons = [];

    Object.keys(standardPropsMap).forEach((hasEquipmentFn) => {
      if (structType[hasEquipmentFn]()) {
        const prop = standardPropsMap[hasEquipmentFn];
        const equipmentType = structType[prop];
        const iconClass = _constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_EQUIPMENT_ICON_MAP[equipmentType];
        if (!iconClass) {
          console.log(`Missing icon for equipment type: ${hasEquipmentFn}`)
        }
        icons.push(this.structPropertyIconHtml(iconClass, prop, structType.type));
      }
    });

    icons = icons.concat(this.buildExtractorPropertyIcons(struct, structType));
    icons = icons.concat(this.buildRefineryPropertyIcons(struct, structType));
    icons = icons.concat(this.buildPowerGeneratorPropertyIcons(struct, structType));

    return icons.join('');
  }

  /**
   * @return {string}
   */
  getActionBtnIdPrefix() {
    return `${this.playerType}-action-bar`;
  }

  /**
   * @param {Struct} struct
   * @param {number} actionCharge
   * @param {boolean} isOnlineAction
   * @param {boolean} requiresPower whether or not the action requires power
   * @return {boolean}
   */
  isActionAvailable(struct, actionCharge = 0, isOnlineAction = true, requiresPower = true) {
    return (struct.isOnline() === isOnlineAction)
      && !this.gameState.actionBarLock.isLocked()
      && struct.owner === this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER].id
      && (!requiresPower || !this.isKeyPlayerOverloaded(_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER))
      && (!actionCharge || this.gameState.chargeCalculator.isChargeLevelSufficient(
        this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER].getCharge(this.gameState.currentBlockHeight),
        actionCharge
      ));
  }

  /**
   * The action buttons that stay pressed while the player picks a target on
   * the map, keyed by the action each one holds on the action bar lock.
   *
   * @return {Object<string, {btnId: string, activeClass: string, prompt: string, buildClearTargetsEvent: function(string): CustomEvent}>}
   */
  getTargetSelectionButtons() {
    const prefix = this.getActionBtnIdPrefix();

    return {
      [_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON]: {
        btnId: `${prefix}-primary-weapon-btn`,
        activeClass: 'sui-mod-active-offense',
        prompt: 'Select Target',
        buildClearTargetsEvent: (mapId) => new _events_ClearAttackTargetsEvent__WEBPACK_IMPORTED_MODULE_13__.ClearAttackTargetsEvent(mapId)
      },
      [_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ATTACK_SECONDARY_WEAPON]: {
        btnId: `${prefix}-secondary-weapon-btn`,
        activeClass: 'sui-mod-active-offense',
        prompt: 'Select Target',
        buildClearTargetsEvent: (mapId) => new _events_ClearAttackTargetsEvent__WEBPACK_IMPORTED_MODULE_13__.ClearAttackTargetsEvent(mapId)
      },
      [_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.MOVE]: {
        btnId: `${prefix}-move-btn`,
        activeClass: 'sui-mod-active-defense',
        prompt: 'Select Tile',
        buildClearTargetsEvent: (mapId) => new _events_ClearMoveTargetsEvent__WEBPACK_IMPORTED_MODULE_9__.ClearMoveTargetsEvent(mapId)
      },
      [_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.DEFENSE_SET]: {
        btnId: `${prefix}-defend-btn`,
        activeClass: 'sui-mod-active-defense',
        prompt: 'Select Struct',
        buildClearTargetsEvent: (mapId) => new _events_ClearDefendTargetsEvent__WEBPACK_IMPORTED_MODULE_11__.ClearDefendTargetsEvent(mapId)
      }
    };
  }

  /**
   * Turns the header over to the prompt for an action that waits on a map
   * click, so the header names what the player is being asked to pick.
   *
   * @param {string} action see STRUCT_ACTIONS
   */
  showTargetSelectionPrompt(action) {
    const headerScreen = document.getElementById(this.headerScreenId);
    const selectionButton = this.getTargetSelectionButtons()[action];

    if (!headerScreen || !selectionButton) {
      return;
    }

    headerScreen.innerHTML = selectionButton.prompt;
    headerScreen.classList.add('sui-mod-inverted');
  }

  /**
   * Returns the header to the selected struct's abbreviation.
   *
   * Committing an action re-renders the bar into its executing state and
   * clicking away re-renders it for the newly selected tile, but abandoning a
   * selection leaves the bar standing, so the prompt has to be taken down by
   * hand.
   */
  clearTargetSelectionPrompt() {
    const headerScreen = document.getElementById(this.headerScreenId);

    if (!headerScreen || !this.selectedStruct) {
      return;
    }

    headerScreen.innerHTML = this.gameState.structTypes
      .getStructTypeById(this.selectedStruct.type)
      .class_abbreviation;
    headerScreen.classList.remove('sui-mod-inverted');
  }

  /**
   * Releases the button holding an unrelated action on the action bar lock, so
   * that pressing one action button never leaves another pressed with its
   * targets still marked on the map.
   *
   * A locked action is already on its way to the chain and is nobody's to
   * abandon: it is settled by the listener that confirms it. Only an action
   * still waiting on a map click is released here.
   *
   * @param {string[]} ownActions the actions the clicked button sets, which
   * the button handles itself rather than releasing
   */
  releaseConflictingAction(ownActions = []) {
    const currentAction = this.gameState.actionBarLock.getCurrentAction();

    if (
      this.gameState.actionBarLock.isLocked()
      || !currentAction
      || ownActions.includes(currentAction)
    ) {
      return;
    }

    const pressedButton = this.getTargetSelectionButtons()[currentAction];

    if (!pressedButton) {
      return;
    }

    this.gameState.actionBarLock.clear(false);
    this.clearTargetSelectionPrompt();

    const btn = document.getElementById(pressedButton.btnId);
    if (btn) {
      if (btn.hasAttribute('data-active-defense')) {
        btn.setAttribute('data-active-defense', '0');
      }
      btn.classList.remove(pressedButton.activeClass);
      btn.classList.add('sui-mod-default');
    }

    window.dispatchEvent(pressedButton.buildClearTargetsEvent(this.gameState.getActiveMapId()));
  }

  /**
   * @param {array} buttons
   * @param {Struct} struct
   * @param {StructType} structType
   */
  buildPrimaryWeaponActionButton(buttons, struct, structType) {
    if (structType.hasPrimaryWeapon()) {
      const iconClass = structType.primary_weapon_control === 'guided'
        ? 'icon-smart-weapon'
        : 'icon-ballistic-weapon';
      const btnClass = this.isActionAvailable(struct, structType.primary_weapon_charge)
        ? 'sui-mod-default'
        : 'sui-mod-disabled';
      buttons.push(`
        <a 
          id="${this.getActionBtnIdPrefix()}-primary-weapon-btn"
          href="javascript: void(0)"
          class="sui-panel-btn ${btnClass}"
          title="${structType.primary_weapon_label || 'Primary Weapon'}"
          data-sui-cheatsheet="${structType.type}"
          data-selected-property="primary_weapon"
          data-action-charge="${structType.primary_weapon_charge}"
        >
          <i class="sui-icon-md ${iconClass}"></i>
        </a>
      `);
    }
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachPrimaryWeaponButtonHandler(struct, structType) {
    if (structType.hasPrimaryWeapon()) {
      const btn = document.getElementById(`${this.getActionBtnIdPrefix()}-primary-weapon-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (!this.isActionAvailable(struct, structType.primary_weapon_charge)) {
            return;
          }

          const currentAction = this.gameState.actionBarLock.getCurrentAction();

          if (currentAction === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON) {
            // Already in primary weapon mode - cancel
            this.gameState.actionBarLock.clear(false);
            this.clearTargetSelectionPrompt();
            btn.classList.remove('sui-mod-active-offense');
            btn.classList.add('sui-mod-default');
            window.dispatchEvent(new _events_ClearAttackTargetsEvent__WEBPACK_IMPORTED_MODULE_13__.ClearAttackTargetsEvent(this.gameState.getActiveMapId()));
          } else {
            this.releaseConflictingAction([_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON]);

            // Activate primary weapon mode
            this.gameState.actionBarLock.setCurrentAction(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON);
            this.gameState.actionBarLock.setActionSourceStruct(struct);
            this.showTargetSelectionPrompt(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON);
            btn.classList.remove('sui-mod-default');
            btn.classList.add('sui-mod-active-offense');
            window.dispatchEvent(new _events_ShowAttackTargetsEvent__WEBPACK_IMPORTED_MODULE_12__.ShowAttackTargetsEvent(
              this.gameState.getActiveMapId(),
              structType.primary_weapon_ambits_array
            ));
          }
        });
      }
    }
  }

  /**
   * @param {array} buttons
   * @param {Struct} struct
   * @param {StructType} structType
   */
  buildSecondaryWeaponActionButton(buttons, struct, structType) {
    if (structType.hasSecondaryWeapon()) {
      const iconClass = structType.secondary_weapon_control === 'guided'
        ? 'icon-smart-weapon'
        : 'icon-ballistic-weapon';
      const btnClass = this.isActionAvailable(struct, structType.secondary_weapon_charge)
        ? 'sui-mod-default'
        : 'sui-mod-disabled';
      buttons.push(`
        <a 
          id="${this.getActionBtnIdPrefix()}-secondary-weapon-btn"
          href="javascript: void(0)"
          class="sui-panel-btn ${btnClass}"
          title="${structType.secondary_weapon_label || 'Secondary Weapon'}"
          data-sui-cheatsheet="${structType.type}"
          data-selected-property="secondary_weapon"
          data-action-charge="${structType.secondary_weapon_charge}"
        >
          <i class="sui-icon-md ${iconClass}"></i>
        </a>
      `);
    }
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachSecondaryWeaponButtonHandler(struct, structType) {
    if (structType.hasSecondaryWeapon()) {
      const btn = document.getElementById(`${this.getActionBtnIdPrefix()}-secondary-weapon-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (!this.isActionAvailable(struct, structType.secondary_weapon_charge)) {
            return;
          }

          const currentAction = this.gameState.actionBarLock.getCurrentAction();

          if (currentAction === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ATTACK_SECONDARY_WEAPON) {
            // Already in secondary weapon mode - cancel
            this.gameState.actionBarLock.clear(false);
            this.clearTargetSelectionPrompt();
            btn.classList.remove('sui-mod-active-offense');
            btn.classList.add('sui-mod-default');
            window.dispatchEvent(new _events_ClearAttackTargetsEvent__WEBPACK_IMPORTED_MODULE_13__.ClearAttackTargetsEvent(this.gameState.getActiveMapId()));
          } else {
            this.releaseConflictingAction([_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ATTACK_SECONDARY_WEAPON]);

            // Activate secondary weapon mode
            this.gameState.actionBarLock.setCurrentAction(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ATTACK_SECONDARY_WEAPON);
            this.gameState.actionBarLock.setActionSourceStruct(struct);
            this.showTargetSelectionPrompt(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.ATTACK_SECONDARY_WEAPON);
            btn.classList.remove('sui-mod-default');
            btn.classList.add('sui-mod-active-offense');
            window.dispatchEvent(new _events_ShowAttackTargetsEvent__WEBPACK_IMPORTED_MODULE_12__.ShowAttackTargetsEvent(
              this.gameState.getActiveMapId(),
              structType.secondary_weapon_ambits_array
            ));
          }
        });
      }
    }
  }

  /**
   * @param {array} buttons
   * @param {Struct} struct
   * @param {StructType} structType
   */
  buildStealthModeActionButton(buttons, struct, structType) {
    if (structType.stealth_systems) {
      let btnClass;
      if (!this.isActionAvailable(struct, structType.stealth_activate_charge)) {
        btnClass = 'sui-mod-disabled';
      } else if (struct.isHidden()) {
        btnClass = 'sui-mod-active-defense';
      } else {
        btnClass = 'sui-mod-default';
      }
      buttons.push(`
        <a 
          id="${this.getActionBtnIdPrefix()}-stealth-btn"
          href="javascript: void(0)"
          class="sui-panel-btn ${btnClass}"
          title="Stealth Mode"
          data-sui-cheatsheet="${structType.type}"
          data-selected-property="unit_defenses"
          data-action-charge="${structType.stealth_activate_charge}"
          data-active-defense="${struct.isHidden() ? 1 : 0}"
        >
          <i class="sui-icon-md icon-stealth"></i>
        </a>
      `);
    }
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachStealthModeButtonHandler(struct, structType) {
    if (structType.stealth_systems) {
      const btn = document.getElementById(`${this.getActionBtnIdPrefix()}-stealth-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (!this.isActionAvailable(struct, structType.stealth_activate_charge)) {
            return;
          }

          this.releaseConflictingAction([_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.STEALTH_ACTIVATE, _constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.STEALTH_DEACTIVATE]);

          if (struct.isHidden()) {
            this.gameState.actionBarLock.setCurrentAction(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.STEALTH_DEACTIVATE);
            this.gameState.actionBarLock.lock();

            // Deactivate stealth mode
            this.signingClientManager.queueMsgStructStealthDeactivate(struct.id, structType.stealth_activate_charge).then(() => {
              struct.removeStatusFlag(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_STATUS_FLAGS.HIDDEN);
              // Update button to default state
              btn.setAttribute('data-active-defense', '0');
              btn.classList.remove('sui-mod-active-defense');
              btn.classList.add('sui-mod-default');
            });
          } else {
            this.gameState.actionBarLock.setCurrentAction(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.STEALTH_ACTIVATE);
            this.gameState.actionBarLock.lock();

            // Activate stealth mode
            this.signingClientManager.queueMsgStructStealthActivate(struct.id, structType.stealth_activate_charge).then(() => {
              struct.addStatusFlag(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_STATUS_FLAGS.HIDDEN);
              // Update button to active state
              btn.setAttribute('data-active-defense', '1');
              btn.classList.remove('sui-mod-default');
              btn.classList.add('sui-mod-active-defense');
            });
          }
        });
      }
    }
  }

  /**
   * @param {array} buttons
   * @param {Struct} struct
   * @param {StructType} structType
   */
  buildMoveActionButton(buttons, struct, structType) {
    if (structType.movable) {
      const btnClass = this.isActionAvailable(struct, structType.move_charge)
        ? 'sui-mod-default'
        : 'sui-mod-disabled';

      buttons.push(`
        <a 
          id="${this.getActionBtnIdPrefix()}-move-btn"
          href="javascript: void(0)"
          class="sui-panel-btn ${btnClass}"
          title="Move"
          data-sui-cheatsheet="${structType.type}"
          data-selected-property="movable"
          data-action-charge="${structType.move_charge}"
        >
          <i class="sui-icon-md icon-move"></i>
        </a>
      `);
    }
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachMoveButtonHandler(struct, structType) {
    if (structType.movable) {
      const btn = document.getElementById(`${this.getActionBtnIdPrefix()}-move-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (!this.isActionAvailable(struct, structType.move_charge)) {
            return;
          }

          if (btn.classList.contains('sui-mod-active-defense')) {
            // Deactivate move mode
            this.gameState.actionBarLock.clear(false);
            this.clearTargetSelectionPrompt();
            btn.classList.remove('sui-mod-active-defense');
            btn.classList.add('sui-mod-default');

            // Clear move target indicators
            window.dispatchEvent(new _events_ClearMoveTargetsEvent__WEBPACK_IMPORTED_MODULE_9__.ClearMoveTargetsEvent(this.gameState.getActiveMapId()));
          } else {
            this.releaseConflictingAction([_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.MOVE]);

            // Activate move mode
            this.gameState.actionBarLock.setCurrentAction(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.MOVE);
            this.gameState.actionBarLock.setActionSourceStruct(struct);
            this.showTargetSelectionPrompt(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.MOVE);
            btn.classList.remove('sui-mod-default');
            btn.classList.add('sui-mod-active-defense');

            // Show move target indicators on empty command tiles
            window.dispatchEvent(new _events_ShowMoveTargetsEvent__WEBPACK_IMPORTED_MODULE_8__.ShowMoveTargetsEvent(this.gameState.getActiveMapId()));
          }
        });
      }
    }
  }

  /**
   * @param {array} buttons
   * @param {Struct} struct
   * @param {StructType} structType
   */
  buildDefendActionButton(buttons, struct, structType) {
    if (structType.category === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_CATEGORIES.FLEET) {
      let btnClass;
      if (!this.isActionAvailable(struct, structType.defend_change_charge)) {
        btnClass = 'sui-mod-disabled';
      } else if (struct.isDefending()) {
        btnClass = 'sui-mod-active-defense';
      } else {
        btnClass = 'sui-mod-default';
      }

      buttons.push(`
        <a 
          id="${this.getActionBtnIdPrefix()}-defend-btn"
          href="javascript: void(0)"
          class="sui-panel-btn ${btnClass}"
          title="Defend"
          data-sui-cheatsheet="${structType.type}"
          data-action-button="defend"
          data-action-charge="${structType.defend_change_charge}"
          data-active-defense="${struct.isDefending() ? 1 : 0}"
        >
          <i class="sui-icon-md icon-defend"></i>
        </a>
      `);
    }
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachDefendButtonHandler(struct, structType) {
    if (structType.category === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_CATEGORIES.FLEET) {
      const btn = document.getElementById(`${this.getActionBtnIdPrefix()}-defend-btn`);
      if (btn) {
        btn.addEventListener('click', async () => {
          if (!this.isActionAvailable(struct, structType.defend_change_charge)) {
            return;
          }

          const currentAction = this.gameState.actionBarLock.getCurrentAction();

          this.releaseConflictingAction([_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.DEFENSE_SET, _constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.DEFENSE_CLEAR]);

          if (struct.isDefending()) {
            // Struct is currently defending another struct - clicking clears the defense
            this.gameState.actionBarLock.setCurrentAction(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.DEFENSE_CLEAR);
            this.gameState.actionBarLock.setActionSourceStruct(struct);
            this.gameState.actionBarLock.lock();

            // Update button to default state while processing
            btn.setAttribute('data-active-defense', '0');
            btn.classList.remove('sui-mod-active-defense');
            btn.classList.add('sui-mod-default');

            // Send defense clear message to chain
            await this.signingClientManager.queueMsgStructDefenseClear(struct.id, structType.defend_change_charge);

          } else if (currentAction === _constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.DEFENSE_SET) {
            // Already in defense selection mode - cancel it
            this.gameState.actionBarLock.clear(false);
            this.clearTargetSelectionPrompt();

            // Update button to default state
            btn.setAttribute('data-active-defense', '0');
            btn.classList.remove('sui-mod-active-defense');
            btn.classList.add('sui-mod-default');

            // Clear defend target indicators
            window.dispatchEvent(new _events_ClearDefendTargetsEvent__WEBPACK_IMPORTED_MODULE_11__.ClearDefendTargetsEvent(this.gameState.getActiveMapId()));

          } else {
            // Activate defense selection mode
            this.gameState.actionBarLock.setCurrentAction(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.DEFENSE_SET);
            this.gameState.actionBarLock.setActionSourceStruct(struct);
            this.showTargetSelectionPrompt(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.DEFENSE_SET);

            // Update button to active state
            btn.setAttribute('data-active-defense', '1');
            btn.classList.remove('sui-mod-default');
            btn.classList.add('sui-mod-active-defense');

            // Mark enemy structs as invalid
            window.dispatchEvent(new _events_ShowDefendTargetsEvent__WEBPACK_IMPORTED_MODULE_10__.ShowDefendTargetsEvent(this.gameState.getActiveMapId()));
          }
        });
      }
    }
  }

  /**
   * @param {array} buttons
   * @param {Struct} struct
   * @param {StructType} structType
   */
  buildConsumeAlphaActionButton(buttons, struct, structType) {
    if (structType.hasPowerGeneration()) {
      const btnClass = this.isActionAvailable(struct)
        ? 'sui-mod-default'
        : 'sui-mod-disabled';
      buttons.push(`
        <a 
          id="${this.getActionBtnIdPrefix()}-consume-alpha-btn"
          href="javascript: void(0)"
          class="sui-panel-btn ${btnClass}"
          title="Consume Alpha"
          data-sui-cheatsheet="${structType.type}"
          data-selected-property="power_generation"
          data-action-charge="0"
        >
          <i class="sui-icon-md icon-send-alpha"></i>
        </a>
      `);
    }
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachConsumeAlphaButtonHandler(struct, structType) {
    if (structType.hasPowerGeneration()) {
      const btn = document.getElementById(`${this.getActionBtnIdPrefix()}-consume-alpha-btn`);
      if (!btn) return;

      btn.addEventListener('click', () => {
        if (!this.isActionAvailable(struct)) return;

        this.releaseConflictingAction();

        const offcanvas = new _offcanvas_ConsumeAlphaOffcanvas__WEBPACK_IMPORTED_MODULE_17__.ConsumeAlphaOffcanvas(
          this.gameState,
          this.alphaManager,
          this.grassManager,
          struct,
          structType
        );
        offcanvas.render();
      });
    }
  }

  /**
   * Builds the HTML for struct action buttons based on struct type capabilities.
   *
   * @param {Struct} struct
   * @param {StructType} structType
   * @return {string} HTML for action buttons
   */
  buildStructActionButtons(struct, structType) {
    const buttons = [];

    this.buildPrimaryWeaponActionButton(buttons, struct, structType);
    this.buildSecondaryWeaponActionButton(buttons, struct, structType);
    this.buildStealthModeActionButton(buttons, struct, structType);
    this.buildMoveActionButton(buttons, struct, structType);
    this.buildDefendActionButton(buttons, struct, structType);
    this.buildConsumeAlphaActionButton(buttons, struct, structType);

    return buttons.join('');
  }

  /**
   * Attaches click handlers to struct action buttons.
   *
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachStructActionButtonHandlers(struct, structType) {
    this.attachPrimaryWeaponButtonHandler(struct, structType);
    this.attachSecondaryWeaponButtonHandler(struct, structType);
    this.attachStealthModeButtonHandler(struct, structType);
    this.attachMoveButtonHandler(struct, structType);
    this.attachDefendButtonHandler(struct, structType);
    this.attachConsumeAlphaButtonHandler(struct, structType);
  }

  renderHTML() {
    let actionChunkLeftHTML = '';
    let actionChunkRightHTML = `
      <div id="${this.connectorId}" class="sui-panel-connector hidden"></div>
      <div id="${this.actionChunkId}" class="sui-panel-chunk hidden"></div>
    `;

    if (this.align === 'right') {
      actionChunkLeftHTML = `
        <div id="${this.actionChunkId}" class="sui-panel-chunk hidden"></div>
        <div id="${this.connectorId}" class="sui-panel-connector hidden"></div>
      `;
      actionChunkRightHTML = '';
    }

    return `
      <div id="${this.id}" class="sui-panel-wrapper-fit-content action-bar-bottom-${this.align}">
        <div class="sui-panel ${this.themeClass}">
          <div class="sui-panel-edge-left"></div>
          
            ${actionChunkLeftHTML}
          
            ${this.renderPortraitChunkHTML()}
            
            ${actionChunkRightHTML}
                      
          <div class="sui-panel-edge-right"></div>
        </div>
      </div>
    `;
  }
}

/***/ },

/***/ "./js/view_models/components/hud/StatusBarTopLeftComponent.js"
/*!********************************************************************!*\
  !*** ./js/view_models/components/hud/StatusBarTopLeftComponent.js ***!
  \********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StatusBarTopLeftComponent: () => (/* binding */ StatusBarTopLeftComponent)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../framework/AbstractViewModelComponent */ "./js/framework/AbstractViewModelComponent.js");
/* harmony import */ var _EnergyUsageComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../EnergyUsageComponent */ "./js/view_models/components/EnergyUsageComponent.js");



class StatusBarTopLeftComponent extends _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {string} id
   */
  constructor(gameState, id) {
    super(gameState);
    this.id = id;
    this.energyUsageComponent = new _EnergyUsageComponent__WEBPACK_IMPORTED_MODULE_1__.EnergyUsageComponent(gameState, 'hud-energy-usage');
  }


  initPageCode() {
    this.energyUsageComponent.initPageCode();
  }

  renderHTML() {
    return `
      <div id="${this.id}" class="sui-status-bar-panel status-bar-panel-top-left">
        ${this.energyUsageComponent.renderHTML()}
      </div>
    `;
  }
}

/***/ },

/***/ "./js/view_models/components/hud/StatusBarTopRightComponent.js"
/*!*********************************************************************!*\
  !*** ./js/view_models/components/hud/StatusBarTopRightComponent.js ***!
  \*********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StatusBarTopRightComponent: () => (/* binding */ StatusBarTopRightComponent)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../framework/AbstractViewModelComponent */ "./js/framework/AbstractViewModelComponent.js");
/* harmony import */ var _constants_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../constants/Events */ "./js/constants/Events.js");
/* harmony import */ var _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../constants/MapConstants */ "./js/constants/MapConstants.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");
/* harmony import */ var _ShieldStatusComponent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../ShieldStatusComponent */ "./js/view_models/components/ShieldStatusComponent.js");






class StatusBarTopRightComponent extends _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {Boolean} isRaidPlanet
   * @param {string} id
   * @param {string} planetOwnerPlayerType the type of key player that owns the planet
   */
  constructor(gameState, isRaidPlanet, id, planetOwnerPlayerType) {
    super(gameState);
    this.id = id;
    this.isRaidPlanet = isRaidPlanet;
    this.planetOwnerPlayerType = planetOwnerPlayerType;
    this.prefix = '';
    this.theme = '';
    this.oreCountChangedEvent = _constants_Events__WEBPACK_IMPORTED_MODULE_1__.EVENTS.ORE_COUNT_CHANGED;

    if (this.isRaidPlanet) {
      this.prefix = 'raid-';
      this.theme = 'sui-theme-enemy';
    }

    this.startHidden = ((this.gameState.activeMapContainerId === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_2__.MAP_CONTAINER_IDS.RAID) === this.isRaidPlanet)
      ? '' : 'hidden';

    this.hudShieldStatusId = `${this.prefix}hud-shield-status`;
    this.hudOreValueId = `${this.prefix}hud-ore`;
    this.hudOreHintId = `${this.prefix}${this.hudOreValueId}-hint`;

    this.shieldStatusComponent = new _ShieldStatusComponent__WEBPACK_IMPORTED_MODULE_4__.ShieldStatusComponent(
      this.gameState,
      this.planetOwnerPlayerType,
      this.hudShieldStatusId
    );
  }

  initPageCode() {
    this.shieldStatusComponent.initPageCode();

    window.addEventListener(this.oreCountChangedEvent, function (event) {
      if (
        (this.isRaidPlanet && event.playerType === _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.RAID_ENEMY && this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.RAID_ENEMY].player)
        || (!this.isRaidPlanet && event.playerType === _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER && this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_3__.PLAYER_TYPES.PLAYER].player)
      ) {
        document.getElementById(this.hudOreValueId).innerText = `${this.gameState.keyPlayers[event.playerType].player.ore}`;
      }
    }.bind(this));
  }

  renderHTML() {
    return `
      <div id="${this.id}" class="sui-status-bar-panel status-bar-panel-top-right ${this.theme} ${this.startHidden}">
        ${this.shieldStatusComponent.renderHTML()}
        <a 
          id="${this.hudOreHintId}" 
          class="sui-resource"
          href="javascript: void(0)" 
          data-sui-tooltip="Alpha Ore"
        >
          <i class="sui-icon sui-icon-alpha-ore"></i>
          <span id="${this.hudOreValueId}"></span>
        </a>
      </div>
    `;
  }
}

/***/ },

/***/ "./js/view_models/components/map/GenericMapLayerComponent.js"
/*!*******************************************************************!*\
  !*** ./js/view_models/components/map/GenericMapLayerComponent.js ***!
  \*******************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GenericMapLayerComponent: () => (/* binding */ GenericMapLayerComponent)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../framework/AbstractViewModelComponent */ "./js/framework/AbstractViewModelComponent.js");
/* harmony import */ var _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../constants/MapConstants */ "./js/constants/MapConstants.js");
/* harmony import */ var _models_Player__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../models/Player */ "./js/models/Player.js");
/* harmony import */ var _dtos_MapStructTileRenderParamsDTO__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../dtos/MapStructTileRenderParamsDTO */ "./js/dtos/MapStructTileRenderParamsDTO.js");
/* harmony import */ var _models_Struct__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../models/Struct */ "./js/models/Struct.js");
/* harmony import */ var _models_Fleet__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../models/Fleet */ "./js/models/Fleet.js");








class GenericMapLayerComponent extends _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {string} tileRowClass
   * @param {string} tileClass
   * @param {StructManager} structManager
   * @param {string[]} mapColBreakdown
   * @param {(Planet|null)} planet
   * @param {Player|null} defender
   * @param {Player|null} attacker
   * @param {Fleet|null} defenderFleet
   * @param {Fleet|null} attackerFleet
   * @param {string} containerId
   * @param {string} mapId
   */
  constructor(
    gameState,
    tileRowClass,
    tileClass,
    structManager,
    mapColBreakdown,
    planet,
    defender,
    attacker,
    defenderFleet = null,
    attackerFleet = null,
    containerId = "",
    mapId = ""
  ) {
    super(gameState);
    this.tileRowClass = tileRowClass;
    this.tileClass = tileClass;
    this.structManager = structManager;
    this.mapColBreakdown = mapColBreakdown;
    this.dividerIndex = this.mapColBreakdown.lastIndexOf(_constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_DIVIDER);
    this.planet = planet;
    this.defender = defender;
    this.attacker = attacker;
    this.defenderFleet = defenderFleet;
    this.attackerFleet = attackerFleet;
    this.containerId = containerId;
    this.mapId = mapId;
  }

  /**
   * @param {number} col
   * @return {string}
   */
  getTileSide(col) {
    if (col < this.dividerIndex) {
      return 'left';
    } else if (col === this.dividerIndex) {
      return '';
    } else {
      return 'right';
    }
  }

  /**
   * Check if tile has required position data attributes
   * @param {string} tileType
   * @param {string} ambit
   * @param {string} slot
   * @param {string} playerId
   * @return {boolean}
   */
  hasTilePositionData(tileType, ambit, slot, playerId) {
    return !!(tileType && ambit && slot !== '' && playerId);
  }

  /**
   * Build CSS selector for finding a struct tile
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @return {string}
   */
  buildTileSelector(tileType, ambit, slot, playerId) {
    return `.${this.tileClass}[data-tile-type="${tileType}"][data-ambit="${ambit}"][data-slot="${slot}"][data-player-id="${playerId}"]`;
  }

  /**
   * Get location info for a tile based on its type and player
   * @param {string} tileType
   * @param {string} playerId
   * @return {{locationType: string, locationId: string|null, isCommandSlot: boolean}|null}
   */
  getLocationInfoFromTile(tileType, playerId) {
    if (tileType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.PLANETARY_SLOT) {
      return {
        locationType: 'planet',
        locationId: this.planet.id,
        isCommandSlot: false
      };
    }

    if (tileType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.COMMAND || tileType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.FLEET) {
      let locationId = null;
      if (this.defender && playerId === this.defender.id) {
        locationId = this.defender.fleet_id;
      } else if (this.attacker && playerId === this.attacker.id) {
        locationId = this.attacker.fleet_id;
      }

      return {
        locationType: 'fleet',
        locationId: locationId,
        isCommandSlot: (tileType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.COMMAND)
      };
    }

    return null;
  }

  /**
   * @param {string} tileType the tile type. See MAP_TILE_TYPES constant array.
   * @param {string} side the side of the map the tile is on
   * @param {string} playerId the ID of the player that owns the tile or empty if no one does such as a transition tile.
   * @param {string} ambit the ambit the tile is in or empty if it's a transition tile.
   * @param {string|number} slot the planetary or fleet slot number. Empty if it's not a command, planetary, fleet or command tile.
   * @return {string}
   */
  renderTileHTML(
    tileType,
    side = "",
    playerId = "",
    ambit = "",
    slot = ""
  ) {
    return `
      <div
        class="${this.tileClass} mod-side-${side}"
        data-tile-type="${tileType}"
        data-side="${side}"
        data-player-id="${playerId}"
        data-ambit="${ambit}"
        data-slot="${slot}"
        data-struct-id=""
      ></div>
    `;
  }

  renderFogOfWarTileHTML(mapColType) {
    if (this.attacker) {
      return '';
    }

    const mapColTypeLastIndex = this.mapColBreakdown.lastIndexOf(mapColType);
    const attackerSide = (this.mapColBreakdown[0] === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_ATTACKER_COMMAND) ? 'LEFT' : 'RIGHT';

    if (this.dividerIndex === -1 || mapColTypeLastIndex === -1) {
      throw new Error('Divider or map col type not found');
    }

    if (
      mapColType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_DIVIDER
      || (attackerSide === 'RIGHT' && this.dividerIndex < mapColTypeLastIndex)
      || (attackerSide === 'LEFT' && mapColTypeLastIndex < this.dividerIndex)
    ) {
      return this.renderTileHTML(
        _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.FOG_OF_WAR,
        attackerSide.toLowerCase()
      );
    }

    return '';
  }

  /**
   * @param {string} topAmbit the ambit that is on top in the transition
   * @param {string} bottomAmbit the ambit that is on the bottom in the transition
   * @param {boolean} isInFinalTransitionPosition is this for the final transition of the map
   * @param {number|null} totalAmbits the total number of ambits in the ambit
   * @param {number|null} bottomAmbitIndex the ambit index of the bottom ambit
   * @return {string} the row of struct tiles for the whole transition row
   */
  renderTransitionRowHTML(
    topAmbit,
    bottomAmbit,
    isInFinalTransitionPosition = false,
    totalAmbits = null,
    bottomAmbitIndex= null
  ) {
    const isFinalTransition = isInFinalTransitionPosition && (bottomAmbitIndex === (totalAmbits - 1));

    if (isInFinalTransitionPosition && !isFinalTransition) {
      return '';
    }

    let tiles = '';

    for (let c = 0; c < this.mapColBreakdown.length; c++) {
      tiles += this.renderFogOfWarTileHTML(this.mapColBreakdown[c])
        || this.renderTileHTML(
          _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.TRANSITION,
          this.getTileSide(c)
        );
    }

    return `
      <div class="${this.tileRowClass}">
        ${tiles}
      </div>
    `;
  }

  /**
   * Creates a command slot tracker object for an ambit.
   * Each command column type gets 1 usable slot per ambit.
   *
   * @return {Object} commandSlotTracker
   */
  createCommandSlotTracker() {
    return {
      [_constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_DEFENDER_COMMAND]: _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_DEFAULT_COMMAND_COL_COUNT,
      [_constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_ATTACKER_COMMAND]: _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_DEFAULT_COMMAND_COL_COUNT,
    };
  }

  /**
   * @param {string} mapColType
   * @param {string} side
   * @param {string} ambit
   * @param {Object} commandSlotTracker
   * @return {string}
   */
  renderCommandTileHTML(
    mapColType,
    side,
    ambit,
    commandSlotTracker
  ) {
    let playerId = '';

    if (mapColType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_DEFENDER_COMMAND) {
      playerId = this.defender.id;
    } else if (mapColType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_ATTACKER_COMMAND) {
      playerId = this.attacker.id;
    } else {
      return '';
    }

    // Check if there's an available command slot for this column type
    const hasAvailableSlot = commandSlotTracker[mapColType] > 0;

    if (hasAvailableSlot) {
      commandSlotTracker[mapColType]--;
    }

    const tileType = hasAvailableSlot
      ? _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.COMMAND
      : _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.COMMAND_BLOCKED;

    // Command structs are always slot 0 in a fleet
    return this.renderTileHTML(
      tileType,
      side,
      playerId,
      ambit,
      hasAvailableSlot ? 0 : ''
    );
  }

  /**
   * @param {string} mapColType
   * @param {string} side
   * @param {string} ambit
   * @param {string} slot
   * @return {string}
   */
  renderPlanetaryTileHTML(
    mapColType,
    side,
    ambit,
    slot
  ) {
    if (mapColType !== _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_DEFENDER_PLANETARY) {
      return '';
    }

    const tileType = (slot === '')
      ? _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.PLANETARY_BLOCKED
      : _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.PLANETARY_SLOT;

    return this.renderTileHTML(
      tileType,
      side,
      this.defender.id,
      ambit,
      slot
    );
  }

  /**
   * @param {string} mapColType
   * @param {string} side
   * @param {string} ambit
   * @param {string} slot
   * @return {string}
   */
  renderFleetTileHTML(
    mapColType,
    side,
    ambit,
    slot
  ) {
    if (mapColType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_DEFENDER_FLEET) {
      return this.renderTileHTML(_constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.FLEET, side, this.defender.id, ambit, slot);
    }
    if (mapColType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_ATTACKER_FLEET) {
      return this.renderTileHTML(_constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.FLEET, side, this.attacker.id, ambit, slot);
    }
    return '';
  }

  /**
   * @param {string} mapColType
   * @param {string} ambit
   * @return {string}
   */
  renderDividerTileHTML(
    mapColType,
    ambit
  ) {
    if (mapColType !== _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_DIVIDER) {
      return '';
    }

    return this.renderTileHTML(
      _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.DIVIDER,
      '',
      '',
      ambit
    );
  }

  /**
   * @param {string} targetColType
   * @return {{first: null|number, last: null|number}}
   */
  findFirstAndLastOccurrencesOfColType(targetColType) {
    const first = this.mapColBreakdown.indexOf(targetColType);
    return {
      first: first === -1 ? null : first,
      last: first === -1 ? null : this.mapColBreakdown.lastIndexOf(targetColType)
    };
  }

  /**
   * @param {string} targetColType
   * @param {number} currentMapRowIndex
   * @param {number} currentMapColIndex
   * @param {number} totalSlots
   * @return {string}
   */
  calcSlotNumber(
    targetColType,
    currentMapRowIndex,
    currentMapColIndex,
    totalSlots
  ) {
    let targetColTypeOccurrences = this.findFirstAndLastOccurrencesOfColType(targetColType);

    const tilesOfTargetTypePerRow = (targetColTypeOccurrences.last - targetColTypeOccurrences.first) + 1;

    // Slot indexing from right to left
    const slotsToReserveThisRow = (targetColTypeOccurrences.last - currentMapColIndex);
    let slotNumber = slotsToReserveThisRow + currentMapRowIndex * tilesOfTargetTypePerRow;

    // Slot indexing from left to right
    if (this.mapColBreakdown[0] === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_ATTACKER_COMMAND) {
      const slotsAssignedThisRow = currentMapColIndex - targetColTypeOccurrences.first;
      slotNumber = slotsAssignedThisRow + currentMapRowIndex * tilesOfTargetTypePerRow;
    }

    return (slotNumber >= totalSlots) ? '' : `${slotNumber}`;
  }



  /**
   * @return {string}
   */
  renderHTML() {
    let html = '';
    let previousAmbit = '';

    const planetAmbits = this.planet.getAmbits();

    for (let a = 0; a < planetAmbits.length; a++) {

      const currentAmbit = planetAmbits[a];
      const numPlanetarySlots = this.planet.getPlanetarySlotsByAmbit(currentAmbit, this.gameState.structTypes);
      const totalFleetSlotsPerAmbitPerPlayer = _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_ROWS_PER_AMBIT * _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_DEFAULT_FLEET_COL_COUNT;
      const commandSlotTracker = this.createCommandSlotTracker();

      html += this.renderTransitionRowHTML(previousAmbit, currentAmbit);

      for (let r = 0; r < _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_ROWS_PER_AMBIT; r++) {

        html += `<div class="${this.tileRowClass}">`;

        for (let c = 0; c < this.mapColBreakdown.length; c++) {

          const mapColType = this.mapColBreakdown[c];
          let side = this.getTileSide(c);

          html += this.renderFogOfWarTileHTML(mapColType)
            || this.renderCommandTileHTML(mapColType, side, currentAmbit, commandSlotTracker)
            || this.renderPlanetaryTileHTML(
              mapColType,
              side,
              currentAmbit,
              this.calcSlotNumber(_constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_COL_DEFENDER_PLANETARY, r, c, numPlanetarySlots)
            )
            || this.renderFleetTileHTML(
              mapColType,
              side,
              currentAmbit,
              this.calcSlotNumber(mapColType, r, c, totalFleetSlotsPerAmbitPerPlayer)
            )
            || this.renderDividerTileHTML(mapColType, currentAmbit)
          ;
        }

        html += `</div>`;
      }

      html += this.renderTransitionRowHTML(
        previousAmbit,
        currentAmbit,
        true,
        planetAmbits.length,
        a
      );

      previousAmbit = currentAmbit;
    }

    return html;
  }

  /**
   * Clear a tile by position (e.g., when build is canceled).
   *
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   */
  clearTile(tileType, ambit, slot, playerId) {
    const selector = this.buildTileSelector(tileType, ambit, slot, playerId);
    const container = document.getElementById(this.containerId);
    const tileElement = container.querySelector(selector);
    if (tileElement) {
      tileElement.innerHTML = '';
      tileElement.setAttribute('data-struct-id', '');
    }
  }

  /**
   * @param {string} playerId
   * @return {Fleet|null}
   */
  getFleetByPlayerId(playerId) {
    if (this.attackerFleet?.owner === playerId) {
      return this.attackerFleet;
    } else if (this.defenderFleet?.owner === playerId) {
      return this.defenderFleet;
    }
    return null;
  }

  buildMapStructTilRenderParamsFromTileElement(tileElement) {
    const renderParams = new _dtos_MapStructTileRenderParamsDTO__WEBPACK_IMPORTED_MODULE_3__.MapStructTileRenderParamsDTO();
    renderParams.tileElement = tileElement;

    const tileType = tileElement.getAttribute('data-tile-type');
    const ambit = tileElement.getAttribute('data-ambit');
    const slot = tileElement.getAttribute('data-slot');
    const playerId = tileElement.getAttribute('data-player-id');

    if (!this.hasTilePositionData(tileType, ambit, slot, playerId)) {
      return null;
    }

    const locationInfo = this.getLocationInfoFromTile(tileType, playerId);
    if (!locationInfo) {
      return null;
    }

    const slotNum = parseInt(slot, 10);
    const fleet = this.getFleetByPlayerId(playerId);

    renderParams.struct = this.structManager.getStructByPositionAndPlayerId(
      playerId,
      locationInfo.locationType,
      locationInfo.locationId,
      this.planet.id,
      ambit,
      slotNum,
      locationInfo.isCommandSlot,
      fleet
    );

    return renderParams;
  }

  /**
   * @param {Struct} struct
   * @return {MapStructTileRenderParamsDTO|null}
   */
  buildMapStructTilRenderParamsFromStruct(struct) {
    const renderParams = new _dtos_MapStructTileRenderParamsDTO__WEBPACK_IMPORTED_MODULE_3__.MapStructTileRenderParamsDTO();
    renderParams.struct = struct;

    const tileType = this.structManager.getTileTypeFromStruct(struct);

    if (!tileType) {
      return null;
    }

    // Tiles are matched by position and owner alone, so a planetary struct from
    // another planet would otherwise land on this planet's tile in the same slot.
    if (tileType === _constants_MapConstants__WEBPACK_IMPORTED_MODULE_1__.MAP_TILE_TYPES.PLANETARY_SLOT && struct.location_id !== this.planet?.id) {
      return null;
    }

    const ambit = struct.operating_ambit ? struct.operating_ambit.toUpperCase() : '';
    const selector = this.buildTileSelector(tileType, ambit, struct.slot, struct.owner);
    const container = document.getElementById(this.containerId);
    renderParams.tileElement = container.querySelector(selector);

    if (!renderParams.tileElement) {
      return null;
    }

    return renderParams;
  }
}


/***/ },

/***/ "./js/view_models/components/offcanvas/ConsumeAlphaOffcanvas.js"
/*!**********************************************************************!*\
  !*** ./js/view_models/components/offcanvas/ConsumeAlphaOffcanvas.js ***!
  \**********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConsumeAlphaOffcanvas: () => (/* binding */ ConsumeAlphaOffcanvas)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../framework/AbstractViewModelComponent */ "./js/framework/AbstractViewModelComponent.js");
/* harmony import */ var _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../framework/MenuPage */ "./js/framework/MenuPage.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");
/* harmony import */ var _GenericResourceComponent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../GenericResourceComponent */ "./js/view_models/components/GenericResourceComponent.js");
/* harmony import */ var _util_NumberFormatter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../util/NumberFormatter */ "./js/util/NumberFormatter.js");
/* harmony import */ var _models_Struct__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../models/Struct */ "./js/models/Struct.js");
/* harmony import */ var _models_StructType__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../models/StructType */ "./js/models/StructType.js");
/* harmony import */ var _constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../constants/StructConstants */ "./js/constants/StructConstants.js");
/* harmony import */ var _grass_listeners_GridStructListener__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../grass_listeners/GridStructListener */ "./js/grass_listeners/GridStructListener.js");
/* harmony import */ var _grass_listeners_ConsumeAlphaChangeListener__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../grass_listeners/ConsumeAlphaChangeListener */ "./js/grass_listeners/ConsumeAlphaChangeListener.js");











class ConsumeAlphaOffcanvas extends _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {AlphaManager} alphaManager
   * @param {GrassManager} grassManager
   * @param {Struct} struct
   * @param {StructType} structType
   */
  constructor(
    gameState,
    alphaManager,
    grassManager,
    struct,
    structType
  ) {
    super(gameState);
    this.alphaManager = alphaManager;
    this.grassManager = grassManager;
    this.struct = struct;
    this.structType = structType;

    this.amountInputId = 'consumeAlphaAmountInput';
    this.consumeAlphaBtnId = 'consumeAlphaBtn';
    this.projectedSupplyId = 'projectedSupply';
    this.gameState.setTransferAmount(0);
    this.maxAlpha = parseInt(this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_2__.PLAYER_TYPES.PLAYER].player.alpha) || 0;
    this.preexistingSupply = this.struct.fuel * this.structType.generating_rate;

    this.genericResourceComponent = new _GenericResourceComponent__WEBPACK_IMPORTED_MODULE_3__.GenericResourceComponent(gameState);
    this.numberFormatter = new _util_NumberFormatter__WEBPACK_IMPORTED_MODULE_4__.NumberFormatter();
  }

  initPageCode() {
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.sui.inputStepper.autoInitAll();

    const amountInput = document.getElementById(this.amountInputId);
    const decreaseBtn = amountInput.previousElementSibling;
    const increaseBtn = amountInput.nextElementSibling;
    const projectSupply = document.getElementById(`${this.projectedSupplyId}-value`);

    const inputStepperChangeHandler = () => {
      const consumeAlphaBtn = document.getElementById(this.consumeAlphaBtnId);
      const amount = parseInt(document.getElementById(this.amountInputId).value);
      if (0 < amount && amount <= this.maxAlpha) {
        consumeAlphaBtn.disabled = false;
        consumeAlphaBtn.classList.add('sui-mod-primary');
        consumeAlphaBtn.classList.remove('sui-mod-disabled');
      } else {
        consumeAlphaBtn.disabled = true;
        consumeAlphaBtn.classList.add('sui-mod-disabled');
        consumeAlphaBtn.classList.remove('sui-mod-primary');
      }

      projectSupply.innerText = this.numberFormatter.format(this.preexistingSupply + (amount * this.structType.generating_rate));
    }

    decreaseBtn.addEventListener('click', inputStepperChangeHandler);
    increaseBtn.addEventListener('click', inputStepperChangeHandler);
    amountInput.addEventListener('input', inputStepperChangeHandler);

    document.getElementById(this.consumeAlphaBtnId).addEventListener('click', () => {
      this.gameState.actionBarLock.setCurrentAction(_constants_StructConstants__WEBPACK_IMPORTED_MODULE_7__.STRUCT_ACTIONS.CONSUME_ALPHA);
      this.gameState.actionBarLock.lock();

      this.grassManager.registerListener(new _grass_listeners_GridStructListener__WEBPACK_IMPORTED_MODULE_8__.GridStructListener(this.gameState, this.struct.id));
      this.grassManager.registerListener(new _grass_listeners_ConsumeAlphaChangeListener__WEBPACK_IMPORTED_MODULE_9__.ConsumeAlphaChangeListener(this.gameState, this.struct.id));

      const amount = parseInt(document.getElementById(this.amountInputId).value);
      this.alphaManager.structGeneratorInfuse(this.struct.id, amount).then();
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.sui.offcanvas.close();
    })
  }

  /**
   * @return {string}
   */
  renderHTML() {
    return `
        <div class="offcanvas-consume-alpha-layout">
          <div>Spend Alpha Matter to generate energy.</div>
          
          <div>
            <div class="sui-input-stepper">
              <button class="sui-screen-btn sui-mod-secondary">
                <i class="sui-icon sui-icon-md icon-subtract"></i>
              </button>
              <input
                id="${this.amountInputId}"
                name="${this.amountInputId}"
                type="number"
                step="1"
                min="0"
                max="${this.maxAlpha}"
                value="0"
              >
              <button class="sui-screen-btn sui-mod-secondary">
                <i class="sui-icon sui-icon-md icon-add"></i>
              </button>
            </div>
          </div>
          
          <div class="sui-data-card-row">
            <div>
              Projected<br>
              Supply:
            </div>
            <div>
              ${
                this.genericResourceComponent.renderHTML(
                  this.projectedSupplyId,
                  'sui-icon-energy',
                  'Project Energy Supply',
                  this.numberFormatter.format(this.preexistingSupply)
                )
              }
            </div>
          </div>
          
          <div class="sui-screen-btn-flex-wrapper">
            <button id="${this.consumeAlphaBtnId}" class="sui-screen-btn sui-mod-disabled" disabled>Consume Alpha</button>
          </div>
        </div>
     `;
  }

  render() {
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.sui.offcanvas.setHeader('Consume Alpha');
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.sui.offcanvas.setContent(this.renderHTML());
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.sui.offcanvas.open(_framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.sui.offcanvas.narrow);
    this.initPageCode();
  }
}


/***/ },

/***/ "./js/view_models/components/offcanvas/DeployOffcanvas.js"
/*!****************************************************************!*\
  !*** ./js/view_models/components/offcanvas/DeployOffcanvas.js ***!
  \****************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DeployOffcanvas: () => (/* binding */ DeployOffcanvas)
/* harmony export */ });
/* harmony import */ var _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../framework/AbstractViewModelComponent */ "./js/framework/AbstractViewModelComponent.js");
/* harmony import */ var _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../framework/MenuPage */ "./js/framework/MenuPage.js");
/* harmony import */ var _builders_StructStillBuilder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../builders/StructStillBuilder */ "./js/builders/StructStillBuilder.js");
/* harmony import */ var _constants_MapConstants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../constants/MapConstants */ "./js/constants/MapConstants.js");
/* harmony import */ var _models_StructType__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../models/StructType */ "./js/models/StructType.js");
/* harmony import */ var _events_RenderDeploymentIndicatorEvent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../events/RenderDeploymentIndicatorEvent */ "./js/events/RenderDeploymentIndicatorEvent.js");
/* harmony import */ var _events_PendingBuildAddedEvent__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../events/PendingBuildAddedEvent */ "./js/events/PendingBuildAddedEvent.js");
/* harmony import */ var _sui_SUICheatsheet__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../sui/SUICheatsheet */ "./js/sui/SUICheatsheet.js");
/* harmony import */ var _constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../constants/PlayerTypes */ "./js/constants/PlayerTypes.js");










class DeployOffcanvas extends _framework_AbstractViewModelComponent__WEBPACK_IMPORTED_MODULE_0__.AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   * @param {StructManager} structManager
   * @param {string} tileType see MAP_TILE_TYPES
   * @param {string} ambit
   * @param {number|null} slot
   */
  constructor(
    gameState,
    signingClientManager,
    structManager,
    tileType,
    ambit,
    slot = null
  ) {
    super(gameState);
    this.tileType = tileType;
    this.ambit = ambit;
    this.signingClientManager = signingClientManager;
    this.structManager = structManager;
    this.slot = slot;
    this.structStillBuilder = new _builders_StructStillBuilder__WEBPACK_IMPORTED_MODULE_2__.StructStillBuilder(this.gameState);

    /** @type {StructType[]}*/
    this.deployableStructTypes = this.gameState.structTypes.fetchAllByTileTypeAndAmbit(this.tileType, this.ambit);

    this.idPrefix = 'deploy-';
    this.className = 'deploy-struct-type';
    this.disabledClassName = 'deploy-struct-type-disabled';
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  createLinkId(structType) {
    const name = structType.type.toLowerCase().replace(/\s/g, '-');
    return `${this.idPrefix}${name}`;
  }

  /**
   * @param {StructType} structType
   */
  getTileTypeByStructType(structType) {
    if (structType.category === 'planet') {
      return _constants_MapConstants__WEBPACK_IMPORTED_MODULE_3__.MAP_TILE_TYPES.PLANETARY_SLOT;
    } else if (structType.category === 'fleet') {
      if (structType.is_command) {
        return _constants_MapConstants__WEBPACK_IMPORTED_MODULE_3__.MAP_TILE_TYPES.COMMAND
      } else {
        return _constants_MapConstants__WEBPACK_IMPORTED_MODULE_3__.MAP_TILE_TYPES.FLEET
      }
    }

    throw new Error(`Unknown struct type category: ${structType.category}`);
  }

  initPageCode() {
    this.deployableStructTypes.forEach(structType => {
      if (this.structManager.getDeploymentBlocker(structType)) {
        return;
      }

      const element = document.getElementById(this.createLinkId(structType));
      let mouseDownTime = null;

      element.addEventListener('mousedown', () => {
        mouseDownTime = performance.now();
      });

      element.addEventListener('mouseup', () => {
        if (mouseDownTime === null) {
          return;
        }

        const elapsed = performance.now() - mouseDownTime;
        mouseDownTime = null;

        if (elapsed > _sui_SUICheatsheet__WEBPACK_IMPORTED_MODULE_7__.SUICheatsheet.OPEN_DELAY - 50) {
          return;
        }

        console.log(`Deploy: ${structType.type}`);

        const tileType = this.getTileTypeByStructType(structType);

        this.signingClientManager.queueMsgStructBuildInitiate(
          this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].id,
          structType.id,
          this.ambit,
          this.slot,
          structType.build_charge
        ).then();

        _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.sui.offcanvas.close();

        // Add pending build to gameState
        this.gameState.addPendingBuild(
          tileType,
          this.ambit,
          this.slot,
          this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].id,
          structType
        );

        // Dispatch event to render deployment indicator on struct layer
        window.dispatchEvent(new _events_RenderDeploymentIndicatorEvent__WEBPACK_IMPORTED_MODULE_5__.RenderDeploymentIndicatorEvent(
          this.gameState.alphaBaseMap.mapId,
          tileType,
          this.ambit,
          this.slot,
          this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].id
        ));

        // Dispatch event to notify that a pending build was added
        window.dispatchEvent(new _events_PendingBuildAddedEvent__WEBPACK_IMPORTED_MODULE_6__.PendingBuildAddedEvent(
          this.gameState.alphaBaseMap.mapId,
          tileType,
          this.ambit,
          this.slot,
          this.gameState.keyPlayers[_constants_PlayerTypes__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPES.PLAYER].id,
          structType
        ));
      });
    });
  }

  /**
   * @return {string}
   */
  renderHTML() {
     return `
        <div class="offcanvas-struct-list-layout">
          ${this.deployableStructTypes.map(structType => {
            const structStill = this.structStillBuilder.build(structType);
            const deploymentBlocker = this.structManager.getDeploymentBlocker(structType);
            const disabledClassName = deploymentBlocker ? this.disabledClassName : '';
            return `
              <a 
                href="javascript: void(0)"
                id="${this.createLinkId(structType)}"
                class="offcanvas-struct-container ${this.className} ${disabledClassName}"
                data-sui-cheatsheet="${structType.type}"
                data-contextual-msg="${deploymentBlocker}"
              >
                ${structStill.renderHTML()}
              </a>
            `;
          }).join('')}
        </div>
     `;
   }

  render() {
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.sui.offcanvas.setHeader('Select Struct');
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.sui.offcanvas.setContent(this.renderHTML());
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.sui.offcanvas.open();
    this.initPageCode();
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
/* harmony import */ var _ShieldStatusTest__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ShieldStatusTest */ "./js/tests/ShieldStatusTest.js");
/* harmony import */ var _AbandonedPlanetaryStructTest__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./AbandonedPlanetaryStructTest */ "./js/tests/AbandonedPlanetaryStructTest.js");






(new _NumberFormatterTest__WEBPACK_IMPORTED_MODULE_0__.NumberFormatterTest()).run();
(new _PermissionManagerTest__WEBPACK_IMPORTED_MODULE_1__.PermissionManagerTest()).run();
(new _TaskManagerOreTest__WEBPACK_IMPORTED_MODULE_2__.TaskManagerOreTest()).run();
(new _ShieldStatusTest__WEBPACK_IMPORTED_MODULE_3__.ShieldStatusTest()).run();
(new _AbandonedPlanetaryStructTest__WEBPACK_IMPORTED_MODULE_4__.AbandonedPlanetaryStructTest()).run();

})();

/******/ })()
;
//# sourceMappingURL=test.js.map