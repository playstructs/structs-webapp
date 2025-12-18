import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {MenuPage} from "../../../framework/MenuPage";
import {StructStillBuilder} from "../../../builders/StructStillBuilder";
import {MAP_TILE_TYPES} from "../../../constants/MapConstants";
import {StructType} from "../../../models/StructType";
import {RenderDeploymentIndicatorEvent} from "../../../events/RenderDeploymentIndicatorEvent";
import {SUICheatsheet} from "../../../sui/SUICheatsheet";

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

  /**
   * @param {StructType} structType
   */
  getTileTypeByStructType(structType) {
    if (structType.category === 'planet') {
      return MAP_TILE_TYPES.PLANETARY_SLOT;
    } else if (structType.category === 'fleet') {
      if (structType.is_command) {
        return MAP_TILE_TYPES.COMMAND
      } else {
        return MAP_TILE_TYPES.FLEET
      }
    }

    throw new Error(`Unknown struct type category: ${structType.category}`);
  }

  initPageCode() {
    this.deployableStructTypes.forEach(structType => {
      const element = document.getElementById(this.createLinkId(structType));
      let mouseDownTime = null;

      element.addEventListener('mousedown', () => {
        mouseDownTime = performance.now();
      });

      element.addEventListener('mouseup', () => {
        if (mouseDownTime === null) {
          return;
        }

        const elapsed = performance.now() - mouseDownTime;
        mouseDownTime = null;

        if (elapsed > SUICheatsheet.OPEN_DELAY - 50) {
          return;
        }

        console.log(`Deploy: ${structType.type}`);

        this.signingClientManager.queueMsgStructBuildInitiate(
          this.gameState.signingAccount.address,
          this.gameState.thisPlayerId,
          structType.id,
          this.ambit,
          this.slot
        ).then();

        MenuPage.sui.offcanvas.close();

        window.dispatchEvent(new RenderDeploymentIndicatorEvent(
          this.gameState.alphaBaseMap.structLayerId,
          this.getTileTypeByStructType(structType),
          this.ambit,
          this.slot,
          this.gameState.thisPlayerId
        ));
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
