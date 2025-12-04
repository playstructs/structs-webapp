import {SUICheatsheetContentBuilder} from "../sui/SUICheatsheetContentBuilder";
import {STRUCT_DESCRIPTIONS, STRUCT_EQUIPMENT_ICON_MAP} from "../constants/StructConstants";
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
      default:
        const structType = this.gameState.structTypes.getStructType(dataset.suiCheatsheet);
        if (structType) {
          html = this.buildStructCheatsheet(structType, dataset);
        } else {
          throw new Error(`Unknown cheatsheet key: ${dataset.suiCheatsheet}`);
        }

    }

    return html;
  }
}