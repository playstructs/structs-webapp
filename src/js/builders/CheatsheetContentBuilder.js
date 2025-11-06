import {SUICheatsheetContentBuilder} from "../sui/SUICheatsheetContentBuilder";

export class CheatsheetContentBuilder extends SUICheatsheetContentBuilder {
  constructor() {
    super();
  }

  /**
   * @param {string} cheatsheetKey
   * @return {string}
   */
  build(cheatsheetKey) {
    let html = '';

    switch (cheatsheetKey) {
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
        throw new Error(`Unknown cheatsheet key: ${cheatsheetKey}`);

    }
    return html;
  }
}