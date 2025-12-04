import {StructStillRenderer} from "../view_models/components/StructStillRenderer";
import {STRUCT_VARIANTS} from "../constants/StructConstants";

export class StructStillBuilder {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
    this.structImageDir = '/img/structs';
  }
  
  /**
   * @return {StructStillRenderer}
   */
  buildBattleship() {
    const topDetailLayers = [];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/battleship/battleship-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/battleship/battleship-struct-dmg.png';

    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildCommandShip() {
    const topDetailLayers = [
      this.structImageDir + '/cmd-ship/cmd-ship-top-weapon.png'
    ];
    
    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/cmd-ship/cmd-ship-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/cmd-ship/cmd-ship-struct-dmg.png';
    structVariants[STRUCT_VARIANTS.BLINK] = this.structImageDir + '/cmd-ship/cmd-ship-struct-blink.png';
    
    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildCruiser() {
    const topDetailLayers = [
      this.structImageDir + '/cruiser/cruiser-top-weapon-ballistic.png',
      this.structImageDir + '/cruiser/cruiser-top-weapon-smart.png',
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/cruiser/cruiser-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/cruiser/cruiser-struct-dmg.png';

    const bottomDetailLayers = [
      this.structImageDir + '/cruiser/cruiser-bottom-ripples.png'
    ];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildDestroyer() {
    const topDetailLayers = [
      this.structImageDir + '/destroyer/destroyer-top-weapon.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/destroyer/destroyer-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/destroyer/destroyer-struct-dmg.png';

    const bottomDetailLayers = [
      this.structImageDir + '/destroyer/destroyer-bottom-ripples.png'
    ];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildOreExtractor() {
    const topDetailLayers = [
      this.structImageDir + '/extractor/extractor-top-drill.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/extractor/extractor-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/extractor/extractor-struct-dmg.png';

    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildFrigate() {
    const topDetailLayers = [];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/frigate/frigate-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/frigate/frigate-struct-dmg.png';

    const bottomDetailLayers = [
      this.structImageDir + '/frigate/frigate-bottom-weapon.png'
    ];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildFieldGenerator() {
    const topDetailLayers = [
      this.structImageDir + '/generator/generator-top-tube.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/generator/generator-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/generator/generator-struct-dmg.png';

    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildHighAltitudeInterceptor() {
    const topDetailLayers = [];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/interceptor/interceptor-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/interceptor/interceptor-struct-dmg.png';

    const bottomDetailLayers = [
      this.structImageDir + '/interceptor/interceptor-bottom-weapon.png'
    ];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildJammingSatellite() {
    const topDetailLayers = [
      this.structImageDir + '/jamming-sat/jamming-sat-top-weapon.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/jamming-sat/jamming-sat-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/jamming-sat/jamming-sat-struct-dmg.png';

    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildMobileArtillery() {
    const topDetailLayers = [
      this.structImageDir + '/mobile-artillery/mobile-artillery-top-weapon.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/mobile-artillery/mobile-artillery-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/mobile-artillery/mobile-artillery-struct-dmg.png';

    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildOrbitalShieldGenerator() {
    const topDetailLayers = [
      this.structImageDir + '/orb-shield/orb-shield-top-weapon.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/orb-shield/orb-shield-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/orb-shield/orb-shield-struct-dmg.png';

    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildOreBunker() {
    const topDetailLayers = [
      this.structImageDir + '/ore-bunker/ore-bunker-top-weapon.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/ore-bunker/ore-bunker-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/ore-bunker/ore-bunker-struct-dmg.png';

    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildPlanetaryDefenseCannon() {
    const topDetailLayers = [
      this.structImageDir + '/pdc/pdc-top-weapon.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/pdc/pdc-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/pdc/pdc-struct-dmg.png';

    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildPursuitFighter() {
    const topDetailLayers = [];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/pursuit-fighter/pursuit-fighter-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/pursuit-fighter/pursuit-fighter-struct-dmg.png';

    const bottomDetailLayers = [
      this.structImageDir + '/pursuit-fighter/pursuit-fighter-bottom-weapon.png'
    ];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildOreRefinery() {
    const topDetailLayers = [
      this.structImageDir + '/refinery/refinery-top-bays.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/refinery/refinery-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/refinery/refinery-struct-dmg.png';

    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildSAMLauncher() {
    const topDetailLayers = [
      this.structImageDir + '/sam-launcher/sam-launcher-top-weapon.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/sam-launcher/sam-launcher-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/sam-launcher/sam-launcher-struct-dmg.png';

    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildStarfighter() {
    const topDetailLayers = [
      this.structImageDir + '/starfighter/starfighter-top-weapon-ballistic.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/starfighter/starfighter-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/starfighter/starfighter-struct-dmg.png';

    const bottomDetailLayers = [
      this.structImageDir + '/starfighter/starfighter-bottom-weapon-smart.png'
    ];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildStealthBomber() {
    const topDetailLayers = [];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/stealth-bomber/stealth-bomber-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/stealth-bomber/stealth-bomber-struct-dmg.png';

    const bottomDetailLayers = [
      this.structImageDir + '/stealth-bomber/stealth-bomber-bottom-weapon.png'
    ];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildSubmersible() {
    const topDetailLayers = [
      this.structImageDir + '/submersible/submersible-top-weapon.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/submersible/submersible-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/submersible/submersible-struct-dmg.png';

    const bottomDetailLayers = [
      this.structImageDir + '/submersible/submersible-bottom-ripples.png'
    ];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }

  /**
   * @return {StructStillRenderer}
   */
  buildTank() {
    const topDetailLayers = [
      this.structImageDir + '/tank/tank-top-weapon.png'
    ];

    const structVariants = {};
    structVariants[STRUCT_VARIANTS.BASE] = this.structImageDir + '/tank/tank-struct-base.png';
    structVariants[STRUCT_VARIANTS.DMG] = this.structImageDir + '/tank/tank-struct-dmg.png';

    const bottomDetailLayers = [];

    return new StructStillRenderer(
      this.gameState,
      topDetailLayers,
      structVariants,
      bottomDetailLayers
    );
  }
  
  /**
   * @param {string} structType
   * @return {StructStillRenderer}
   */
  build(structType) {
    const structTypeClean = structType.replace(/[^a-zA-Z0-9]/g, '');

    if (!this[`build${structTypeClean}`]) {
      throw new Error(`No struct still for struct type ${structType}`);
    }

    return this[`build${structTypeClean}`]();
  }
}