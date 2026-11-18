import {PublicSectorBlitzAPI} from "./api/PublicSectorBlitzAPI";
import {PublicLeaderboardPage} from "./view_models/sector_blitz/PublicLeaderboardPage";
import {SUITooltip} from "./sui/SUITooltip";

/**
 * Entry point for the public Sector Blitz leaderboard (/sector-blitz), which needs no account.
 * It loads none of the game.
 */
const root = document.getElementById('public-leaderboard');
if (root) {
  new SUITooltip().autoInitAll();
  new PublicLeaderboardPage(root, new PublicSectorBlitzAPI()).start();
}
