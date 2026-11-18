<?php

namespace App\Constant;

/**
 * Manually toggled feature switches for the back end. Keep these in step with
 * the front end's js/constants/FeatureFlags.js.
 */
final class FeatureFlags
{
    /**
     * Sector Blitz (sector control contests, a.k.a. influence contests).
     *
     * When false the public leaderboard page (/sector-blitz) and its public API
     * (/api/public/sector-blitz) answer 404.
     */
    public const bool SECTOR_BLITZ = true;
}
