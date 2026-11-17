import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {SECTORS} from "../../constants/SectorBlitzConstants";
import {SectorBlitzFormat} from "../../util/SectorBlitzFormat";

/**
 * A pannable map of the contest sectors. Picking a sector and pressing Scan Sector
 * opens the Scan page with that sector as a hidden filter.
 */
export class SectorMapViewModel extends AbstractViewModel {

  /**
   * Shared across instances so each render replaces the previous resize listener.
   * @type {function|null}
   */
  static resizeHandler = null;

  /**
   * @param {GameState} gameState
   * @param {InfluenceAPI} influenceAPI
   * @param {SectorBlitzManager} sectorBlitzManager
   * @param {object} options {sector} to preselect
   */
  constructor(gameState, influenceAPI, sectorBlitzManager, options = {}) {
    super();
    this.gameState = gameState;
    this.influenceAPI = influenceAPI;
    this.sectorBlitzManager = sectorBlitzManager;
    this.selectedSector = SECTORS.some(s => s.id === Number(options?.sector)) ? Number(options.sector) : null;

    this.layoutId = 'sector-map-layout';
    this.viewportId = 'sector-map-viewport';
    this.barId = 'sector-map-bar';
    this.scanBtnId = 'sector-map-scan-btn';

    /** @type {Map<number, string>} sector id => leading guild tag(s) */
    this.leaderTags = new Map();
  }

  async fetchLeaders() {
    const contestId = this.sectorBlitzManager.contest.contest_id;
    const [standings, overall] = await Promise.all([
      this.influenceAPI.getStandings(contestId),
      this.influenceAPI.getGuildRanks(contestId, null, 1, 100, true),
    ]);
    const profiles = new Map(overall.data.map(row => [row.guild_id, row.profile]));
    SECTORS.forEach(sector => {
      const leaders = standings.data.filter(row =>
        Number(row.sector) === sector.id && row.sector_rank === '1' && BigInt(row.points) > 0n
      );
      if (leaders.length) {
        this.leaderTags.set(sector.id, leaders.map(row => {
          const profile = profiles.get(row.guild_id);
          return SectorBlitzFormat.escape(profile?.tag || profile?.name || row.guild_id);
        }).join(' / '));
      }
    });
  }

  renderMarkersHTML() {
    return SECTORS.map(sector => `
      <a
        href="javascript: void(0)"
        class="sector-map-marker sector-map-marker-label-${sector.labelSide} ${sector.id === this.selectedSector ? 'sui-mod-selected' : ''}"
        style="left: ${sector.mapX}%; top: ${sector.mapY}%"
        data-sector="${sector.id}"
      >
        <span class="sector-map-marker-light">
          <img src="/img/sector-blitz/sector-light-${sector.light}.gif" alt="">
          <span class="sector-map-marker-corners"></span>
        </span>
        <span class="sector-map-marker-label sui-text-header">${sector.label}</span>
      </a>
    `).join('');
  }

  renderBarHTML() {
    if (this.selectedSector === null) {
      return `
        <div class="sector-map-bar-info">
          <i class="sui-icon sui-icon-md icon-move sui-text-secondary"></i>
          <span class="sui-text-header">Select Sector</span>
          <a class="sui-text-secondary sector-map-bar-tip" href="javascript: void(0)" data-sui-tooltip="Scroll, Click-and-Drag or swipe to navigate the map." data-sui-mod-placement="top">
            <i class="sui-icon icon-tip"></i>
          </a>
        </div>
      `;
    }

    const tag = this.leaderTags.get(this.selectedSector);
    return `
      <div class="sector-map-bar-info">
        <i class="sui-icon sui-icon-md icon-raid sui-text-secondary"></i>
        <span class="sui-text-header">
          ${SectorBlitzFormat.sectorLabel(this.selectedSector)}
          ${tag ? `<span class="sui-text-secondary">[${tag}]</span>` : ''}
        </span>
        <a class="sui-text-secondary sector-map-bar-tip" href="javascript: void(0)" data-sui-tooltip="The guild currently controlling this sector." data-sui-mod-placement="top">
          <i class="sui-icon icon-tip"></i>
        </a>
      </div>
      <a id="${this.scanBtnId}" href="javascript: void(0)" class="sui-screen-btn sui-mod-primary">Scan Sector</a>
    `;
  }

