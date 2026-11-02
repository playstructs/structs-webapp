import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {MenuPage} from "../../../framework/MenuPage";
import {StructStillBuilder} from "../../../builders/StructStillBuilder";
import {MAP_TILE_TYPES} from "../../../constants/MapConstants";
import {StructType} from "../../../models/StructType";
import {RenderDeploymentIndicatorEvent} from "../../../events/RenderDeploymentIndicatorEvent";
import {PendingBuildAddedEvent} from "../../../events/PendingBuildAddedEvent";
import {SUICheatsheet} from "../../../sui/SUICheatsheet";
import {PLAYER_TYPES} from "../../../constants/PlayerTypes";
import {EVENTS} from "../../../constants/Events";
import {TX_STATUS} from "../../../models/SigningTransaction";
import {ClearStructTileEvent} from "../../../events/ClearStructTileEvent";
import {RefreshActionBarEvent} from "../../../events/RefreshActionBarEvent";

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

    /** @type {Set<string>} link IDs that already have deploy handlers attached */
    this.handledLinkIds = new Set();

    /** @type {HTMLElement|null} */
    this.listElm = null;

    this.chargeLevelChangedHandler = this.handleChargeLevelChanged.bind(this);
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

  /**
   * @param {StructType} structType
   */
  attachDeployHandler(structType) {
    const linkId = this.createLinkId(structType);
    const element = document.getElementById(linkId);
    let mouseDownTime = null;

    this.handledLinkIds.add(linkId);

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

      // The struct may have become blocked again since the handler was attached
      if (this.structManager.getDeploymentBlocker(structType)) {
        return;
      }

      console.log(`Deploy: ${structType.type}`);

      const tileType = this.getTileTypeByStructType(structType);

      let completion;
      try {
        completion = this.signingClientManager.queueMsgStructBuildInitiate(
          this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id,
          structType.id,
          this.ambit,
          this.slot,
          structType.build_charge
        );
      } catch (error) {
        console.warn('[DeployOffcanvas] build was not queued:', error);
        return;
      }

      MenuPage.sui.offcanvas.close();

      // Add pending build to gameState
      this.gameState.addPendingBuild(
        tileType,
        this.ambit,
        this.slot,
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id,
        structType
      );
      const playerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
      const mapId = this.gameState.alphaBaseMap.mapId;
      const pending = this.gameState.getPendingBuild(tileType, this.ambit, this.slot, playerId);
      const clearPending = () => {
        if (this.gameState.getPendingBuild(tileType, this.ambit, this.slot, playerId) !== pending) return;
        this.gameState.removePendingBuild(tileType, this.ambit, this.slot, playerId);
        window.dispatchEvent(new ClearStructTileEvent(mapId, tileType, this.ambit, this.slot, playerId));
        window.dispatchEvent(new RefreshActionBarEvent());
      };
      completion.then(transaction => {
        if (transaction.status !== TX_STATUS.SUCCEEDED) clearPending();
      }).catch(error => {
        console.warn('[DeployOffcanvas] build observation stopped:', error);
        // An interrupted observer does not establish transaction failure.
      });

      // Dispatch event to render deployment indicator on struct layer
      window.dispatchEvent(new RenderDeploymentIndicatorEvent(
        this.gameState.alphaBaseMap.mapId,
        tileType,
        this.ambit,
        this.slot,
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
      ));

      // Dispatch event to notify that a pending build was added
      window.dispatchEvent(new PendingBuildAddedEvent(
        this.gameState.alphaBaseMap.mapId,
        tileType,
        this.ambit,
        this.slot,
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id,
        structType
      ));
    });
  }

  /**
   * @return {boolean}
   */
  isShowing() {
    const offcanvasElm = MenuPage.sui.offcanvas.offcanvasElm;
    return !offcanvasElm.classList.contains('hidden') && offcanvasElm.contains(this.listElm);
  }

  /**
   * Re-evaluate each struct type's deployment blocker so struct types become selectable
   * (or blocked again) while the menu is open.
   */
  refreshDeploymentBlockers() {
    this.deployableStructTypes.forEach(structType => {
      const linkId = this.createLinkId(structType);
      const element = document.getElementById(linkId);
      const deploymentBlocker = this.structManager.getDeploymentBlocker(structType);

      element.classList.toggle(this.disabledClassName, !!deploymentBlocker);
      element.dataset.contextualMsg = deploymentBlocker;

      if (!deploymentBlocker && !this.handledLinkIds.has(linkId)) {
        this.attachDeployHandler(structType);
      }
    });
  }

  /**
   * @param {ChargeLevelChangedEvent} event
   */
  handleChargeLevelChanged(event) {
    if (!this.isShowing()) {
      window.removeEventListener(EVENTS.CHARGE_LEVEL_CHANGED, this.chargeLevelChangedHandler);
      return;
    }

    if (event.playerId === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id) {
      this.refreshDeploymentBlockers();
    }
  }

  initPageCode() {
    this.deployableStructTypes.forEach(structType => {
      if (!this.structManager.getDeploymentBlocker(structType)) {
        this.attachDeployHandler(structType);
      }
    });

    window.addEventListener(EVENTS.CHARGE_LEVEL_CHANGED, this.chargeLevelChangedHandler);
  }

  /**
   * @return {string}
   */
  renderHTML() {
     return `
        <div class="offcanvas-struct-list-layout">
          ${this.deployableStructTypes.map(structType => {
            const structStill = this.structStillBuilder.build(structType);
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
    MenuPage.sui.offcanvas.setHeader('Deploy Struct');
    MenuPage.sui.offcanvas.setContent(this.renderHTML());
    // Held so a later menu reusing the same link IDs isn't mistaken for this one
    this.listElm = MenuPage.sui.offcanvas.offcanvasElm.querySelector('.offcanvas-struct-list-layout');
    MenuPage.sui.offcanvas.open();
    this.initPageCode();
  }
}
