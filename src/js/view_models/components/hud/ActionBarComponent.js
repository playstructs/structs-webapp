import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";
import {MAP_CONTAINER_IDS, MAP_TILE_TYPE_ICONS, MAP_TILE_TYPES} from "../../../constants/MapConstants";
import {PLAYER_TYPES} from "../../../constants/PlayerTypes";
import {DeployOffcanvas} from "../offcanvas/DeployOffcanvas";
import {Struct} from "../../../models/Struct";
import {StructType} from "../../../models/StructType";
import {STRUCT_CATEGORIES, STRUCT_EQUIPMENT_ICON_MAP} from "../../../constants/StructConstants";

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

    /* Profile Chunk */
    this.profileClickHandler = function () {};
    this.batteryfilledClass = 'sui-mod-filled';

    /**
     * Currently displayed building struct ID (for progress bar updates).
     * @type {string|null}
     */
    this.currentBuildingStructId = null;
  }

  initPageCode() {
    window.addEventListener(EVENTS.CHARGE_LEVEL_CHANGED, function (event) {
      if (event.playerId === this.gameState.getPlayerIdByType(this.playerType)) {
        this.renderChargeLevel(event.chargeLevel);
      }
    }.bind(this));

    document.getElementById(this.playerChunkPortraitId).addEventListener('click', this.profileClickHandler.bind(this));

    // Listen for task worker changes to update progress bar
    window.addEventListener(EVENTS.TASK_WORKER_CHANGED, (event) => {
      if (this.currentBuildingStructId && event.state.object_id === this.currentBuildingStructId) {
        this.updateProgressBar(event.state.getPercentCompleteEstimate());
      }
    });
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
    const struct = this.structManager.getStructById(structId);

    // If the struct is building, show the building action bar
    if (struct && struct.is_building) {
      this.showBuildingActionBar(struct);
      return;
    }

    // If the struct is built, show the built struct action bar
    if (struct && !struct.is_building) {
      this.showStructActionBar(struct);
      return;
    }

    // Check if there's a pending build at this position
    const playerId = this.gameState.thisPlayerId;
    const pendingBuild = this.gameState.getPendingBuild(tileType, ambitOrTileLabel, slot, playerId);

    if (pendingBuild) {
      this.showPendingBuildActionBar(pendingBuild.structType);
    } else {
      this.showEmptyTileActionBar(tileType, ambitOrTileLabel, side, slot);
    }
  }

  /**
   * Shows the action bar for a pending build (before struct ID is known).
   *
   * @param {StructType} structType
   */
  showPendingBuildActionBar(structType) {
    // Clear current building struct ID (pending builds don't have one yet)
    this.currentBuildingStructId = null;

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
    this.currentBuildingStructId = null;

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
    this.currentBuildingStructId = struct.id;

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
   * Shows the action bar for a built (completed) struct.
   *
   * @param {Struct} struct
   */
  showStructActionBar(struct) {
    // Clear current building struct ID
    this.currentBuildingStructId = null;

    const structType = this.gameState.structTypes.getStructTypeById(struct.type);
    const header = structType.class_abbreviation;

    // Build list of property icons based on struct type capabilities
    const propertyIcons = this.buildStructPropertyIcons(structType);

    // Build action buttons based on struct type capabilities
    const actionButtons = this.buildStructActionButtons(struct, structType);

    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">${header}</div>
      </div>

      <div class="sui-action-bar-bottom-row">
      
        <div class="sui-action-bar-panel-switch-group">
          <img src="/img/sui/panel/panel-switch-on.png" alt="panel switch on" style="height: 48px">
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

    // Attach action button handlers
    this.attachStructActionButtonHandlers(struct, structType);

    this.showActionChunk();
  }

  /**
   * @param {string} iconClass
   * @return {string}
   */
  structPropertyIconHtml(iconClass) {
    return `
      <a href="javascript: void(0)" data-sui-cheatsheet="${iconClass}">
        <i class="sui-icon-md ${iconClass}"></i>
      </a>
    `;
  }

  /**
   * @param structType
   * @return {string}
   */
  buildStructPropertyIcons(structType) {
    const standardPropsMap = {
      'hasPassiveWeaponry': 'passive_weaponry',
      'hasUnitDefenses': 'unit_defenses',
      'hasOreReserveDefenses': 'ore_reserve_defenses',
      'hasPlanetaryDefenses': 'planetary_defenses',
    };
    const icons = [];

    Object.keys(standardPropsMap).forEach((hasEquipmentFn) => {
      if (structType[hasEquipmentFn]()) {
        const prop = standardPropsMap[hasEquipmentFn];
        const equipmentType = structType[prop];
        const iconClass = STRUCT_EQUIPMENT_ICON_MAP[equipmentType];
        if (!iconClass) {
          console.log(`Missing icon for equipment type: ${hasEquipmentFn}`)
        }
        icons.push(this.structPropertyIconHtml(iconClass));
      }
    });

    return icons.join('');
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
    const btnPrefix = `${this.playerType}-action-bar`;

    // Primary weapon button
    if (structType.hasPrimaryWeapon()) {
      const iconClass = structType.primary_weapon_control === 'guided' 
        ? 'icon-smart-weapon' 
        : 'icon-ballistic-weapon';
      buttons.push(`
        <a 
          id="${btnPrefix}-primary-weapon-btn"
          href="javascript: void(0)"
          class="sui-panel-btn sui-mod-default"
          title="${structType.primary_weapon_label || 'Primary Weapon'}"
        >
          <i class="sui-icon-md ${iconClass}"></i>
        </a>
      `);
    }

    // Secondary weapon button
    if (structType.hasSecondaryWeapon()) {
      const iconClass = structType.secondary_weapon_control === 'guided' 
        ? 'icon-smart-weapon' 
        : 'icon-ballistic-weapon';
      buttons.push(`
        <a 
          id="${btnPrefix}-secondary-weapon-btn"
          href="javascript: void(0)"
          class="sui-panel-btn sui-mod-default"
          title="${structType.secondary_weapon_label || 'Secondary Weapon'}"
        >
          <i class="sui-icon-md ${iconClass}"></i>
        </a>
      `);
    }

    // Stealth button (for structs with stealth systems)
    if (structType.stealth_systems) {
      buttons.push(`
        <a 
          id="${btnPrefix}-stealth-btn"
          href="javascript: void(0)"
          class="sui-panel-btn sui-mod-default"
          title="Stealth Mode"
        >
          <i class="sui-icon-md icon-stealth"></i>
        </a>
      `);
    }

    // Move button (for movable structs)
    if (structType.movable) {
      buttons.push(`
        <a 
          id="${btnPrefix}-move-btn"
          href="javascript: void(0)"
          class="sui-panel-btn sui-mod-default"
          title="Move"
        >
          <i class="sui-icon-md icon-move"></i>
        </a>
      `);
    }

    // Defend button (for structs with defensive capabilities)
    if (structType.category === STRUCT_CATEGORIES.FLEET) {
      buttons.push(`
        <a 
          id="${btnPrefix}-defend-btn"
          href="javascript: void(0)"
          class="sui-panel-btn sui-mod-default"
          title="Defend"
        >
          <i class="sui-icon-md icon-defend"></i>
        </a>
      `);
    }

    // Mine button (for structs with mining capability)
    if (structType.hasPlanetaryMining()) {
      buttons.push(`
        <a 
          id="${btnPrefix}-mine-btn"
          href="javascript: void(0)"
          class="sui-panel-btn sui-mod-default"
          title="${structType.planetary_mining_label || 'Mine'}"
        >
          <i class="sui-icon-md icon-mine"></i>
        </a>
      `);
    }

    // Refine button (for structs with refining capability)
    if (structType.hasPlanetaryRefinery()) {
      buttons.push(`
        <a 
          id="${btnPrefix}-refine-btn"
          href="javascript: void(0)"
          class="sui-panel-btn sui-mod-default"
          title="${structType.planetary_refinery_label || 'Refine'}"
        >
          <i class="sui-icon-md icon-refine"></i>
        </a>
      `);
    }

    return buttons.join('');
  }

  /**
   * Attaches click handlers to struct action buttons.
   *
   * @param {Struct} struct
   * @param {StructType} structType
   */
  attachStructActionButtonHandlers(struct, structType) {
    const btnPrefix = `${this.playerType}-action-bar`;

    // Primary weapon handler
    if (structType.hasPrimaryWeapon()) {
      const btn = document.getElementById(`${btnPrefix}-primary-weapon-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          console.log('Action: PRIMARY_WEAPON_ATTACK', { 
            structId: struct.id, 
            weapon: structType.primary_weapon,
            label: structType.primary_weapon_label
          });
        });
      }
    }

    // Secondary weapon handler
    if (structType.hasSecondaryWeapon()) {
      const btn = document.getElementById(`${btnPrefix}-secondary-weapon-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          console.log('Action: SECONDARY_WEAPON_ATTACK', { 
            structId: struct.id, 
            weapon: structType.secondary_weapon,
            label: structType.secondary_weapon_label
          });
        });
      }
    }

    // Stealth handler
    if (structType.stealth_systems) {
      const btn = document.getElementById(`${btnPrefix}-stealth-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          console.log('Action: STEALTH_TOGGLE', { 
            structId: struct.id
          });
        });
      }
    }

    // Move handler
    if (structType.movable) {
      const btn = document.getElementById(`${btnPrefix}-move-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          console.log('Action: MOVE', { 
            structId: struct.id
          });
        });
      }
    }

    // Defend handler
    if (structType.category === STRUCT_CATEGORIES.FLEET) {
      const btn = document.getElementById(`${btnPrefix}-defend-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          console.log('Action: DEFEND', {
            structId: struct.id,
            unitDefenses: structType.unit_defenses_label,
            oreDefenses: structType.ore_reserve_defenses_label,
            planetaryDefenses: structType.planetary_defenses_label
          });
        });
      }
    }

    // Mine handler
    if (structType.hasPlanetaryMining()) {
      const btn = document.getElementById(`${btnPrefix}-mine-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          console.log('Action: MINE', { 
            structId: struct.id,
            label: structType.planetary_mining_label
          });
        });
      }
    }

    // Refine handler
    if (structType.hasPlanetaryRefinery()) {
      const btn = document.getElementById(`${btnPrefix}-refine-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          console.log('Action: REFINE', { 
            structId: struct.id,
            label: structType.planetary_refinery_label
          });
        });
      }
    }
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