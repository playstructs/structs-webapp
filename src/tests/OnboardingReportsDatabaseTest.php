<?php

use App\Manager\OnboardingManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Symfony\Component\HttpFoundation\Response;

/**
 * Runs the onboarding reports over a small cast of players. Everything is
 * filtered to one interface, so other sessions in the database don't count.
 */
class OnboardingReportsDatabaseTest extends ApiManagerTestCase
{
    private const string INTERFACE = 'onboarding-report-test';

    private const string VERSION = 'tutorial-4';

    private const string REPLAY = 'tutorial-4-replay';

    private const string OFFER = 'orientation.tutorial_offer';

    private const string SIGNUP = 'signup.employee_record';

    private const string LOADING = 'tutorial.loading';

    private const string WELCOME = 'tutorial.intro.welcome';

    private const string CERTIFIED = 'tutorial.end.certified';

    private const string FTL = 'tutorial.end.ftl_jump';

    private int $sessions = 0;

    public function testReportsWithWebappPrivileges(): void
    {
        if (!$url = getenv('INTEGRATION_DATABASE_URL')) {
            $this->markTestSkipped('Requires the disposable Sqitch database');
        }
        $db = DriverManager::getConnection(['url' => $url]);
        $db->beginTransaction();
        try {
            $db->executeStatement('SET LOCAL search_path=cache,public,structs');
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $this->assertReports($db);
        } finally {
            $db->rollBack();
            $db->close();
        }
    }

    /**
     * @param array<array{0: string, 1?: string, 2?: string}> $events step, kind, player
     */
    private function session(Connection $db, string $version, string $daysAgo, array $events): void
    {
        $this->sessions++;
        $sessionId = sprintf('00000000-0000-4000-8000-%012d', $this->sessions);

        $db->executeStatement(
            'INSERT INTO onboarding_session (session_id, browser_id, interface_name, content_version)
            VALUES (:session_id, :session_id, :interface_name, :content_version)',
            ['session_id' => $sessionId, 'interface_name' => self::INTERFACE, 'content_version' => $version]
        );

        foreach ($events as $index => $event) {
            $db->executeStatement(
                "INSERT INTO onboarding_progress (session_id, step_key, kind, player_id, recorded_at)
                VALUES (:session_id, :step_key, :kind, :player_id, now() - CAST(:days_ago AS INTERVAL) + make_interval(mins => :minutes))",
                [
                    'session_id' => $sessionId,
                    'step_key' => $event[0],
                    'kind' => $event[1] ?? 'reached',
                    'player_id' => $event[2] ?? null,
                    'days_ago' => $daysAgo,
                    'minutes' => $index * 10,
                ]
            );
        }
    }

    private function givenPlayers(Connection $db): void
    {
        // Left at the signup offer, finished in a later visit, then replayed twice.
        $this->session($db, self::VERSION, '10 days', [
            ['signup.connecting'],
            [self::SIGNUP, 'reached', '1-990001'],
            [self::OFFER, 'reached', '1-990001'],
        ]);
        $this->session($db, self::VERSION, '8 days', [
            [self::OFFER, 'reached', '1-990001'],
            [self::LOADING],
            [self::WELCOME],
            [self::CERTIFIED],
            [self::FTL],
        ]);
        $this->session($db, self::REPLAY, '5 days', [
            [self::LOADING, 'reached', '1-990001'],
            [self::CERTIFIED],
        ]);
        $this->session($db, self::REPLAY, '4 days', [
            [self::LOADING, 'reached', '1-990001'],
            [self::WELCOME],
        ]);

        // Skipped it at signup.
        $this->session($db, self::VERSION, '10 days', [
            [self::SIGNUP, 'reached', '1-990002'],
            [self::OFFER, 'reached', '1-990002'],
            [self::OFFER, 'skipped'],
        ]);

        // Left during the tutorial.
        $this->session($db, self::VERSION, '10 days', [
            [self::SIGNUP, 'reached', '1-990003'],
            [self::OFFER, 'reached', '1-990003'],
            [self::LOADING],
            [self::WELCOME],
        ]);

        // Still playing.
        $this->session($db, self::VERSION, '1 hour', [
            [self::SIGNUP, 'reached', '1-990004'],
            [self::OFFER, 'reached', '1-990004'],
            [self::LOADING],
        ]);

        // Signed up before this telemetry: one took the offer on a new device,
        // one started from the Account menu.
        $this->session($db, self::VERSION, '6 days', [
            [self::OFFER, 'reached', '1-990005'],
            [self::LOADING],
            [self::CERTIFIED],
            [self::FTL],
        ]);
        $this->session($db, self::REPLAY, '6 days', [
            [self::LOADING, 'reached', '1-990006'],
            [self::CERTIFIED],
        ]);

        // Left during signup, so never reached the tutorial.
        $this->session($db, self::VERSION, '10 days', [['signup.connecting']]);
    }

