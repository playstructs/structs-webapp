import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../constants/Events";
import {MenuPage} from "../../framework/MenuPage";

export class AlphaOwnedComponent extends AbstractViewModelComponent {

  constructor(gameState, elementId) {
    super(gameState);
    this.elementId = elementId;
    this.alphaOwnedClass = 'alpha-owned';

    this.alphaOwnedHandler = this.alphaOwnedHandler.bind(this);
  }

  getAlphaOwned() {
    let alpha = this.gameState.thisPlayer ? this.gameState.thisPlayer.alpha : 0;
    return this.numberFormatter.format(alpha);
  }

  alphaOwnedHandler() {
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

    MenuPage.sui.tooltip.init(document.getElementById(this.elementId));
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