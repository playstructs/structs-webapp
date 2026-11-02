<?php

namespace App\EventSubscriber;

use App\Util\ClientKey;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;

/** Bound public registration reads before they can query the native node. */
class RegistrationRateLimitSubscriber implements EventSubscriberInterface
{
    private const ROUTES = [
        'api_get_address_registration_proof',
        'api_get_address_registration_status',
        'api_add_player_pending_address',
    ];

    public function __construct(
        private RateLimiterFactoryInterface $registrationClientLimiter,
        private RateLimiterFactoryInterface $registrationGlobalLimiter,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        // Routing has resolved _route; no controller or native query has run.
        return [KernelEvents::REQUEST => ['onKernelRequest', 6]];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }
        $request = $event->getRequest();
        if (!in_array($request->attributes->get('_route'), self::ROUTES, true)) {
            return;
        }

        // HttpFoundation ignores forwarded IP headers unless the operator has
        // explicitly configured that proxy as trusted.
        $client = ClientKey::fromRequest($request);
        $limit = $this->registrationClientLimiter->create($client)->consume();
        if ($limit->isAccepted()) {
            $limit = $this->registrationGlobalLimiter->create('all')->consume();
        }
        if (!$limit->isAccepted()) {
            $retryAfter = max(1, $limit->getRetryAfter()->getTimestamp() - time());
            $event->setResponse(new JsonResponse([
                'success' => false,
                'message' => 'Registration verification is temporarily limited. Please retry shortly.',
            ], 429, ['Retry-After' => (string) $retryAfter, 'Cache-Control' => 'no-store']));
        }
    }
}
