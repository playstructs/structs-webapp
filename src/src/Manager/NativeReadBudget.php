<?php

namespace App\Manager;

use App\Util\ClientKey;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use UnexpectedValueException;

/** Bounds native chain reads made on behalf of API clients, per client and in total. */
class NativeReadBudget
{
    public function __construct(
        private RateLimiterFactoryInterface $nativeReadClientLimiter,
        private RateLimiterFactoryInterface $nativeReadGlobalLimiter,
        private RequestStack $requestStack,
    ) {
    }

    public function consume(): void
    {
        $client = ClientKey::fromRequest($this->requestStack->getMainRequest());
        if (!$this->nativeReadClientLimiter->create($client)->consume()->isAccepted()
            || !$this->nativeReadGlobalLimiter->create('all')->consume()->isAccepted()) {
            throw new UnexpectedValueException('Native query budget is unavailable');
        }
    }
}
