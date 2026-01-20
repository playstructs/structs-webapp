import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../constants/Events";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";

export class AlphaOwnedComponent extends AbstractViewModelComponent {

  constructor(gameState, elementId) {
    super(gameState);
    this.elementId = elementId;
    this.alphaOwnedClass = 'alpha-owned';

    this.alphaOwnedHandler = this.alphaOwnedHandler.bind(this);
  }

  getAlphaOwned() {
    let alpha = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player ? this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.alpha : 0;
    return this.numberFormatter.format(alpha);
  }

  alphaOwnedHandler(event) {
    if (event.playerType !== PLAYER_TYPES.PLAYER) {
      return;
    }

    const alphaOwnedLinkElm = document.getElementById(this.elementId);

    if (!alphaOwnedLinkElm) {
      window.removeEventListener(EVENTS.ALPHA_COUNT_CHANGED, this.alphaOwnedHandler);
      return;
    }

    const alphaOwnedNumbersContainer = alphaOwnedLinkElm.querySelector(`.${this.alphaOwnedClass}`);
    alphaOwnedNumbersContainer.innerText = this.getAlphaOwned();
  }

  initPageCode() {
    const alphaOwnedLinkElm = document.getElementById(this.elementId);
    const alphaOwnedNumbersContainer = alphaOwnedLinkElm.querySelector(`.${this.alphaOwnedClass}`);
    alphaOwnedNumbersContainer.innerText = this.getAlphaOwned();

    window.addEventListener(EVENTS.ALPHA_COUNT_CHANGED, this.alphaOwnedHandler);
  }

  renderHTML() {
    return `
      <a 
        id="${this.elementId}"
        class="sui-resource"
        href="javascript: void(0)" 
        data-sui-tooltip="Alpha Matter"
        data-sui-mod-placement="bottom"
      >
        <span class="${this.alphaOwnedClass}"></span>
        <i class="sui-icon sui-icon-alpha-matter"></i>
      </a>
    `;
  }
}