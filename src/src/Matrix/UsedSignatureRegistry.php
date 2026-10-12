<?php

namespace App\Matrix;

use App\Manager\SignatureValidationManager;
use Psr\Cache\CacheItemPoolInterface;

/**
 * Makes each login signature single-use for /api/auth/matrix.
 *
 * A signature is accepted for MSG_EXPIRY_TIME after its timestamp, which is
 * long enough for one that leaks to be replayed for a second Matrix session.
 * Remembering each accepted signature for that window closes the gap; after it
 * the timestamp check refuses the signature anyway, so nothing has to be kept
 * longer.
 */
class UsedSignatureRegistry
{
    public function __construct(private readonly CacheItemPoolInterface $cache)
    {
    }

    /**
     * Claims the signature. False when it has already been claimed.
     */
    public function claim(string $signature): bool
    {
        $item = $this->cache->getItem('matrix_signin_used_' . hash('sha256', $signature));

        if ($item->isHit()) {
            return false;
        }

        $item->set(true);
        $item->expiresAfter(SignatureValidationManager::MSG_EXPIRY_TIME);
        $this->cache->save($item);

        return true;
    }
}
