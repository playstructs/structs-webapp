import {StructStillRenderer} from "../view_models/components/StructStillRenderer";
import {
  STRUCT_EQUIPMENT,
  STRUCT_STILL_LAYERS,
  STRUCT_WATER_RIPPLE,
  STRUCT_WEAPON_SYSTEM
} from "../constants/StructConstants";
import {StructType} from "../models/StructType";
import {StructTypeArtSetBuilder} from "./StructTypeArtSetBuilder";

export class StructStillBuilder {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
    this.structTypeArtSetBuilder = new StructTypeArtSetBuilder();
  }
  
  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildBattleship(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      '',
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildCommandShip(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildCruiser(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      art[STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[STRUCT_WATER_RIPPLE]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildDestroyer(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[STRUCT_WATER_RIPPLE]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildOreExtractor(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_EQUIPMENT.PLANETARY_MINING],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildFrigate(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      '',
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildFieldGenerator(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_EQUIPMENT.POWER_GENERATION],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildHighAltitudeInterceptor(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      '',
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildJammingSatellite(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_EQUIPMENT.PLANETARY_DEFENSES],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildMobileArtillery(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildOrbitalShieldGenerator(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_EQUIPMENT.ORE_RESERVE_DEFENSES],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildOreBunker(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_EQUIPMENT.ORE_RESERVE_DEFENSES],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildPlanetaryDefenseCannon(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_EQUIPMENT.PLANETARY_DEFENSES],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildPursuitFighter(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      '',
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildOreRefinery(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_EQUIPMENT.PLANETARY_REFINERY],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildSAMLauncher(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      ''
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildStarfighter(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildStealthBomber(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      '',
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildSubmersible(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
      art[STRUCT_WATER_RIPPLE]
    );
  }

  /**
   * @param {StructType} structType
   * @return {StructStillRenderer}
   */
  buildTank(structType) {
    const art = this.structTypeArtSetBuilder.build(structType);

    return new StructStillRenderer(
      this.gameState,
      structType,
      art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON],
      '',
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE],
      art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG],
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
