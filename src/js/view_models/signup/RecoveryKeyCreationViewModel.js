import {MenuPage} from "../../framework/MenuPage";

export class RecoveryKeyCreationViewModel {
  render() {
    MenuPage.hideAndClearNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
    
      <!-- Page Header Start -->

        <div class="sui-page-header">
          <a href="javascript: void(0)" class="sui-nav-btn">
<!--            <i class="sui-icon-sm icon-chevron-left sui-text-secondary"></i>-->
            Create Recovery Key
          </a>
        </div>

        <!-- Page Header End -->
        
        <div class="common-layout-col">
          <div class="common-group-col">
            <div>Write down your 12-word Recovery Key and keep it in a safe place. You will need this Key to recover your account if you log out or clear your browser cache.</div>
            <a href="javascript: void(0);" class="sui-text-secondary">Learn More About Recovery Keys</a>
          </div>
          <div class="common-group-col mod-border">
            <a href="javascript: void(0);" class="sui-screen-btn sui-mod-secondary">
              <i class="sui-icon-md icon-key"></i>
              <span>Display Recovery Key</span>
            </a>
            <div id="recovery-key" class="text-recovery-key">
              <div class="recovery-key-word">
                <span class="sui-text-secondary">1</span>
                <span class="mod-white">apple</span>
              </div>
              <div class="recovery-key-word">
                <span class="sui-text-secondary">2</span>
                <span class="mod-white">mask</span>
              </div>
              <div class="recovery-key-word">
                <span class="sui-text-secondary">3</span>
                <span class="mod-white">lens</span>
              </div>
              <div class="recovery-key-word">
                <span class="sui-text-secondary">4</span>
                <span class="mod-white">scout</span>
              </div>
              <div class="recovery-key-word">
                <span class="sui-text-secondary">5</span>
                <span class="mod-white">acid</span>
              </div>
              <div class="recovery-key-word">
                <span class="sui-text-secondary">6</span>
                <span class="mod-white">exclude</span>
              </div>
              <div class="recovery-key-word">
                <span class="sui-text-secondary">7</span>
                <span class="mod-white">evolve</span>
              </div>
              <div class="recovery-key-word">
                <span class="sui-text-secondary">8</span>
                <span class="mod-white">double</span>
              </div>
              <div class="recovery-key-word">
                <span class="sui-text-secondary">9</span>
                <span class="mod-white">build</span>
              </div>
              <div class="recovery-key-word">
                <span class="sui-text-secondary">10</span>
                <span class="mod-white">theme</span>
              </div>
              <div class="recovery-key-word">
                <span class="sui-text-secondary">11</span>
                <span class="mod-white">tone</span>
              </div>
              <div class="recovery-key-word">
                <span class="sui-text-secondary">12</span>
                <span class="mod-white">enlist</span>
              </div>
            </div>
          </div>
        </div>
        
    </div>
    `);

    MenuPage.hideAndClearDialoguePanel();
  }
}