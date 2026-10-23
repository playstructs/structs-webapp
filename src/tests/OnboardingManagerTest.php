<?php

use App\Manager\OnboardingManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class OnboardingManagerTest extends ApiManagerTestCase
{
    private const string SESSION_ID = '0f8c2a1e-5d4b-4c3a-9b2e-7a6f5e4d3c2b';

    private const string BROWSER_ID = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

    private function request(array|string $body): Request
    {
        $content = is_string($body) ? $body : json_encode($body);

        // sendBeacon posts text/plain; the manager must read the body anyway.
        return new Request([], [], [], [], [], ['CONTENT_TYPE' => 'text/plain;charset=UTF-8'], $content);
    }

    private function body(array $events): array
    {
        return [
            'session_id' => self::SESSION_ID,
            'browser_id' => self::BROWSER_ID,
            'interface_name' => 'structs-webapp',
            'content_version' => 'tutorial-4',
            'events' => $events,
        ];
    }

    /**
     * Returns a connection that records each statement and reports one row
     * inserted per statement.
     */
    private function recordingConnection(?array &$statements): Connection
    {
        $statements = [];
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())->method('beginTransaction');
        $connection->expects($this->once())->method('commit');
        $connection->method('executeStatement')
            ->willReturnCallback(function (string $sql, array $params) use (&$statements) {
                $statements[] = ['sql' => $sql, 'params' => $params];

                return 1;
            });

        return $connection;
    }

    private function silentConnection(): Connection
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('executeStatement');

        return $connection;
    }

    public function testRecordsSessionThenEachEvent(): void
    {
        $statements = null;
        $manager = new OnboardingManager($this->entityManager($this->recordingConnection($statements)), $this->validator());

        $response = $manager->recordEvents($this->request($this->body([
            ['step_key' => 'signup.connecting', 'kind' => 'reached'],
            ['step_key' => 'orientation.tutorial_offer', 'kind' => 'skipped'],
        ])));

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertSame(['inserted' => 2], json_decode($response->getContent(), true)['data']);
        $this->assertCount(3, $statements);

        $session = $statements[0];
        $this->assertStringContainsString('INSERT INTO onboarding_session', $session['sql']);
        $this->assertStringContainsString('ON CONFLICT (session_id) DO NOTHING', $session['sql']);
        // The guild comes from this webapp's own guild, not the request.
        $this->assertStringContainsString('gm.this_infrastructure = TRUE', $session['sql']);
        $this->assertArrayNotHasKey('guild_id', $session['params']);
        $this->assertSame('tutorial-4', $session['params']['content_version']);

        $progress = $statements[1];
        $this->assertStringContainsString('INSERT INTO onboarding_progress', $progress['sql']);
        $this->assertStringContainsString('os.content_version = s.content_version', $progress['sql']);
        $this->assertStringContainsString('ON CONFLICT (session_id, step_key, kind) DO NOTHING', $progress['sql']);
        $this->assertSame([
            'session_id' => self::SESSION_ID,
            'step_key' => 'signup.connecting',
            'kind' => 'reached',
            'player_id' => null,
        ], $progress['params']);
        $this->assertSame('skipped', $statements[2]['params']['kind']);
    }

    public function testPlayerIdIsAcceptedOnTheEmployeeRecordReachedEvent(): void
    {
        $statements = null;
        $manager = new OnboardingManager($this->entityManager($this->recordingConnection($statements)), $this->validator());

        $response = $manager->recordEvents($this->request($this->body([
            ['step_key' => 'signup.employee_record', 'kind' => 'reached', 'player_id' => '1-101'],
        ])));

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertSame('1-101', $statements[1]['params']['player_id']);
    }

    /**
     * @dataProvider invalidPlayerIdProvider
     */
    public function testPlayerIdIsRejectedElsewhere(array $event): void
    {
        $manager = new OnboardingManager($this->entityManager($this->silentConnection()), $this->validator());

        $response = $manager->recordEvents($this->request($this->body([$event])));

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $this->assertArrayHasKey('events.0.player_id', json_decode($response->getContent(), true)['errors']);
    }

    public static function invalidPlayerIdProvider(): array
    {
        return [
            'other step' => [['step_key' => 'signup.submit', 'kind' => 'reached', 'player_id' => '1-101']],
            'skipped kind' => [['step_key' => 'signup.employee_record', 'kind' => 'skipped', 'player_id' => '1-101']],
            'malformed id' => [['step_key' => 'signup.employee_record', 'kind' => 'reached', 'player_id' => "1-101'; --"]],
        ];
    }

    /**
     * @dataProvider invalidBodyProvider
     */
    public function testInvalidBodiesAreRejectedWithoutWriting(array|string $body, string $errorKey): void
    {
        $manager = new OnboardingManager($this->entityManager($this->silentConnection()), $this->validator());

        $response = $manager->recordEvents($this->request($body));

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $this->assertArrayHasKey($errorKey, json_decode($response->getContent(), true)['errors']);
    }

    public static function invalidBodyProvider(): array
    {
        $valid = [
            'session_id' => self::SESSION_ID,
            'browser_id' => self::BROWSER_ID,
            'interface_name' => 'structs-webapp',
            'content_version' => 'tutorial-4',
            'events' => [['step_key' => 'signup.connecting', 'kind' => 'reached']],
        ];

        return [
            'not json' => ['nope', 'invalid_request_content'],
            'bad session id' => [['session_id' => 'abc'] + $valid, 'session_id'],
            'missing browser id' => [array_diff_key($valid, ['browser_id' => true]), 'browser_id'],
            'bad interface name' => [['interface_name' => 'bad name!'] + $valid, 'interface_name'],
            'no events' => [['events' => []] + $valid, 'events'],
            'too many events' => [
                ['events' => array_fill(0, OnboardingManager::MAX_EVENTS + 1, ['step_key' => 'signup.connecting', 'kind' => 'reached'])] + $valid,
                'events',
            ],
            'bad step key' => [['events' => [['step_key' => 'Signup Connecting', 'kind' => 'reached']]] + $valid, 'events.0.step_key'],
            'bad kind' => [['events' => [['step_key' => 'signup.connecting', 'kind' => 'finished']]] + $valid, 'events.0.kind'],
        ];
    }

    /**
     * Returns a connection whose single fetchAllAssociative call records its SQL and params.
     */
    private function readingConnection(?string &$sql, ?array &$params, string $method = 'fetchAllAssociative'): Connection
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())
            ->method($method)
            ->willReturnCallback(function (string $query, array $bound) use (&$sql, &$params, $method) {
                $sql = $query;
                $params = $bound;

                return $method === 'fetchAllAssociative' ? [] : ['offered' => 0];
            });

        return $connection;
    }

    public function testFunnelBindsFiltersAndDefaultsTheIdleWindow(): void
    {
        $sql = null;
        $params = null;
        $manager = new OnboardingManager($this->entityManager($this->readingConnection($sql, $params)), $this->validator());

        $response = $manager->getFunnel('tutorial-4', 'signup', 'structs-webapp', null, null);

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertStringContainsString('nxt.previous_step_key = os.step_key', $sql);
        $this->assertSame([
            'content_version' => 'tutorial-4',
            'phase' => 'signup',
            'interface_name' => 'structs-webapp',
            'guild_id' => null,
            'idle_hours' => OnboardingManager::DEFAULT_IDLE_HOURS,
            'reached' => 'reached',
            'skipped' => 'skipped',
        ], $params);
    }

    /**
     * @dataProvider invalidFunnelProvider
     */
    public function testFunnelRejectsInvalidFilters(string $phase, ?string $idleHours, string $errorField): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAllAssociative');
        $manager = new OnboardingManager($this->entityManager($connection), $this->validator());

        $response = $manager->getFunnel('tutorial-4', $phase, null, null, $idleHours);

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $this->assertStringContainsString($errorField, json_encode(json_decode($response->getContent(), true)['errors']));
    }

    public static function invalidFunnelProvider(): array
    {
        return [
            'unknown phase' => ['orientation', null, 'phase'],
            'idle hours not a number' => ['signup', 'soon', 'idle_hours'],
            'idle hours out of range' => ['signup', '9999', 'idle_hours'],
        ];
    }

    public function testTutorialOutcomesCountFromTheOffer(): void
    {
        $sql = null;
        $params = null;
        $manager = new OnboardingManager(
            $this->entityManager($this->readingConnection($sql, $params, 'fetchAssociative')),
            $this->validator()
        );

        $response = $manager->getTutorialOutcomes('tutorial-4', null, '0-1', '48');

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertSame(OnboardingManager::OFFER_STEP_KEY, $params['offer_step_key']);
        $this->assertSame(OnboardingManager::FTL_STEP_KEY, $params['ftl_step_key']);
        $this->assertSame(48, $params['idle_hours']);
        $this->assertSame('0-1', $params['guild_id']);
        $this->assertStringContainsString('AS left_during_tutorial', $sql);
    }

    public function testPlayerOnboardingFindsTheSessionThroughTheSignupRow(): void
    {
        $sql = null;
        $params = null;
        $manager = new OnboardingManager($this->entityManager($this->readingConnection($sql, $params)), $this->validator());

        $response = $manager->getPlayerOnboarding('1-101');

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertStringContainsString('WHERE pp.player_id = :player_id', $sql);
        $this->assertSame(['player_id' => '1-101'], $params);
    }
}
