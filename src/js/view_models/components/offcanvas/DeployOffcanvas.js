import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {MenuPage} from "../../../framework/MenuPage";

export class DeployOffcanvas extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {string} tileType see MAP_TILE_TYPES
   * @param {string} ambit
   */
  constructor(
    gameState,
    tileType,
    ambit
  ) {
    super(gameState);
    this.tileType = tileType;
    this.ambit = ambit;

    /** @type {StructType[]}*/
    this.deployableStructTypes = this.gameState.structTypes.fetchAllByTileTypeAndAmbit(this.tileType, this.ambit);

    this.idPrefix = 'deploy-';
    this.className = 'deploy-struct-type';
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  createLinkId(structType) {
    const name = structType.type.toLowerCase().replace(/\s/g, '-');
    return `${this.idPrefix}${name}`;
  }

  initPageCode() {
    this.deployableStructTypes.forEach(structType => {
      document.getElementById(this.createLinkId(structType)).addEventListener('click', () => {
        console.log(`Clicked on type: ${structType.type}`);
      });
    });
  }

  /**
   * @return {string}
   */
  renderHTML() {
     return `
        <div class="offcanvas-struct-list-layout">
          ${this.deployableStructTypes.map(structType => `
            <a 
              href="javascript: void(0)"
              id="${this.createLinkId(structType)}"
              class="offcanvas-struct-container ${this.className}">
              ${structType.type}
            </a>
          `).join('')}
        </div>
     `;
   }

  render() {
    MenuPage.sui.offcanvas.setHeader('Select Struct');
    MenuPage.sui.offcanvas.setContent(this.renderHTML());
    MenuPage.sui.offcanvas.open();
  }
}
