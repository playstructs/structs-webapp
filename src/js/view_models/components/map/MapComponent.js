import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";

export class MapComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {string} idPrefix
   * @param {string} containerId
   */
  constructor(
    gameState,
    idPrefix,
    containerId
  ) {
    super(gameState);

    this.idPrefix = idPrefix;

    this.containerId = containerId;

    /** @type {Planet|null} */
    this.mapPlanet = null;

    /** @type {Player|null} */
    this.attacker = null;

    /** @type {Player|null} */
    this.defender = null;

    this.playerMapRole = null; // ATTACKER, DEFENDER, SPECTATOR
    this.perspective = null; // ATTACKER, DEFENDER
  }

  initPageCode() {
    // TODO
  }

  renderHTML() {
    // TODO
    return '';
  }
}