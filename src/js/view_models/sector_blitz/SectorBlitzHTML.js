import {
  SECTOR_BLITZ,
  SECTOR_BLITZ_GUILD_COLOURS,
  SECTOR_BLITZ_LEGEND_ICONS,
  SECTOR_BLITZ_OTHER_COLOUR,
  SECTOR_BLITZ_OTHER_LEGEND_ICON,
  SECTORS
} from "../../constants/SectorBlitzConstants";
import {SectorBlitzFormat} from "../../util/SectorBlitzFormat";
import {PfpViewerComponent} from "../components/PfpViewerComponent";
import {PfpClientRenderAttributes} from "../../models/PfpClientRenderAttributes";
import {RaidTarget} from "../../util/RaidTarget";

/**
 * Markup shared by the in-game Sector Blitz pages and the public leaderboard (/sector-blitz).
 * Every function is pure: it takes contest API rows and returns HTML.
 */
export class SectorBlitzHTML {

  /**
   * @param {string} message
   * @return {string}
   */
  static emptyHTML(message = 'No Activity') {
    return `<div class="sector-blitz-empty">${message}</div>`;
  }

  /**
   * A sector name with a chevron. With an href it is a real link; otherwise the caller
   * handles clicks through data-sector-link.
   *
   * @param {number} sectorId
   * @param {string|null} href
   * @return {string}
   */
  static sectorLinkHTML(sectorId, href = null) {
    const target = href ? SectorBlitzFormat.escape(href) : 'javascript: void(0)';
    return `
      <a href="${target}" class="sector-blitz-sector-link sui-text-header" data-sector-link="${sectorId}">
        ${SectorBlitzFormat.sectorLabel(sectorId)}
        <i class="sui-icon sui-icon-sm icon-chevron-right sui-text-secondary"></i>
      </a>
    `;
  }

  /**
   * @param {object[]} overall ranked guilds with profiles
   * @return {Map<string, object>}
   */
  static profilesById(overall) {
    return new Map(overall.map(row => [row.guild_id, row.profile]));
  }

  /**
   * @param {object[]} rows standings rows for one sector
   * @return {object[]} the sector's leaders (several when tied), empty if nobody scored
   */
  static sectorLeaders(rows) {
    return rows.filter(row => row.sector_rank === '1' && BigInt(row.points) > 0n);
  }

  /**
   * @param {object[]} leaders
   * @param {Map<string, object>} profiles
   * @param {boolean} useTag
   * @return {string}
   */
  static guildNames(leaders, profiles, useTag) {
    return leaders.map(row => {
      const profile = profiles.get(row.guild_id);
      if (useTag && profile?.tag) {
        return `[${SectorBlitzFormat.escape(profile.tag)}]`;
      }
      return SectorBlitzFormat.guildName(profile, row.guild_id);
    }).join(' / ');
  }

  /**
   * @param {object[]} overall
   * @return {string[]} the guilds that get their own bar colour and legend entry
   */
  static topGuildIds(overall) {
    return overall.slice(0, SECTOR_BLITZ.FLEET_CARD_TOP_GUILDS).map(row => row.guild_id);
  }

  /**
   * One sector's control bar: everyone else on the left, then 3rd, 2nd and the overall leader.
   *
   * @param {object[]} rows standings rows for the sector
   * @param {string[]} topGuilds
   * @return {string}
   */
  static sectorBarHTML(rows, topGuilds) {
    const total = rows.reduce((sum, row) => sum + BigInt(row.points), 0n);
    if (total <= 0n) {
      return `<div class="sector-blitz-bar sector-blitz-bar-empty"></div>`;
    }

    const pointsFor = guildId => BigInt(rows.find(row => row.guild_id === guildId)?.points ?? '0');
    const topPoints = topGuilds.map(pointsFor);
    const otherPoints = total - topPoints.reduce((sum, points) => sum + points, 0n);
    const segment = (points, colourClass) => points > 0n
      ? `<div class="sector-blitz-bar-segment ${colourClass}" style="flex-grow: ${Number((points * 10000n) / total)}"></div>`
      : '';

    return `
      <div class="sector-blitz-bar">
        ${segment(otherPoints, SECTOR_BLITZ_OTHER_COLOUR)}
        ${topPoints.map((points, i) => ({points, i})).reverse()
          .map(({points, i}) => segment(points, SECTOR_BLITZ_GUILD_COLOURS[i])).join('')}
      </div>
    `;
  }

