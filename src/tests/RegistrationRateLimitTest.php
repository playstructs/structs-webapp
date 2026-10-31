<?php

use App\EventSubscriber\RegistrationRateLimitSubscriber;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\RateLimiter\Storage\InMemoryStorage;

class RegistrationRateLimitTest extends TestCase
{
    private function subscriber(int $client, int $global): RegistrationRateLimitSubscriber
    {
        $storage = new InMemoryStorage();
        $factory = fn (string $id, int $limit) => new RateLimiterFactory([
            'id' => $id, 'policy' => 'token_bucket', 'limit' => $limit,
            'rate' => ['interval' => '1 hour', 'amount' => 1],
        ], $storage);
        return new RegistrationRateLimitSubscriber($factory('client', $client), $factory('global', $global));
    }

    private function request(RegistrationRateLimitSubscriber $subscriber, string $route, string $ip = '127.0.0.1'): RequestEvent
    {
        $request = Request::create('/');
        $request->attributes->set('_route', $route);
        $request->server->set('REMOTE_ADDR', $ip);
        $request->headers->set('X-Forwarded-For', '192.0.2.' . random_int(1, 254));
        $event = new RequestEvent($this->createMock(HttpKernelInterface::class), $request, HttpKernelInterface::MAIN_REQUEST);
        $subscriber->onKernelRequest($event);
        return $event;
    }

    public function testRoutesShareAClientBudgetAndIgnoreUntrustedForwardedHeaders(): void
    {
        $subscriber = $this->subscriber(2, 10);
        $this->assertFalse($this->request($subscriber, 'api_get_address_registration_proof')->hasResponse());
        $this->assertFalse($this->request($subscriber, 'api_get_address_registration_status')->hasResponse());
        $blocked = $this->request($subscriber, 'api_add_player_pending_address')->getResponse();
        $this->assertSame(429, $blocked->getStatusCode());
        $this->assertGreaterThan(0, (int) $blocked->headers->get('Retry-After'));
        $this->assertTrue($blocked->headers->hasCacheControlDirective('no-store'));
        $this->assertFalse($this->request($subscriber, 'api_get_player_id_by_address_and_guild')->hasResponse());
    }

    public function testRotatingClientsStillUsesTheGlobalBudget(): void
    {
        $subscriber = $this->subscriber(10, 2);
        $this->assertFalse($this->request($subscriber, 'api_get_address_registration_proof', '192.0.2.1')->hasResponse());
        $this->assertFalse($this->request($subscriber, 'api_get_address_registration_status', '192.0.2.2')->hasResponse());
        $this->assertSame(429, $this->request($subscriber, 'api_get_address_registration_proof', '192.0.2.3')->getResponse()->getStatusCode());
    }
}
