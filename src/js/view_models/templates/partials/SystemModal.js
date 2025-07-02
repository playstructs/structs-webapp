export class SystemModal {

  constructor() {
    this.systemModalId = 'system-modal';
    this.iconClasses = 'icon-deploy';
    this.messageId = 'system-modal-message';
    this.cancelBtnId = 'system-modal-cancel-btn';
    this.confirmBtnId = 'system-modal-confirm-btn';
    this.cancelBtnHandler = () => {
      this.hide();
    };
    this.confirmBtnHandler = () => {};
    this.cancelBtnLabel = 'Cancel';
    this.confirmBtnLabel = 'Confirm';
  }

  init() {
    document.getElementById(this.cancelBtnId).addEventListener('click', this.cancelBtnHandler);
    document.getElementById(this.confirmBtnId).addEventListener('click', this.confirmBtnHandler);
  }

  show() {
    document.getElementById(this.systemModalId).classList.remove('hidden');
  }

  hide() {
    document.getElementById(this.systemModalId).classList.add('hidden');
  }

  render() {
    return `
    <!-- System Model Start -->
    
    <div id="${this.systemModalId}" class="sui-message-system-model-overlay hidden">
      <div class="sui-message-system-modal">
        <div class="sui-message-system-modal-frame">
          <div class="sui-message-system-modal-frame-left">
            <div class="sui-message-system-modal-frame-left-top"></div>
            <div class="sui-message-system-modal-frame-left-middle">
              <i class="sui-icon sui-icon-md ${this.iconClasses}"></i>
            </div>
            <div class="sui-message-system-modal-frame-left-bottom"></div>
          </div>
          <div id="${this.messageId}" class="sui-message-system-model-frame-center"></div>
        </div>
        <div class="sui-message-system-modal-cta">
          <div class="sui-message-system-modal-cta-btn-wrapper">
            <a 
              href="javascript: void(0)"
              id="${this.cancelBtnId}"
              class="sui-screen-btn sui-mod-secondary"
            >${this.cancelBtnLabel}</a>
          </div>
          <div class="sui-message-system-modal-cta-btn-wrapper">
            <a
              href="javascript: void(0)"
              id="${this.confirmBtnId}"
              class="sui-screen-btn sui-mod-primary"
            >${this.confirmBtnLabel}</a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- System Model End -->
    `;
  }
}