    private function data(Response $response): array
    {
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(), $response->getContent());

        return json_decode($response->getContent(), true)['data'];
    }

    private function assertReports(Connection $db): void
    {
        $this->givenPlayers($db);
        $manager = new OnboardingManager($this->entityManager($db), $this->validator());

        // Sessions: the signup offer that was left stays visible.
        $this->assertSame([
            'offered' => 6,
            'started' => 4,
            'completed' => 2,
            'declined' => 1,
            'left_at_offer' => 1,
            'left_during_tutorial' => 1,
            'in_progress' => 1,
        ], $this->data($manager->getTutorialOutcomes(self::VERSION, self::INTERFACE, null, null)));

        // Players: each counted once, by the best of their sessions.
        $this->assertSame([
            'players' => 6,
            'new_players' => 4,
            'existing_players' => 2,
            'started' => 5,
            'completed' => 3,
            'declined' => 1,
            'left_at_offer' => 0,
            'left_during_tutorial' => 1,
            'in_progress' => 1,
            'revisited' => 1,
        ], $this->data($manager->getTutorialPlayers(self::VERSION, self::INTERFACE, null, null)));

        $this->assertSame(
            2,
            $this->data($manager->getTutorialPlayers(self::VERSION, self::INTERFACE, null, null, null, 'existing'))['players']
        );

        // How far players got.
        $steps = array_column(
            $this->data($manager->getTutorialPlayerSteps(self::VERSION, self::INTERFACE, null)),
            null,
            'step_key'
        );
        $this->assertSame(6, $steps[self::OFFER]['reached']);
        $this->assertSame(1, $steps[self::OFFER]['furthest']);
        $this->assertSame(5, $steps[self::LOADING]['reached']);
        $this->assertSame(1, $steps[self::LOADING]['furthest']);
        $this->assertSame(4, $steps[self::WELCOME]['reached']);
        $this->assertSame(1, $steps[self::WELCOME]['furthest']);
        $this->assertSame(3, $steps[self::FTL]['reached']);
        $this->assertSame(3, $steps[self::FTL]['furthest']);
        $this->assertSame('0.5000', (string) $steps[self::FTL]['retained_rate']);

        // Run by run.
        $comparison = $this->data($manager->getTutorialRunComparison(self::VERSION, self::INTERFACE, null, null));
        $this->assertSame([1, 2, 3], array_column($comparison, 'run_number'));
        $this->assertSame([5, 1, 1], array_column($comparison, 'runs'));
        $this->assertSame([3, 1, 0], array_column($comparison, 'completed'));
        $this->assertSame([1, 0, 1], array_column($comparison, 'left_during_tutorial'));
        $this->assertSame('0.6000', (string) $comparison[0]['completion_rate']);
        $this->assertNull($comparison[0]['median_hours_since_previous_run']);
        $this->assertEqualsWithDelta(72, (float) $comparison[1]['median_hours_since_previous_run'], 1);

        // One player's history, and the revisits.
        $history = $this->data($manager->getTutorialRuns(self::VERSION, self::INTERFACE, null, null, null, null, '1-990001', 1));
        $this->assertSame([3, 2, 1], array_column($history, 'run_number'));
        $this->assertSame(['left_during_tutorial', 'completed', 'completed'], array_column($history, 'outcome'));
        $this->assertSame([self::WELCOME, self::CERTIFIED, self::FTL], array_column($history, 'furthest_step_key'));
        $this->assertSame([self::REPLAY, self::REPLAY, self::VERSION], array_column($history, 'content_version'));

        $revisits = $this->data($manager->getTutorialRuns(self::VERSION, self::INTERFACE, null, null, 'repeat', null, null, 1));
        $this->assertSame([3, 2], array_column($revisits, 'run_number'));

        // The funnels stay per version, and take the same filters.
        $funnelOffer = fn (array $rows) => array_column($rows, 'reached', 'step_key')[self::OFFER];
        $this->assertSame(6, $funnelOffer($this->data(
            $manager->getFunnel(self::VERSION, 'tutorial', self::INTERFACE, null, null)
        )));
        $this->assertSame(1, $funnelOffer($this->data(
            $manager->getFunnel(self::VERSION, 'tutorial', self::INTERFACE, null, null, null, 'existing')
        )));
        $this->assertSame(0, $funnelOffer($this->data(
            $manager->getFunnel(self::VERSION, 'tutorial', self::INTERFACE, null, null, 'repeat')
        )));
        $replayFunnel = $this->data($manager->getFunnel(self::REPLAY, 'tutorial', self::INTERFACE, null, null));
        $this->assertSame(3, array_column($replayFunnel, 'reached', 'step_key')[self::LOADING]);

        // A replay's outcome comes from its own last step.
        $this->assertSame([
            'offered' => 3,
            'started' => 3,
            'completed' => 2,
            'declined' => 0,
            'left_at_offer' => 0,
            'left_during_tutorial' => 1,
            'in_progress' => 0,
        ], $this->data($manager->getTutorialOutcomes(self::REPLAY, self::INTERFACE, null, null)));

        // Exclusions apply retroactively to every linked session, including
        // anonymous signup events in that session, but not unlinked sessions.
        $reports = function (?string $include = null) use ($manager): array {
            return [
                $this->data($manager->getFunnel(self::VERSION, 'signup', self::INTERFACE, null, null, null, null, $include)),
                $this->data($manager->getTutorialOutcomes(self::VERSION, self::INTERFACE, null, null, null, null, $include)),
                $this->data($manager->getTutorialPlayers(self::VERSION, self::INTERFACE, null, null, null, null, $include)),
                $this->data($manager->getTutorialPlayerSteps(self::VERSION, self::INTERFACE, null, null, null, $include)),
                $this->data($manager->getTutorialRunComparison(self::VERSION, self::INTERFACE, null, null, null, $include)),
                $this->data($manager->getTutorialRuns(self::VERSION, self::INTERFACE, null, null, null, null, null, 1, $include)),
            ];
        };
        $baseline = $reports();
        $db->executeStatement('RESET ROLE');
        $db->executeStatement("INSERT INTO structs.onboarding_telemetry_exclusion (player_id) VALUES ('1-990001')");
        $db->executeStatement('SET LOCAL ROLE structs_webapp');
        $filtered = $reports();
        $this->assertSame($baseline, $reports('1'));
        $this->assertSame($filtered, $reports('0'));
        $this->assertSame(1, array_column($filtered[0], 'reached', 'step_key')['signup.connecting']);
        $this->assertSame(4, $filtered[1]['offered']);
        $this->assertSame(5, $filtered[2]['players']);
        $this->assertSame(0, $filtered[2]['revisited']);
        $this->assertSame(2, array_column($filtered[3], 'reached', 'step_key')[self::FTL]);
        $this->assertSame([4], array_column($filtered[4], 'runs'));
        $this->assertCount(4, $filtered[5]);
        $this->assertNotEmpty($this->data($manager->getPlayerOnboarding('1-990001')));
        $db->executeStatement('RESET ROLE');
        $db->executeStatement("DELETE FROM structs.onboarding_telemetry_exclusion WHERE player_id = '1-990001'");
        $db->executeStatement('SET LOCAL ROLE structs_webapp');
        $this->assertSame($baseline, $reports());

        // The seeded username rule matches optional hyphen/seconds variants,
        // and must not match lowercase or a substring of a larger username.
        $db->executeStatement('RESET ROLE');
        $db->executeStatement("INSERT INTO structs.player (id, username) VALUES
            ('1-990001', 'T261110-123456'),
            ('1-990002', 'T2611101234'),
            ('1-990003', 'prefixT261110-1234'),
            ('1-990004', 'T261110-1234suffix'),
            ('1-990005', 't261110-1234'),
            ('1-990006', NULL)");
        $db->executeStatement('SET LOCAL ROLE structs_webapp');
        $regexFiltered = $reports();
        $this->assertSame($baseline, $reports('1'));
        $this->assertSame(4, $regexFiltered[2]['players']);
        $this->assertSame(0, $regexFiltered[2]['declined']);
        $this->assertCount(4, $regexFiltered[5]);
        // An explicit exclusion overlapping a regex does not double count.
        $db->executeStatement('RESET ROLE');
        $db->executeStatement("INSERT INTO structs.onboarding_telemetry_exclusion (player_id) VALUES ('1-990001')");
        $db->executeStatement('SET LOCAL ROLE structs_webapp');
        $this->assertSame($regexFiltered, $reports());
        // Renames stop matching dynamically, while explicit IDs stay excluded.
        $db->executeStatement('RESET ROLE');
        $db->executeStatement("UPDATE structs.player SET username = 'Renamed' WHERE id IN ('1-990001', '1-990002')");
        $db->executeStatement('SET LOCAL ROLE structs_webapp');
        $this->assertSame($filtered, $reports());
    }
}
