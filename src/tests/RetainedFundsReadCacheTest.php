<?php

use App\Manager\RetainedFundsReadCache;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Lock\LockFactory;
use Symfony\Component\Lock\Store\FlockStore;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\RateLimiter\Storage\InMemoryStorage;

class RetainedFundsReadCacheTest extends TestCase
{
    private string $directory;
    private ArrayAdapter $cache;
    private RequestStack $requests;

    protected function setUp(): void
    {
        $this->directory = sys_get_temp_dir() . '/retained-funds-test-' . bin2hex(random_bytes(8));
        mkdir($this->directory);
        $this->cache = new ArrayAdapter();
        $this->requests = new RequestStack();
        $this->requests->push(Request::create('/', server: ['REMOTE_ADDR' => '192.0.2.1']));
    }

    protected function tearDown(): void
    {
        foreach (glob($this->directory . '/*') as $file) unlink($file);
        rmdir($this->directory);
    }

    private function reader(int $client = 660, int $global = 2640): RetainedFundsReadCache
    {
        $storage = new InMemoryStorage();
        $limiter = fn (string $id, int $limit) => new RateLimiterFactory([
            'id' => $id, 'policy' => 'token_bucket', 'limit' => $limit,
            'rate' => ['interval' => '1 hour', 'amount' => 1],
        ], $storage);

        return new RetainedFundsReadCache($this->cache, new LockFactory(new FlockStore($this->directory)),
            $limiter('client', $client), $limiter('global', $global), $this->requests);
    }

    public function testOnlyIdenticalEvidenceIsReusedAndTheOwnerSlotIsReplaced(): void
    {
        $reader = $this->reader();
        $reads = 0;
        $fetch = function () use (&$reads): array { return ['read' => ++$reads]; };
        $this->assertSame(['read' => 1], $reader->read('1-1', 'height-and-candidates-A', 33, $fetch));
        $this->assertSame(['read' => 1], $reader->read('1-1', 'height-and-candidates-A', 33, $fetch));
        $this->assertSame(['read' => 2], $reader->read('1-1', 'height-and-candidates-B', 33, $fetch));
        $this->assertCount(1, $this->cache->getValues(), 'Blocks must not accumulate cache files');
        $this->assertSame(['read' => 3], $reader->read('1-2', 'height-and-candidates-B', 33, $fetch));
        $this->assertCount(2, $this->cache->getValues());
    }

    public function testCompetingWorkerDoesNotRepeatTheNativeReads(): void
    {
        $first = $this->reader();
        $second = $this->reader();
        $result = $first->read('1-1', 'snapshot', 33, function () use ($second): array {
            try {
                $second->read('1-1', 'snapshot', 33, fn () => $this->fail('Duplicate native work'));
                $this->fail('The second worker should defer');
            } catch (RuntimeException $error) {
                $this->assertStringContainsString('already in progress', $error->getMessage());
            }
            return ['total' => '50000000'];
        });
        $this->assertSame($result, $second->read('1-1', 'snapshot', 33, fn () => $this->fail('Expected cache hit')));
    }

    public function testClientAndGlobalBudgetsChargeNativeReadsBeforeFetching(): void
    {
        $reader = $this->reader(33, 66);
        $fetch = fn () => ['total' => '1'];
        $reader->read('1-1', 'snapshot', 33, $fetch);
        $this->assertSame(['total' => '1'], $reader->read('1-1', 'snapshot', 33, fn () => $this->fail('Cache uses no budget')));
        try {
            $reader->read('1-2', 'snapshot', 33, fn () => $this->fail('Over-budget native work'));
            $this->fail('Changing target must not reset client budget');
        } catch (RuntimeException $error) {
            $this->assertStringContainsString('budget', $error->getMessage());
        }
        $this->requests->getMainRequest()->server->set('REMOTE_ADDR', '192.0.2.2');
        $reader->read('1-2', 'snapshot', 33, $fetch);
        $this->requests->getMainRequest()->server->set('REMOTE_ADDR', '192.0.2.3');
        $this->expectExceptionMessage('budget');
        $reader->read('1-3', 'snapshot', 33, fn () => $this->fail('Over global budget'));
    }

    public function testFailedReadReleasesLockAndDoesNotCachePartialEvidence(): void
    {
        $reader = $this->reader();
        try {
            $reader->read('1-1', 'snapshot', 33, function (): array { throw new RuntimeException('native unavailable'); });
            $this->fail('Native failure must propagate');
        } catch (RuntimeException $error) {
            $this->assertSame('native unavailable', $error->getMessage());
        }
        $this->assertSame(['total' => '2'], $reader->read('1-1', 'snapshot', 33, fn () => ['total' => '2']));
    }
}
