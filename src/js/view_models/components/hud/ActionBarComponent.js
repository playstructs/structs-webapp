import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";
import {MAP_CONTAINER_IDS, MAP_TILE_TYPE_ICONS, MAP_TILE_TYPES} from "../../../constants/MapConstants";
import {PLAYER_TYPES} from "../../../constants/PlayerTypes";
import {DeployOffcanvas} from "../offcanvas/DeployOffcanvas";
import {Struct} from "../../../models/Struct";
import {StructType} from "../../../models/StructType";
import {STRUCT_ACTIONS, STRUCT_CATEGORIES, STRUCT_EQUIPMENT_ICON_MAP, STRUCT_STATUS_FLAGS} from "../../../constants/StructConstants";
import {ShowMoveTargetsEvent} from "../../../events/ShowMoveTargetsEvent";
import {ClearMoveTargetsEvent} from "../../../events/ClearMoveTargetsEvent";
import {ShowDefendTargetsEvent} from "../../../events/ShowDefendTargetsEvent";
import {ClearDefendTargetsEvent} from "../../../events/ClearDefendTargetsEvent";
import {ShowAttackTargetsEvent} from "../../../events/ShowAttackTargetsEvent";
import {ClearAttackTargetsEvent} from "../../../events/ClearAttackTargetsEvent";
import {TASK_TYPES} from "../../../constants/TaskTypes";
import {NumberFormatter} from "../../../util/NumberFormatter";

