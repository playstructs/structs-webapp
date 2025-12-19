import {AbstractViewModel} from "../framework/AbstractViewModel";
import {StatusBarTopLeftComponent} from "./components/hud/StatusBarTopLeftComponent";
import {StatusBarTopRightComponent} from "./components/hud/StatusBarTopRightComponent";
import {ActionBarComponent} from "./components/hud/ActionBarComponent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {MenuPage} from "../framework/MenuPage";
import {HUD_IDS} from "../constants/HUDConstants";
import {MAP_CONTAINER_IDS} from "../constants/MapConstants";
import {MENU_PAGE_ROUTER_MODES} from "../constants/MenuPageRouterModes";

export class HUDViewModel extends AbstractViewModel {

  /** @type {GameState} */
  static gameState;

  /** @type {SigningClientManager} */
  static signingClientManager;

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
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   * @param {StructManager} structManager
   */
  static init(gameState, signingClientManager, structManager) {
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
      PLAYER_TYPES.PLAYER,
      'left',
      HUD_IDS.ACTION_BAR_PLAYER
    );

    HUDViewModel.bottomRightActionBarAlphaBase = new ActionBarComponent(
      gameState,
      signingClientManager,
      structManager,
      PLAYER_TYPES.PLANET_RAIDER,
      'right',
      HUD_IDS.ACTION_BAR_ALPHA_BASE_ENEMY
    );

    HUDViewModel.bottomRightActionBarRaid = new ActionBarComponent(
      gameState,
      signingClientManager,
      structManager,
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
      MenuPage.router.goto('Account', 'profile', {playerId: this.gameState.planetRaider.id});
      MenuPage.open();
    };

    HUDViewModel.bottomRightActionBarRaid.profileClickHandler = () => {
      MenuPage.router.enablePreviewMode();
      MenuPage.router.goto('Account', 'profile', {playerId: this.gameState.raidEnemy.id});
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
        && this.gameState.planetRaider
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

    // Show action bar for both empty and occupied tiles
    // Pass structId to determine if deploy button should be disabled
    HUDViewModel[actionBar].showActionBarFor(
      clickedDomElement.dataset.tileType,
      clickedDomElement.dataset.tileLabel || clickedDomElement.dataset.ambit,
      clickedDomElement.dataset.side,
      slot,
      structId || null
    );
  }
}
