import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {MenuPage} from "../../../framework/MenuPage";
import {StructStillBuilder} from "../../../builders/StructStillBuilder";
import {MAP_TILE_TYPES} from "../../../constants/MapConstants";
import {StructType} from "../../../models/StructType";
import {RenderDeploymentIndicatorEvent} from "../../../events/RenderDeploymentIndicatorEvent";
import {PendingBuildAddedEvent} from "../../../events/PendingBuildAddedEvent";
import {SUICheatsheet} from "../../../sui/SUICheatsheet";

export class DeployOffcanvas extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   * @param {StructManager} structManager
   * @param {string} tileType see MAP_TILE_TYPES
   * @param {string} ambit
   * @param {number|null} slot
   */
  constructor(
    gameState,
    signingClientManager,
    structManager,
    tileType,
    ambit,
    slot = null
  ) {
    super(gameState);
    this.tileType = tileType;
    this.ambit = ambit;
    this.signingClientManager = signingClientManager;
    this.structManager = structManager;
    this.slot = slot;
    this.structStillBuilder = new StructStillBuilder(this.gameState);

    /** @type {StructType[]}*/
    this.deployableStructTypes = this.gameState.structTypes.fetchAllByTileTypeAndAmbit(this.tileType, this.ambit);

    this.idPrefix = 'deploy-';
    this.className = 'deploy-struct-type';
    this.disabledClassName = 'deploy-struct-type-disabled';
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
      if (this.structManager.getDeploymentBlocker(structType)) {
        return;
      }

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

        const tileType = this.getTileTypeByStructType(structType);

        this.signingClientManager.queueMsgStructBuildInitiate(
          this.gameState.signingAccount.address,
          this.gameState.thisPlayerId,
          structType.id,
          this.ambit,
          this.slot
        ).then();

        MenuPage.sui.offcanvas.close();

        // Add pending build to gameState
        this.gameState.addPendingBuild(
          tileType,
          this.ambit,
          this.slot,
          this.gameState.thisPlayerId,
          structType
        );

        // Dispatch event to render deployment indicator on struct layer
        window.dispatchEvent(new RenderDeploymentIndicatorEvent(
          this.gameState.alphaBaseMap.structLayerId,
          tileType,
          this.ambit,
          this.slot,
          this.gameState.thisPlayerId
        ));

        // Dispatch event to notify that a pending build was added
        window.dispatchEvent(new PendingBuildAddedEvent(
          this.gameState.alphaBaseMap.structLayerId,
          tileType,
          this.ambit,
          this.slot,
          this.gameState.thisPlayerId,
          structType
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
            const deploymentBlocker = this.structManager.getDeploymentBlocker(structType);
            const disabledClassName = deploymentBlocker ? this.disabledClassName : '';
            return `
              <a 
                href="javascript: void(0)"
                id="${this.createLinkId(structType)}"
                class="offcanvas-struct-container ${this.className} ${disabledClassName}"
                data-sui-cheatsheet="${structType.type}"
                data-contextual-msg="${deploymentBlocker}"
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