export class ActionBarComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   * @param {StructManager} structManager
   * @param {TaskManager} taskManager
   * @param {string} playerType
   * @param {string} align left or right
   * @param {string} id
   */
  constructor(
    gameState,
    signingClientManager,
    structManager,
    taskManager,
    playerType,
    align,
    id
  ) {
    super(gameState);

    this.playerType = playerType;
    this.signingClientManager = signingClientManager;
    this.structManager = structManager;
    this.taskManager = taskManager;
    this.numberFormatter = new NumberFormatter();

    /* Style */
    this.themeClass = `sui-theme-${this.playerType === PLAYER_TYPES.PLAYER ? 'player' : 'enemy'}`;
    this.align = align;

    /* IDs */
    this.id = id;
    this.playerChunkId = `${this.playerType}-action-bar-player-chunk`;
    this.playerChunkPortraitId = `${this.playerType}-action-bar-portrait`;
    this.playerChunkBatteryId = `${this.playerType}-action-bar-battery`;
    this.connectorId = `${this.playerType}-action-bar-connector`;
    this.actionChunkId = `${this.playerType}-action-bar-action-chunk`;
    this.headerScreenId = `${this.playerType}-action-bar-header`;
    this.propertiesScreenId = `${this.playerType}-action-bar-properties-screen`;
    this.progressBarId = `${this.playerType}-action-bar-progress-bar`;
    this.undiscoveredOreContainerId = `${this.playerType}-action-bar-undiscovered-or-container`;
    this.oreReadyContainerId = `${this.playerType}-action-bar-ore-ready-container`;
    this.inProgressValueContainerId = `${this.playerType}-action-bar-progress-bar-in-progress-value`;
    this.panelSwitchId = `${this.playerType}-action-bar-panel-switch`;

    /* Profile Chunk */
    this.profileClickHandler = function () {};
    this.batteryfilledClass = 'sui-mod-filled';

    /**
     * Currently selected struct
     * @type {Struct|null}
     */
    this.selectedStruct = null;
  }

  /**
   * Currently selected struct ID if there is one.
   * @return {string|null}
   */
  getSelectedStructId() {
    return this.selectedStruct ? this.selectedStruct.id : null;
  }

  /**
   * @param {ChargeLevelChangedEvent} event
   */
  updateActionButtons(event) {
    if (
      this.playerType === PLAYER_TYPES.PLAYER
      && event.playerId === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
      && this.selectedStruct
      && this.selectedStruct.isOnline()
    ) {
      const charge = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].getCharge(this.gameState.currentBlockHeight);
      const actionButtons = document.getElementById(this.actionChunkId).querySelectorAll('.sui-action-bar-btn-group a.sui-panel-btn');
      actionButtons.forEach(actionButton => {
        if (
          parseInt(actionButton.getAttribute('data-action-charge')) <= charge
          && actionButton.classList.contains('sui-mod-disabled')
        ) {
          const isActive = parseInt(actionButton.getAttribute('data-active-defense') || 0);
          if (isActive) {
            actionButton.classList.add('sui-mod-active-defense');
          } else {
            actionButton.classList.add('sui-mod-default');
          }
          actionButton.classList.remove('sui-mod-disabled');
        }
      });
    }
  }

  initPageCode() {
    window.addEventListener(EVENTS.CHARGE_LEVEL_CHANGED, function (event) {
      if (event.playerId === this.gameState.getPlayerIdByType(this.playerType)) {
        this.renderChargeLevel(event.chargeLevel);
      }

      if (this.selectedStruct && !this.selectedStruct.isOnline()) {
        const panelSwitchElm = document.getElementById(this.panelSwitchId);

        if (panelSwitchElm && panelSwitchElm.dataset.state === 'disabled') {
          const structType = this.gameState.structTypes.getStructTypeById(this.selectedStruct.type);
          const panelSwitchState = this.getPanelSwitchState(this.selectedStruct, structType);

          if (panelSwitchState.canToggle) {
            this.showStructActionBar(this.selectedStruct);
          }
        }

      }

      this.updateActionButtons(event);

    }.bind(this));

    document.getElementById(this.playerChunkPortraitId).addEventListener('click', this.profileClickHandler.bind(this));

    // Listen for task worker changes to update progress bar
    window.addEventListener(EVENTS.TASK_WORKER_CHANGED, (event) => {
      if (!this.getSelectedStructId() || event.state.object_id !== this.getSelectedStructId()) {
        return;
      }
      if (event.state.task_type === TASK_TYPES.BUILD) {
        this.updateProgressBar(event.state.getPercentCompleteEstimate());
      } else if (event.state.task_type === TASK_TYPES.MINE || event.state.task_type === TASK_TYPES.REFINE) {
        const estInMS = event.state.getTimeRemainingEstimate();
        const estFormatted = this.numberFormatter.formatMilliseconds(estInMS);
        this.updateInProgressValue(estFormatted);
      }
    });

    const undiscoveredOreContainer = document.getElementById(this.undiscoveredOreContainerId);
    if (undiscoveredOreContainer) {
      window.addEventListener(EVENTS.UNDISCOVERED_ORE_COUNT_CHANGED, (event) => {
        if (event.playerType === PLAYER_TYPES.PLAYER) {
          undiscoveredOreContainer.innerHTML = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planet.undiscovered_ore;
        }
      });
    }

    const oreReadyContainer = document.getElementById(this.oreReadyContainerId);
    if (oreReadyContainer) {
      window.addEventListener(EVENTS.ORE_COUNT_CHANGED, () => {
        oreReadyContainer.innerHTML = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.ore;
      });
    }
  }

  /**
   * Update the progress bar contents without re-rendering the entire action bar.
   *
   * @param {number} percentageToComplete
   */
  updateProgressBar(percentageToComplete) {
    const progressBarWrapper = document.getElementById(this.progressBarId);
    if (progressBarWrapper) {
      progressBarWrapper.innerHTML = this.renderProgressBar(percentageToComplete);
    }
  }

  /**
   * Update the in progress time estimate without re-rendering the entire action bar.
   *
   * @param {string} value
   */
  updateInProgressValue(value) {
    const inProgressValueContainer = document.getElementById(this.inProgressValueContainerId);
    if (inProgressValueContainer) {
      inProgressValueContainer.innerHTML = value;
    }
  }

  renderChargeLevel(level) {
    const battery = document.getElementById(this.playerChunkBatteryId);
    const batteryChunks = battery.children;

    for (let i = 0; i < batteryChunks.length; i++) {
      if (i + 1 > level) {
        batteryChunks[i].classList.remove(this.batteryfilledClass);
      } else {
        batteryChunks[i].classList.add(this.batteryfilledClass);
      }
    }
  }

  renderPortraitChunkHTML() {
    const hoverIcon = this.playerType === PLAYER_TYPES.PLAYER ? 'icon-menu' : 'icon-info';
    return `
      <div id="${this.playerChunkId}" class="sui-panel-chunk">
  
        <div class="sui-screen">
          <a id="${this.playerChunkPortraitId}" href="javascript: void(0)" class="sui-screen-portrait">
            <div class="sui-screen-portrait-image"></div>
            <i class="sui-icon-md ${hoverIcon}"></i>
          </a>
        </div>
        <div class="sui-screen">
          <div id="${this.playerChunkBatteryId}" class="sui-screen-battery">
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
          </div>
        </div>

      </div>
    `;
  }

  showActionChunk() {
    document.getElementById(this.connectorId).classList.remove('hidden');
    document.getElementById(this.actionChunkId).classList.remove('hidden');
  }

  hideActionChunk() {
    document.getElementById(this.connectorId).classList.add('hidden');
    document.getElementById(this.actionChunkId).classList.add('hidden');
  }

  /**
   *
   * @param {string} tileType see MAP_TILE_TYPES
   * @return {string} icon class
   */
  getPropertyIconForTileType(tileType) {
    if (
      this.align === 'right'
      && (
        tileType === MAP_TILE_TYPES.COMMAND
        || tileType === MAP_TILE_TYPES.PLANETARY_SLOT
        || tileType === MAP_TILE_TYPES.FLEET
      )
    ) {
      return MAP_TILE_TYPE_ICONS.ENEMY_TERRITORY;
    }

    return MAP_TILE_TYPE_ICONS[tileType];
  }

  /**
   * Renders the progress bar chunks HTML without the wrapper.
   *
   * @param {number} percentageToComplete - A number from 0 to 1 representing completion percentage
   * @return {string} HTML for the progress bar chunks
   */
  renderProgressBar(percentageToComplete) {
    const totalChunks = 10;
    const filledChunks = Math.floor(percentageToComplete * totalChunks);

    let chunksHTML = '';
    for (let i = 0; i < totalChunks; i++) {
      const filledClass = i < filledChunks ? ' sui-mod-filled' : '';
      chunksHTML += `<div class="sui-action-bar-progress-bar-chunk${filledClass}"></div>`;
    }

    return `
      <div class="sui-action-bar-progress-bar">
        ${chunksHTML}
      </div>
    `;
  }

  /**
   * @param {string} tileType
   * @param {string} ambitOrTileLabel
   * @param {string} side right or left
   * @param {number|null} slot
   * @param {string|null} structId - ID of struct occupying the tile, null if empty
   */
  showActionBarFor(
    tileType,
    ambitOrTileLabel,
    side,
    slot = null,
    structId = null
  ) {
    if (side === 'left' && this.gameState.actionBarLock.isLocked()) {
      this.showExecutingActionBar();
      return;
    }

    const struct = this.structManager.getStructById(structId);

    // If the struct is building, show the building action bar
    if (struct && !struct.isBuilt()) {
      this.showBuildingActionBar(struct);
      return;
    }

    // If the struct is built, show the built struct action bar
    if (struct && struct.isBuilt()) {
      this.showStructActionBar(struct);
      return;
    }

    // Check if there's a pending build at this position
    const playerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    const pendingBuild = this.gameState.getPendingBuild(tileType, ambitOrTileLabel, slot, playerId);

    if (pendingBuild) {
      this.showPendingBuildActionBar(pendingBuild.structType);
    } else {
      this.showEmptyTileActionBar(tileType, ambitOrTileLabel, side, slot);
    }
  }

  showExecutingActionBar() {
    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">Executing</div>
      </div>

      <div class="sui-action-bar-bottom-row">

        <div id="${this.propertiesScreenId}" class="sui-screen">
          <div class="sui-screen-properties">
            <div id="${this.progressBarId}" class="sui-action-bar-progress-bar-wrapper">
              <div class="sui-action-bar-progress-bar sui-mod-animated"></div>
            </div>
          </div>
        </div>

      </div>
    `;

    this.showActionChunk();
  }

  /**
   * Shows the action bar for a pending build (before struct ID is known).
   *
   * @param {StructType} structType
   */
  showPendingBuildActionBar(structType) {
    // Clear current building struct ID (pending builds don't have one yet)
    this.selectedStruct = null;

    const header = structType.class_abbreviation;

    // Pending builds start at 0% progress
    const percentageToComplete = 0;

    const cancelBtnId = `${this.playerType}-action-bar-cancel-btn`;

    const cancelBtn = `
      <div class="sui-action-bar-btn-group">
        <a 
          id="${cancelBtnId}"
          href="javascript: void(0)"
          class="sui-panel-btn sui-mod-disabled"
        >
          <i class="sui-icon-md icon-close"></i>
        </a>
      </div>
    `;

    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">${header}</div>
      </div>

      <div class="sui-action-bar-bottom-row">

        <div id="${this.propertiesScreenId}" class="sui-screen">
          <div class="sui-screen-properties">
            <div id="${this.progressBarId}" class="sui-action-bar-progress-bar-wrapper">
              ${this.renderProgressBar(percentageToComplete)}
            </div>
          </div>
        </div>

        ${cancelBtn}

      </div>
    `;

    this.showActionChunk();
  }

  /**
   * @param {string} tileType
   * @param {string} ambitOrTileLabel
   * @param {string} side right or left
   * @param {number|null} slot
   */
  showEmptyTileActionBar(
    tileType,
    ambitOrTileLabel,
    side,
    slot = null,
  ) {
    // Clear current building struct ID
    this.selectedStruct = null;

    const header = ambitOrTileLabel.toUpperCase();

    const propertyIcon = this.getPropertyIconForTileType(tileType);
    const propertyIconLinkId = `${this.playerType}-action-bar-property-tile-type`;

    const hasDeployButton = tileType === MAP_TILE_TYPES.PLANETARY_SLOT
      || tileType === MAP_TILE_TYPES.FLEET
      || tileType === MAP_TILE_TYPES.COMMAND;
    let deployBtn = '';
    const deployBtnId = `${this.playerType}-action-bar-deploy-btn`;
    let attachDeployBtnHandler = () => {};
    let btnTypeClass = 'sui-mod-disabled';

    if (hasDeployButton) {
      // Only enable deploy button if:
      // 1. It's on the left side (player's side)
      // 2. The map is the alpha base map
      // TODO 3. The player's command ship is on the alpha base
      if (
        side === 'left'
        && this.gameState.activeMapContainerId === MAP_CONTAINER_IDS.ALPHA_BASE
      ) {
        btnTypeClass = 'sui-mod-default';
        attachDeployBtnHandler = () => {
          document.getElementById(deployBtnId).addEventListener('click', function () {
            const deployOffcanvas = new DeployOffcanvas(
              this.gameState,
              this.signingClientManager,
              this.structManager,
              tileType,
              ambitOrTileLabel,
              slot
            );
            deployOffcanvas.render();
          }.bind(this));
        };
      }

      deployBtn = `
        <div class="sui-action-bar-btn-group">
          <a 
            id="${deployBtnId}"
            href="javascript: void(0)"
            class="sui-panel-btn ${btnTypeClass}"
          >
            <i class="sui-icon-md icon-deploy"></i>
          </a>
        </div>
      `;
    }

    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">${header}</div>
      </div>

      <div class="sui-action-bar-bottom-row">

        <div id="${this.propertiesScreenId}" class="sui-screen">
          <div class="sui-screen-properties">
            <a id="${propertyIconLinkId}" href="javascript: void(0)" data-sui-cheatsheet="${propertyIcon}">
              <i class="sui-icon-md ${propertyIcon}"></i>
            </a>
          </div>
        </div>

        ${deployBtn}

      </div>
    `;

    attachDeployBtnHandler();

    this.showActionChunk();
  }

  /**
   * Shows the action bar for a struct that is currently being built.
   *
   * @param {Struct} struct
   */
  showBuildingActionBar(struct) {
    // Store current building struct ID for progress bar updates
    this.selectedStruct = struct;

    const structType = this.gameState.structTypes.getStructTypeById(struct.type);
    const header = structType.class_abbreviation;

    // Get the build progress
    let percentageToComplete = 0;

    const buildProcess = this.taskManager.getBuildProcessByStructId(struct.id);
    if (buildProcess) {
      percentageToComplete = this.taskManager.getProcessPercentCompleteEstimate(buildProcess.state.getPID());
      console.log(`Build progress: ${percentageToComplete}`);
    }

    const cancelBtnId = `${this.playerType}-action-bar-cancel-btn`;

    const cancelBtn = `
      <div class="sui-action-bar-btn-group">
        <a 
          id="${cancelBtnId}"
          href="javascript: void(0)"
          class="sui-panel-btn sui-mod-default"
        >
          <i class="sui-icon-md icon-close"></i>
        </a>
      </div>
    `;

    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">${header}</div>
      </div>

      <div class="sui-action-bar-bottom-row">

        <div id="${this.propertiesScreenId}" class="sui-screen">
          <div class="sui-screen-properties">
            <div id="${this.progressBarId}" class="sui-action-bar-progress-bar-wrapper">
              ${this.renderProgressBar(percentageToComplete)}
            </div>
          </div>
        </div>

        ${cancelBtn}

      </div>
    `;

    // Attach cancel button handler
    document.getElementById(cancelBtnId).addEventListener('click', function () {
      this.structManager.cancelStructBuild(struct);
    }.bind(this));

    this.showActionChunk();
  }

  /**
   * Determines the panel switch state based on struct online status and player charge.
   *
   * @param {Struct} struct
   * @param {StructType} structType
   * @return {{image: string, state: string, canToggle: boolean}}
   */
  getPanelSwitchState(struct, structType) {
    if (this.isActionAvailable(struct, 0, true)) {
      return {
        image: '/img/sui/panel/panel-switch-on.png',
        state: 'on',
        canToggle: true
      };
    }

    if (this.isActionAvailable(struct, structType.activate_charge, false)) {
      return {
        image: '/img/sui/panel/panel-switch-off.png',
        state: 'off',
        canToggle: true
      };
    }

    return {
      image: '/img/sui/panel/panel-switch-disabled.png',
      state: 'disabled',
      canToggle: false
    };
  }

  /**
   * Handles panel switch click to toggle struct online/offline state.
   *
   * @param {Struct} struct
   * @param {StructType} structType
   */
  handlePanelSwitchClick(struct, structType) {
    if (this.isActionAvailable(struct, 0, true)) {
      // Turn off: deactivate the struct
      this.signingClientManager.queueMsgStructDeactivate(struct.id).then(() => {
        struct.removeStatusFlag(STRUCT_STATUS_FLAGS.ONLINE);
        this.showStructActionBar(struct);
      });
    } else if (this.isActionAvailable(struct, structType.activate_charge, false)){
      // Turn on: activate the struct
      this.signingClientManager.queueMsgStructActivate(struct.id).then(() => {
        struct.addStatusFlag(STRUCT_STATUS_FLAGS.ONLINE);
        this.showStructActionBar(struct);
      });
    }
  }

  /**
   * Shows the action bar for a built (completed) struct.
   *
   * @param {Struct} struct
   */
  showStructActionBar(struct) {
    this.selectedStruct = struct;

    const structType = this.gameState.structTypes.getStructTypeById(struct.type);
    const header = structType.class_abbreviation;

    const isOnline = struct.isOnline();

    // Determine panel switch state
    const panelSwitchState = this.getPanelSwitchState(struct, structType);
    const panelSwitchCursor = panelSwitchState.canToggle ? 'pointer' : 'not-allowed';

    // Build list of property icons based on struct type capabilities and online state
    let propertyIcons;
    if (isOnline) {
      propertyIcons = this.buildStructPropertyIcons(struct, structType);
    } else {
      // Show unpowered icon when offline
      propertyIcons = `
        <a href="javascript: void(0)" data-sui-cheatsheet="icon-unpowered">
          <i class="sui-icon-md icon-unpowered"></i>
        </a>
      `;
    }

    // Build action buttons based on struct type capabilities
    const actionButtons = this.buildStructActionButtons(struct, structType);

    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">${header}</div>
      </div>

      <div class="sui-action-bar-bottom-row">
      
        <div class="sui-action-bar-panel-switch-group">
          <img 
            id="${this.panelSwitchId}" 
            src="${panelSwitchState.image}" 
            alt="panel switch" 
            data-state="${panelSwitchState.state}"
            style="height: 48px; cursor: ${panelSwitchCursor}"
          >
        </div>

        <div id="${this.propertiesScreenId}" class="sui-screen">
          <div class="sui-screen-properties">
            ${propertyIcons}
          </div>
        </div>

        <div class="sui-action-bar-btn-group">
          ${actionButtons}
        </div>

      </div>
    `;

    // Attach panel switch handler if it can be toggled
    if (panelSwitchState.canToggle) {
      document.getElementById(this.panelSwitchId).addEventListener('click', () => {
        this.handlePanelSwitchClick(struct, structType);
      });
    }

    // Attach action button handlers (only functional when online)
    if (isOnline) {
      this.attachStructActionButtonHandlers(struct, structType);
    }

    this.showActionChunk();
  }

  /**
   * @param {string} iconClass
   * @param {string} selectedProperty
   * @param {string} structTypeId
   * @return {string}
   */
  structPropertyIconHtml(iconClass, selectedProperty, structTypeId) {
    return `
      <a href="javascript: void(0)" data-sui-cheatsheet="${structTypeId}" data-selected-property="${selectedProperty}">
        <i class="sui-icon-md ${iconClass}"></i>
      </a>
    `;
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   * @return {string[]}
   */
  buildExtractorPropertyIcons(struct, structType) {
    if (!structType.hasPlanetaryMining()) {
      return [];
    }

    const icons = [];

    icons.push(`
      <a href="javascript: void(0)" data-sui-cheatsheet="icon-undiscovered-ore" data-undiscovered-ore="${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planet.undiscovered_ore}">
        <i class="sui-icon-md icon-undiscovered-ore"></i><span id="${this.undiscoveredOreContainerId}" class="sui-icon-value">${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planet.undiscovered_ore}</span>
      </a> 
    `);

    if (struct.isOnline()) {
      const estInMS = this.taskManager.getProcessTimeRemainingEstimate(this.getSelectedStructId());
      const estFormatted = this.numberFormatter.formatMilliseconds(estInMS);

      icons.push(`
        <a href="javascript: void(0)" data-sui-cheatsheet="extractor-active" data-est-time="${estFormatted}">
          <i class="sui-icon-md icon-in-progress"></i><span id="${this.inProgressValueContainerId}" class="sui-icon-value">${estFormatted}</span>
        </a>
      `);
    }

    return icons;
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   * @return {string[]}
   */
  buildRefineryPropertyIcons(struct, structType) {
    if (!structType.hasPlanetaryRefinery()) {
      return [];
    }

    const icons = [];

    icons.push(`
      <a href="javascript: void(0)" data-sui-cheatsheet="icon-ore-ready" data-ore-ready="${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.ore}">
        <i class="sui-icon-md icon-ore-ready"></i><span id="${this.oreReadyContainerId}" class="sui-icon-value">${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.ore}</span>
      </a> 
    `);

    if (struct.isOnline()) {
      const estInMS = this.taskManager.getProcessTimeRemainingEstimate(this.getSelectedStructId());
      const estFormatted = this.numberFormatter.formatMilliseconds(estInMS);

      icons.push(`
        <a href="javascript: void(0)" data-sui-cheatsheet="refinery-active" data-est-time="${estFormatted}">
          <i class="sui-icon-md icon-in-progress"></i><span id="${this.inProgressValueContainerId}" class="sui-icon-value">${estFormatted}</span>
        </a>
      `);
    }

    return icons;
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   * @return {string}
   */
  buildStructPropertyIcons(struct, structType) {
    const standardPropsMap = {
      'hasPassiveWeaponry': 'passive_weaponry',
      'hasUnitDefenses': 'unit_defenses',
      'hasOreReserveDefenses': 'ore_reserve_defenses',
      'hasPlanetaryDefenses': 'planetary_defenses',
    };
    let icons = [];

    Object.keys(standardPropsMap).forEach((hasEquipmentFn) => {
      if (structType[hasEquipmentFn]()) {
        const prop = standardPropsMap[hasEquipmentFn];
        const equipmentType = structType[prop];
        const iconClass = STRUCT_EQUIPMENT_ICON_MAP[equipmentType];
        if (!iconClass) {
          console.log(`Missing icon for equipment type: ${hasEquipmentFn}`)
        }
        icons.push(this.structPropertyIconHtml(iconClass, prop, structType.type));
      }
    });

    icons = icons.concat(this.buildExtractorPropertyIcons(struct, structType));
    icons = icons.concat(this.buildRefineryPropertyIcons(struct, structType));

    return icons.join('');
  }

  /**
   * @return {string}
   */
  getActionBtnIdPrefix() {
    return `${this.playerType}-action-bar`;
  }

  /**
   * @param {Struct} struct
   * @param {number} actionCharge
   * @param {boolean} isOnlineAction
   * @return {boolean}
   */
  isActionAvailable(struct, actionCharge = 0, isOnlineAction = true) {
    return (struct.isOnline() === isOnlineAction)
      && struct.owner === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
      && (!actionCharge || actionCharge <= this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].getCharge(this.gameState.currentBlockHeight));
  }

  /**
   * @param {array} buttons
   * @param {Struct} struct
   * @param {StructType} structType
   */
  buildPrimaryWeaponActionButton(buttons, struct, structType) {
    if (structType.hasPrimaryWeapon()) {
      const iconClass = structType.primary_weapon_control === 'guided'
        ? 'icon-smart-weapon'
        : 'icon-ballistic-weapon';
      const btnClass = this.isActionAvailable(struct, structType.primary_weapon_charge)
        ? 'sui-mod-default'
        : 'sui-mod-disabled';
      buttons.push(`
        <a 
          id="${this.getActionBtnIdPrefix()}-primary-weapon-btn"
          href="javascript: void(0)"
          class="sui-panel-btn ${btnClass}"
          title="${structType.primary_weapon_label || 'Primary Weapon'}"
          data-sui-cheatsheet="${structType.type}"
          data-selected-property="primary_weapon"
          data-action-charge="${structType.primary_weapon_charge}"
        >
          <i class="sui-icon-md ${iconClass}"></i>
        </a>
      `);
    }
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachPrimaryWeaponButtonHandler(struct, structType) {
    if (structType.hasPrimaryWeapon()) {
      const btn = document.getElementById(`${this.getActionBtnIdPrefix()}-primary-weapon-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (!this.isActionAvailable(struct, structType.primary_weapon_charge)) {
            return;
          }

          const currentAction = this.gameState.actionBarLock.getCurrentAction();

          if (currentAction === STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON) {
            // Already in primary weapon mode - cancel
            this.gameState.actionBarLock.clear(false);
            btn.classList.remove('sui-mod-active-offense');
            btn.classList.add('sui-mod-default');
            window.dispatchEvent(new ClearAttackTargetsEvent(this.gameState.getActiveMapId()));
          } else {
            // If secondary weapon mode was active, reset its button
            if (currentAction === STRUCT_ACTIONS.ATTACK_SECONDARY_WEAPON) {
              const secBtn = document.getElementById(`${this.getActionBtnIdPrefix()}-secondary-weapon-btn`);
              if (secBtn) {
                secBtn.classList.remove('sui-mod-active-offense');
                secBtn.classList.add('sui-mod-default');
              }
              window.dispatchEvent(new ClearAttackTargetsEvent(this.gameState.getActiveMapId()));
            }

            // Activate primary weapon mode
            this.gameState.actionBarLock.setCurrentAction(STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON);
            this.gameState.actionBarLock.setActionSourceStruct(struct);
            btn.classList.remove('sui-mod-default');
            btn.classList.add('sui-mod-active-offense');
            window.dispatchEvent(new ShowAttackTargetsEvent(
              this.gameState.getActiveMapId(),
              structType.primary_weapon_ambits_array
            ));
          }
        });
      }
    }
  }

  /**
   * @param {array} buttons
   * @param {Struct} struct
   * @param {StructType} structType
   */
  buildSecondaryWeaponActionButton(buttons, struct, structType) {
    if (structType.hasSecondaryWeapon()) {
      const iconClass = structType.secondary_weapon_control === 'guided'
        ? 'icon-smart-weapon'
        : 'icon-ballistic-weapon';
      const btnClass = this.isActionAvailable(struct, structType.secondary_weapon_charge)
        ? 'sui-mod-default'
        : 'sui-mod-disabled';
      buttons.push(`
        <a 
          id="${this.getActionBtnIdPrefix()}-secondary-weapon-btn"
          href="javascript: void(0)"
          class="sui-panel-btn ${btnClass}"
          title="${structType.secondary_weapon_label || 'Secondary Weapon'}"
          data-sui-cheatsheet="${structType.type}"
          data-selected-property="secondary_weapon"
          data-action-charge="${structType.secondary_weapon_charge}"
        >
          <i class="sui-icon-md ${iconClass}"></i>
        </a>
      `);
    }
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachSecondaryWeaponButtonHandler(struct, structType) {
    if (structType.hasSecondaryWeapon()) {
      const btn = document.getElementById(`${this.getActionBtnIdPrefix()}-secondary-weapon-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (!this.isActionAvailable(struct, structType.secondary_weapon_charge)) {
            return;
          }

          const currentAction = this.gameState.actionBarLock.getCurrentAction();

          if (currentAction === STRUCT_ACTIONS.ATTACK_SECONDARY_WEAPON) {
            // Already in secondary weapon mode - cancel
            this.gameState.actionBarLock.clear(false);
            btn.classList.remove('sui-mod-active-offense');
            btn.classList.add('sui-mod-default');
            window.dispatchEvent(new ClearAttackTargetsEvent(this.gameState.getActiveMapId()));
          } else {
            // If primary weapon mode was active, reset its button
            if (currentAction === STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON) {
              const priBtn = document.getElementById(`${this.getActionBtnIdPrefix()}-primary-weapon-btn`);
              if (priBtn) {
                priBtn.classList.remove('sui-mod-active-offense');
                priBtn.classList.add('sui-mod-default');
              }
              window.dispatchEvent(new ClearAttackTargetsEvent(this.gameState.getActiveMapId()));
            }

            // Activate secondary weapon mode
            this.gameState.actionBarLock.setCurrentAction(STRUCT_ACTIONS.ATTACK_SECONDARY_WEAPON);
            this.gameState.actionBarLock.setActionSourceStruct(struct);
            btn.classList.remove('sui-mod-default');
            btn.classList.add('sui-mod-active-offense');
            window.dispatchEvent(new ShowAttackTargetsEvent(
              this.gameState.getActiveMapId(),
              structType.secondary_weapon_ambits_array
            ));
          }
        });
      }
    }
  }

  /**
   * @param {array} buttons
   * @param {Struct} struct
   * @param {StructType} structType
   */
  buildStealthModeActionButton(buttons, struct, structType) {
    if (structType.stealth_systems) {
      let btnClass;
      if (!this.isActionAvailable(struct, structType.stealth_activate_charge)) {
        btnClass = 'sui-mod-disabled';
      } else if (struct.isHidden()) {
        btnClass = 'sui-mod-active-defense';
      } else {
        btnClass = 'sui-mod-default';
      }
      buttons.push(`
        <a 
          id="${this.getActionBtnIdPrefix()}-stealth-btn"
          href="javascript: void(0)"
          class="sui-panel-btn ${btnClass}"
          title="Stealth Mode"
          data-sui-cheatsheet="${structType.type}"
          data-selected-property="unit_defenses"
          data-action-charge="${structType.stealth_activate_charge}"
          data-active-defense="${struct.isHidden() ? 1 : 0}"
        >
          <i class="sui-icon-md icon-stealth"></i>
        </a>
      `);
    }
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachStealthModeButtonHandler(struct, structType) {
    if (structType.stealth_systems) {
      const btn = document.getElementById(`${this.getActionBtnIdPrefix()}-stealth-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (!this.isActionAvailable(struct, structType.stealth_activate_charge)) {
            return;
          }
          if (struct.isHidden()) {
            this.gameState.actionBarLock.setCurrentAction(STRUCT_ACTIONS.STEALTH_DEACTIVATE);
            this.gameState.actionBarLock.lock();

            // Deactivate stealth mode
            this.signingClientManager.queueMsgStructStealthDeactivate(struct.id).then(() => {
              struct.removeStatusFlag(STRUCT_STATUS_FLAGS.HIDDEN);
              // Update button to default state
              btn.setAttribute('data-active-defense', '0');
              btn.classList.remove('sui-mod-active-defense');
              btn.classList.add('sui-mod-default');
            });
          } else {
            this.gameState.actionBarLock.setCurrentAction(STRUCT_ACTIONS.STEALTH_ACTIVATE);
            this.gameState.actionBarLock.lock();

            // Activate stealth mode
            this.signingClientManager.queueMsgStructStealthActivate(struct.id).then(() => {
              struct.addStatusFlag(STRUCT_STATUS_FLAGS.HIDDEN);
              // Update button to active state
              btn.setAttribute('data-active-defense', '1');
              btn.classList.remove('sui-mod-default');
              btn.classList.add('sui-mod-active-defense');
            });
          }
        });
      }
    }
  }

  /**
   * @param {array} buttons
   * @param {Struct} struct
   * @param {StructType} structType
   */
  buildMoveActionButton(buttons, struct, structType) {
    if (structType.movable) {
      const btnClass = this.isActionAvailable(struct, structType.move_charge)
        ? 'sui-mod-default'
        : 'sui-mod-disabled';

      buttons.push(`
        <a 
          id="${this.getActionBtnIdPrefix()}-move-btn"
          href="javascript: void(0)"
          class="sui-panel-btn ${btnClass}"
          title="Move"
          data-sui-cheatsheet="${structType.type}"
          data-selected-property="movable"
          data-action-charge="${structType.move_charge}"
        >
          <i class="sui-icon-md icon-move"></i>
        </a>
      `);
    }
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachMoveButtonHandler(struct, structType) {
    if (structType.movable) {
      const btn = document.getElementById(`${this.getActionBtnIdPrefix()}-move-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (!this.isActionAvailable(struct, structType.move_charge)) {
            return;
          }

          if (btn.classList.contains('sui-mod-active-defense')) {
            // Deactivate move mode
            this.gameState.actionBarLock.clear(false);
            btn.classList.remove('sui-mod-active-defense');
            btn.classList.add('sui-mod-default');

            // Clear move target indicators
            window.dispatchEvent(new ClearMoveTargetsEvent(this.gameState.getActiveMapId()));
          } else {
            // Activate move mode
            this.gameState.actionBarLock.setCurrentAction(STRUCT_ACTIONS.MOVE);
            this.gameState.actionBarLock.setActionSourceStruct(struct);
            btn.classList.remove('sui-mod-default');
            btn.classList.add('sui-mod-active-defense');

            // Show move target indicators on empty command tiles
            window.dispatchEvent(new ShowMoveTargetsEvent(this.gameState.getActiveMapId()));
          }
        });
      }
    }
  }

  /**
   * @param {array} buttons
   * @param {Struct} struct
   * @param {StructType} structType
   */
  buildDefendActionButton(buttons, struct, structType) {
    if (structType.category === STRUCT_CATEGORIES.FLEET) {
      let btnClass;
      if (!this.isActionAvailable(struct, structType.defend_change_charge)) {
        btnClass = 'sui-mod-disabled';
      } else if (struct.isDefending()) {
        btnClass = 'sui-mod-active-defense';
      } else {
        btnClass = 'sui-mod-default';
      }

      buttons.push(`
        <a 
          id="${this.getActionBtnIdPrefix()}-defend-btn"
          href="javascript: void(0)"
          class="sui-panel-btn ${btnClass}"
          title="Defend"
          data-sui-cheatsheet="${structType.type}"
          data-action-button="defend"
          data-action-charge="${structType.defend_change_charge}"
          data-active-defense="${struct.isDefending() ? 1 : 0}"
        >
          <i class="sui-icon-md icon-defend"></i>
        </a>
      `);
    }
  }

  /**
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachDefendButtonHandler(struct, structType) {
    if (structType.category === STRUCT_CATEGORIES.FLEET) {
      const btn = document.getElementById(`${this.getActionBtnIdPrefix()}-defend-btn`);
      if (btn) {
        btn.addEventListener('click', async () => {
          if (!this.isActionAvailable(struct, structType.defend_change_charge)) {
            return;
          }

          const currentAction = this.gameState.actionBarLock.getCurrentAction();

          if (struct.isDefending()) {
            // Struct is currently defending another struct - clicking clears the defense
            this.gameState.actionBarLock.setCurrentAction(STRUCT_ACTIONS.DEFENSE_CLEAR);
            this.gameState.actionBarLock.setActionSourceStruct(struct);
            this.gameState.actionBarLock.lock();

            // Update button to default state while processing
            btn.setAttribute('data-active-defense', '0');
            btn.classList.remove('sui-mod-active-defense');
            btn.classList.add('sui-mod-default');

            // Send defense clear message to chain
            await this.signingClientManager.queueMsgStructDefenseClear(struct.id);

          } else if (currentAction === STRUCT_ACTIONS.DEFENSE_SET) {
            // Already in defense selection mode - cancel it
            this.gameState.actionBarLock.clear(false);

            // Update button to default state
            btn.setAttribute('data-active-defense', '0');
            btn.classList.remove('sui-mod-active-defense');
            btn.classList.add('sui-mod-default');

            // Clear defend target indicators
            window.dispatchEvent(new ClearDefendTargetsEvent(this.gameState.getActiveMapId()));

          } else {
            // Activate defense selection mode
            this.gameState.actionBarLock.setCurrentAction(STRUCT_ACTIONS.DEFENSE_SET);
            this.gameState.actionBarLock.setActionSourceStruct(struct);

            // Update button to active state
            btn.setAttribute('data-active-defense', '1');
            btn.classList.remove('sui-mod-default');
            btn.classList.add('sui-mod-active-defense');

            // Mark enemy structs as invalid
            window.dispatchEvent(new ShowDefendTargetsEvent(this.gameState.getActiveMapId()));
          }
        });
      }
    }
  }

  /**
   * Builds the HTML for struct action buttons based on struct type capabilities.
   *
   * @param {Struct} struct
   * @param {StructType} structType
   * @return {string} HTML for action buttons
   */
  buildStructActionButtons(struct, structType) {
    const buttons = [];

    this.buildPrimaryWeaponActionButton(buttons, struct, structType);
    this.buildSecondaryWeaponActionButton(buttons, struct, structType);
    this.buildStealthModeActionButton(buttons, struct, structType);
    this.buildMoveActionButton(buttons, struct, structType);
    this.buildDefendActionButton(buttons, struct, structType);

    return buttons.join('');
  }

  /**
   * Attaches click handlers to struct action buttons.
   *
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachStructActionButtonHandlers(struct, structType) {
    this.attachPrimaryWeaponButtonHandler(struct, structType);
    this.attachSecondaryWeaponButtonHandler(struct, structType);
    this.attachStealthModeButtonHandler(struct, structType);
    this.attachMoveButtonHandler(struct, structType);
    this.attachDefendButtonHandler(struct, structType);
  }

  renderHTML() {
    let actionChunkLeftHTML = '';
    let actionChunkRightHTML = `
      <div id="${this.connectorId}" class="sui-panel-connector hidden"></div>
      <div id="${this.actionChunkId}" class="sui-panel-chunk hidden"></div>
    `;

    if (this.align === 'right') {
      actionChunkLeftHTML = `
        <div id="${this.actionChunkId}" class="sui-panel-chunk hidden"></div>
        <div id="${this.connectorId}" class="sui-panel-connector hidden"></div>
      `;
      actionChunkRightHTML = '';
    }

    return `
      <div id="${this.id}" class="sui-panel-wrapper-fit-content action-bar-bottom-${this.align}">
        <div class="sui-panel ${this.themeClass}">
          <div class="sui-panel-edge-left"></div>
          
            ${actionChunkLeftHTML}
          
            ${this.renderPortraitChunkHTML()}
            
            ${actionChunkRightHTML}
                      
          <div class="sui-panel-edge-right"></div>
        </div>
      </div>
    `;
  }
}