export class PageHeader {

  constructor() {
    this.pageLabel = '';
    this.showBackButton = false;
    this.backButtonHandler = () => {};
  }

  init() {
    document.getElementById('page-header-back-button').addEventListener('click', this.backButtonHandler);
  }

  render() {
    const backButtonIcon = this.showBackButton
      ? `<i class="sui-icon-sm icon-chevron-left sui-text-secondary"></i>`
      : '';
    const backButtonHref = this.showBackButton
      ? 'href="javascript: void(0)"'
      : '';

    return `
    <!-- Page Header Start -->

    <div class="sui-page-header">
      <a id="page-header-back-button" ${backButtonHref} class="sui-nav-btn">
        ${backButtonIcon}
        ${this.pageLabel}
      </a>
    </div>

    <!-- Page Header End -->
    `;
  }
}