import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {
  MAP_COL_ATTACKER_COMMAND, MAP_COL_ATTACKER_FLEET, MAP_COL_DEFENDER_COMMAND, MAP_COL_DEFENDER_FLEET,
  MAP_COL_DEFENDER_PLANETARY, MAP_COL_DIVIDER, MAP_DEFAULT_FLEET_COL_COUNT,
  MAP_TILE_ROWS_PER_AMBIT, MAP_TILE_TYPES, MAP_TRANSITION_TILE_LABELS
} from "../../../constants/MapConstants";
import {AMBITS} from "../../../constants/Ambits";

export class MapTileSelectionComponent extends AbstractViewModelComponent {

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
    this.planet = planet;
    this.defender = defender;
    this.attacker = attacker;
  }

  /**
   * @param {string} tileType the tile type. See MAP_TILE_TYPES constant array.
   * @param {string} playerId the ID of the player that owns the tile or empty if no one does such as a transition tile.
   * @param {string} ambit the ambit the tile is in or empty if it's a transition tile.
   * @param {string|number} slot the planetary or fleet slot number. Empty if it's not a command, planetary, fleet or command tile.
   * @param {string} structId the ID of the struct occupying the tile or empty if the tile is not occupied.
   * @param {string} tileLabel a custom tile label that is displayed in the action bar. Used for transition tiles.
   * @return {string}
   */
  renderSelectionTileHTML(
    tileType,
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
        MAP_TILE_TYPES.FOG_OF_WAR
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
        || this.renderSelectionTileHTML(MAP_TILE_TYPES.TRANSITION, '', '', '', '', tileLabel);
    }

    return `
      <div class="map-tile-selection-row">
        ${tiles}
      </div>
    `;
  }

  /**
   * @param {string} mapColType
   * @param {string} ambit
   * @return {string}
   */
  renderCommandTileHTML(mapColType, ambit) {
    let playerId = '';

    if (mapColType === MAP_COL_DEFENDER_COMMAND) {
      playerId = this.defender.id;
    } else if (mapColType === MAP_COL_ATTACKER_COMMAND) {
      playerId = this.attacker.id;
    } else {
      return '';
    }

    return this.renderSelectionTileHTML(
      MAP_TILE_TYPES.COMMAND,
      playerId,
      ambit
    );
  }

  /**
   * @param {string} mapColType
   * @param {string} ambit
   * @param {string} slot
   * @return {string}
   */
  renderPlanetaryTileHTML(
    mapColType,
    ambit,
    slot
  ) {
    if (mapColType !== MAP_COL_DEFENDER_PLANETARY) {
      return '';
    }

    const tileType = (slot === '')
      ? MAP_TILE_TYPES.PLANETARY_BLOCKED
      : MAP_TILE_TYPES.PLANETARY_SLOT;

    return this.renderSelectionTileHTML(
      tileType,
      this.defender.id,
      ambit,
      slot
    );
  }

  /**
   * @param {string} mapColType
   * @param {string} ambit
   * @param {string} slot
   * @return {string}
   */
  renderDefenderFleetTileHTML(
    mapColType,
    ambit,
    slot
  ) {
    if (mapColType !== MAP_COL_DEFENDER_FLEET) {
      return '';
    }

    return this.renderSelectionTileHTML(
      MAP_TILE_TYPES.FLEET,
      this.defender.id,
      ambit,
      slot
    );
  }

  /**
   * @param {string} mapColType
   * @param {string} ambit
   * @param {string} slot
   * @return {string}
   */
  renderAttackerFleetTileHTML(
    mapColType,
    ambit,
    slot
  ) {
    if (mapColType !== MAP_COL_ATTACKER_FLEET) {
      return '';
    }

    return this.renderSelectionTileHTML(
      MAP_TILE_TYPES.FLEET,
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

    return this.renderSelectionTileHTML(
      MAP_TILE_TYPES.DIVIDER,
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

  initPageCode() {
    document.querySelectorAll('a.map-tile-selection-tile').forEach(tile => {
      tile.addEventListener('click', (e) => {
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
      const numPlanetarySlots = this.planet[`${currentAmbit.toLowerCase()}_slots`];
      const totalFleetSlotsPerAmbitPerPlayer = MAP_TILE_ROWS_PER_AMBIT * MAP_DEFAULT_FLEET_COL_COUNT;

      html += this.renderTransitionRowHTML(previousAmbit, currentAmbit);

      for (let r = 0; r < MAP_TILE_ROWS_PER_AMBIT; r++) {

        html += `<div class="map-tile-selection-row">`;

        for (let c = 0; c < this.mapColBreakdown.length; c++) {

          const mapColType = this.mapColBreakdown[c];

          // TODO: Missing divider tile

          html += this.renderFogOfWarTileHTML(mapColType)
            || this.renderCommandTileHTML(mapColType, currentAmbit)
            || this.renderPlanetaryTileHTML(
              mapColType,
              currentAmbit,
              this.calcSlotNumber(MAP_COL_DEFENDER_PLANETARY, r, c, numPlanetarySlots)
            )
            || this.renderDefenderFleetTileHTML(
              mapColType,
              currentAmbit,
              this.calcSlotNumber(MAP_COL_DEFENDER_FLEET, r, c, totalFleetSlotsPerAmbitPerPlayer)
            )
            || this.renderAttackerFleetTileHTML(
              mapColType,
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