import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {MenuPage} from "../../framework/MenuPage";

export class GenericResourceComponent extends AbstractViewModelComponent {

  constructor(gameState) {
    super(gameState);
  }

  getPageCode(elementId) {
    return () => {
      MenuPage.sui.tooltip.init(document.getElementById(elementId));
    }
  }

  renderHTML(
    elementId,
    iconClass,
    toolTipText,
    value
  ) {
    return `
      <a 
        id="${elementId}"
        class="sui-resource"
        href="javascript: void(0)" 
        data-sui-tooltip="${toolTipText}"
        data-sui-mod-placement="bottom"
      >
        <span>${value}</span>
        <i class="sui-icon ${iconClass}"></i>
      </a>
    `;
  }
}