import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";
import {SectorBlitzFormat} from "../../util/SectorBlitzFormat";

/**
 * The spectator's menu screen: what is being watched (or why it can't be), a way back to the
 * public leaderboard and, while the battle is on, a way back to the map.
 */
export class SpectatorStatusViewModel extends AbstractViewModel {

  /**
   * @param {object} options
   * @param {string} options.title nav label
   * @param {string} [options.message] escaped HTML: what is happening, shown above the buttons
   * @param {string} options.leaderboardUrl
   * @param {boolean} [options.canWatch] show "Watch Battle", which closes the menu
   * @param {boolean} [options.loading] a waiting screen: the loading animation and message, no buttons
   * @param {string} [options.detailHTML] escaped HTML shown above the buttons
   */
  constructor({title, message = '', leaderboardUrl, canWatch = false, loading = false, detailHTML = ''}) {
    super();
    this.title = title;
    this.message = message;
    this.leaderboardUrl = leaderboardUrl;
    this.canWatch = canWatch;
    this.loading = loading;
    this.detailHTML = detailHTML;
  }

  render() {
    MenuPage.setNavItems([new NavItemDTO('nav-item-text-only', this.title)]);
    if (this.canWatch) {
      MenuPage.enableCloseBtn();
    } else {
      MenuPage.disableCloseBtn();
    }
    MenuPage.showNav();
    MenuPage.useOpaqueBackground();

    if (this.loading) {
      // The same waiting screen as MenuWaitingViewModel: three dots, the message underneath.
      MenuPage.setBodyContent(`
        <div class="login-activating-device-layout">
          <img src="/img/loading-3-dots.gif" class="loading-3-dots" alt="3 dots loading animation"/>
          <div>${this.message}</div>
        </div>
      `);
    } else {
      // Laid out like the start screen (IndexViewModel): centered, with fixed-width buttons.
      MenuPage.setBodyContent(`
        <div class="sui-page-body-screen-content sui-screen-body justified-centered spectator-status">
          ${this.message ? `<p class="sui-text-paragraph spectator-status-message">${this.message}</p>` : ''}
          ${this.detailHTML}
          ${this.canWatch ? `<a href="javascript:void(0)" id="spectator-watch-btn" class="sui-screen-btn fixed-256 sui-mod-primary">Watch Battle</a>` : ''}
          <a href="${SectorBlitzFormat.escape(this.leaderboardUrl)}" class="sui-screen-btn fixed-256 sui-mod-secondary">Event Leaderboard</a>
        </div>
      `);
    }

    MenuPage.hideAndClearDialoguePanel();
    MenuPage.open();

    document.getElementById('spectator-watch-btn')?.addEventListener('click', () => MenuPage.close());
  }
}
