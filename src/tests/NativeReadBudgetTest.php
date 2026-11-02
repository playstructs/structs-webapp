<?php

use App\Manager\ChainSnapshotManager;
use App\Manager\NativeReadBudget;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\RateLimiter\Storage\InMemoryStorage;

class NativeReadBudgetTest extends TestCase
{
    private function chain(int $client, int $global, string $ip, int &$requests, ?InMemoryStorage $storage = null): ChainSnapshotManager
    {
        $storage ??= new InMemoryStorage();
        $factory = fn (string $id, int $limit) => new RateLimiterFactory([
            'id' => $id, 'policy' => 'token_bucket', 'limit' => $limit,
            'rate' => ['interval' => '1 hour', 'amount' => 1],
        ], $storage);
        $stack = new RequestStack();
        $stack->push(Request::create('/', server: ['REMOTE_ADDR' => $ip]));
        $http = new MockHttpClient(function () use (&$requests) {
            $requests++;
            return new MockResponse('{"default_node_info":{"network":"structstestnet-111"}}');
        });

        return new ChainSnapshotManager($http, 'http://structsd:1317',
            new NativeReadBudget($factory('client', $client), $factory('global', $global), $stack));
    }

    public function testReadsStopWhenTheClientBudgetIsSpent(): void
    {
        $requests = 0;
        $chain = $this->chain(2, 10, '192.0.2.1', $requests);
        $chain->verifyChain('structstestnet-111');
        $chain->verifyChain('structstestnet-111');
        $this->assertSame(1, $requests, 'A verified network is not re-read within the request');
        try {
            $chain->verifyChain('other-network');
            $this->fail('A different network is read and refused');
        } catch (UnexpectedValueException $error) {
            $this->assertSame('Chain snapshot network mismatch', $error->getMessage());
        }
        $this->expectExceptionMessage('Native query budget is unavailable');
        try {
            $chain->verifyChain('third-network');
        } finally {
            $this->assertSame(2, $requests, 'An exhausted budget sends no request');
        }
    }

    public function testRotatingIpv6WithinOneSlash64SharesTheBudget(): void
    {
        $requests = 0;
        $storage = new InMemoryStorage();
        $this->chain(1, 10, '2001:db8::1', $requests, $storage)->verifyChain('structstestnet-111');
        $this->expectExceptionMessage('Native query budget is unavailable');
        $this->chain(1, 10, '2001:db8::2', $requests, $storage)->verifyChain('structstestnet-111');
    }
}
