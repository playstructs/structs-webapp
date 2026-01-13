import {SUICheatsheetContentBuilder} from "../sui/SUICheatsheetContentBuilder";
import {
  STRUCT_DESCRIPTIONS,
  STRUCT_EQUIPMENT_ICON_MAP,
  STRUCT_WEAPON_CONTROL_LABELS
} from "../constants/StructConstants";
import {AMBIT_ORDER} from "../constants/Ambits";
import {StructType} from "../models/StructType";
import {NumberFormatter} from "../util/NumberFormatter";

export class CheatsheetContentBuilder extends SUICheatsheetContentBuilder {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super();
    this.gameState = gameState;
    this.numberFormatter = new NumberFormatter();
  }

  /**
   * @param {StructType} structType
   * @return {string[]}
   */
  getPassiveWeaponryAmbits(structType) {
    const ambits = new Set([
      ...structType.primary_weapon_ambits_array,
      ...structType.secondary_weapon_ambits_array
    ]);
    return [...ambits].sort((a, b) => {
      const indexA = AMBIT_ORDER.indexOf(a.toUpperCase());
      const indexB = AMBIT_ORDER.indexOf(b.toUpperCase());
      return indexA - indexB;
    });
  }

  /**
   * @param {string} weaponType
   * @param {number} weaponDamage
   * @param {string} weaponLabel
   * @param {string[]} weaponAmbits
   * @param {string} notEquippedValue
   * @return {string}
   */
  renderWeaponProperty(
    weaponType,
    weaponLabel,
    weaponDamage,
    weaponAmbits,
    notEquippedValue
  ) {
    if (!weaponType || weaponType === notEquippedValue) {
      return '';
    }

    const iconClass = STRUCT_EQUIPMENT_ICON_MAP[weaponType];
    const ambitIcons = weaponAmbits.map(ambit => 
      `<i class="sui-icon sui-icon-${ambit.toLowerCase()}"></i>`
    ).join('');

    return `
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md ${iconClass}"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>${weaponLabel}</div>
          <div>
            ${weaponDamage} DMG
            ${ambitIcons}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  renderPassiveWeaponProperty(structType) {
    if (!structType.passive_weaponry || structType.passive_weaponry === 'noPassiveWeaponry') {
      return '';
    }

    const iconClass = STRUCT_EQUIPMENT_ICON_MAP[structType.passive_weaponry];
    const weaponAmbits = this.getPassiveWeaponryAmbits(structType);
    const possibleAmbitsLower = structType.possible_ambit_array.map(a => a.toLowerCase());

    let damageHTML = '';

    if (structType.counter_attack_same_ambit > structType.counter_attack) {
      // Separate ambits into regular and same-ambit groups
      const regularAmbits = weaponAmbits.filter(a => !possibleAmbitsLower.includes(a.toLowerCase()));
      const sameAmbits = weaponAmbits.filter(a => possibleAmbitsLower.includes(a.toLowerCase()));

      if (regularAmbits.length > 0) {
        const regularIcons = regularAmbits.map(ambit =>
          `<i class="sui-icon sui-icon-${ambit.toLowerCase()}"></i>`
        ).join('');
        damageHTML += `${structType.counter_attack} DMG ${regularIcons} `;
      }

      if (sameAmbits.length > 0) {
        const sameIcons = sameAmbits.map(ambit =>
          `<i class="sui-icon sui-icon-${ambit.toLowerCase()}"></i>`
        ).join('');
        damageHTML += `${structType.counter_attack_same_ambit} DMG ${sameIcons}`;
      }
    } else {
      const ambitIcons = weaponAmbits.map(ambit =>
        `<i class="sui-icon sui-icon-${ambit.toLowerCase()}"></i>`
      ).join('');
      damageHTML = `${structType.counter_attack} DMG ${ambitIcons}`;
    }

    return `
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md ${iconClass}"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>${structType.passive_weaponry_label}</div>
          <div>
            ${damageHTML}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  renderUnitDefensesProperty(structType) {
    if (structType.unit_defenses === 'noUnitDefenses') {
      return '';
    }

    const iconClass = STRUCT_EQUIPMENT_ICON_MAP[structType.unit_defenses];

    return `
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md ${iconClass}"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>${structType.unit_defenses_label}</div>
        </div>
      </div>
    `;
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  renderPlanetaryDefensesProperty(structType) {
    switch (structType.planetary_defenses) {
      case 'noPlanetaryDefense':
        return '';
      case 'defensiveCannon':
        return this.renderWeaponProperty(
          structType.planetary_defenses,
          structType.planetary_defenses_label,
          1,
          AMBIT_ORDER.map(ambit => ambit.toLowerCase()),
          'noPlanetaryDefense'
        );
      default:
        const iconClass = STRUCT_EQUIPMENT_ICON_MAP[structType.planetary_defenses];

        return `
          <div class="sui-cheatsheet-property">
            <div class="sui-cheatsheet-property-icon">
              <i class="sui-icon sui-icon-md ${iconClass}"></i>
            </div>
            <div class="sui-cheatsheet-property-info">
              <div>${structType.planetary_defenses_label}</div>
            </div>
          </div>
        `;
    }
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  renderOreReserveDefensesProperty(structType) {
    if (structType.ore_reserve_defenses === 'noOreReserveDefenses') {
      return '';
    }

    const iconClass = STRUCT_EQUIPMENT_ICON_MAP[structType.ore_reserve_defenses];
    const planetaryShieldContribution = this.numberFormatter.format(structType.planetary_shield_contribution);

    return `
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md ${iconClass}"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>${structType.ore_reserve_defenses_label}</div>
          <div>+${planetaryShieldContribution} Planetary Defense</div>
        </div>
      </div>
    `;
  }

  /**
   * @param {StructType} structType
   * @return {string}
   */
  renderPowerGenerationProperty(structType) {
    if (structType.power_generation === 'noPowerGeneration') {
      return '';
    }

    const iconClass = STRUCT_EQUIPMENT_ICON_MAP[structType.power_generation];

    return `
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md icon-send-alpha"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>Consume Alpha</div>
        </div>
      </div>
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md ${iconClass}"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>+${structType.generating_rate} KW Per Alpha</div>
        </div>
      </div>
    `;
  }

  /**
   * @param {StructType} structType
   * @param {object} dataset
   * @return {string}
   */
  buildStructCheatsheet(structType, dataset = {}) {
    let propertiesHTML = '';

    propertiesHTML += this.renderWeaponProperty(
      structType.primary_weapon,
      structType.primary_weapon_label,
      structType.primary_weapon_damage,
      structType.primary_weapon_ambits_array,
      'noActiveWeaponry'
    );

    propertiesHTML += this.renderWeaponProperty(
      structType.secondary_weapon,
      structType.secondary_weapon_label,
      structType.secondary_weapon_damage,
      structType.secondary_weapon_ambits_array,
      'noActiveWeaponry'
    );

    propertiesHTML += this.renderPassiveWeaponProperty(structType);

    propertiesHTML += this.renderUnitDefensesProperty(structType);

    propertiesHTML += this.renderPlanetaryDefensesProperty(structType);

    propertiesHTML += this.renderOreReserveDefensesProperty(structType);

    propertiesHTML += this.renderPowerGenerationProperty(structType);

    return this.renderer.renderContentHTML(
      `${structType.default_cosmetic_model_number} ${structType.class}`,
      structType.build_charge,
      structType.build_draw,
      STRUCT_DESCRIPTIONS[structType.type],
      dataset.contextualMsg ? dataset.contextualMsg : '',
      propertiesHTML || null
    );
  }

  /**
   *
   * @param {string} selectedProperty
   * @param {string} weaponType
   * @param {string} weaponControl
   * @param {number} weaponCharge
   * @param {number} weaponDamage
   * @param {number} weaponShots
   * @param {string[]} weaponAmbitsArray
   * @return {string}
   */
  renderPropertiesForWeapon(
    selectedProperty,
    weaponType,
    weaponControl,
    weaponCharge,
    weaponDamage,
    weaponShots,
    weaponAmbitsArray
  ) {
    if (!selectedProperty || (selectedProperty !== 'primary_weapon' && selectedProperty !== 'secondary_weapon')) {
      return '';
    }

    const iconClass = STRUCT_EQUIPMENT_ICON_MAP[weaponType];
    const weaponControlLabel = STRUCT_WEAPON_CONTROL_LABELS[weaponControl];
    let weaponDamageLabel = (weaponShots > 1)
      ? `${weaponDamage}-${weaponDamage * weaponShots} DMG`
      :`${weaponDamage} DMG`;
    const ambitIcons = weaponAmbitsArray.map(ambit =>
      `<i class="sui-icon sui-icon-${ambit.toLowerCase()}"></i>`
    ).join('');

    return `
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md ${iconClass}"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>${weaponControlLabel}</div>
        </div>
      </div>
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md icon-dmg"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>
            ${weaponDamageLabel}
          </div>
        </div>
      </div>
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md icon-range"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>
            ${ambitIcons}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * @param {string} selectedProperty
   * @param {StructType} structType
   * @return {string}
   */
  renderPropertiesForPassiveWeaponry(selectedProperty, structType) {
    if (!selectedProperty || selectedProperty !== 'passive_weaponry') {
      return '';
    }

    if (!structType.passive_weaponry || structType.passive_weaponry === 'noPassiveWeaponry') {
      return '';
    }

    const weaponAmbits = this.getPassiveWeaponryAmbits(structType);

    let damageHTML = `${structType.counter_attack} DMG`;

    if (structType.counter_attack_same_ambit > structType.counter_attack) {
      damageHTML += `${structType.counter_attack}-${structType.counter_attack_same_ambit} DMG`;
    }

    return `
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md icon-dmg"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>
            ${damageHTML}
          </div>
        </div>
      </div>
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md icon-range"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>
            ${weaponAmbits.map(ambit => `<i class="sui-icon sui-icon-${ambit.toLowerCase()}"></i>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * @param {string} selectedProperty
   * @param {StructType} structType
   * @return {string}
   */
  renderPropertiesForOreReserveDefenses(selectedProperty, structType) {
    if (!selectedProperty || selectedProperty !== 'ore_reserve_defenses') {
      return '';
    }

    if (structType.ore_reserve_defenses === 'noOreReserveDefenses') {
      return '';
    }

    const iconClass = STRUCT_EQUIPMENT_ICON_MAP[structType.ore_reserve_defenses];
    const planetaryShieldContribution = this.numberFormatter.format(structType.planetary_shield_contribution);

    return `
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md ${iconClass}"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>${structType.ore_reserve_defenses_label}</div>
          <div>+${planetaryShieldContribution} Planetary Defense</div>
        </div>
      </div>
    `;
  }

  /**
   * @param {string} selectedProperty
   * @param {StructType} structType
   * @return {string}
   */
  renderPropertiesForPlanetaryDefenses(selectedProperty, structType) {
    if (!selectedProperty || selectedProperty !== 'planetary_defenses') {
      return '';
    }

    if (structType.planetary_defenses === 'defensiveCannon') {
        const weaponDamage = 1;
        const weaponAmbits = AMBIT_ORDER.map(ambit => ambit.toLowerCase());
        const ambitIcons = weaponAmbits.map(ambit =>
            `<i class="sui-icon sui-icon-${ambit.toLowerCase()}"></i>`
        ).join('');
        
        return `
          <div class="sui-cheatsheet-property">
            <div class="sui-cheatsheet-property-icon">
              <i class="sui-icon sui-icon-md icon-dmg"></i>
            </div>
            <div class="sui-cheatsheet-property-info">
              <div>
                ${weaponDamage} DMG
              </div>
            </div>
          </div>
          <div class="sui-cheatsheet-property">
            <div class="sui-cheatsheet-property-icon">
              <i class="sui-icon sui-icon-md icon-range"></i>
            </div>
            <div class="sui-cheatsheet-property-info">
              <div>
                ${ambitIcons}
              </div>
            </div>
          </div>
        `;
    }

    // Default or other planetary defenses if any
    return '';
  }

  /**
   * @param {StructType} structType
   * @param {object} dataset
   * @return {string}
   */
  buildStructPropertyCheatsheet(structType, dataset) {
    const selectedProperty = dataset.selectedProperty;
    let titleText = '';
    let batteryCost = null;
    let descriptionText = '';
    let propertySectionHTML = '';

    switch (selectedProperty) {
      case 'primary_weapon':
        titleText = structType.primary_weapon_label;
        batteryCost = structType.primary_weapon_charge;
        descriptionText = structType.primary_weapon_description;
        propertySectionHTML = this.renderPropertiesForWeapon(
          selectedProperty,
          structType.primary_weapon,
          structType.primary_weapon_control,
          structType.primary_weapon_charge,
          structType.primary_weapon_damage,
          structType.primary_weapon_shots,
          structType.primary_weapon_ambits_array
        );
        break;
      case 'secondary_weapon':
        titleText = structType.secondary_weapon_label;
        batteryCost = structType.secondary_weapon_charge;
        descriptionText = structType.secondary_weapon_description;
        propertySectionHTML = this.renderPropertiesForWeapon(
          selectedProperty,
          structType.secondary_weapon,
          structType.secondary_weapon_control,
          structType.secondary_weapon_charge,
          structType.secondary_weapon_damage,
          structType.secondary_weapon_shots,
          structType.secondary_weapon_ambits_array
        );
        break;
      case 'movable':
        titleText = structType.drive_label;
        batteryCost = structType.move_charge;
        descriptionText = structType.drive_description;
        break;
      case 'passive_weaponry':
        titleText = structType.passive_weaponry_label;
        descriptionText = structType.passive_weaponry_description;
        propertySectionHTML = this.renderPropertiesForPassiveWeaponry(selectedProperty, structType);
        break;
      case 'unit_defenses':
        titleText = structType.unit_defenses_label;
        descriptionText = structType.unit_defenses_description;
        break;
      case 'ore_reserve_defenses':
        titleText = structType.ore_reserve_defenses_label;
        descriptionText = structType.ore_reserve_defenses_description;
        propertySectionHTML = this.renderPropertiesForOreReserveDefenses(selectedProperty, structType);
        break;
      case 'planetary_defenses':
        titleText = structType.planetary_defenses_label;
        descriptionText = structType.planetary_defenses_description;
        propertySectionHTML = this.renderPropertiesForPlanetaryDefenses(selectedProperty, structType);
        break;
    }

    return this.renderer.renderContentHTML(
      titleText,
      batteryCost,
      null,
      descriptionText,
      null,
      propertySectionHTML
    );
  }

  /**
   * @param {object} dataset
   * @return {string}
   */
  renderUndiscoveredOre(dataset) {
    return this.renderer.renderContentHTML(
      'Undiscovered Ore',
      null,
      null,
      `${dataset.undiscoveredOre} Ore remains to be mined.`
    );
  }

  /**
   * @param {object} dataset
   * @return {string}
   */
  renderExtractorActive(dataset) {
    let oreExtracting = 0;
    let timeRemaining = '';

    if (dataset.estTime) {
      oreExtracting = 1;
      timeRemaining = `<div>${dataset.estTime} Est. time remaining.</div>`;
    }

    return this.renderer.renderContentHTML(
      'Extractor Active',
      null,
      null,
      `
        <div>${oreExtracting} Ore extracting.</div>
        ${timeRemaining}
      `
    );
  }

  /**
   * @param {object} dataset
   * @return {string}
   */
  renderOreReady(dataset) {
    return this.renderer.renderContentHTML(
      'Ore Ready',
      null,
      null,
      `${dataset.oreReady} Ore remains to be refined.`
    );
  }

  /**
   * @param {object} dataset
   * @return {string}
   */
  renderRefineryActive(dataset) {
    let oreRefining = 0;
    let timeRemaining = '';

    if (dataset.estTime) {
      oreRefining = 1;
      timeRemaining = `<div>${dataset.estTime} Est. time remaining.</div>`;
    }

    return this.renderer.renderContentHTML(
      'Refinery Active',
      null,
      null,
      `
        <div>${oreRefining} Ore refining.</div>
        ${timeRemaining}
      `
    );
  }

  /**
   * @param {object} dataset triggering element's data attributes
   * @return {string}
   */
  build(dataset) {
    let html = '';

    switch (dataset.suiCheatsheet) {
      case 'icon-beacon':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Planetary Beacon',
          'Planetary Structs can be deployed to this location.'
        );
        break;
      case 'icon-blocked':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Blocked',
          'Structs cannot be deployed to this location.'
        );
        break;
      case 'icon-cmd-post':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Command Post',
          'Only the Command Ship can be deployed to this location.'
        );
        break;
      case 'icon-enemy-tile':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Enemy Territory',
          'Structs cannot be deployed in Enemy Territory.'
        );
        break;
      case 'icon-fleet-tile':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Fleet Territory',
          'Fleet Structs can be deployed to this location.'
        );
        break;
      case 'icon-unknown-territory':
        html = this.renderer.renderContentForEmptyTileHTML(
          'Unknown Territory',
          'There is nothing of interest here yet.'
        );
        break;
      case 'icon-undiscovered-ore':
        html = this.renderUndiscoveredOre(dataset);
        break;
      case 'extractor-active':
        html = this.renderExtractorActive(dataset);
        break;
      case 'icon-ore-ready':
        html = this.renderOreReady(dataset);
        break;
      case 'refinery-active':
        html = this.renderRefineryActive(dataset);
        break;
      default:
        const structType = this.gameState.structTypes.getStructType(dataset.suiCheatsheet);
        if (structType) {
          if (dataset.selectedProperty) {
            html = this.buildStructPropertyCheatsheet(structType, dataset);
          } else {
            html = this.buildStructCheatsheet(structType, dataset);
          }
        } else {
          throw new Error(`Unknown cheatsheet key: ${dataset.suiCheatsheet}`);
        }

    }

    return html;
  }
}
