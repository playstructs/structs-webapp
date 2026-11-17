import {SECTORS} from "../constants/SectorBlitzConstants";

/**
 * Display helpers shared by the Sector Blitz pages.
 */
export class SectorBlitzFormat {

  /**
   * Escape text from the chain or guild configuration before it is placed in HTML.
   *
   * @param {*} value
   * @return {string}
   */
  static escape(value) {
    return `${value ?? ''}`
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Compact points: 920, 6.3k, 10.1k, 1.2M. Truncates rather than rounds up.
   *
   * @param {string|number} value exact decimal string
   * @return {string}
   */
  static points(value) {
    const digits = `${value ?? '0'}`.replace(/^0+(?=\d)/, '');
    if (!/^\d+$/.test(digits)) return '0';
    if (digits.length <= 3) return digits;
    const units = ['', 'k', 'M', 'G', 'T', 'P'];
    const group = Math.min(Math.floor((digits.length - 1) / 3), units.length - 1);
    const whole = digits.slice(0, digits.length - group * 3);
    const tenth = digits.charAt(digits.length - group * 3);
    return `${whole}${tenth !== '0' && whole.length < 3 ? `.${tenth}` : ''}${units[group]}`;
  }

  /**
   * @param {string|number|null} rank
   * @return {string} e.g. #001, #099, #1234
   */
  static rank(rank) {
    if (rank === null || rank === undefined) return '';
    return `#${`${rank}`.padStart(3, '0')}`;
  }

  /**
   * @param {number} ms
   * @return {string} e.g. 4D 23H 16M
   */
  static remaining(ms) {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;
    return `${days}D ${hours}H ${minutes}M`;
  }

  /**
   * @param {number} sectorId
   * @return {string} e.g. Sector 044
   */
  static sectorLabel(sectorId) {
    return SECTORS.find(sector => sector.id === Number(sectorId))?.label
      ?? `Sector ${`${sectorId}`.padStart(3, '0')}`;
  }

  /**
   * @param {number} sectorId
   * @return {string} e.g. 044
   */
  static sectorNumber(sectorId) {
    return `${sectorId}`.padStart(3, '0');
  }

  /**
   * @param {{name: ?string, tag: ?string}|null} profile
   * @param {string} guildId
   * @return {string} escaped guild name
   */
  static guildName(profile, guildId) {
    return SectorBlitzFormat.escape(profile?.name || profile?.tag || `Guild ${guildId}`);
  }

  /**
   * @param {object|null} profile
   * @param {string} playerId
   * @return {string} escaped "[TAG] NAME" HTML
   */
  static playerName(profile, playerId) {
    const tag = profile?.tag
      ? `<span class="sui-text-secondary">[${SectorBlitzFormat.escape(profile.tag)}]</span> `
      : '';
    const name = profile?.username ? SectorBlitzFormat.escape(profile.username) : `PID #${SectorBlitzFormat.escape(playerId)}`;
    return `${tag}${name}`;
  }

  /**
   * "A", "A and B", "A, B, and C"
   *
   * @param {string[]} items
   * @return {string}
   */
  static list(items) {
    if (items.length <= 1) return items.join('');
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  }
}
