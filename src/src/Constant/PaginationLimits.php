<?php

namespace App\Constant;

class PaginationLimits
{
    const int DEFAULT = 100;

    const int MAX = 1000;

    const int LEADERBOARD_DEFAULT = 50;

    const int BATCH_IDS_MAX = 25;

    const int AGGREGATE_MAX_SECONDS = 2592000;

    /**
     * Accepts a raw query-string value so callers do not each repeat the
     * null/empty-string dance before casting.
     */
    public static function clamp(int|string|null $limit, int $default = self::DEFAULT): int
    {
        if ($limit === null || $limit === '' || (int) $limit < 1) {
            return $default;
        }

        return min(self::MAX, (int) $limit);
    }
}