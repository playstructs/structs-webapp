import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";

export class GenericResourceComponent extends AbstractViewModelComponent {

  constructor(gameState) {
    super(gameState);
  }

  renderHTML(
    elementId,
    iconClass,
    toolTipText,
    value,
    iconFirst = false
  ) {
    let iconPos1 = '';
    let iconPos2 = `<i class="sui-icon ${iconClass}"></i>`;

    if (iconFirst) {
      iconPos1 = iconPos2;
      iconPos2 = '';
    }

    return `
      <a 
        id="${elementId}"
        class="sui-resource"
        href="javascript: void(0)" 
        data-sui-tooltip="${toolTipText}"
        data-sui-mod-placement="bottom"
      >
        ${iconPos1}
        <span id="${elementId}-value">${value}</span>
        ${iconPos2}
      </a>
    `;
  }
}