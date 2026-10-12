<?php

namespace App\Matrix;

use Psr\Cache\CacheItemPoolInterface;

/**
 * Fixed-window attempt counting for /api/auth/matrix, by address and by IP.
 *
 * Every attempt costs a full MAS chain plus a signature check against
 * structsd, so this sits in front of both. A legitimate client signs in about
 * once per page load; the limits are generous against that and tight against
 * a loop. Counters live in the app cache, so on a multi-replica deployment
 * without a shared cache they are per replica, which still bounds the rate.
 */
class SignInRateLimiter
{
    public const int WINDOW_SECONDS = 600;

    public const int ADDRESS_LIMIT = 12;

    public const int IP_LIMIT = 60;

    public function __construct(private readonly CacheItemPoolInterface $cache)
    {
    }

    /**
     * Records one attempt and says whether it may proceed. Refused attempts
     * are counted too, so hammering the endpoint extends the lockout.
     *
     * @return int|null seconds until the window resets when refused, null when allowed
     */
    public function attempt(string $address, string $ip): ?int
    {
        $retryAfter = null;

        foreach ([['address', $address, self::ADDRESS_LIMIT], ['ip', $ip, self::IP_LIMIT]] as [$kind, $subject, $limit]) {
            if ($subject === '') {
                continue;
            }

            $wait = $this->count($kind, $subject, $limit);

            if ($wait !== null) {
                $retryAfter = max($retryAfter ?? 0, $wait);
            }
        }

        return $retryAfter;
    }

    private function count(string $kind, string $subject, int $limit): ?int
    {
        $item = $this->cache->getItem('matrix_signin_rate_' . $kind . '_' . sha1($subject));
        $state = $item->isHit() && is_array($item->get()) ? $item->get() : null;
        $now = time();

        if ($state === null || !isset($state['reset_at']) || $state['reset_at'] <= $now) {
            $state = ['count' => 0, 'reset_at' => $now + self::WINDOW_SECONDS];
        }

        $state['count']++;

        $item->set($state);
        $item->expiresAt((new \DateTimeImmutable())->setTimestamp((int) $state['reset_at']));
        $this->cache->save($item);

        return $state['count'] > $limit ? max(1, (int) $state['reset_at'] - $now) : null;
    }
}
