import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {MenuPage} from "../../../framework/MenuPage";
import {StructStillBuilder} from "../../../builders/StructStillBuilder";

export class DeployOffcanvas extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   * @param {string} tileType see MAP_TILE_TYPES
   * @param {string} ambit
   * @param {number|null} slot
   */
  constructor(
    gameState,
    signingClientManager,
    tileType,
    ambit,
    slot = null
  ) {
    super(gameState);
    this.tileType = tileType;
    this.ambit = ambit;
    this.signingClientManager = signingClientManager;
    this.slot = slot;
    this.structStillBuilder = new StructStillBuilder(this.gameState);

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
        console.log(`Deploy: ${structType.type}`);

        this.signingClientManager.queueMsgStructBuildInitiate(
          this.gameState.signingAccount.address,
          this.gameState.thisPlayerId,
          structType.id,
          this.ambit,
          this.slot
        ).then();

        MenuPage.sui.offcanvas.close();
      });
    });
  }

  /**
   * @return {string}
   */
  renderHTML() {
     return `
        <div class="offcanvas-struct-list-layout">
          ${this.deployableStructTypes.map(structType => {
            const structStill = this.structStillBuilder.build(structType.type);
            return `
              <a 
                href="javascript: void(0)"
                id="${this.createLinkId(structType)}"
                class="offcanvas-struct-container ${this.className}"
                data-sui-cheatsheet="${structType.type}"
              >
                ${structStill.renderHTML()}
              </a>
            `;
          }).join('')}
        </div>
     `;
   }

  render() {
    MenuPage.sui.offcanvas.setHeader('Select Struct');
    MenuPage.sui.offcanvas.setContent(this.renderHTML());
    MenuPage.sui.offcanvas.open();
    this.initPageCode();
  }
}
