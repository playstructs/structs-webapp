import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {
  MAP_COL_ATTACKER_COMMAND, MAP_COL_ATTACKER_FLEET, MAP_COL_DEFENDER_COMMAND, MAP_COL_DEFENDER_FLEET,
  MAP_COL_DEFENDER_PLANETARY, MAP_COL_DIVIDER, MAP_DEFAULT_FLEET_COL_COUNT,
  MAP_TILE_ROWS_PER_AMBIT, MAP_TILE_TYPES, MAP_TRANSITION_TILE_LABELS,
  MAP_DEFAULT_COMMAND_COL_COUNT
} from "../../../constants/MapConstants";
import {AMBITS} from "../../../constants/Ambits";
import {HUDViewModel} from "../../HUDViewModel";
import {Planet} from "../../../models/Planet";
import {Player} from "../../../models/Player";


export class MapTileSelectionComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {StructManager} structManager
   * @param {string[]} mapColBreakdown
   * @param {Planet|null} planet
   * @param {Player|null} defender
   * @param {Player|null} attacker
   * @param {boolean} isRaidMap - Whether this is the raid map
   */
  constructor(
    gameState,
    structManager,
    mapColBreakdown,
    planet,
    defender,
    attacker,
    isRaidMap = false
  ) {
    super(gameState);
    this.structManager = structManager;
    this.mapColBreakdown = mapColBreakdown;
    this.dividerIndex = this.mapColBreakdown.lastIndexOf(MAP_COL_DIVIDER);

    /** @type {Planet} */
    this.planet = planet;

    /** @type {Player} */
    this.defender = defender;

    /** @type {Player} */
    this.attacker = attacker;

    this.isRaidMap = isRaidMap;
  }

  /**
   * Get struct ID at a position for the data attribute
   * @param {string} locationType
   * @param {string} locationId
   * @param {string} ambit
   * @param {string|number} slot
   * @param {boolean} isCommandSlot
   * @return {string}
   */
  getStructIdAtPosition(locationType, locationId, ambit, slot, isCommandSlot = false) {
    if (slot === "") {
      return "";
    }

    const struct = this.structManager.getStructByPosition(
      this.isRaidMap,
      locationType,
      locationId,
      ambit,
      parseInt(slot, 10),
      isCommandSlot
    );

    return struct ? struct.id : "";
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
   * @param {string} tileLabel a custom tile label that is displayed in the action bar. Used for transition tiles.
   * @return {string}
   */
  renderSelectionTileHTML(
    tileType,
    side = "",
    playerId = "",
    ambit = "",
    slot = "",
    structId = "",
    tileLabel = ""
  ) {
    return `
      <a
        class="map-tile-selection-tile"
        data-tile-type="${tileType}"
        data-side="${side}"
        data-player-id="${playerId}"
        data-ambit="${ambit}"
        data-slot="${slot}"
        data-struct-id="${structId}"
        data-tile-label="${tileLabel}"
        href="javascript: void(0)"
        role="button"
      >
      </a>
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
      return this.renderSelectionTileHTML(
        MAP_TILE_TYPES.FOG_OF_WAR,
        attackerSide.toLowerCase(),
        '',
        '',
        '',
        '',
        'Unknown Territory'
      );
    }

    return '';
  }

  /**
   * Determine what the transition tile's label should be based on the current ambit and previous ambit.
   *
   * @param {string} topAmbit
   * @param {string} bottomAmbit
   * @param {boolean} isFinalTransition
   * @return {string}
   */
  getTransitionTileLabel(
    topAmbit,
    bottomAmbit,
    isFinalTransition = false
  ) {
    let label;

    if (isFinalTransition) {
      label = bottomAmbit.toUpperCase();
    } else if (topAmbit === AMBITS.SPACE && bottomAmbit === AMBITS.AIR) {
      label = MAP_TRANSITION_TILE_LABELS.ATMOSPHERE;
    } else if (
      (topAmbit === AMBITS.SPACE || topAmbit === AMBITS.AIR)
      && (bottomAmbit === AMBITS.LAND || bottomAmbit === AMBITS.WATER)
    ) {
      label = MAP_TRANSITION_TILE_LABELS.HORIZON;
    } else if (topAmbit === AMBITS.LAND && bottomAmbit === AMBITS.WATER) {
      label = MAP_TRANSITION_TILE_LABELS.SHORE;
    } else {
      label = bottomAmbit.toUpperCase();
    }

    return label;
  }

  /**
   * @param {string} topAmbit the ambit that is on top in the transition
   * @param {string} bottomAmbit the ambit that is on the bottom in the transition
   * @param {boolean} isInFinalTransitionPosition is this for the final transition of the map
   * @param {number|null} totalAmbits the total number of ambits in the ambit
   * @param {number|null} bottomAmbitIndex the ambit index of the bottom ambit
   * @return {string} the row of selection tiles for the whole transition row
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
    const tileLabel = this.getTransitionTileLabel(topAmbit, bottomAmbit, isFinalTransition);

    for (let c = 0; c < this.mapColBreakdown.length; c++) {
      tiles += this.renderFogOfWarTileHTML(this.mapColBreakdown[c])
        || this.renderSelectionTileHTML(
          MAP_TILE_TYPES.TRANSITION,
          this.getTileSide(c),
          '',
          '',
          '',
          '',
          tileLabel
        );
    }

    return `
      <div class="map-tile-selection-row">
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
    let fleetId = '';

    if (mapColType === MAP_COL_DEFENDER_COMMAND) {
      playerId = this.defender.id;
      fleetId = this.defender.fleet_id;
    } else if (mapColType === MAP_COL_ATTACKER_COMMAND) {
      playerId = this.attacker.id;
      fleetId = this.attacker.fleet_id;
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

    // Command structs are always slot 0
    const structId = hasAvailableSlot 
      ? this.getStructIdAtPosition('fleet', fleetId, ambit, 0, true)
      : '';

    return this.renderSelectionTileHTML(
      tileType,
      side,
      playerId,
      ambit,
      hasAvailableSlot ? 0 : '',
      structId
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

    const structId = slot !== '' 
      ? this.getStructIdAtPosition('planet', this.planet.id, ambit, slot, false)
      : '';

    return this.renderSelectionTileHTML(
      tileType,
      side,
      this.defender.id,
      ambit,
      slot,
      structId
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

    const structId = slot !== ''
      ? this.getStructIdAtPosition('fleet', this.defender.fleet_id, ambit, slot, false)
      : '';

    return this.renderSelectionTileHTML(
      MAP_TILE_TYPES.FLEET,
      side,
      this.defender.id,
      ambit,
      slot,
      structId
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

    const structId = slot !== ''
      ? this.getStructIdAtPosition('fleet', this.attacker.fleet_id, ambit, slot, false)
      : '';

    return this.renderSelectionTileHTML(
      MAP_TILE_TYPES.FLEET,
      side,
      this.attacker.id,
      ambit,
      slot,
      structId
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

    return this.renderSelectionTileHTML(
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
   * Add the relevant focus cursor to a selected tile.
   * Use this when you select a tile without an action engaged.
   *
   * @param {HTMLElement|object} tile
   */
  addFocusToSourceTile(tile) {
    document.querySelectorAll('a.map-tile-selection-tile.focus-source').forEach(focusedTile => {
      focusedTile.classList.remove('focus-source');
      focusedTile.classList.remove('focus-friendly');
      focusedTile.classList.remove('focus-neutral');
      focusedTile.classList.remove('focus-enemy');
    });

    tile.classList.add('focus-source');

    if (tile.dataset.side === 'left' && tile.dataset.playerId) {
      tile.classList.add('focus-friendly');
    } else if (tile.dataset.side === 'right' && tile.dataset.playerId) {
      tile.classList.add('focus-enemy');
    } else {
      tile.classList.add('focus-neutral');
    }
  }

  initPageCode() {
    document.querySelectorAll('a.map-tile-selection-tile').forEach(tile => {
      tile.addEventListener('click', (e) => {
        //TODO: When actions are engaged, need to use a different function for focus
        this.addFocusToSourceTile(e.currentTarget);
        HUDViewModel.showActionBar(e.currentTarget);
        console.log(e.currentTarget);
      });
    });
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

        html += `<div class="map-tile-selection-row">`;

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