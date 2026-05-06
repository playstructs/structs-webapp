import {
  STRUCT_EQUIPMENT,
  STRUCT_STILL_LAYERS,
  STRUCT_WATER_RIPPLE,
  STRUCT_WEAPON_SYSTEM
} from "../constants/StructConstants";
import {StructType} from "../models/StructType";
import {StructTypeArtSet} from "../models/StructTypeArtSet";

export class StructTypeArtSetBuilder {

  constructor() {
    this.structImageDir = '/img/structs';
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}
   */
  buildBattleship(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/battleship/battleship-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/battleship/battleship-struct-dmg.png';
    
    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildCommandShip(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/cmd-ship/cmd-ship-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/cmd-ship/cmd-ship-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/cmd-ship/cmd-ship-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildCruiser(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/cruiser/cruiser-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/cruiser/cruiser-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/cruiser/cruiser-top-weapon-ballistic.png';
    art[STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON] = this.structImageDir + '/cruiser/cruiser-top-weapon-smart.png';
    art[STRUCT_WATER_RIPPLE] = this.structImageDir + '/cruiser/cruiser-bottom-ripples.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildDestroyer(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/destroyer/destroyer-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/destroyer/destroyer-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/destroyer/destroyer-top-weapon.png';
    art[STRUCT_WATER_RIPPLE] = this.structImageDir + '/destroyer/destroyer-bottom-ripples.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildOreExtractor(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/extractor/extractor-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/extractor/extractor-struct-dmg.png';
    art[STRUCT_EQUIPMENT.PLANETARY_MINING] = this.structImageDir + '/extractor/extractor-top-drill.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildFrigate(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/frigate/frigate-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/frigate/frigate-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/frigate/frigate-bottom-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildFieldGenerator(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/generator/generator-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/generator/generator-struct-dmg.png';
    art[STRUCT_EQUIPMENT.POWER_GENERATION] = this.structImageDir + '/generator/generator-top-tube.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildHighAltitudeInterceptor(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/interceptor/interceptor-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/interceptor/interceptor-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/interceptor/interceptor-bottom-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildJammingSatellite(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/jamming-sat/jamming-sat-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/jamming-sat/jamming-sat-struct-dmg.png';
    art[STRUCT_EQUIPMENT.PLANETARY_DEFENSES] = this.structImageDir + '/jamming-sat/jamming-sat-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildMobileArtillery(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/mobile-artillery/mobile-artillery-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/mobile-artillery/mobile-artillery-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/mobile-artillery/mobile-artillery-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildOrbitalShieldGenerator(structType) {
    const art = new StructTypeArtSet(structType);
    
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/orb-shield/orb-shield-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/orb-shield/orb-shield-struct-dmg.png';
    art[STRUCT_EQUIPMENT.ORE_RESERVE_DEFENSES] = this.structImageDir + '/orb-shield/orb-shield-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildOreBunker(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/ore-bunker/ore-bunker-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/ore-bunker/ore-bunker-struct-dmg.png';
    art[STRUCT_EQUIPMENT.ORE_RESERVE_DEFENSES] = this.structImageDir + '/ore-bunker/ore-bunker-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildPlanetaryDefenseCannon(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/pdc/pdc-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/pdc/pdc-struct-dmg.png';
    art[STRUCT_EQUIPMENT.PLANETARY_DEFENSES] = this.structImageDir + '/pdc/pdc-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildPursuitFighter(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/pursuit-fighter/pursuit-fighter-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/pursuit-fighter/pursuit-fighter-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/pursuit-fighter/pursuit-fighter-bottom-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildOreRefinery(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/refinery/refinery-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/refinery/refinery-struct-dmg.png';
    art[STRUCT_EQUIPMENT.PLANETARY_REFINERY] = this.structImageDir + '/refinery/refinery-top-bays.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildStarfighter(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/starfighter/starfighter-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/starfighter/starfighter-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/starfighter/starfighter-bottom-weapon-smart.png';
    art[STRUCT_WEAPON_SYSTEM.SECONDARY_WEAPON] = this.structImageDir + '/starfighter/starfighter-top-weapon-ballistic.png'

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildSAMLauncher(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/sam-launcher/sam-launcher-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/sam-launcher/sam-launcher-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/sam-launcher/sam-launcher-top-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildStealthBomber(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/stealth-bomber/stealth-bomber-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/stealth-bomber/stealth-bomber-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/stealth-bomber/stealth-bomber-bottom-weapon.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildSubmersible(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/submersible/submersible-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/submersible/submersible-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/submersible/submersible-top-weapon.png';
    art[STRUCT_WATER_RIPPLE] = this.structImageDir + '/submersible/submersible-bottom-ripples.png';

    return art;
  }

  /**
   * @param {StructType} structType
   * @return {StructTypeArtSet}}
   */
  buildTank(structType) {
    const art = new StructTypeArtSet(structType);

    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_BASE] = this.structImageDir + '/tank/tank-struct-base.png';
    art[STRUCT_STILL_LAYERS.STRUCT_VARIANT_DMG] = this.structImageDir + '/tank/tank-struct-dmg.png';
    art[STRUCT_WEAPON_SYSTEM.PRIMARY_WEAPON] = this.structImageDir + '/tank/tank-top-weapon.png';

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
