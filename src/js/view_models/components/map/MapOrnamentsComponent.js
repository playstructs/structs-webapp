import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";

/**
 * An overlay for ambit level map ornaments.
 */
export class MapOrnamentsComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {MapOrnamentComponentBuilder} mapOrnamentBuilder
   * @param {Planet} planet
   */
  constructor(
    gameState,
    mapOrnamentBuilder,
    planet
  ) {
    super(gameState);
    this.mapOrnamentBuilder = mapOrnamentBuilder;
    this.planet = planet;
  }

  /**
   * @return {string}
   */
  renderHTML() {
    const planetAmbits = this.planet.getAmbits();
    const planetOrnaments = this.planet.getOrnaments();

    let html = '';

    for (let j = 0; j < planetAmbits.length; j++) {

      const ambitOrnaments = planetOrnaments.get(planetAmbits[j]);

      for (let i = 0; i < ambitOrnaments.length; i++) {
        html += (this.mapOrnamentBuilder.make(ambitOrnaments[i], planetAmbits[j])).renderHTML();
      }
    }

    return html;
  }
}