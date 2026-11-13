import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../constants/Events";

export class ShieldStatusComponent extends AbstractViewModelComponent {

  /**
   * Tracks the window listeners registered per element id so that rebuilding a
   * component bound to the same element doesn't accumulate duplicate listeners.
   *
   * @type {Object<string, Object<string, function>>}
   */
  static registeredListeners = {};

  constructor(
    gameState,
    planetOwnerPlayerType,
    elementId,
    showTextStatus = false
  ) {
    super(gameState);
    this.planetOwnerPlayerType = planetOwnerPlayerType;
    this.elementId = elementId;
    this.elementIconWrapperId = `${this.elementId}-icon-wrapper`;
    this.elementValueContainerId = `${this.elementId}-value`;
    this.showTextStatus = showTextStatus;
  }

  initPageCode() {
    this.removeStaleListeners();

    this.loginCompleteHandler = () => {
      this.renderShieldStatusIcon();
    };

    this.shieldHealthChangedHandler = (event) => {
      if (event.playerType !== this.planetOwnerPlayerType) {
        return;
      }
      this.renderShieldStatusIcon();
    };

    // The shield status also depends on whether the command struct is alive,
    // whether the fleet is holding station over the planet, and whether a raid
    // is active, so refresh the icon when any of those inputs change.
    this.defensesChangedHandler = (event) => {
      if (event.playerType !== this.planetOwnerPlayerType) {
        return;
      }
      this.renderShieldStatusIcon();
    };

    window.addEventListener(EVENTS.LOGIN_COMPLETE, this.loginCompleteHandler);
    window.addEventListener(EVENTS.SHIELD_HEALTH_CHANGED, this.shieldHealthChangedHandler);
    window.addEventListener(EVENTS.STRUCT_COUNT_CHANGED, this.defensesChangedHandler);
    window.addEventListener(EVENTS.PLANET_RAID_STATUS_CHANGED, this.defensesChangedHandler);
    window.addEventListener(EVENTS.FLEET_CHANGED, this.defensesChangedHandler);

    ShieldStatusComponent.registeredListeners[this.elementId] = {
      [EVENTS.LOGIN_COMPLETE]: this.loginCompleteHandler,
      [EVENTS.SHIELD_HEALTH_CHANGED]: this.shieldHealthChangedHandler,
      [EVENTS.STRUCT_COUNT_CHANGED]: this.defensesChangedHandler,
      [EVENTS.PLANET_RAID_STATUS_CHANGED]: this.defensesChangedHandler,
      [EVENTS.FLEET_CHANGED]: this.defensesChangedHandler,
    };

    this.renderShieldStatusIcon();
  }

  /**
   * Removes window listeners registered by a previous component instance bound
   * to the same element id, preventing listener accumulation as cards rebuild.
   */
  removeStaleListeners() {
    const existing = ShieldStatusComponent.registeredListeners[this.elementId];
    if (!existing) {
      return;
    }

    Object.entries(existing).forEach(([eventName, handler]) => {
      window.removeEventListener(eventName, handler);
    });

    delete ShieldStatusComponent.registeredListeners[this.elementId];
  }

  renderHTML() {
    return `
      <a 
        id="${this.elementId}"
        class="sui-resource"
        href="javascript: void(0)" 
        data-sui-mod-placement="bottom"
      >
        <div id="${this.elementIconWrapperId}" class="planetary-shield-symbol-wrapper"></div>
        <span id="${this.elementValueContainerId}" class="sui-text-warning"></span>
      </a>
    `;
  }

  renderShieldStatusIcon() {
    const elm = document.getElementById(this.elementId);
    const iconElm = document.getElementById(this.elementIconWrapperId);

    if (!elm || !iconElm) {
      return;
    }

    const planetOwner = this.gameState.keyPlayers[this.planetOwnerPlayerType];

    let status = 'secure';

    if (planetOwner?.arePlanetaryDefensesBreached()) {
      status = 'breached';
    } else if (planetOwner?.arePlanetaryDefensesVulnerable()) {
      status = 'vulnerable';
    }

    let cheatsheet = `shield-${status}`;

    // Only swap the icon if the status changed
    if (elm.dataset.suiCheatsheet !== cheatsheet) {
      iconElm.innerHTML = `<img src="/img/non_standard_icons/shield_${status}_${this.planetOwnerPlayerType}.png" alt="${status}" />`;
      elm.dataset.suiCheatsheet = cheatsheet;
    }

    // Always refresh the breach time as it depends on the planetary shield
    // info, which can load/change independently of the status.
    elm.dataset.projectedBreachTime = planetOwner?.getProjectedShieldBreachTime() ?? 'N/A';

    this.renderShieldStatusValue();
  }

  /**
   * What the readout says, worked out from the planet owner's current state
   * every time, so it can never disagree with the status icon beside it.
   *
   * @return {{text: string, warning: boolean}}
   */
  getShieldReadout() {
    const planetOwner = this.gameState.keyPlayers[this.planetOwnerPlayerType];

    if (!planetOwner || planetOwner.arePlanetaryDefensesSecure()) {
      return {text: planetOwner && this.showTextStatus ? 'Secure' : '', warning: false};
    }

    const countdown = planetOwner.arePlanetaryDefensesBreached() ? planetOwner.getPlanetShieldHealth() : '';
    if (countdown) {
      return {text: countdown, warning: true};
    }

    if (!this.showTextStatus) {
      return {text: '', warning: true};
    }

    // An enemy planet is a raid target, so how long its shield would hold is the
    // useful figure; the player's own planet just reports that it is exposed.
    return planetOwner.isRaidDependent()
      ? {text: planetOwner.getProjectedShieldBreachTime(), warning: true}
      : {text: 'Vulnerable', warning: false};
  }

  renderShieldStatusValue() {
    const valueElm = document.getElementById(this.elementValueContainerId);

    if (!valueElm) {
      return;
    }

    const readout = this.getShieldReadout();

    if (readout.warning) {
      valueElm.classList.add('sui-text-warning');
    } else {
      valueElm.classList.remove('sui-text-warning');
    }
    valueElm.innerText = readout.text;
  }
}