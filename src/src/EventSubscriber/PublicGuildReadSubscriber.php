<?php

namespace App\EventSubscriber;

use App\Security\PublicGuildReadMatcher;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class PublicGuildReadSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly PublicGuildReadMatcher $publicReads)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            // Answer only the approved read preflights before routing (priority 32).
            KernelEvents::REQUEST => ['onRequest', 34],
            KernelEvents::RESPONSE => 'onResponse',
        ];
    }

    public function onRequest(RequestEvent $event): void
    {
        if ($event->isMainRequest() && $this->publicReads->matchesPreflight($event->getRequest())) {
            $event->setResponse(new Response('', Response::HTTP_NO_CONTENT, [
                'Access-Control-Allow-Methods' => implode(', ', PublicGuildReadMatcher::METHODS),
                'Access-Control-Allow-Headers' => implode(', ', PublicGuildReadMatcher::REQUEST_HEADERS),
            ]));
        }
    }

    public function onResponse(ResponseEvent $event): void
    {
        if ($event->isMainRequest() && ($this->publicReads->matches($event->getRequest())
            || $this->publicReads->matchesPreflight($event->getRequest()))) {
            // Guild reads contain public data and do not use session or bearer identity.
            // Cross-guild browser clients omit credentials, including on read preflights.
            $event->getResponse()->headers->set('Access-Control-Allow-Origin', '*');
        }
    }
}
