import {AmbitUtil} from "./AmbitUtil";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {STRUCT_ACTIONS} from "../constants/StructConstants";
import {Struct} from "../models/Struct";

/**
 * Single source of truth for whether a struct can be attacked by the struct the
 * player is currently acting with.
 *
 * The map draws invalid targets and the tile selection layer accepts clicks on
 * valid ones, and the two run at different times off different inputs. Sharing
 * the rule keeps a tile from being clickable while it looks invalid, or the
 * reverse.
 */
export class AttackTargetUtil {

  /**
   * @param {GameState} gameState
   * @param {StructManager} structManager
   */
  constructor(gameState, structManager) {
    this.gameState = gameState;
    this.structManager = structManager;
    this.ambitUtil = new AmbitUtil();
  }

  /**
   * A struct in stealth mode is only reachable from its own ambit, regardless of
   * what the attacking weapon would otherwise be able to reach.
   *
   * @param {Struct} attackingStruct
   * @param {Struct} targetStruct
   * @return {boolean}
   */
  isConcealedFrom(attackingStruct, targetStruct) {
    return targetStruct.isHidden()
      && !this.ambitUtil.isSame(attackingStruct.operating_ambit, targetStruct.operating_ambit);
  }

  /**
   * @param {Struct|null} attackingStruct
   * @param {Struct|null} targetStruct
   * @param {string[]} weaponAmbitsArray - Valid target ambits for the weapon (e.g. ["space", "air"])
   * @return {boolean}
   */
  isValidTarget(attackingStruct, targetStruct, weaponAmbitsArray) {
    if (!attackingStruct || !targetStruct || !weaponAmbitsArray) {
      return false;
    }

    if (targetStruct.owner === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id) {
      return false;
    }

    if (!this.ambitUtil.contains(
      weaponAmbitsArray,
      targetStruct.operating_ambit,
      attackingStruct.operating_ambit
    )) {
      return false;
    }

    return !this.isConcealedFrom(attackingStruct, targetStruct);
  }

  /**
   * @param {string|null} targetStructId
   * @param {Struct|null} attackingStruct
   * @param {string[]} weaponAmbitsArray
   * @return {boolean}
   */
  isValidTargetById(targetStructId, attackingStruct, weaponAmbitsArray) {
    return this.isValidTarget(
      attackingStruct,
      this.structManager.getStructById(targetStructId),
      weaponAmbitsArray
    );
  }

  /**
   * The ambits the action bar's active weapon can currently target, derived from
   * the action bar rather than from the event that opened targeting mode, so a
   * re-evaluation mid-selection reads the same state the click handler will.
   *
   * @return {string[]|null} null when the action bar is not in attack mode
   */
  getActiveWeaponAmbitsArray() {
    const attackingStruct = this.gameState.actionBarLock.getActionSourceStruct();

    if (!attackingStruct) {
      return null;
    }

    const structType = this.gameState.structTypes.getStructTypeById(attackingStruct.type);

    if (!structType) {
      return null;
    }

    switch (this.gameState.actionBarLock.getCurrentAction()) {
      case STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON:
        return structType.primary_weapon_ambits_array;
      case STRUCT_ACTIONS.ATTACK_SECONDARY_WEAPON:
        return structType.secondary_weapon_ambits_array;
      default:
        return null;
    }
  }
}
