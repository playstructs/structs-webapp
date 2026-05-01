import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {USERNAME_PATTERN} from "../../constants/RegexPattern";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";

export class AccountChangeUsername extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {PermissionManager} permissionManager
   * @param {SigningClientManager} signingClientManager
   */
  constructor(
    gameState,
    guildAPI,
    permissionManager,
    signingClientManager
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.permissionManager = permissionManager;
    this.signingClientManager = signingClientManager;
    this.changeUsernameInputId = 'changeUsername';
    this.changeUsernameBtnId = 'changeUsernameBtn';
    this.changeUsernameErrorId = 'changeUsernameError';
    this.canEditUsername = true;
    this.disabledMessage = "This device doesn't have permission to change the display name. Sign in on a device with management permissions to update it.";
  }

  initPageCode() {
    if (!this.canEditUsername) {
      return;
    }

    const usernameInput = document.getElementById(this.changeUsernameInputId);
    usernameInput.addEventListener('keyup', () => {
      const submitBtn = document.getElementById(this.changeUsernameBtnId);

      if (usernameInput.value.length > 0 && submitBtn.classList.contains('sui-mod-disabled')) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('sui-mod-disabled');
        submitBtn.classList.add('sui-mod-primary');
      } else if (usernameInput.value.length === 0 && submitBtn.classList.contains('sui-mod-primary')) {
        submitBtn.disabled = true;
        submitBtn.classList.remove('sui-mod-primary');
        submitBtn.classList.add('sui-mod-disabled');
      }
    });

    const submitBtnHandler = () => {
      document.getElementById(this.changeUsernameErrorId).classList.remove('sui-mod-show');

      const usernameInput = document.getElementById(this.changeUsernameInputId);

      if (!USERNAME_PATTERN.test(usernameInput.value)) {
        document.getElementById(this.changeUsernameErrorId).classList.add('sui-mod-show');
      } else {
        this.signingClientManager.queueMsgPlayerUpdateName(
          this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id,
          usernameInput.value
        );
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.username = usernameInput.value;
        MenuPage.router.goto('Account', 'profile');
      }
    };

    document.getElementById(this.changeUsernameBtnId).addEventListener('click', submitBtnHandler);
    usernameInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        submitBtnHandler();
      }
    });
  }

  render() {
    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn(
      'Change Display Name',
      true,
      () => {
        MenuPage.router.goto('Account', 'profile');
      });

    this.guildAPI.getPlayerAddress(this.gameState.signingAccount.address).then((currentDevice) => {
      const currentDevicePermissions = parseInt(currentDevice.permissions);
      const manageBits = this.permissionManager.getManageDevicesPermissions();
      this.canEditUsername = (currentDevicePermissions & manageBits) === manageBits;

      const inputAttrs = this.canEditUsername ? '' : 'readonly';
      const inputClass = this.canEditUsername ? 'sui-input-text' : 'sui-input-text sui-mod-disabled';
      const errorClass = this.canEditUsername ? 'sui-input-text-warning' : 'sui-input-text-warning sui-mod-show';
      const errorMessage = this.canEditUsername
        ? "Name must be 3\u201320 characters and only include letters, numbers, '-' and '_'."
        : this.disabledMessage;

      MenuPage.setPageTemplateContent(`
        <div class="change-username-layout">
          <div class="common-inline-text-input-group-container">
            <div class="common-inline-text-input-controls-container">
              <label class="${inputClass}" for="${this.changeUsernameInputId}">
                <span>Display Name</span>
                <input
                  type="text"
                  name="${this.changeUsernameInputId}"
                  id="${this.changeUsernameInputId}"
                  placeholder="Type your new display name"
                  ${inputAttrs}
                >
              </label>
              <button id="${this.changeUsernameBtnId}" class="sui-screen-btn sui-mod-primary sui-mod-disabled" disabled>Submit</button>
            </div>
            <div class="common-inline-text-input-error-container">
              <div id="${this.changeUsernameErrorId}" class="${errorClass}">${errorMessage}</div>
            </div>
          </div>
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
    });
  }
}
