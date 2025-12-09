import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {
  MAP_COL_ATTACKER_COMMAND, MAP_COL_ATTACKER_FLEET, MAP_COL_DEFENDER_COMMAND, MAP_COL_DEFENDER_FLEET,
  MAP_COL_DEFENDER_PLANETARY, MAP_COL_DIVIDER, MAP_DEFAULT_FLEET_COL_COUNT,
  MAP_TILE_ROWS_PER_AMBIT, MAP_TILE_TYPES,
  MAP_DEFAULT_COMMAND_COL_COUNT
} from "../../../constants/MapConstants";


export class MapStructLayerComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {string[]} mapColBreakdown
   * @param {Planet|null} planet
   * @param {Player|null} defender
   * @param {Player|null} attacker
   */
  constructor(
    gameState,
    mapColBreakdown,
    planet,
    defender,
    attacker
  ) {
    super(gameState);
    this.mapColBreakdown = mapColBreakdown;
    this.dividerIndex = this.mapColBreakdown.lastIndexOf(MAP_COL_DIVIDER);
    this.planet = planet;
    this.defender = defender;
    this.attacker = attacker;
    this.tileIdCounter = 0;
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
   * @param {string} tileType the tile type. See MAP_TILE_TYPES constant array.
   * @param {string} side the side of the map the tile is on
   * @param {string} playerId the ID of the player that owns the tile or empty if no one does such as a transition tile.
   * @param {string} ambit the ambit the tile is in or empty if it's a transition tile.
   * @param {string|number} slot the planetary or fleet slot number. Empty if it's not a command, planetary, fleet or command tile.
   * @param {string} structId the ID of the struct occupying the tile or empty if the tile is not occupied.
   * @return {string}
   */
  renderStructTileHTML(
    tileType,
    side = "",
    playerId = "",
    ambit = "",
    slot = "",
    structId = ""
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
        data-struct-id="${structId}"
      >
      </div>
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

    return this.renderStructTileHTML(
      tileType,
      side,
      playerId,
      ambit
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

