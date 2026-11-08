<?php

namespace App\Util;

use Psr\Cache\CacheItemPoolInterface;
use Psr\Cache\InvalidArgumentException;

/**
 * Counts requests per key in fixed time windows, using the app cache.
 *
 * Built for unauthenticated endpoints. It is deliberately coarse: concurrent
 * requests can race on the same counter, which only lets a few extra through.
 */
class FixedWindowRateLimiter
{
    public function __construct(
        private readonly CacheItemPoolInterface $cache,
        private readonly string $namespace,
        private readonly int $limit,
        private readonly int $windowSeconds
    ) {
    }

    /**
     * Records one request for the key and reports whether it is within the limit.
     *
     * @throws InvalidArgumentException
     */
    public function consume(string $key): bool
    {
        $window = intdiv(time(), $this->windowSeconds);
        // Cache keys may not contain reserved characters such as ':' (IPv6), so hash the key.
        $item = $this->cache->getItem("{$this->namespace}.{$window}." . hash('sha256', $key));

        $count = $item->isHit() ? (int) $item->get() : 0;
        $count++;

        $item->set($count);
        $item->expiresAfter($this->windowSeconds);
        $this->cache->save($item);

        return $count <= $this->limit;
    }
}
