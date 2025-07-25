import {MenuPage} from "../../../framework/MenuPage";

export class Pagination {

  constructor(
    currentPage,
    resultsPerPage,
    totalResults,
    idPrefix,
    targetController,
    targetAction,
    options = {}
  ) {
    this.currentPage = currentPage;
    this.resultsPerPage = resultsPerPage;
    this.totalResults = totalResults;
    this.totalPages = Math.ceil(this.totalResults / this.resultsPerPage);
    this.idPrefix = idPrefix;
    this.targetController = targetController;
    this.targetAction = targetAction;
    this.pageBtns = [];
    this.options = options;
  }

  init() {
    if (this.currentPage > 1) {
      document.getElementById(`${this.idPrefix}-pagi-prev-btn`).addEventListener('click', () => {
        MenuPage.router.goto(this.targetController, this.targetAction, {...this.options, page: this.currentPage - 1});
      });
    }

    if (this.currentPage < this.totalPages) {
      document.getElementById(`${this.idPrefix}-pagi-next-btn`).addEventListener('click', () => {
        MenuPage.router.goto(this.targetController, this.targetAction, {...this.options, page: this.currentPage + 1});
      });
    }

    this.pageBtns.forEach((pageBtnNumber) => {
      document.getElementById(`${this.idPrefix}-pagi-${pageBtnNumber}-btn`).addEventListener('click', () => {
        MenuPage.router.goto(this.targetController, this.targetAction, {...this.options, page: pageBtnNumber});
      });
    });
  }

  renderPreviousPageBtn() {
    if (this.currentPage === 1) {
      return '';
    }

    return `
      <a id="${this.idPrefix}-pagi-prev-btn" href="javascript: void(0)">
        <i class="sui-icon sui-icon-md icon-chevron-left"></i>
      </a>
    `;
  }

  renderNextPageBtn() {
    if (this.currentPage >= this.totalPages) {
      return '';
    }

    return `
      <a id="${this.idPrefix}-pagi-next-btn" href="javascript: void(0)">
        <i class="sui-icon sui-icon-md icon-chevron-right"></i>
      </a>
    `;
  }


  renderPageBtn(label, isActive = false) {
    const activeClass = isActive ? 'sui-mod-active' : '';

    if (label === '...') {
      return `<div class="sui-pagination-number">...</div>`;
    }

    this.pageBtns.push(label);

    return `
      <a id="${this.idPrefix}-pagi-${label}-btn" href="javascript: void(0)" class="sui-pagination-number ${activeClass}">${label}</a>
    `;
  }

  renderNumberedPageBtns() {
    let btn1 = this.renderPageBtn(1, (this.currentPage === 1));
    let btn2 = '';
    let btn3 = '';
    let btn4 = '';
    let btn5 = '';

    if (this.totalPages >= 2) {
      if ((this.totalPages <= 5 || this.currentPage <= 3)) {
        btn2 = this.renderPageBtn(2, (this.currentPage === 2));
      } else {
        btn2 = this.renderPageBtn('...');
      }
    }

    if (this.totalPages >= 3) {
      if (this.totalPages <= 5 || this.currentPage <= 3) {
        btn3 = this.renderPageBtn(3, (this.currentPage === 3));
      } else if (this.currentPage > 3 && this.totalPages - this.currentPage > 2) {
        btn3 = this.renderPageBtn(this.currentPage, true);
      } else {
        btn3 = this.renderPageBtn('...');
      }
    }

    if (this.totalPages >= 4) {
      if (this.totalPages <= 5) {
        btn4 = this.renderPageBtn(4, (this.currentPage === 4));
      } else {
        btn4 = this.renderPageBtn('...');
      }
    }

    if (this.totalPages >= 5) {
      if (this.totalPages - this.currentPage <= 2) {
        btn3 = this.renderPageBtn(this.totalPages - 2, (this.currentPage === this.totalPages - 2));
        btn4 = this.renderPageBtn(this.totalPages - 1, (this.currentPage === this.totalPages - 1));
      }

      btn5 = this.renderPageBtn(this.totalPages, (this.currentPage === this.totalPages));
    }

    return `
      <div class="sui-pagination-numbers">
        ${btn1}${btn2}${btn3}${btn4}${btn5}
      </div>
    `;
  }

  render() {

    const previousPageBtn = this.renderPreviousPageBtn();
    const nextPageBtn = this.renderNextPageBtn();
    const pageBtns = this.renderNumberedPageBtns();

    return `
    <!-- Pagination Start -->

    <div class="sui-pagination">
      ${previousPageBtn}
      ${pageBtns}
      ${nextPageBtn}
    </div>

    <!-- Pagination End -->
    `;
  }
}