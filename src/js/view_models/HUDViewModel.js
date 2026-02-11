import {AbstractViewModel} from "../framework/AbstractViewModel";
import {StatusBarTopLeftComponent} from "./components/hud/StatusBarTopLeftComponent";
import {StatusBarTopRightComponent} from "./components/hud/StatusBarTopRightComponent";
import {ActionBarComponent} from "./components/hud/ActionBarComponent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {EVENTS} from "../constants/Events";
import {MenuPage} from "../framework/MenuPage";
import {HUD_IDS} from "../constants/HUDConstants";
import {MAP_CONTAINER_IDS} from "../constants/MapConstants";
import {MENU_PAGE_ROUTER_MODES} from "../constants/MenuPageRouterModes";

export class HUDViewModel extends AbstractViewModel {

  /** @type {GameState} */
  static gameState;

  /** @type {SigningClientManager} */
  static signingClientManager;

  static containerId = 'hud-container';

  /** @type {StatusBarTopLeftComponent} */
  static topLeftStatusBar;

  /** @type {StatusBarTopRightComponent} */
  static topRightStatusBarAlphaBase;

  /** @type {StatusBarTopRightComponent} */
  static topRightStatusBarRaid;

  /** @type {ActionBarComponent} */
  static bottomLeftActionBar;

  /** @type {ActionBarComponent} */
  static bottomRightActionBarAlphaBase;

  /** @type {ActionBarComponent} */
  static bottomRightActionBarRaid;

  /**
   * Currently selected tile data for action bar refresh.
   * @type {{tileType: string, ambit: string, slot: number|null, playerId: string, side: string, structId: string|null, tileLabel: string}|null}
   */
  static currentSelectedTile = null;

  /**
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   * @param {StructManager} structManager
   * @param {TaskManager} taskManager
   */
  static init(
    gameState,
    signingClientManager,
    structManager,
    taskManager
  ) {
    HUDViewModel.gameState = gameState;
    HUDViewModel.signingClientManager = signingClientManager;

    HUDViewModel.topLeftStatusBar = new StatusBarTopLeftComponent(
      gameState,
      HUD_IDS.STATUS_BAR_TOP_LEFT
    );

    HUDViewModel.topRightStatusBarAlphaBase = new StatusBarTopRightComponent(
      gameState,
      false,
      HUD_IDS.STATUS_BAR_TOP_RIGHT_ALPHA_BASE
    );

    HUDViewModel.topRightStatusBarRaid = new StatusBarTopRightComponent(
      gameState,
      true,
      HUD_IDS.STATUS_BAR_TOP_RIGHT_RAID
    );

    HUDViewModel.bottomLeftActionBar = new ActionBarComponent(
      gameState,
      signingClientManager,
      structManager,
      taskManager,
      PLAYER_TYPES.PLAYER,
      'left',
      HUD_IDS.ACTION_BAR_PLAYER
    );

    HUDViewModel.bottomRightActionBarAlphaBase = new ActionBarComponent(
      gameState,
      signingClientManager,
      structManager,
      taskManager,
      PLAYER_TYPES.PLANET_RAIDER,
      'right',
      HUD_IDS.ACTION_BAR_ALPHA_BASE_ENEMY
    );

    HUDViewModel.bottomRightActionBarRaid = new ActionBarComponent(
      gameState,
      signingClientManager,
      structManager,
      taskManager,
      PLAYER_TYPES.RAID_ENEMY,
      'right',
      HUD_IDS.ACTION_BAR_RAID_ENEMY
    );

    HUDViewModel.bottomLeftActionBar.profileClickHandler = function () {
      const allowedControllers = [
        'Fleet',
        'Guild',
        'Account',
      ];
      if (!allowedControllers.includes(MenuPage.router.currentController)) {
        MenuPage.router.goto('Fleet', 'index');
      } else {
        if (MenuPage.router.mode !== MENU_PAGE_ROUTER_MODES.DEFAULT) {
          MenuPage.router.enableDefaultMode();
        }
        MenuPage.router.goto(MenuPage.router.currentController, MenuPage.router.currentPage, MenuPage.router.currentOptions);
      }
      MenuPage.open();
    };

    HUDViewModel.bottomRightActionBarAlphaBase.profileClickHandler = () => {
      MenuPage.router.enablePreviewMode();
      MenuPage.router.goto('Account', 'profile', {playerId: this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].player.id});
      MenuPage.open();
    };

