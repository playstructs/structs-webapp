import {BannerLayer} from "../../framework/BannerLayer";
import {AbstractBannerViewModel} from "./AbstractBannerViewModel";

export class VictoryBannerViewModel extends AbstractBannerViewModel {

    constructor() {
      super();
      this.id = 'victory-banner';
      this.banner = null;
    }

    render() {
      BannerLayer.setContent(`<div id="${this.id}" class="raid-end-banner"></div>`);
      BannerLayer.show();

      const {lottie} = window;
      const {loadAnimation} = lottie;

      this.banner = loadAnimation({
        container: document.getElementById(this.id),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/lottie/victory-banner/data.json'
      });
      this.banner.addEventListener('DOMLoaded', () => {
        this.isLoaded = true;
        this.banner.playSegments([0,45], true);
        this.banner.loop = true;
        this.banner.playSegments([45,96], false);
      });
    }

    close() {
      return new Promise((resolve) => {
        if (!this.isLoaded) {
          this.banner?.destroy();
          BannerLayer.hideAndClear();
          resolve();
          return;
        }

        this.banner.loop = false;
        this.banner.addEventListener('complete', () => {
          BannerLayer.hideAndClear();
          resolve();
        });
        this.banner.playSegments([97,123], false);
      });
    }

}