import {MenuPage} from "../framework/MenuPage";

/**
 * RAID for targets that can be raided now, VIEW for those that can't (already under attack).
 * Both open the Raid Preview, which only offers Launch Fleet for a raidable target.
 */
export class RaidTarget {

  /**
   * @param {{under_attack: *, planet_id: ?string}} target
   * @return {boolean}
   */
  static isRaidable(target) {
    const underAttack = target.under_attack === true || Number(target.under_attack) === 1;
    return !!target.planet_id && !underAttack;
  }

  /**
   * @param {object} target
   * @return {string}
   */
  static buttonLabel(target) {
    return RaidTarget.isRaidable(target) ? 'Raid' : 'View';
  }

  /**
   * @param {object} target
   * @return {string} the fleet status badge HTML
   */
  static statusBadgeHTML(target) {
    if (target.under_attack === true || Number(target.under_attack) === 1) {
      return `<span class="sui-badge sui-mod-destructive">Under Attack</span>`;
    }
    if (target.fleet_status === 'away') {
      return `<span class="sui-badge sui-mod-default">Fleet Away</span>`;
    }
    return `<span class="sui-badge sui-mod-warning">On Station</span>`;
  }

  /**
   * Open the Raid Preview for a target.
   *
   * @param {GuildAPI} guildAPI
   * @param {{id: string, planet_id: string, undiscovered_ore: *, ore: *}} target
   */
  static preview(guildAPI, target) {
    guildAPI.getActivePlanetRaidByPlanetId(target.planet_id).then(planetRaid => {
      MenuPage.router.goto('Fleet', 'preview', {
        planet_id: target.planet_id,
        planet_undiscovered_ore: target.undiscovered_ore ? target.undiscovered_ore : 0,
        defender_id: target.id,
        defender_ore: target.ore ? target.ore : 0,
        attacker_id: planetRaid.isRaidActive() ? planetRaid.fleet_owner : null
      });
    });
  }
}