    HUDViewModel.bottomRightActionBarRaid.profileClickHandler = () => {
      MenuPage.router.enablePreviewMode();
      MenuPage.router.goto('Account', 'profile', {playerId: this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].player.id});
      MenuPage.open();
    };
  }

  static initPageCode() {
    HUDViewModel.topLeftStatusBar.initPageCode();
    HUDViewModel.topRightStatusBarAlphaBase.initPageCode();
    HUDViewModel.topRightStatusBarRaid.initPageCode();
    HUDViewModel.bottomLeftActionBar.initPageCode();
    HUDViewModel.bottomRightActionBarAlphaBase.initPageCode();
    HUDViewModel.bottomRightActionBarRaid.initPageCode();

    window.addEventListener(EVENTS.REFRESH_ACTION_BAR, () => {
      console.log('Refreshing action bar');
      HUDViewModel.refreshActionBar();
    });

    // Listen for REFRESH_ACTION_BAR events (when a struct arrives at a position)
    window.addEventListener(EVENTS.REFRESH_ACTION_BAR_IF_SELECTED, (event) => {
      HUDViewModel.refreshActionBarIfSelected(
        event.tileType,
        event.ambit,
        event.slot,
        event.playerId,
        event.structId
      );
    });

    // Listen for PENDING_BUILD_ADDED events to refresh action bar if the tile is selected
    window.addEventListener(EVENTS.PENDING_BUILD_ADDED, (event) => {
      if (HUDViewModel.currentSelectedTile) {
        const current = HUDViewModel.currentSelectedTile;
        if (
          current.tileType === event.tileType
          && current.ambit.toUpperCase() === event.ambit.toUpperCase()
          && current.slot === event.slot
          && current.playerId === event.playerId
        ) {
          // Refresh the action bar to show the pending build
          const actionBar = HUDViewModel.whichActionBar(current.side);
          HUDViewModel[actionBar].showActionBarFor(
            current.tileType,
            current.tileLabel,
            current.side,
            current.slot,
            current.structId
          );
        }
      }
    });
  }

  static render() {
    return `
      ${HUDViewModel.topLeftStatusBar.renderHTML()}
      ${HUDViewModel.topRightStatusBarAlphaBase.renderHTML()}
      ${HUDViewModel.topRightStatusBarRaid.renderHTML()}
      ${HUDViewModel.bottomLeftActionBar.renderHTML()}
      ${HUDViewModel.bottomRightActionBarAlphaBase.renderHTML()}
      ${HUDViewModel.bottomRightActionBarRaid.renderHTML()}
    `;
  }

  /**
   * @param {string} sideClicked left or right or empty string
   * @return {string}
   */
  static whichActionBar(sideClicked) {
    let actionBar = 'bottomLeftActionBar';

    if (sideClicked === 'right') {
      if (this.gameState.activeMapContainerId === MAP_CONTAINER_IDS.RAID) {
        actionBar = 'bottomRightActionBarRaid';
      }
      if (
        this.gameState.activeMapContainerId === MAP_CONTAINER_IDS.ALPHA_BASE
        && this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].player
      ) {
        actionBar = 'bottomRightActionBarAlphaBase';
      }
    }

    return actionBar;
  }

  static hideActionBarActionChunks() {
    HUDViewModel.bottomLeftActionBar.hideActionChunk();
    HUDViewModel.bottomRightActionBarAlphaBase.hideActionChunk();
    HUDViewModel.bottomRightActionBarRaid.hideActionChunk();
  }

  /**
   * @param {HTMLElement|object} clickedDomElement
   */
  static showActionBar(clickedDomElement) {
    HUDViewModel.hideActionBarActionChunks();

    const actionBar = HUDViewModel.whichActionBar(clickedDomElement.dataset.side);
    const structId = clickedDomElement.dataset.structId;

    let slot = parseInt(clickedDomElement.dataset.slot, 10);
    if (isNaN(slot)) {
      slot = null;
    }

    const tileType = clickedDomElement.dataset.tileType;
    const tileLabel = clickedDomElement.dataset.tileLabel || clickedDomElement.dataset.ambit;
    const side = clickedDomElement.dataset.side;
    const playerId = clickedDomElement.dataset.playerId;

    // Store the currently selected tile for action bar refresh
    HUDViewModel.currentSelectedTile = {
      tileType: tileType,
      ambit: clickedDomElement.dataset.ambit,
      slot: slot,
      playerId: playerId,
      side: side,
      structId: structId || null,
      tileLabel: tileLabel
    };

    // Show action bar for both empty and occupied tiles
    // Pass structId to determine if deploy button should be disabled
    HUDViewModel[actionBar].showActionBarFor(
      tileType,
      tileLabel,
      side,
      slot,
      structId || null
    );
  }

  /**
   * Refresh the action bar for the currently selected tile.
   * Called when a struct arrives at the selected position.
   *
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @param {string} structId
   */
  static refreshActionBarIfSelected(tileType, ambit, slot, playerId, structId) {
    if (!HUDViewModel.currentSelectedTile) {
      return;
    }

    const current = HUDViewModel.currentSelectedTile;

    // Check if the event matches the currently selected tile
    if (
      current.tileType === tileType
      && current.ambit.toUpperCase() === ambit.toUpperCase()
      && current.slot === slot
      && current.playerId === playerId
    ) {
      // Update the stored struct ID
      HUDViewModel.currentSelectedTile.structId = structId;

      // Refresh the action bar
      const actionBar = HUDViewModel.whichActionBar(current.side);
      HUDViewModel[actionBar].showActionBarFor(
        current.tileType,
        current.tileLabel,
        current.side,
        current.slot,
        structId
      );
    }
  }

  static refreshActionBar() {
    if (!HUDViewModel.currentSelectedTile) {
      return;
    }

    const current = HUDViewModel.currentSelectedTile;
    const actionBar = HUDViewModel.whichActionBar(current.side);
    HUDViewModel[actionBar].showActionBarFor(
      current.tileType,
      current.tileLabel,
      current.side,
      current.slot,
      current.structId
    );
  }

  static hide() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.classList.add('hidden')
    }
  }

  static show() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.classList.remove('hidden')
    }
  }
}
