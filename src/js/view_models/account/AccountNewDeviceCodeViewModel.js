import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {CreateActivationCodeRequestDTO} from "../../dtos/CreateActivationCodeRequestDTO";

export class AccountNewDeviceCodeViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {AuthManager} authManager
   */
  constructor(
    gameState,
    guildAPI,
    authManager
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.authManager = authManager;
    this.generateActivationCode = 'generate-activation-code';
    this.generateNewCode = 'generate-new-code';
    this.activationCodeWrapper = 'activation-code-Wrapper';
    this.activationCodeDisplay = 'activation-code-display';
  }

  initPageCode() {
    const signal=MenuPage.router.navigationSignal;
    const display=activation=>{
      if (!activation || signal.aborted) return;
      document.getElementById(this.activationCodeDisplay).textContent=activation.code;
      document.getElementById(this.generateActivationCode).classList.add('hidden');
      document.getElementById(this.activationCodeWrapper).classList.remove('hidden');
      this.observer?.abort();
      const observer=this.observer=new AbortController();
      const cancel=()=>observer.abort();
      signal.addEventListener('abort',cancel,{once:true});
      this.authManager.waitForPendingDevice(activation,observer.signal).then(row=>{
        if (signal.aborted || observer.signal.aborted) return;
        const existing=this.authManager.signingClientManager.queue.findRegistration(row.player_id,row.address);
        MenuPage.router.goto('Account',existing ? 'activatingDevice' : 'approveNewDevice',row);
      }).catch(error=>{
        if (!observer.signal.aborted) console.debug('[DeviceActivation] pending read unavailable:',error);
      }).finally(()=>signal.removeEventListener('abort',cancel));
    };
    let generating=false;
    const generate=async()=>{
      if (generating) return;
      generating=true;
      try {
        const request=new CreateActivationCodeRequestDTO();
        request.logged_in_address=this.gameState.signingAccount.address;
        request.guild_id=this.gameState.thisGuild.id;
        display(await this.authManager.createActivationCode(request));
      } finally { generating=false; }
    };
    document.getElementById(this.generateActivationCode).addEventListener('click',()=>generate().catch(console.warn));
    document.getElementById(this.generateNewCode).addEventListener('click',()=>generate().catch(console.warn));
    display(this.authManager.savedActivationCode());
  }

  render () {
    MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

    MenuPage.setPageTemplateHeaderBtn(
      'Activate New Device',
      true,
      () => {
        MenuPage.router.goto('Account', 'devices');
      });

    MenuPage.setPageTemplateContent(`
      <div class="common-layout-col">
        <button id="${this.generateActivationCode}" class="sui-screen-btn sui-mod-primary">Generate Activation Code</button>
        <div id="${this.activationCodeWrapper}" class="generate-activation-code-wrapper hidden">
          <div class="activation-code-and-button-container">
            <div class="activation-code-container">
              <div class="sui-text-header sui-mod-primary">Activation Code</div>
              <div id="${this.activationCodeDisplay}" class="activation-code-text"></div>
            </div>
            <button id="${this.generateNewCode}" class="sui-screen-btn sui-mod-primary">Generate New Code</button>
          </div>
          <div class="sui-text-warning">Do not close this screen until activation is complete.</div>
        </div>
        <div>Enter the above code on the Returning Player screen on your new device to activate it.</div>
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
