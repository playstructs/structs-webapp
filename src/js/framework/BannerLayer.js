export class BannerLayer {

  /* Element IDs Start */

  static id = 'banner-layer';

  /* Element IDs End */

  static setContent(content) {
    const bannerLayer = document.getElementById(BannerLayer.id);
    if (bannerLayer) {
      bannerLayer.innerHTML = content;
    }
  }

  static clear() {
    const bannerLayer = document.getElementById(BannerLayer.id);
    if (bannerLayer) {
      bannerLayer.innerHTML = '';
    }
  }

  static hideAndClear() {
    const bannerLayer = document.getElementById(BannerLayer.id);
    if (bannerLayer) {
      bannerLayer.classList.add('hidden');
    }
    BannerLayer.clear();
  }

  static show() {
    const bannerLayer = document.getElementById(BannerLayer.id);
    if (bannerLayer) {
      bannerLayer.classList.remove('hidden');
    }
  }
}
