import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";

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
  }

  initPageCode() {

  }

  renderHTML() {
     return `
        <div class="offcanvas-struct-list-layout">
          <a href="javascript: void(0)" class="offcanvas-struct-container"></a>
          <a href="javascript: void(0)" class="offcanvas-struct-container"></a>
          <a href="javascript: void(0)" class="offcanvas-struct-container"></a>
          <a href="javascript: void(0)" class="offcanvas-struct-container"></a>
        </div>
     `;
   }

   render() {

   }
}