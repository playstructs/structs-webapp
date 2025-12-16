import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {
  MAP_COL_ATTACKER_COMMAND, MAP_COL_ATTACKER_FLEET, MAP_COL_DEFENDER_COMMAND, MAP_COL_DEFENDER_FLEET,
  MAP_COL_DEFENDER_PLANETARY, MAP_COL_DIVIDER, MAP_DEFAULT_FLEET_COL_COUNT,
  MAP_TILE_ROWS_PER_AMBIT, MAP_TILE_TYPES,
  MAP_DEFAULT_COMMAND_COL_COUNT
} from "../../../constants/MapConstants";
import {EVENTS} from "../../../constants/Events";
import {RenderAllStructsEvent} from "../../../events/RenderAllStructsEvent";
import {RenderStructEvent} from "../../../events/RenderStructEvent";
import {StructStillBuilder} from "../../../builders/StructStillBuilder";
import {Player} from "../../../models/Player";
import {Struct} from "../../../models/Struct";


export class MapStructLayerComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {StructManager} structManager
   * @param {string[]} mapColBreakdown
   * @param {Planet|null} planet
   * @param {Player|null} defender
   * @param {Player|null} attacker
   * @param {boolean} isRaidMap - Whether this is the raid map (to determine which struct collection to use)
   * @param {string} containerId - The ID of the DOM container element for this struct layer
   */
  constructor(
    gameState,
    structManager,
    mapColBreakdown,
    planet,
    defender,
    attacker,
    isRaidMap = false,
    containerId = ""
  ) {
    super(gameState);
    this.structManager = structManager;
    this.mapColBreakdown = mapColBreakdown;
    this.dividerIndex = this.mapColBreakdown.lastIndexOf(MAP_COL_DIVIDER);
    this.planet = planet;
    this.defender = defender;
    this.attacker = attacker;
    this.isRaidMap = isRaidMap;
    this.containerId = containerId;
    this.tileIdCounter = 0;
    this.structStillBuilder = new StructStillBuilder(this.gameState);
  }

  /**
   * Generates a unique tile ID
   * @return {string}
   */
  generateTileId() {
    return `map-struct-tile-${this.tileIdCounter++}`;
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
   * Render the content inside a struct tile (struct image or building indicator)
   * @param {Struct|null} struct
   * @return {string}
   */
  renderStructContent(struct) {
    if (!struct) {
      return '';
    }

    if (struct.is_building) {
      // Building state - no content, CSS will show yellow background
      return '';
    }

    const structType = this.gameState.structTypes.getStructTypeById(struct.type)

    // Completed struct - render the struct image
    const structStill = this.structStillBuilder.build(structType.type);
    return structStill.renderHTML();
  }

  /**
   * Get the CSS class for a struct tile based on its state
   * @param {Struct|null} struct
   * @return {string}
   */
  getStructTileClass(struct) {
    return (struct && struct.is_building)
      ? 'map-struct-layer-tile map-struct-layer-tile-building'
      : 'map-struct-layer-tile';
  }

  /**
   * Update a tile element's struct content, class, and data-struct-id attribute
   * @param {HTMLElement} tileElement
   * @param {Struct|null} struct
   */
  updateTileStructContent(tileElement, struct) {
    tileElement.innerHTML = this.renderStructContent(struct);
    tileElement.className = this.getStructTileClass(struct);
    tileElement.setAttribute('data-struct-id', struct ? struct.id : '');
  }

  /**
   * Find and update a single struct tile by position
   * @param {Struct} struct
   */
  renderStruct(struct) {

    // Determine tile type based on struct location
    let tileType;
    let playerId = '';

    if (struct.location_type === 'planet') {
      tileType = MAP_TILE_TYPES.PLANETARY_SLOT;
      // Planetary tiles always use defender's player ID
      playerId = this.defender.id;
    } else if (struct.location_type === 'fleet') {
      // Check if this is a command struct
      const isCommand = this.structManager.isCommandStruct(struct);
      if (isCommand) {
        tileType = MAP_TILE_TYPES.COMMAND;
      } else {
        tileType = MAP_TILE_TYPES.FLEET;
      }
      // Determine player ID based on which fleet this struct is in
      if (struct.location_id === this.defender.fleet_id) {
        playerId = this.defender.id;
      } else if (struct.location_id === this.attacker.fleet_id) {
        playerId = this.attacker.id;
      }
    }

    // Convert ambit to uppercase to match data-ambit attribute (tiles use uppercase, structs use lowercase)
    const ambit = struct.operating_ambit ? struct.operating_ambit.toUpperCase() : '';
    const slot = struct.slot;

    // Find matching tile by querying with data attributes
    // We need to match: tile type, ambit, slot, and player ID
    const selector = `.map-struct-layer-tile[data-tile-type="${tileType}"][data-ambit="${ambit}"][data-slot="${slot}"][data-player-id="${playerId}"]`;
    const container = document.getElementById(this.containerId);
    const tileElement = container.querySelector(selector);
    this.updateTileStructContent(tileElement, struct);
  }

  /**
   * Sync all struct tiles in the container by looking up structs for each tile
   */
  renderAllStructs() {
    const container = document.getElementById(this.containerId);
    const tiles = container.querySelectorAll('.map-struct-layer-tile');
    
    tiles.forEach(tileElement => {
      const tileType = tileElement.getAttribute('data-tile-type');
      const ambit = tileElement.getAttribute('data-ambit');
      const slot = tileElement.getAttribute('data-slot');
      const playerId = tileElement.getAttribute('data-player-id');

      // Skip tiles that don't have position data (transition tiles, divider tiles, etc.)
      if (!tileType || !ambit || slot === '' || !playerId) {
        return;
      }

      // Determine location type and ID based on tile type
      let locationType = '';
      let locationId = '';
      let isCommandSlot = false;

      if (tileType === MAP_TILE_TYPES.PLANETARY_SLOT) {
        locationType = 'planet';
        locationId = this.planet.id;
      } else if (tileType === MAP_TILE_TYPES.COMMAND || tileType === MAP_TILE_TYPES.FLEET) {
        locationType = 'fleet';
        isCommandSlot = (tileType === MAP_TILE_TYPES.COMMAND);
        
        // Determine fleet ID based on player ID
        if (this.defender && playerId === this.defender.id) {
          locationId = this.defender.fleet_id;
        } else if (this.attacker && playerId === this.attacker.id) {
          locationId = this.attacker.fleet_id;
        }
      }

      // Look up struct at this position
      const slotNum = parseInt(slot, 10);

      const struct = this.structManager.getStructByPosition(
        this.isRaidMap,
        locationType,
        locationId,
        ambit,
        slotNum,
        isCommandSlot
      );

      // Update tile with struct (or null if no struct)
      this.updateTileStructContent(tileElement, struct);
    });
  }

  /**
   * @param {string} tileType the tile type. See MAP_TILE_TYPES constant array.
   * @param {string} side the side of the map the tile is on
   * @param {string} playerId the ID of the player that owns the tile or empty if no one does such as a transition tile.
   * @param {string} ambit the ambit the tile is in or empty if it's a transition tile.
   * @param {string|number} slot the planetary or fleet slot number. Empty if it's not a command, planetary, fleet or command tile.
   * @return {string}
   */
  renderStructTileHTML(
    tileType,
    side = "",
    playerId = "",
    ambit = "",
    slot = ""
  ) {
    const tileId = this.generateTileId();

    return `
      <div
        id="${tileId}"
        class="map-struct-layer-tile"
        data-tile-type="${tileType}"
        data-side="${side}"
        data-player-id="${playerId}"
        data-ambit="${ambit}"
        data-slot="${slot}"
      ></div>
    `;
  }

  renderFogOfWarTileHTML(mapColType) {
    if (this.attacker) {
      return '';
    }

    const mapColTypeLastIndex = this.mapColBreakdown.lastIndexOf(mapColType);
    const dividerIndex = this.mapColBreakdown.lastIndexOf(MAP_COL_DIVIDER);
    const attackerSide = (this.mapColBreakdown[0] === MAP_COL_ATTACKER_COMMAND) ? 'LEFT' : 'RIGHT';

    if (dividerIndex === -1 || mapColTypeLastIndex === -1) {
      throw new Error('Divider or map col type not found');
    }

    if (
      mapColType === MAP_COL_DIVIDER
      || (attackerSide === 'RIGHT' && dividerIndex < mapColTypeLastIndex)
      || (attackerSide === 'LEFT' && mapColTypeLastIndex < dividerIndex)
    ) {
      return this.renderStructTileHTML(
        MAP_TILE_TYPES.FOG_OF_WAR,
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
        || this.renderStructTileHTML(
          MAP_TILE_TYPES.TRANSITION,
          this.getTileSide(c)
        );
    }

    return `
      <div class="map-struct-layer-row">
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
      [MAP_COL_DEFENDER_COMMAND]: MAP_DEFAULT_COMMAND_COL_COUNT,
      [MAP_COL_ATTACKER_COMMAND]: MAP_DEFAULT_COMMAND_COL_COUNT,
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

    if (mapColType === MAP_COL_DEFENDER_COMMAND) {
      playerId = this.defender.id;
    } else if (mapColType === MAP_COL_ATTACKER_COMMAND) {
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
      ? MAP_TILE_TYPES.COMMAND
      : MAP_TILE_TYPES.COMMAND_BLOCKED;

    // Command structs are always slot 0 in a fleet
    return this.renderStructTileHTML(
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
    if (mapColType !== MAP_COL_DEFENDER_PLANETARY) {
      return '';
    }

    const tileType = (slot === '')
      ? MAP_TILE_TYPES.PLANETARY_BLOCKED
      : MAP_TILE_TYPES.PLANETARY_SLOT;

    return this.renderStructTileHTML(
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
  renderDefenderFleetTileHTML(
    mapColType,
    side,
    ambit,
    slot
  ) {
    if (mapColType !== MAP_COL_DEFENDER_FLEET) {
      return '';
    }

    return this.renderStructTileHTML(
      MAP_TILE_TYPES.FLEET,
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
  renderAttackerFleetTileHTML(
    mapColType,
    side,
    ambit,
    slot
  ) {
    if (mapColType !== MAP_COL_ATTACKER_FLEET) {
      return '';
    }

    return this.renderStructTileHTML(
      MAP_TILE_TYPES.FLEET,
      side,
      this.attacker.id,
      ambit,
      slot
    );
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
    if (mapColType !== MAP_COL_DIVIDER) {
      return '';
    }

    return this.renderStructTileHTML(
      MAP_TILE_TYPES.DIVIDER,
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
    let firstOccurrence = null;
    let lastOccurrence = null;

    for(let i = 0; i < this.mapColBreakdown.length; i++) {

      if (this.mapColBreakdown[i] !== targetColType) {
        continue;
      }

      if (firstOccurrence === null) {
        firstOccurrence = i;
      }

      lastOccurrence = i;
    }

    return {
      first: firstOccurrence,
      last: lastOccurrence
    }

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
    if (this.mapColBreakdown[0] === MAP_COL_ATTACKER_COMMAND) {
      const slotsAssignedThisRow = currentMapColIndex - targetColTypeOccurrences.first;
      slotNumber = slotsAssignedThisRow + currentMapRowIndex * tilesOfTargetTypePerRow;
    }

    return (slotNumber >= totalSlots) ? '' : `${slotNumber}`;
  }

  /**
   * Initialize page code: populate structs and set up event listeners
   */
  initPageCode() {
    // Populate initial structs
    this.renderAllStructs();

    // Listen for RENDER_ALL_STRUCTS events
    window.addEventListener(EVENTS.RENDER_ALL_STRUCTS, (event) => {
      if (event instanceof RenderAllStructsEvent && event.containerId === this.containerId) {
        this.renderAllStructs();
      }
    });

    // Listen for RENDER_STRUCT events
    window.addEventListener(EVENTS.RENDER_STRUCT, (event) => {
      if (event instanceof RenderStructEvent && event.containerId === this.containerId) {
        this.renderStruct(event.struct);
      }
    });
  }

  /**
   * @return {string}
   */
  renderHTML() {
    let html = '';
    let previousAmbit = '';

    const planetAmbits = this.planet.getAmbits();

    // Reset tile ID counter for each render
    this.tileIdCounter = 0;

    for (let a = 0; a < planetAmbits.length; a++) {

      const currentAmbit = planetAmbits[a];
      const numPlanetarySlots = this.planet.getPlanetarySlotsByAmbit(currentAmbit, this.gameState.structTypes);
      const totalFleetSlotsPerAmbitPerPlayer = MAP_TILE_ROWS_PER_AMBIT * MAP_DEFAULT_FLEET_COL_COUNT;
      const commandSlotTracker = this.createCommandSlotTracker();

      html += this.renderTransitionRowHTML(previousAmbit, currentAmbit);

      for (let r = 0; r < MAP_TILE_ROWS_PER_AMBIT; r++) {

        html += `<div class="map-struct-layer-row">`;

        for (let c = 0; c < this.mapColBreakdown.length; c++) {

          const mapColType = this.mapColBreakdown[c];
          let side = this.getTileSide(c);

          html += this.renderFogOfWarTileHTML(mapColType)
            || this.renderCommandTileHTML(mapColType, side, currentAmbit, commandSlotTracker)
            || this.renderPlanetaryTileHTML(
              mapColType,
              side,
              currentAmbit,
              this.calcSlotNumber(MAP_COL_DEFENDER_PLANETARY, r, c, numPlanetarySlots)
            )
            || this.renderDefenderFleetTileHTML(
              mapColType,
              side,
              currentAmbit,
              this.calcSlotNumber(MAP_COL_DEFENDER_FLEET, r, c, totalFleetSlotsPerAmbitPerPlayer)
            )
            || this.renderAttackerFleetTileHTML(
              mapColType,
              side,
              currentAmbit,
              this.calcSlotNumber(MAP_COL_ATTACKER_FLEET, r, c, totalFleetSlotsPerAmbitPerPlayer)
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
}
