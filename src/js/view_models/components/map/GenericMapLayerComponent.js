import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {
  MAP_COL_ATTACKER_COMMAND, MAP_COL_ATTACKER_FLEET, MAP_COL_DEFENDER_COMMAND, MAP_COL_DEFENDER_FLEET,
  MAP_COL_DEFENDER_PLANETARY, MAP_COL_DIVIDER, MAP_DEFAULT_FLEET_COL_COUNT,
  MAP_TILE_ROWS_PER_AMBIT, MAP_TILE_TYPES,
  MAP_DEFAULT_COMMAND_COL_COUNT
} from "../../../constants/MapConstants";
import {Player} from "../../../models/Player";
import {MapStructTileRenderParamsDTO} from "../../../dtos/MapStructTileRenderParamsDTO";


export class GenericMapLayerComponent extends AbstractViewModelComponent {

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
    this.dividerIndex = this.mapColBreakdown.lastIndexOf(MAP_COL_DIVIDER);
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
    if (tileType === MAP_TILE_TYPES.PLANETARY_SLOT) {
      return {
        locationType: 'planet',
        locationId: this.planet.id,
        isCommandSlot: false
      };
    }

    if (tileType === MAP_TILE_TYPES.COMMAND || tileType === MAP_TILE_TYPES.FLEET) {
      let locationId = null;
      if (this.defender && playerId === this.defender.id) {
        locationId = this.defender.fleet_id;
      } else if (this.attacker && playerId === this.attacker.id) {
        locationId = this.attacker.fleet_id;
      }

      return {
        locationType: 'fleet',
        locationId: locationId,
        isCommandSlot: (tileType === MAP_TILE_TYPES.COMMAND)
      };
    }

    return null;
  }

  /**
   * @param {string} playerId
   * @return {boolean}
   */
  isFleetOnPlanet(playerId) {
    return (this.defender.id === playerId && this.defenderFleet?.location_id === this.planet.id)
      || (this.attacker?.id === playerId && this.attackerFleet?.location_id === this.planet.id);
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
      ></div>
    `;
  }

  renderFogOfWarTileHTML(mapColType) {
    if (this.attacker) {
      return '';
    }

    const mapColTypeLastIndex = this.mapColBreakdown.lastIndexOf(mapColType);
    const attackerSide = (this.mapColBreakdown[0] === MAP_COL_ATTACKER_COMMAND) ? 'LEFT' : 'RIGHT';

    if (this.dividerIndex === -1 || mapColTypeLastIndex === -1) {
      throw new Error('Divider or map col type not found');
    }

    if (
      mapColType === MAP_COL_DIVIDER
      || (attackerSide === 'RIGHT' && this.dividerIndex < mapColTypeLastIndex)
      || (attackerSide === 'LEFT' && mapColTypeLastIndex < this.dividerIndex)
    ) {
      return this.renderTileHTML(
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
        || this.renderTileHTML(
          MAP_TILE_TYPES.TRANSITION,
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
    if (mapColType !== MAP_COL_DEFENDER_PLANETARY) {
      return '';
    }

    const tileType = (slot === '')
      ? MAP_TILE_TYPES.PLANETARY_BLOCKED
      : MAP_TILE_TYPES.PLANETARY_SLOT;

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
    if (mapColType === MAP_COL_DEFENDER_FLEET) {
      return this.renderTileHTML(MAP_TILE_TYPES.FLEET, side, this.defender.id, ambit, slot);
    }
    if (mapColType === MAP_COL_ATTACKER_FLEET) {
      return this.renderTileHTML(MAP_TILE_TYPES.FLEET, side, this.attacker.id, ambit, slot);
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
    if (mapColType !== MAP_COL_DIVIDER) {
      return '';
    }

    return this.renderTileHTML(
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
    if (this.mapColBreakdown[0] === MAP_COL_ATTACKER_COMMAND) {
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
      const totalFleetSlotsPerAmbitPerPlayer = MAP_TILE_ROWS_PER_AMBIT * MAP_DEFAULT_FLEET_COL_COUNT;
      const commandSlotTracker = this.createCommandSlotTracker();

      html += this.renderTransitionRowHTML(previousAmbit, currentAmbit);

      for (let r = 0; r < MAP_TILE_ROWS_PER_AMBIT; r++) {

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
              this.calcSlotNumber(MAP_COL_DEFENDER_PLANETARY, r, c, numPlanetarySlots)
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
    }
  }

  buildMapStructTilRenderParamsFromTileElement(tileElement) {
    const renderParams = new MapStructTileRenderParamsDTO();
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

    if (locationInfo.locationType === 'planet' || this.isFleetOnPlanet(playerId)) {
      renderParams.struct = this.structManager.getStructByPositionAndPlayerId(
        playerId,
        locationInfo.locationType,
        locationInfo.locationId,
        ambit,
        slotNum,
        locationInfo.isCommandSlot
      );
    }

    return renderParams;
  }
}
