import {SUIFeature} from "./SUIFeature.js";

export class SUIOffcanvas extends SUIFeature {

  constructor() {
    super();

    this.offcanvasElm = null;
    this.placement = 'left';
    this.theme = 'player';

    // Closes the offcanvas when a click occurs outside of it. Bound here so
    // the same reference can be added/removed from the document listener.
    this.handleOutsideClick = (e) => {
      if (this.offcanvasElm && !this.offcanvasElm.contains(e.target)) {
        this.close();
      }
    };
  }

  setPlacement(placement) {
    this.placement = placement;
    this.offcanvasElm.classList.remove(`sui-mod-${this.placement}`);
    this.offcanvasElm.classList.add(`sui-mod-${this.placement}`);
  }

  setTheme(theme) {
    this.theme = theme;
    this.offcanvasElm.classList.remove(`sui-theme-${this.theme}`);
    this.offcanvasElm.classList.add(`sui-theme-${this.theme}`);
  }

  open() {
    this.offcanvasElm.classList.remove('hidden');

    // Defer attaching so the click that triggered open() does not bubble up
    // to the document listener and immediately close the offcanvas. The
    // browser de-duplicates identical (listener, options) pairs, so repeated
    // open() calls remain safe.
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
    }, 0);
  }

  close() {
    this.offcanvasElm.classList.add('hidden');
    document.removeEventListener('click', this.handleOutsideClick);
  }

  setHeader(header) {
    this.offcanvasElm.querySelector('.sui-offcanvas-header').innerHTML = header;
  }

  setContent(content) {
    this.offcanvasElm.querySelector('.sui-offcanvas-body').innerHTML = content;
  }

  renderOffcanvasInnerHTML() {
    return `
      <div class="sui-panel-edge-left"></div>
      <div class="sui-panel-chunk sui-mod-grow sui-mod-shrink">
  
          <!-- Nav Start -->
  
          <div class="sui-screen sui-screen-full-width">
              <div class="sui-screen-nav">
                  <div class="sui-screen-nav-items">
                      <div class="sui-offcanvas-header sui-screen-nav-item sui-mod-header">HEADER</div>
                  </div>
                  <a class="sui-offcanvas-close-btn sui-screen-nav-close" href="javascript: void(0)">
                      <i class="sui-icon-sm icon-close"></i>
                  </a>
              </div>
          </div>
  
          <!-- Nav End -->
  
          <!-- Page Screen Body Start -->
  
          <div class="height-100 sui-screen sui-screen-full-width sui-screen-shrink">
              <div class="height-100 sui-page-body-screen">
                  <div class="sui-page-body-screen-content">
  
                      <!-- Screen Body Start -->
  
                      <div class="sui-offcanvas-body sui-screen-body">
  
                          <!-- Content Goes Here -->
  
                      </div>
  
                      <!-- Screen Body End -->
  
                  </div>
              </div>
          </div>
  
          <!-- Page Screen Body End -->
  
      </div>
      <div class="sui-panel-edge-right"></div>
    `;
  }

  /**
   * Initialize the offcanvas element. There can only be one offcanvas at a time.
   */
  autoInitAll() {

    this.offcanvasElm = document.createElement('div');
    this.offcanvasElm.id = `sui-offcanvas`;
    this.offcanvasElm.classList.add('hidden');
    this.offcanvasElm.classList.add('sui-panel');
    this.setPlacement(this.placement);
    this.setTheme(this.theme);
    this.offcanvasElm.innerHTML = this.renderOffcanvasInnerHTML();

    document.body.appendChild(this.offcanvasElm);

    if (this.offcanvasElm) {
      this.offcanvasElm.querySelector('.sui-offcanvas-close-btn').addEventListener('click', () => {
        this.close();
      });
    }

  }
}
