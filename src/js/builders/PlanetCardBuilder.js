import {PLANET_CARD_TYPES} from "../constants/PlanetCardTypes";
import {PlanetCardComponent} from "../view_models/components/PlanetCardComponent";
import {MenuPage} from "../framework/MenuPage";
import {RAID_STATUS} from "../constants/RaidStatus";

export class PlanetCardBuilder {

  /**
   * @param {GameState} gameState
   * @param {FleetManager} fleetManager
   */
  constructor(gameState, fleetManager) {
    this.gameState = gameState;
    this.fleetManager = fleetManager;
  }

  /**
   * @return {PlanetCardComponent}
   */
  createAlphaBasePlanetCard() {
    return new PlanetCardComponent(
      this.gameState,
      'alpha-base',
      false
    );
  }

  /**
   * @return {PlanetCardComponent}
   */
  createRaidPlanetCard() {
    return new PlanetCardComponent(
      this.gameState,
      'raid',
      true
    )
  }

  buildAlphaBaseLoading(alphaBaseCard, type) {
    if (type !== PLANET_CARD_TYPES.ALPHA_BASE_LOADING) {
      return;
    }

    alphaBaseCard.hasGeneralMessage = true;
    alphaBaseCard.generalMessageIconClass = 'hidden';
    alphaBaseCard.generalMessage = `<img src="/img/loading-3-dots.gif" class="loading-3-dots" alt="3 dots loading animation">`;
  }

  /**
   * @param {PlanetCardComponent} alphaBaseCard
   * @param {string} type
   */
  buildAlphaBaseActive(alphaBaseCard, type) {
    if (type !== PLANET_CARD_TYPES.ALPHA_BASE_ACTIVE) {
      return;
    }

    alphaBaseCard.planetName = this.gameState.planet.name;

    alphaBaseCard.hasStatusGroup = true;
    alphaBaseCard.undiscoveredOre = this.gameState.planet.undiscovered_ore;
    alphaBaseCard.alphaOre = this.gameState.thisPlayer.ore;
    alphaBaseCard.shieldHealth = this.gameState.planetShieldHealth;

    alphaBaseCard.hasPrimaryBtn = true;
    alphaBaseCard.primaryBtnLabel = 'Command';
    alphaBaseCard.primaryBtnHandler = () => {
      console.log('Command');
    }
  }

  buildAlphaBaseCompleted(alphaBaseCard, type) {
    if (type !== PLANET_CARD_TYPES.ALPHA_BASE_COMPLETED) {
      return;
    }

    alphaBaseCard.planetName = this.gameState.planet.name;

    alphaBaseCard.hasStatusGroup = true;
    alphaBaseCard.undiscoveredOre = this.gameState.planet.undiscovered_ore;
    alphaBaseCard.alphaOre = this.gameState.thisPlayer.ore;
    alphaBaseCard.shieldHealth = this.gameState.planetShieldHealth;

    alphaBaseCard.hasAlert = true;
    alphaBaseCard.alertIconColorClass = 'sui-text-primary';
    alphaBaseCard.alertMessage = 'All Alpha recovered.';

    alphaBaseCard.hasPrimaryBtn = true;
    alphaBaseCard.primaryBtnLabel = 'Command';
    alphaBaseCard.primaryBtnHandler = () => {
      console.log('Command');
    }

    alphaBaseCard.hasSecondaryBtn = true;
    alphaBaseCard.secondaryBtnLabel = 'Depart';
    alphaBaseCard.secondaryBtnHandler = () => {
      console.log('Depart');
    }
  }

  buildAlphaBaseDepart(alphaBaseCard, type) {
    if (type !== PLANET_CARD_TYPES.ALPHA_BASE_DEPART) {
      return;
    }

    alphaBaseCard.planetName = this.gameState.planet.name;

    alphaBaseCard.hasAlert = true;
    alphaBaseCard.alertMessage = 'Depart planet?';

    alphaBaseCard.hasGeneralMessage = true;
    alphaBaseCard.generalMessageIconClass = 'hidden';
    alphaBaseCard.generalMessage = `Fleet will travel to an undiscovered world.`;

    alphaBaseCard.hasPrimaryBtn = true;
    alphaBaseCard.primaryBtnLabel = 'Confirm';
    alphaBaseCard.primaryBtnHandler = () => {
      console.log('Confirm');
    }

    alphaBaseCard.hasSecondaryBtn = true;
    alphaBaseCard.secondaryBtnLabel = 'Cancel';
    alphaBaseCard.secondaryBtnHandler = () => {
      MenuPage.router.goto('Fleet', 'index');
    }
  }