  /**
   * Sector rows with their leading guild's tag and control bar.
   *
   * @param {object[]} standings
   * @param {object[]} overall
   * @param {function(number): string} labelFn the sector name (a link, or plain text)
   * @param {number[]} sectorIds
   * @return {string}
   */
  static sectorsHTML(standings, overall, labelFn, sectorIds = SECTORS.map(sector => sector.id)) {
    const profiles = SectorBlitzHTML.profilesById(overall);
    const topGuilds = SectorBlitzHTML.topGuildIds(overall);

    return sectorIds.map(sectorId => {
      const rows = standings.filter(row => Number(row.sector) === sectorId);
      const leaders = SectorBlitzHTML.sectorLeaders(rows);
      return `
        <div class="sector-blitz-sector-row">
          <div class="sector-blitz-sector-row-header">
            ${labelFn(sectorId)}
            <span class="sui-text-header sui-text-hint">${leaders.length ? SectorBlitzHTML.guildNames(leaders, profiles, true) : ''}</span>
          </div>
          ${SectorBlitzHTML.sectorBarHTML(rows, topGuilds)}
        </div>
      `;
    }).join('');
  }

  /**
   * The colour key for the top guilds and everyone else; empty before anyone scores.
   *
   * @param {object[]} overall
   * @return {string}
   */
  static legendHTML(overall) {
    const profiles = SectorBlitzHTML.profilesById(overall);
    const topGuilds = SectorBlitzHTML.topGuildIds(overall);
    if (!topGuilds.length) {
      return '';
    }

    return `
      <div class="sector-blitz-legend">
        ${topGuilds.map((guildId, i) => `
          <span class="sector-blitz-legend-item sui-text-header">
            <i class="${SECTOR_BLITZ_LEGEND_ICONS[i]}"></i>
            ${SectorBlitzFormat.guildName(profiles.get(guildId), guildId)}
          </span>
        `).join('')}
        <span class="sector-blitz-legend-item sui-text-header">
          <i class="${SECTOR_BLITZ_OTHER_LEGEND_ICON}"></i>
          Other
        </span>
      </div>
    `;
  }

