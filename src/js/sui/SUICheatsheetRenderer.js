import {NumberFormatter} from "../util/NumberFormatter";
import {ChargeCalculator} from "../util/ChargeCalculator";

export class SUICheatsheetRenderer {

  constructor() {
    this.numberFormatter = new NumberFormatter();
    this.chargeCalculator = new ChargeCalculator();
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

    const chargeLevel = this.chargeCalculator.calcChargeLevelByCharge(batteryCost);

    for(let i = 1; i < this.chargeCalculator.chargeLevelThresholds.length; i++) {
      const isFilledClass = i <= chargeLevel ? 'sui-mod-filled' : '';
      batteryChunks += `<div class="sui-battery-chunk ${isFilledClass}"></div>`;
    }

    return `
     <div class="sui-battery">
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
    if (!descriptionText) {
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
    if (!contextualMessageText) {
      return '';
    }
    return `
      <div class="sui-cheatsheet-contextual-message">
        ${contextualMessageText}
      </div>
    `
  }

  /**
   * @param {string|null} propertySectionHTML
   * @return {string}
   */
  renderCheatsheetPropertySectionHTML(propertySectionHTML) {
    if (!propertySectionHTML) {
      return '';
    }
    return `
      <div class="sui-cheatsheet-property-section">
        ${propertySectionHTML}
      </div>
    `;
  }

  /**
   * @param {string} titleText
   * @param {number|null} batteryCost
   * @param {number|null} energyCost
   * @param {string|null} descriptionText
   * @param {string|null} contextualMessageText
   * @param {string|null} propertySectionHTML
   * @return {string}
   */
  renderContentHTML(
    titleText,
    batteryCost = null,
    energyCost = null,
    descriptionText = null,
    contextualMessageText = null,
    propertySectionHTML = null
  ) {
    return `
      <div class="sui-cheatsheet-top-frame"></div>
  
      ${this.renderTitleHTML(titleText, batteryCost, energyCost)}
  
      <div class="sui-cheatsheet-content">
        ${this.renderDescriptionHTML(descriptionText)}
        
        ${this.renderCheatsheetPropertySectionHTML(propertySectionHTML)}
        
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