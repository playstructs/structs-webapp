import {SUICheatsheetContentBuilder} from "../sui/SUICheatsheetContentBuilder";
import {STRUCT_DESCRIPTIONS} from "../constants/StructConstants";

export class CheatsheetContentBuilder extends SUICheatsheetContentBuilder {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super();
    this.gameState = gameState;
  }

  /**
   * @param {StructType} structType
   * @param {object} dataset
   * @return {string}
   */
  buildStructCheatsheet(structType, dataset = {}) {
    return this.renderer.renderContentHTML(
      structType.class,
      structType.build_charge,
      structType.build_draw,
      STRUCT_DESCRIPTIONS[structType.type],
      dataset.contextualMsg ? dataset.contextualMsg : ''
    );
  }

  /**
   * @param {object} dataset triggering element's data attributes
   * @return {string}
   */
  build(dataset) {
    let html = '';

    switch (dataset.suiCheatsheet) {
      case 'icon-beacon':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Planetary Beacon',
          'Planetary Structs can be deployed to this location.'
        );
        break;
      case 'icon-blocked':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Blocked',
          'Structs cannot be deployed to this location.'
        );
        break;
      case 'icon-cmd-post':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Command Post',
          'Only the Command Ship can be deployed to this location.'
        );
        break;
      case 'icon-enemy-tile':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Enemy Territory',
          'Structs cannot be deployed in Enemy Territory.'
        );
        break;
      case 'icon-fleet-tile':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Fleet Territory',
          'Fleet Structs can be deployed to this location.'
        );
        break;
      case 'icon-unknown-territory':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Unknown Territory',
          'There is nothing of interest here yet.'
        );
        break;
      default:
        const structType = this.gameState.structTypes.getStructType(dataset.suiCheatsheet);
        if (structType) {
          html = this.buildStructCheatsheet(structType, dataset);
        } else {
          throw new Error(`Unknown cheatsheet key: ${dataset.suiCheatsheet}`);
        }

    }

    return html;
  }
}