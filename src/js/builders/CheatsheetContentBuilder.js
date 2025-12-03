import {SUICheatsheetContentBuilder} from "../sui/SUICheatsheetContentBuilder";
import {STRUCT_DESCRIPTIONS, STRUCT_EQUIPMENT_ICON_MAP} from "../constants/StructConstants";
import {AMBIT_ORDER} from "../constants/Ambits";
import {StructType} from "../models/StructType";

export class CheatsheetContentBuilder extends SUICheatsheetContentBuilder {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super();
    this.gameState = gameState;
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
   * @param {string} abilityType
   * @param {string} abilityLabel
   * @param {string} notEquippedValue
   * @return {string}
   */
  renderAbilityProperty(abilityType, abilityLabel, notEquippedValue) {
    if (!abilityType || abilityType === notEquippedValue) {
      return '';
    }

    const iconClass = STRUCT_EQUIPMENT_ICON_MAP[abilityType];

    return `
      <div class="sui-cheatsheet-property">
        <div class="sui-cheatsheet-property-icon">
          <i class="sui-icon sui-icon-md ${iconClass}"></i>
        </div>
        <div class="sui-cheatsheet-property-info">
          <div>${abilityLabel}</div>
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

    propertiesHTML += this.renderAbilityProperty(
      structType.unit_defenses,
      structType.unit_defenses_label,
      'noUnitDefenses'
    );

    propertiesHTML += this.renderAbilityProperty(
      structType.ore_reserve_defenses,
      structType.ore_reserve_defenses_label,
      'noOreReserveDefenses'
    );

    propertiesHTML += this.renderAbilityProperty(
      structType.planetary_defenses,
      structType.planetary_defenses_label,
      'noPlanetaryDefense'
    );

    propertiesHTML += this.renderAbilityProperty(
      structType.power_generation,
      structType.power_generation_label,
      'noPowerGeneration'
    );

    return this.renderer.renderContentHTML(
      structType.class,
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