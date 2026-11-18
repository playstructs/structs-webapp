import {TASK} from "./TaskConstants";

export const SECTOR_BLITZ_PHASES = Object.freeze({
  NONE: 'none',
  ACTIVE: 'active',
  RESULTS: 'results',
});

/** How long the results stay visible after a contest's end block. */
const RESULTS_DISPLAY_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * The scoring sectors. Map positions are percentages of the sector map image,
 * measured from the Figma Sector Map (Large Viewport Scenario).
 */
export const SECTORS = Object.freeze([
  Object.freeze({
    id: 44,
    label: 'Sector 044',
    light: 'teal',
    mapX: 19.4,
    mapY: 54.6,
    labelSide: 'right',
  }),
  Object.freeze({
    id: 127,
    label: 'Sector 127',
    light: 'yellow',
    mapX: 68.7,
    mapY: 76.9,
    labelSide: 'left',
  }),
  Object.freeze({
    id: 999,
    label: 'Sector 999',
    light: 'purple',
    mapX: 65.8,
    mapY: 32.6,
    labelSide: 'left',
  }),
]);

export const SECTOR_BLITZ = Object.freeze({
  NAME: 'Sector Blitz',
  RESULTS_DISPLAY_MS: RESULTS_DISPLAY_MS,
  RESULTS_DISPLAY_BLOCKS: Math.ceil(RESULTS_DISPLAY_MS / TASK.ESTIMATED_BLOCK_TIME),
  CONTEST_REFRESH_MS: 60 * 1000,
  LEADERBOARD_PAGE_SIZE: 10,
  /** Guilds shown in the Fleet card legend and bars. */
  FLEET_CARD_TOP_GUILDS: 3,
  /** Guilds named on the Sector Results podium. */
  RESULTS_TOP_GUILDS: 4,
  /** Players named on the Sector Results podium. */
  RESULTS_TOP_PLAYERS: 3,
  /** Live updates are coalesced into at most one page refresh per interval. */
  LIVE_REFRESH_THROTTLE_MS: 5000,
  /** The public leaderboard refreshes 30-60 seconds after each load, at a random point. */
  PUBLIC_REFRESH_MIN_MS: 30 * 1000,
  PUBLIC_REFRESH_JITTER_MS: 30 * 1000,
  PUBLIC_BATTLES_PAGE_SIZE: 5,
  INFLUENCE_ICON_HTML: '<i class="sui-icon sector-blitz-influence-icon"></i>',
});

/** Bar colour classes by overall guild position (1st, 2nd, 3rd, everyone else). */
export const SECTOR_BLITZ_GUILD_COLOURS = Object.freeze([
  'sector-blitz-colour-first',
  'sector-blitz-colour-second',
  'sector-blitz-colour-third',
]);

export const SECTOR_BLITZ_OTHER_COLOUR = 'sector-blitz-colour-other';

/** Legend icons, matching SECTOR_BLITZ_GUILD_COLOURS (green, yellow, red). */
export const SECTOR_BLITZ_LEGEND_ICONS = Object.freeze([
  'sui-icon-player-indicator',
  'sui-icon-neutral-indicator',
  'sui-icon-enemy-indicator',
]);

/** Legend icon for everyone else (plum), matching SECTOR_BLITZ_OTHER_COLOUR. */
export const SECTOR_BLITZ_OTHER_LEGEND_ICON = 'sui-icon-other-indicator';

export const SECTOR_BLITZ_ALERTS = Object.freeze({
  START: 'start',
  RESULTS: 'results',
});
