import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {TileClassNameUtil} from "../../../util/TileClassNameUtil";
import {MapTransitionLayerComponentFactory} from "../../../factories/MapTransitionLayerComponentFactory";
import {MapTransitionComponentBuilder} from "../../../builders/MapTransitionComponentBuilder";
import {MapTerrainComponent} from "./MapTerrainComponent";
import {MapOrnamentComponentBuilder} from "../../../builders/MapOrnamentComponentBuilder";
import {MapOrnamentsComponent} from "./MapOrnamentsComponent";
import {MapTileMarkersComponent} from "./MapTileMarkersComponent";
import {MapFogOfWarComponent} from "./MapFogOfWarComponent";
import {MAP_ORNAMENTS} from "../../../constants/MapConstants";
import {PLAYER_MAP_ROLES} from "../../../constants/PlayerMapRoles";
import {MAP_PERSPECTIVES} from "../../../constants/MapPerspectives";
import {MapTileSelectionComponent} from "./MapTileSelectionComponent";
import {MapStructLayerComponent} from "./MapStructLayerComponent";
import {MapStructHUDLayerComponent} from "./MapStructHUDLayerComponent";
import {Planet} from "../../../models/Planet";
import {Player} from "../../../models/Player";

export class MapComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   * @param {StructManager} structManager
   * @param {string} containerId
   * @param {string} idPrefix
   * @param {boolean} enableTileSelectionLayer
   */
  constructor(
    gameState,
    signingClientManager,
    structManager,
    containerId,
    idPrefix,
    enableTileSelectionLayer = true
  ) {
    super(gameState);

    /** @type {SigningClientManager} */
    this.signingClientManager = signingClientManager;

    this.structManager = structManager;

    this.containerId = containerId;

    this.idPrefix = idPrefix;

    this.enableTileSelectionLayer = enableTileSelectionLayer;

    this.mapId = `${this.idPrefix}-map`;
    this.terrainId = `${this.idPrefix}-map-terrain`;
    this.ornamentsId = `${this.idPrefix}-map-ornaments`;
    this.markersId = `${this.idPrefix}-map-markers`;
    this.structLayerId = `${this.idPrefix}-map-struct-layer`;
    this.structHUDLayerId = `${this.idPrefix}-map-struct-hud-layer`;
    this.fogOfWarId = `${this.idPrefix}-map-fog-of-war`;
    this.tileSelectionId = `${this.idPrefix}-map-tile-selection`;

    /** @type {Planet|null} */
    this.planet = null;

    /** @type {Player|null} */
    this.attacker = null;

    /** @type {Player|null} */
    this.defender = null;

    /** @type {Fleet|null} */
    this.attackerFleet = null;

    /** @type {Fleet|null} */
    this.defenderFleet = null;

    this.perspective = null; // ATTACKER, DEFENDER

    this.tileClassNameUtil = new TileClassNameUtil();
    this.transitionLayerFactory = new MapTransitionLayerComponentFactory(this.tileClassNameUtil);
    this.transitionBuilder = new MapTransitionComponentBuilder(gameState, this.transitionLayerFactory);

    /** @type {MapTerrainComponent|null} */
    this.mapTerrain = null;

    /** @type {MapOrnamentComponentBuilder|null} */
    this.mapOrnamentBuilder = null;

    /** @type {MapOrnamentsComponent|null} */
    this.mapOrnaments = null;

    /** @type {MapTileMarkersComponent|null} */
    this.mapTileMarkers = null;

    /** @type {MapFogOfWarComponent|null} */
    this.mapFogOfWar = null;

    /** @type {MapStructLayerComponent|null} */
    this.mapStructLayer = null;

    /** @type {MapStructHUDLayerComponent|null} */
    this.mapStructHUDLayer = null;

    /** @type {MapTileSelectionComponent|null} */
    this.mapTileSelection = null;
  }

  /**
   * @param {Planet} planet
   */
  setPlanet(planet) {
    this.planet = planet;
  }

  /**
   * @param {Player} player
   */
  setDefender(player) {
    this.defender = player;
  }

  /**
   * @param {Player|null} player
   */
  setAttacker(player) {
    this.attacker = player;
  }

  /**
   * @param {Fleet|null} fleet
   */
  setDefenderFleet(fleet) {
    this.defenderFleet = fleet;
  }

  /**
   * @param {Fleet|null} fleet
   */
  setAttackerFleet(fleet) {
    this.attackerFleet = fleet;
  }

  /**
   * @param {string} role
   */
  setPlayerMapRole(role) {
    if(!Object.values(PLAYER_MAP_ROLES).includes(role)) {
      throw new Error(`Invalid player map role: ${role}`);
    }

    switch (role) {
      case PLAYER_MAP_ROLES.ATTACKER:
        this.perspective = MAP_PERSPECTIVES.ATTACKER;
        break;
      case PLAYER_MAP_ROLES.DEFENDER:
        this.perspective = MAP_PERSPECTIVES.DEFENDER;
        break;
      case PLAYER_MAP_ROLES.SPECTATOR:
        this.perspective = MAP_PERSPECTIVES.ATTACKER;
        break;
    }
  }

  shouldDisplayFogOfWar() {
    return !this.attacker && (this.perspective === MAP_PERSPECTIVES.DEFENDER);
  }

  initMapComponents() {
    /**
     * URL parameter parsing for testing different scenarios.
     * URL param syntax: ?[ornament(/[a-zA-Z_]+/)]=[space|air|land|water]
     * */
    const urlParams = new URLSearchParams(document.location.search);

    Object.keys(MAP_ORNAMENTS).forEach((ornamentKey) => {
      let ornamentAmbit = urlParams.get(ornamentKey.toLowerCase());

      if (ornamentAmbit) {
        console.log(ornamentAmbit);
        ornamentAmbit = ornamentAmbit.toUpperCase();
        const ambitOrnaments = this.planet.ornaments.get(ornamentAmbit);
        ambitOrnaments.push(ornamentKey);
        this.planet.ornaments.set(ornamentAmbit, ambitOrnaments);
        console.log(this.planet);
      }
    })

    this.mapTerrain = new MapTerrainComponent(
      this.gameState,
      this.transitionBuilder,
      this.tileClassNameUtil,
      this.planet
    );
    this.mapTerrain.init();

    this.mapOrnamentBuilder = new MapOrnamentComponentBuilder(
      gameState,
      this.planet,
      this.mapTerrain.mapColCount
    );

    this.mapOrnaments = new MapOrnamentsComponent(
      this.gameState,
      this.mapOrnamentBuilder,
      this.planet
    );

    const mapColBreakdown = this.mapTerrain.getMapColBreakdown(this.perspective === MAP_PERSPECTIVES.DEFENDER);
    this.mapTileMarkers = new MapTileMarkersComponent(
      this.gameState,
      this.tileClassNameUtil,
      mapColBreakdown,
      this.planet
    );

    this.mapFogOfWar = new MapFogOfWarComponent(
      this.gameState,
      mapColBreakdown,
      this.planet
    );
    
    this.mapStructLayer = new MapStructLayerComponent(
      this.gameState,
      this.structManager,
      mapColBreakdown,
      this.planet,
      this.defender,
      this.attacker,
      this.defenderFleet,
      this.attackerFleet,
      this.structLayerId,
      this.mapId
    );

    this.mapStructHUDLayer = new MapStructHUDLayerComponent(
      this.gameState,
      this.structManager,
      mapColBreakdown,
      this.planet,
      this.defender,
      this.attacker,
      this.defenderFleet,
      this.attackerFleet,
      this.structHUDLayerId,
      this.mapId
    );

    if (this.enableTileSelectionLayer) {

      this.mapTileSelection = new MapTileSelectionComponent(
        this.gameState,
        this.signingClientManager,
        this.structManager,
        mapColBreakdown,
        this.planet,
        this.defender,
        this.attacker,
        this.tileSelectionId,
        this.mapId
      );

    }
  }

  /**
   * @return {string}
   */
  renderHTML() {
    return `
      <div id="${this.mapId}" class="map">
        <div id="${this.terrainId}" class="map-terrain"></div>
        <div id="${this.ornamentsId}" class="map-ornaments"></div>
        <div id="${this.markersId}" class="map-markers"></div>
        <div id="${this.structLayerId}" class="map-struct-layer"></div>
        <div id="${this.structHUDLayerId}" class="map-struct-hud-layer"></div>
        <div id="${this.fogOfWarId}" class="map-fog-of-war-anchor"></div>
        <div id="${this.tileSelectionId}" class="map-tile-selection"></div>
      </div>
    `;
  }

  render() {
    document.getElementById(this.containerId).innerHTML = this.renderHTML();

    if (this.planet === null) {
      return;
    }

    this.initMapComponents();

    document.getElementById(this.terrainId).innerHTML = this.mapTerrain.renderHTML();

    document.getElementById(this.ornamentsId).innerHTML = this.mapOrnaments.renderHTML();

    document.getElementById(this.markersId).innerHTML = this.mapTileMarkers.renderHTML();

    document.getElementById(this.structLayerId).innerHTML = this.mapStructLayer.renderHTML();

    document.getElementById(this.structHUDLayerId).innerHTML = this.mapStructHUDLayer.renderHTML();

    if (this.shouldDisplayFogOfWar()) {
      document.getElementById(this.fogOfWarId).innerHTML = this.mapFogOfWar.renderHTML();
    }

    if (this.enableTileSelectionLayer) {
      document.getElementById(this.tileSelectionId).innerHTML = this.mapTileSelection.renderHTML();
      this.mapTileSelection.initPageCode();
    }
    
    this.mapStructLayer.initPageCode();
    this.mapStructHUDLayer.initPageCode();
  }
}