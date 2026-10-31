<?php

namespace App\Manager;

use Psr\Cache\CacheItemPoolInterface;
use RuntimeException;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Lock\LockFactory;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;

/** Share exact-height native evidence and bound work on cache misses. */
class RetainedFundsReadCache
{
    public function __construct(
        private CacheItemPoolInterface $retainedFundsCache,
        private LockFactory $lockFactory,
        private RateLimiterFactoryInterface $retainedFundsClientLimiter,
        private RateLimiterFactoryInterface $retainedFundsGlobalLimiter,
        private RequestStack $requestStack,
    ) {
    }

    public function read(string $ownerId, string $identity, int $cost, callable $fetch): array
    {
        if ($cost < 1 || $cost > 33) {
            throw new RuntimeException('Invalid retained-funds query cost');
        }
        // One slot per owner, not a new filesystem entry for every block.
        $key = 'retained-funds.' . hash('sha256', $ownerId);
        $item = $this->retainedFundsCache->getItem($key);
        $cached = $item->isHit() ? $item->get() : null;
        if (is_array($cached) && ($cached['identity'] ?? null) === $identity) {
            return $cached['data'];
        }

        $lock = $this->lockFactory->createLock($key);
        if (!$lock->acquire()) {
            throw new RuntimeException('Retained-funds verification is already in progress');
        }
        try {
            // A different PHP worker may have finished before this lock arrived.
            $item = $this->retainedFundsCache->getItem($key);
            $cached = $item->isHit() ? $item->get() : null;
            if (is_array($cached) && ($cached['identity'] ?? null) === $identity) {
                return $cached['data'];
            }
            $client = $this->requestStack->getMainRequest()?->getClientIp() ?? 'unavailable';
            if (!$this->retainedFundsClientLimiter->create($client)->consume($cost)->isAccepted()
                || !$this->retainedFundsGlobalLimiter->create('all')->consume($cost)->isAccepted()) {
                throw new RuntimeException('Retained-funds native query budget is unavailable');
            }
            $data = $fetch();
            $item->set(['identity' => $identity, 'data' => $data])->expiresAfter(60);
            if (!$this->retainedFundsCache->save($item)) {
                throw new RuntimeException('Retained-funds evidence could not be cached');
            }

            return $data;
        } finally {
            $lock->release();
        }
    }
}
