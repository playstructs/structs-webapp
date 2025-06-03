import {MenuPage} from "../../framework/MenuPage";

export class ConfirmTemplate {

  constructor() {
    this.showResources = false;

    this.headerBtnLabel = '';
    this.headerShowBackBtn = false;
    this.headerBackBtnHandler = () => {};

    this.messageHeaderColorClass = '';
    this.messageHeaderIconClass = '';
    this.messageHeaderText = '';
    this.messageBody1HTML = '';
    this.messageBody2HTML = '';

    this.confirmBtn1Enabled = false;
    this.confirmBtn1Id = 'confirm-template-btn-1';
    this.confirmBtn1Label = '';
    this.confirmBtn1ColorClass = '';

    this.confirmBtn2Enabled = false;
    this.confirmBtn2Id = 'confirm-template-btn-2';
    this.confirmBtn2Label = '';
    this.confirmBtn2ColorClass = '';

    this.initPageCode = () => {};
  }

  render() {
    MenuPage.enablePageTemplate(
      MenuPage.navItemAccountId,
      this.showResources
    );

    MenuPage.setPageTemplateHeaderBtn(
      this.headerBtnLabel,
      this.headerShowBackBtn,
      this.headerBackBtnHandler
    );

    let confirmBtn1HTML = '';
    let confirmBtn2HTML = '';

    if (this.confirmBtn1Enabled) {
      confirmBtn1HTML = `
      <div class="sui-screen-btn-flex-wrapper">
        <button 
          id="${this.confirmBtn1Id}" 
          class="sui-screen-btn ${this.confirmBtn1ColorClass}"
        >${this.confirmBtn1Label}</button>
      </div>
      `;
    }

    if (this.confirmBtn2Enabled) {
      confirmBtn2HTML = `
      <div class="sui-screen-btn-flex-wrapper">
        <button 
          id="${this.confirmBtn2Id}" 
          class="sui-screen-btn ${this.confirmBtn2ColorClass}"
        >${this.confirmBtn2Label}</button>
      </div>
      `;
    }

    MenuPage.setPageTemplateContent(`
      <div class="common-layout-col">
        <div class="confirm-template-text-container">
          <div class="${this.messageHeaderColorClass}">
            <i class="sui-icon sui-icon-md ${this.messageHeaderIconClass}"></i>
            ${this.messageHeaderText}
          </div>
          <div>${this.messageBody1HTML}</div>
        </div>
        
        <div>${this.messageBody2HTML}</div>        
        
        <div class="confirm-template-btn-container">
          ${confirmBtn1HTML}
          ${confirmBtn2HTML}
        </div>

      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}