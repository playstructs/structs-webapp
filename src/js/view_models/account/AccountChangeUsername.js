import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {USERNAME_PATTERN} from "../../constants/RegexPattern";

export class AccountChangeUsername extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(
    gameState,
    guildAPI
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.changeUsernameInputId = 'changeUsername';
    this.changeUsernameBtnId = 'changeUsernameBtn';
    this.changeUsernameErrorId = 'changeUsernameError';
  }

  initPageCode() {
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
        this.guildAPI.setUsername(usernameInput.value).then((response) => {
          if (response.success) {
            this.gameState.thisPlayer.username = usernameInput.value;
            MenuPage.router.goto('Account', 'profile');
          } else {
            document.getElementById(this.changeUsernameErrorId).classList.add('sui-mod-show');
          }
        }).catch((error) => {
          console.log(error);
          document.getElementById(this.changeUsernameErrorId).classList.add('sui-mod-show');
        });
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

    MenuPage.setPageTemplateContent(`
      <div class="change-username-layout">
        <div class="common-inline-text-input-group-container">
          <div class="common-inline-text-input-controls-container">
            <label class="sui-input-text" for="${this.changeUsernameInputId}">
              <span>Display Name</span>
              <input
                type="text"
                name="${this.changeUsernameInputId}"
                id="${this.changeUsernameInputId}"
                placeholder="Type your new display name"
              >
            </label>
            <button id="${this.changeUsernameBtnId}" class="sui-screen-btn sui-mod-primary sui-mod-disabled" disabled>Submit</button>
          </div>
          <div class="common-inline-text-input-error-container">
            <div id="${this.changeUsernameErrorId}" class="sui-input-text-warning">Name must be 3–20 characters and only include letters, numbers, '-' and '_'.</div>
          </div>
        </div>
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