  buildAlphaBaseArrived(alphaBaseCard, type) {
    if (type !== PLANET_CARD_TYPES.ALPHA_BASE_ARRIVED) {
      return;
    }

    alphaBaseCard.planetName = this.gameState.planet.name;

    alphaBaseCard.hasGeneralMessage = true;
    alphaBaseCard.generalMessageIconClass = 'icon-planet';
    alphaBaseCard.generalMessage = `Fleet has arrived at ${this.gameState.planet.name}.`;

    alphaBaseCard.hasPrimaryBtn = true;
    alphaBaseCard.primaryBtnLabel = 'View';
    alphaBaseCard.primaryBtnHandler = () => {
      console.log('View');
    }

    alphaBaseCard.hasSecondaryBtn = true;
    alphaBaseCard.secondaryBtnLabel = 'Dismiss';
    alphaBaseCard.secondaryBtnHandler = () => {
      MenuPage.router.goto('Fleet', 'index');
    }
  }

  /**
   * @param {string} type
   * @param {PlanetCardComponent} raidCard
   */
  buildRaidLoading(raidCard, type) {
    if (type !== PLANET_CARD_TYPES.RAID_LOADING) {
      return;
    }

    raidCard.hasGeneralMessage = true;
    raidCard.generalMessageIconClass = 'hidden';
    raidCard.generalMessage = `<img src="/img/loading-3-dots.gif" class="loading-3-dots" alt="3 dots loading animation">`;
  }

  /**
   * @param {string} type
   * @param {PlanetCardComponent} raidCard
   */
  buildRaidNone(raidCard, type) {
    if (type !== PLANET_CARD_TYPES.RAID_NONE) {
      return;
    }

    raidCard.hasGeneralMessage = true;
    raidCard.generalMessageIconClass = 'hidden';
    raidCard.generalMessage = 'No Raid active.';

    raidCard.hasSecondaryBtn = true;
    raidCard.secondaryBtnLabel = 'Scan';
    raidCard.secondaryBtnHandler = () => {
      MenuPage.router.goto('Fleet', 'scan');
    }
  }

  /**
   * @param {string} type
   * @param {PlanetCardComponent} raidCard
   */
  buildRaidStarted(raidCard, type) {
    if (type !== PLANET_CARD_TYPES.RAID_STARTED) {
      return;
    }

    raidCard.planetName = this.gameState.getRaidEnemyUsername();

    raidCard.hasGeneralMessage = true;
    raidCard.generalMessageIconClass = 'icon-raid';
    raidCard.generalMessage = `Fleet has begun raid on ${this.gameState.getRaidEnemyUsername()}.`;

    raidCard.hasPrimaryBtn = true;
    raidCard.primaryBtnLabel = 'View';
    raidCard.primaryBtnHandler = () => {
      console.log('view');
    }

    raidCard.hasSecondaryBtn = true;
    raidCard.secondaryBtnLabel = 'Dismiss';
    raidCard.secondaryBtnHandler = () => {
      MenuPage.router.goto('Fleet', 'index');
    }
  }

  /**
   * @param {string} type
   * @param {PlanetCardComponent} raidCard
   */
  buildRaidActive(raidCard, type) {
    if (type !== PLANET_CARD_TYPES.RAID_ACTIVE) {
      return;
    }

    raidCard.planetName = this.gameState.getRaidEnemyUsername();

    raidCard.hasStatusGroup = true;
    raidCard.undiscoveredOre = this.gameState.raidPlanet.undiscovered_ore;
    raidCard.alphaOre = this.gameState.raidEnemy.ore;
    raidCard.shieldHealth = this.gameState.raidPlanetShieldHealth;

    raidCard.hasPrimaryBtn = true;
    raidCard.primaryBtnLabel = 'Command';
    raidCard.primaryBtnHandler = () => {
      console.log('command');
    }

    raidCard.hasSecondaryBtn = true;
    raidCard.secondaryBtnLabel = 'Retreat';
    raidCard.secondaryBtnHandler = () => {
      MenuPage.router.goto('Fleet', 'index', {raidCardType: PLANET_CARD_TYPES.RAID_RETREAT})
    }
  }