  /**
   * The winning guild and each sector's winner.
   *
   * @param {object[]} standings
   * @param {object[]} overall
   * @param {function(number): string} labelFn the sector name (a link, or plain text)
   * @return {string}
   */
  static resultsHTML(standings, overall, labelFn) {
    const profiles = SectorBlitzHTML.profilesById(overall);
    const winners = overall.filter(row => row.rank === '1' && row.sectors_controlled > 0);
    const winnerHTML = winners.length
      ? winners.map(row => SectorBlitzFormat.guildName(row.profile, row.guild_id)).join(' / ')
      : 'No Winner';

    const sectorsHTML = SECTORS.map(sector => {
      const leaders = SectorBlitzHTML.sectorLeaders(standings.filter(row => Number(row.sector) === sector.id));
      return `
        <div class="sector-blitz-results-sector">
          ${labelFn(sector.id)}
          <div class="sui-text-header">${leaders.length ? SectorBlitzHTML.guildNames(leaders, profiles, false) : '&mdash;'}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="sector-blitz-results-winner">
        <div class="sui-text-header">Winning Guild</div>
        <div class="sui-text-display sui-text-secondary">${winnerHTML}</div>
      </div>
      <div class="sector-blitz-results-sectors">${sectorsHTML}</div>
    `;
  }

  /**
   * @param {object|null} profile
   * @return {string}
   */
  static guildIconHTML(profile) {
    if (profile?.logo) {
      return `
        <div class="sui-result-row-portrait">
          <img class="sui-result-row-portrait-image sector-blitz-guild-logo" src="${SectorBlitzFormat.escape(profile.logo)}" alt="">
        </div>
      `;
    }
    return `
      <div class="sui-result-row-portrait sector-blitz-guild-placeholder sui-text-secondary">
        <i class="sui-icon sui-icon-md icon-unknown"></i>
      </div>
    `;
  }

  /**
   * @param {string} points
   * @param {string} rank
   * @return {string}
   */
  static scoreHTML(points, rank) {
    return `
      <div class="sui-result-row-resources">
        <a class="sui-resource" href="javascript: void(0)" data-sui-tooltip="Influence Points">
          <span>${SectorBlitzFormat.points(points)}</span>
          ${SECTOR_BLITZ.INFLUENCE_ICON_HTML}
        </a>
        <div class="sector-blitz-rank">${SectorBlitzFormat.rank(rank)}</div>
      </div>
    `;
  }

  /**
   * @param {object} row guild rank row
   * @return {string} the guild's logo and name
   */
  static guildInfoHTML(row) {
    return `
      <div class="sui-result-row-left-section">
        ${SectorBlitzHTML.guildIconHTML(row.profile)}
        <div class="sui-result-row-player-info">
          <div class="sui-text-label-block">${SectorBlitzFormat.guildName(row.profile, row.guild_id)}</div>
        </div>
      </div>
    `;
  }

  /**
   * @param {object} row guild rank row
   * @param {string} actionHTML e.g. a View button
   * @return {string}
   */
  static guildRowHTML(row, actionHTML = '') {
    return `
      <div class="sui-result-row">
        ${SectorBlitzHTML.guildInfoHTML(row)}
        <div class="sui-result-row-right-section">
          ${SectorBlitzHTML.scoreHTML(row.points, row.rank)}
          ${actionHTML}
        </div>
      </div>
    `;
  }

  /**
   * @param {string} tooltip
   * @param {string} value
   * @param {string} iconHTML
   * @return {string}
   */
  static resourceHTML(tooltip, value, iconHTML = '') {
    return `
      <a class="sui-resource" href="javascript: void(0)" data-sui-tooltip="${tooltip}" data-sui-mod-placement="bottom">
        <span>${value}</span>
        ${iconHTML}
      </a>
    `;
  }

  /**
   * A public Top Guilds row: sectors controlled across the whole event, then influence and
   * position in the listed scope (the event, or one sector).
   *
   * @param {object} row guild rank row
   * @return {string}
   */
  static publicGuildRowHTML(row) {
    return `
      <div class="sui-result-row">
        ${SectorBlitzHTML.guildInfoHTML(row)}
        <div class="sui-result-row-right-section sector-blitz-public-guild-stats">
          <div class="sui-result-row-resources">
            ${SectorBlitzHTML.resourceHTML('Sectors Controlled', SectorBlitzFormat.points(row.sectors_controlled), SECTOR_BLITZ.SECTOR_ICON_HTML)}
            ${SectorBlitzHTML.resourceHTML('Influence Points', SectorBlitzFormat.points(row.points), SECTOR_BLITZ.INFLUENCE_ICON_HTML)}
            ${SectorBlitzHTML.resourceHTML('Position', SectorBlitzFormat.rank(row.rank))}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * One side of a battle: portrait, tag and name, and a Defender or Attacker badge.
   * The attacker's side is mirrored, portrait on the right.
   *
   * @param {object|null} side {player_id, username, tag, pfp_client_render_attributes}
   * @param {boolean} isDefender
   * @return {string}
   */
  static combatantHTML(side, isDefender) {
    const tag = side?.tag ? `<span class="sui-text-secondary">[${SectorBlitzFormat.escape(side.tag)}]</span>` : '';
    const name = side?.username
      ? SectorBlitzFormat.escape(side.username)
      : `PID #${SectorBlitzFormat.escape(side?.player_id ?? '?')}`;
    const badge = isDefender
      ? `<span class="sui-badge sui-mod-default">Defender</span>`
      : `<span class="sui-badge sui-mod-destructive">Attacker</span>`;

    return `
      <div class="public-battle-side public-battle-${isDefender ? 'defender' : 'attacker'}">
        ${SectorBlitzHTML.portraitHTML(side?.pfp_client_render_attributes)}
        <div class="public-battle-info">
          <div class="sui-text-header public-battle-name">${isDefender ? `${tag} ${name}` : `${name} ${tag}`}</div>
          ${badge}
        </div>
      </div>
    `;
  }

  /**
   * A Current Battles row: defender, VS, attacker, then an optional action (e.g. Spectate).
   *
   * @param {object|null} defender see combatantHTML
   * @param {object|null} attacker see combatantHTML
   * @param {string} actionHTML
   * @return {string}
   */
  static battleRowHTML(defender, attacker, actionHTML = '') {
    return `
      <div class="sui-result-row public-battle-row">
        ${SectorBlitzHTML.combatantHTML(defender, true)}
        <div class="sui-text-display public-battle-vs">VS</div>
        ${SectorBlitzHTML.combatantHTML(attacker, false)}
        ${actionHTML}
      </div>
    `;
  }

  /**
   * @param {object} row player rank row
   * @return {object} raid target fields
   */
  static toTarget(row) {
    return {
      id: row.player_id,
      planet_id: row.profile?.planet_id,
      undiscovered_ore: row.profile?.undiscovered_ore,
      ore: row.profile?.ore,
      under_attack: row.profile?.under_attack,
      fleet_status: row.profile?.fleet_status,
    };
  }

  /**
   * @param {string|null|undefined} attributes
   * @return {string}
   */
  static portraitHTML(attributes) {
    const pfpViewer = new PfpViewerComponent(PfpClientRenderAttributes.fromJson(attributes ?? null));
    return `
      <div class="sui-result-row-portrait">
        <div class="sui-result-row-portrait-image">${pfpViewer.renderHTML()}</div>
      </div>
    `;
  }

  /**
   * @param {object} row player rank row
   * @param {string} actionHTML e.g. a raid button
   * @return {string}
   */
  static playerRowHTML(row, actionHTML = '') {
    return `
      <div class="sui-result-row">
        <div class="sui-result-row-left-section">
          ${SectorBlitzHTML.portraitHTML(row.profile?.pfp_client_render_attributes)}
          <div class="sui-result-row-player-info">
            <div class="sui-text-label-block">
              ${SectorBlitzFormat.playerName(row.profile, row.player_id)}<br>
              ${RaidTarget.statusBadgeHTML(SectorBlitzHTML.toTarget(row))}
            </div>
          </div>
        </div>
        <div class="sui-result-row-right-section">
          ${SectorBlitzHTML.scoreHTML(row.points, row.rank)}
          ${actionHTML}
        </div>
      </div>
    `;
  }

  /**
   * Places follow the shared ranks, so tied entries get the same label.
   *
   * @param {object[]} rows
   * @param {function(object): string} nameFn
   * @return {string}
   */
  static placeNamesHTML(rows, nameFn) {
    const places = {'1': 'Tied First', '2': 'Second Place', '3': 'Third Place', '4': 'Fourth Place'};
    return rows.map(row => `
      <div class="sector-blitz-podium-place">
        <div class="sui-text-header sui-text-hint">${places[row.rank] ?? SectorBlitzFormat.rank(row.rank)}</div>
        <div class="sui-text-header sector-blitz-podium-name">${nameFn(row)}</div>
      </div>
    `).join('');
  }

  /**
   * The Sector Results card: the sector's top guilds and top players.
   *
   * @param {number} sectorId
   * @param {object[]} podiumGuilds
   * @param {object[]} podiumPlayers
   * @return {string}
   */
  static sectorResultsCardHTML(sectorId, podiumGuilds, podiumPlayers) {
    const guildName = row => SectorBlitzFormat.guildName(row.profile, row.guild_id);
    const playerName = row => SectorBlitzFormat.playerName(row.profile, row.player_id);
    const [topGuild, ...otherGuilds] = podiumGuilds;
    const [topPlayer, ...otherPlayers] = podiumPlayers;

    const guildsHTML = topGuild
      ? `
        <div class="sector-blitz-podium">
          <div class="sector-blitz-podium-leader">
            <div class="sui-text-header sui-text-hint">Top Guild</div>
            <div class="sui-text-display sui-text-secondary">${guildName(topGuild)}</div>
          </div>
          <div class="sector-blitz-podium-places">${SectorBlitzHTML.placeNamesHTML(otherGuilds, guildName)}</div>
        </div>
      `
      : '';
    const playersHTML = topPlayer
      ? `
        <div class="sector-blitz-podium">
          <div class="sector-blitz-podium-leader">
            <div class="sui-text-header sui-text-hint">Top Player</div>
            <div class="sui-text-display">${playerName(topPlayer)}</div>
          </div>
          <div class="sector-blitz-podium-places">${SectorBlitzHTML.placeNamesHTML(otherPlayers, playerName)}</div>
        </div>
      `
      : '';

    return `
      <div class="sui-data-card sector-blitz-fleet-card sector-blitz-fleet-card-results">
        <div class="sector-blitz-fleet-card-header">
          <div class="sector-blitz-title">
            <i class="sui-icon sui-icon-md icon-guild sui-text-primary"></i>
            <div class="sector-blitz-title-text">
              <div class="sui-text-header sui-text-primary">Sector Results</div>
              <div class="sui-text-header">${SectorBlitzFormat.sectorLabel(sectorId)}</div>
            </div>
          </div>
        </div>
        ${guildsHTML || playersHTML ? `${guildsHTML}${playersHTML}` : SectorBlitzHTML.emptyHTML('No Activity in Sector')}
      </div>
    `;
  }
}