  selectSector(sectorId) {
    this.selectedSector = sectorId;
    document.querySelectorAll(`#${this.viewportId} .sector-map-marker`).forEach(marker => {
      marker.classList.toggle('sui-mod-selected', Number(marker.dataset.sector) === sectorId);
    });
    this.updateBar();
  }

  updateBar() {
    const bar = document.getElementById(this.barId);
    if (!bar) return;
    bar.innerHTML = this.renderBarHTML();
    document.getElementById(this.scanBtnId)?.addEventListener('click', () => {
      MenuPage.router.goto('Fleet', 'scan', {sector: this.selectedSector});
    });
  }

  /**
   * Click-and-drag (and touch drag) panning; wheel and trackpad scrolling are native.
   */
  initPanning() {
    const viewport = document.getElementById(this.viewportId);
    let drag = null;

    viewport.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      drag = {x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, moved: false};
    });
    viewport.addEventListener('pointermove', event => {
      if (!drag) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      if (!drag.moved) {
        drag.moved = true;
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add('sui-mod-dragging');
      }
      viewport.scrollLeft = drag.left - dx;
      viewport.scrollTop = drag.top - dy;
    });
    const endDrag = event => {
      if (drag?.moved) {
        // Swallow the click that ends a drag so it doesn't select a sector.
        viewport.addEventListener('click', e => e.stopPropagation(), {capture: true, once: true});
        viewport.releasePointerCapture?.(event.pointerId);
      }
      viewport.classList.remove('sui-mod-dragging');
      drag = null;
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
  }

  /**
   * Start centred on the selected sector, or on the whole map.
   */
  centreViewport() {
    const viewport = document.getElementById(this.viewportId);
    const sector = SECTORS.find(s => s.id === this.selectedSector);
    const map = viewport.firstElementChild;
    const x = sector ? map.offsetWidth * sector.mapX / 100 : map.offsetWidth / 2;
    const y = sector ? map.offsetHeight * sector.mapY / 100 : map.offsetHeight / 2;
    viewport.scrollLeft = x - viewport.clientWidth / 2;
    viewport.scrollTop = y - viewport.clientHeight / 2;
  }

  /**
   * The menu body scrolls its pages; the map pans instead, so it fills exactly the visible area
   * and keeps the sector bar on screen.
   */
  fitToScreen() {
    const layout = document.getElementById(this.layoutId);
    const screen = document.getElementById(MenuPage.screenBodyId);
    if (!layout || !screen) return false;
    const header = screen.querySelector('.sui-page-header');
    layout.style.height = `${Math.max(240, screen.clientHeight - (header?.offsetHeight ?? 0))}px`;
    return true;
  }

  initPageCode() {
    window.removeEventListener('resize', SectorMapViewModel.resizeHandler);
    SectorMapViewModel.resizeHandler = () => {
      if (!this.fitToScreen()) {
        window.removeEventListener('resize', SectorMapViewModel.resizeHandler);
      }
    };
    window.addEventListener('resize', SectorMapViewModel.resizeHandler);
    this.fitToScreen();

    document.querySelectorAll(`#${this.viewportId} .sector-map-marker`).forEach(marker => {
      marker.addEventListener('click', () => this.selectSector(Number(marker.dataset.sector)));
    });
    this.initPanning();
    this.centreViewport();
    this.updateBar();

    this.fetchLeaders()
      .then(() => this.updateBar())
      .catch(error => console.debug('[SectorBlitz] sector leaders unavailable:', error));
  }

  render() {
    // The contest check may finish after the player has moved on to another page.
    const navigationId = MenuPage.router.navigationId;

    this.sectorBlitzManager.refresh().then(() => {
      if (navigationId !== MenuPage.router.navigationId) {
        return;
      }
      if (!this.sectorBlitzManager.isActive()) {
        MenuPage.router.goto('Fleet', 'scan');
        return;
      }

      MenuPage.enablePageTemplate(MenuPage.navItemFleetId);

      MenuPage.setPageTemplateHeaderBtn('Sector Map', true, () => {
        MenuPage.router.goto('Fleet', 'index');
      });

      MenuPage.setPageTemplateContent(`
        <div id="${this.layoutId}" class="sector-map-layout">
          <div id="${this.viewportId}" class="sector-map-viewport">
            <div class="sector-map">
              <img class="sector-map-image" src="/img/sector-blitz/sector-map.png" alt="Map of the contested sectors" draggable="false">
              ${this.renderMarkersHTML()}
            </div>
          </div>
          <div id="${this.barId}" class="sector-map-bar"></div>
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
    });
  }
}