  /**
   * @param {string} type
   * @param {PlanetCardComponent} raidCard
   */
  buildRaidRetreat(raidCard, type) {
    if (type !== PLANET_CARD_TYPES.RAID_RETREAT) {
      return;
    }

    raidCard.planetName = this.gameState.getRaidEnemyUsername();

    raidCard.hasAlert = true;
    raidCard.alertMessage = 'Abandon raid?';

    raidCard.hasGeneralMessage = true;
    raidCard.generalMessageIconClass = 'hidden';
    raidCard.generalMessage = `Fleet will return to Alpha Base.`;

    raidCard.hasPrimaryBtn = true;
    raidCard.primaryBtnLabel = 'Confirm';
    raidCard.primaryBtnHandler = () => {
      MenuPage.router.goto('Fleet', 'index', {raidCardType: PLANET_CARD_TYPES.RAID_LOADING})
      this.fleetManager.moveFleet(this.gameState.planet.id).then();
    }

    raidCard.hasSecondaryBtn = true;
    raidCard.secondaryBtnLabel = 'Cancel';
    raidCard.secondaryBtnHandler = () => {
      MenuPage.router.goto('Fleet', 'index');
    }
  }

  /**
   * @param {string|null} selectedType
   */
  determineAlphaBaseCardType(selectedType = null) {
    let type = PLANET_CARD_TYPES.ALPHA_BASE_ACTIVE;

    if (selectedType === PLANET_CARD_TYPES.ALPHA_BASE_LOADING) {
      type = PLANET_CARD_TYPES.ALPHA_BASE_LOADING;
    }

    return type;
  }

  /**
   * @param {string|null} selectedType
   * @return {string}
   */
  determineRaidCardType(selectedType = null) {
    let type = PLANET_CARD_TYPES.RAID_NONE;

    if (
      selectedType === PLANET_CARD_TYPES.RAID_LOADING
      || this.gameState.raidPlanetRaidInfo.status === RAID_STATUS.REQUESTED
    ) {

      type = PLANET_CARD_TYPES.RAID_LOADING;

    } else if (
      selectedType === PLANET_CARD_TYPES.RAID_STARTED
      && this.gameState.raidPlanetRaidInfo.status === RAID_STATUS.INITIATED
    ) {

      type = PLANET_CARD_TYPES.RAID_STARTED;

    } else if (
      selectedType === PLANET_CARD_TYPES.RAID_RETREAT
    ) {

      type = PLANET_CARD_TYPES.RAID_RETREAT;

    } else if (
      this.gameState.raidPlanetRaidInfo.status === RAID_STATUS.INITIATED
      || this.gameState.raidPlanetRaidInfo.status === RAID_STATUS.ONGOING
    ) {

      type = PLANET_CARD_TYPES.RAID_ACTIVE;

    }

    return type;
  }

  /**
   * @param {string|null} selectedType
   * @return {PlanetCardComponent}
   */
  buildAlphaBaseCard(selectedType = null) {
    let planetCard = this.createAlphaBasePlanetCard();

    const type = this.determineAlphaBaseCardType(selectedType);

    this.buildAlphaBaseLoading(planetCard, type);
    this.buildAlphaBaseActive(planetCard, type);
    this.buildAlphaBaseCompleted(planetCard, type);
    this.buildAlphaBaseDepart(planetCard, type);
    this.buildAlphaBaseArrived(planetCard, type);

    return planetCard;
  }

  /**
   * @param {string|null} selectedType
   * @return {PlanetCardComponent}
   */
  buildRaidCard(selectedType = null) {
    let planetCard = this.createRaidPlanetCard();

    const type = this.determineRaidCardType(selectedType);

    this.buildRaidLoading(planetCard, type);
    this.buildRaidNone(planetCard, type);
    this.buildRaidStarted(planetCard, type);
    this.buildRaidActive(planetCard, type);
    this.buildRaidRetreat(planetCard, type);

    return planetCard;
  }

  /**
   * @param {boolean} isRaidCard
   * @param {string|null} selectedType
   * @return {PlanetCardComponent}
   */
  build(isRaidCard = false, selectedType = null) {
    return isRaidCard
      ? this.buildRaidCard(selectedType)
      : this.buildAlphaBaseCard(selectedType);
  }
}