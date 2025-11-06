import {NumberFormatter} from "../util/NumberFormatter";

export class SUICheatsheetRenderer {

  constructor() {
    this.numberFormatter = new NumberFormatter();
    this.numBatteryChargeLevels = 5;
  }


  /**
   * @param {number|null} batteryCost
   * @return {string}
   */
  renderBatteryCostHTML(batteryCost = null) {
    if (batteryCost === null) {
      return '';
    }

    let batteryChunks = '';

    for(let i = 0; i < this.numBatteryChargeLevels; i++) {
      const isFilledClass = i < batteryCost ? 'sui-mod-filled' : '';
      batteryChunks += `<div class="sui-battery-chunk ${isFilledClass}"></div>`;
    }

    return `
     <div class="sui-theme-player sui-battery">
       ${batteryChunks}
     </div>
    `;
  }

  /**
   * @param {number|null} energyCost
   * @return {string}
   */
  renderEnergyCostHTML(energyCost = null) {
    if (energyCost === null) {
      return '';
    }
    return `
      <div class="sui-cheatsheet-cost">
        ${this.numberFormatter.format(energyCost)} <i class="sui-icon sui-icon-energy"></i>
      </div>
    `;
  }

  /**
   * @param {string} titleText
   * @param {number|null} batteryCost
   * @param {number|null} energyCost
   * @return {string}
   */
  renderTitleHTML(
    titleText,
    batteryCost = null,
    energyCost = null
  ) {
    return `
      <div class="sui-cheatsheet-title">
        <div class="sui-cheatsheet-title-text">${titleText.toUpperCase()}</div>
        <div class="sui-cheatsheet-costs">
          ${this.renderBatteryCostHTML(batteryCost)}
          ${this.renderEnergyCostHTML(energyCost)}
        </div>
      </div>
    `;
  }

  /**
   * @param {string|null} descriptionText
   * @return {string}
   */
  renderDescriptionHTML(descriptionText) {
    if (descriptionText === null) {
      return '';
    }
    return `
      <div class="sui-cheatsheet-description">
        ${descriptionText}
      </div>
    `;
  }

  /**
   * @param {string|null} contextualMessageText
   * @return {string}
   */
  renderContextualMessageHTML(contextualMessageText) {
    if (contextualMessageText === null) {
      return '';
    }
    return `
      <div class="sui-cheatsheet-contextual-message">
        ${contextualMessageText}
      </div>
    `
  }

  /**
   * @param {string} titleText
   * @param {number|null} batteryCost
   * @param {number|null} energyCost
   * @param {string|null} descriptionText
   * @param {string|null} contextualMessageText
   * @return {string}
   */
  renderContentHTML(
    titleText,
    batteryCost = null,
    energyCost = null,
    descriptionText = null,
    contextualMessageText = null
  ) {
    return `
      <div class="sui-cheatsheet-top-frame"></div>
  
      ${this.renderTitleHTML(titleText, batteryCost, energyCost)}
  
      <div class="sui-cheatsheet-content">
        ${this.renderDescriptionHTML(descriptionText)}
        
        ${this.renderContextualMessageHTML(contextualMessageText)}
      </div>
    `;
  }

  /**
   * @param {string} titleText
   * @param {string} descriptionText
   * @return {string}
   */
  renderContentForEmptyTileHTML(
    titleText,
    descriptionText
  ) {
    return this.renderContentHTML(
      titleText,
      null,
      null,
      descriptionText
    );
  }
}