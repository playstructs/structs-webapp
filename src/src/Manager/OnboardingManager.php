<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Constant\PaginationLimits;
use App\Constant\RegexPattern;
use App\Dto\ApiResponseContentDto;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Onboarding telemetry: one session row per onboarding run, and one
 * insert-only progress row each time a signup or tutorial step is reached or
 * skipped. See structs-pg docs/onboarding-telemetry-handoff.md.
 *
 * Recording is unauthenticated (signup has no player yet), so every value is
 * validated here, step keys must be in the catalog for the session's content
 * version, and resends insert nothing. The read queries are ordinary
 * authenticated API reads.
 */
class OnboardingManager
{
    use ApiSqlQueryTrait;

    /** Where signup finishes and a new player first has an id. */
    public const string SIGNUP_STEP_KEY = 'signup.employee_record';

    /**
     * First tutorial step; a skipped row here is Skip Tutorial. After signup it
     * is only recorded once the player takes the tutorial.
     */
    public const string OFFER_STEP_KEY = 'orientation.tutorial_offer';

    /** The tutorial has started. First step of a replay. */
    public const string START_STEP_KEY = 'tutorial.loading';

    /**
     * The steps whose reached row may carry a player id: where signup finishes,
     * and the offer, which a later session reaches without passing through signup.
     */
    public const array PLAYER_STEP_KEYS = [self::SIGNUP_STEP_KEY, self::OFFER_STEP_KEY];

    /** The same, for a replay, which has no offer. */
    public const array REPLAY_PLAYER_STEP_KEYS = [self::START_STEP_KEY];

    /** Last step of a replay. */
    public const string CERTIFIED_STEP_KEY = 'tutorial.end.certified';

    /** Last tutorial step, recorded once the player lands in the real game. */
    public const string FTL_STEP_KEY = 'tutorial.end.ftl_jump';

    /** A design's replays, from the Account menu, are recorded as this version of it. */
    public const string REPLAY_SUFFIX = '-replay';

    public const string KIND_REACHED = 'reached';

    public const string KIND_SKIPPED = 'skipped';

    /** Most events accepted in one request; a full tutorial run is about 66. */
    public const int MAX_EVENTS = 64;

    private const int MAX_NAME_LENGTH = 64;

    private const int MAX_STEP_KEY_LENGTH = 96;

    /** Hours without a new event before a session counts as stopped, when idle_hours is omitted. */
    public const int DEFAULT_IDLE_HOURS = 24;

    /**
     * Each session with who it belongs to and, if the tutorial started in it,
     * which of that player's runs it was. Runs are numbered before any filter and
     * across designs, so a filtered report keeps the same numbers. A session with
     * no player id, such as one left during signup, belongs to its browser.
     */
    private const string SESSION_RUNS = "
        WITH session_facts AS (
          SELECT
            s.session_id,
            s.browser_id,
            s.interface_name,
            s.guild_id,
            s.content_version,
            min(p.player_id) AS player_id,
            coalesce(min(p.player_id), s.browser_id::TEXT) AS person,
            bool_or(p.step_key = :signup_step_key AND p.kind = :reached) AS signed_up,
            bool_or(p.step_key = :offer_step_key AND p.kind = :reached) AS offered,
            bool_or(p.step_key = :offer_step_key AND p.kind = :skipped) AS declined,
            min(p.recorded_at) FILTER (WHERE p.step_key = :start_step_key AND p.kind = :reached) AS started_at,
            bool_or(p.kind = :reached AND (
              p.step_key = :ftl_step_key
              OR (p.step_key = :certified_step_key AND s.content_version LIKE '%" . self::REPLAY_SUFFIX . "')
            )) AS completed,
            count(*) FILTER (WHERE p.kind = :reached AND p.step_key LIKE 'tutorial.%') AS steps_reached,
            max(p.recorded_at) AS last_event_at
          FROM onboarding_session s
          INNER JOIN onboarding_progress p ON p.session_id = s.session_id
          GROUP BY s.session_id
        ),
        runs AS (
          SELECT
            f.*,
            f.started_at IS NOT NULL AS started,
            f.last_event_at < now() - make_interval(hours => CAST(:idle_hours AS INTEGER)) AS idle,
            f.player_id IS NULL OR bool_or(f.signed_up) OVER (PARTITION BY f.person) AS new_player,
            CASE WHEN f.started_at IS NOT NULL THEN row_number() OVER person_runs END AS run_number,
            CASE WHEN f.started_at IS NOT NULL THEN lag(f.started_at) OVER person_runs END AS previous_run_at
          FROM session_facts f
          WINDOW person_runs AS (PARTITION BY f.person ORDER BY f.started_at NULLS LAST, f.session_id)
        )
    ";

    /** The filters every report takes, on a row of runs named r. */
    private const string REPORT_FILTERS = "
        AND (CAST(:interface_name AS VARCHAR) IS NULL OR r.interface_name = :interface_name)
        AND (CAST(:guild_id AS VARCHAR) IS NULL OR r.guild_id = :guild_id)
        AND (CAST(:player_type AS VARCHAR) IS NULL OR r.new_player = (CAST(:player_type AS VARCHAR) = 'new'))
    ";

    /** first keeps a player's first run and any offer not taken; repeat keeps the runs after it. */
    private const string RUN_FILTER = "
        AND (
          CAST(:run AS VARCHAR) IS NULL
          OR (CAST(:run AS VARCHAR) = 'first' AND coalesce(r.run_number, 1) = 1)
          OR (CAST(:run AS VARCHAR) = 'repeat' AND r.run_number > 1)
        )
    ";

    /** A design and its replays: one tutorial, however the player reached it. */
    private const string TUTORIAL_VERSIONS = 'r.content_version IN (:content_version, :replay_version)';

    /** One outcome from the completed, started, declined and idle columns of a session or player. */
    private const string OUTCOME = "
        CASE
          WHEN completed THEN 'completed'
          WHEN declined AND NOT started THEN 'declined'
          WHEN NOT idle THEN 'in_progress'
          WHEN started THEN 'left_during_tutorial'
          ELSE 'left_at_offer'
        END
    ";

    public EntityManagerInterface $entityManager;

    public ApiRequestParsingManager $apiRequestParsingManager;

    public function __construct(EntityManagerInterface $entityManager, ValidatorInterface $validator)
    {
        $this->entityManager = $entityManager;
        $this->apiRequestParsingManager = new ApiRequestParsingManager(
            $validator,
            new ConstraintViolationUtil()
        );
    }

    /**
     * The step catalog for one tutorial design, in order.
     *
     * @throws Exception
     */
    public function getCatalog(string $content_version): Response
    {
        $query = '
            SELECT
              os.phase,
              os.step_order,
              os.step_key,
              os.previous_step_key
            FROM onboarding_step os
            WHERE os.content_version = :content_version
            ORDER BY os.phase, os.step_order
        ';

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            [ApiParameters::CONTENT_VERSION => $content_version],
            [ApiParameters::CONTENT_VERSION]
        );
    }

    /**
     * Per-step funnel for one phase of one design: how many sessions reached
     * and skipped each step, how many stopped there (reached it, never reached
     * the next step, and have been idle for idle_hours), and the share of the
     * phase's first step that got this far.
     *
     * dropped is null on a step with no next step (the last step, and the
     * off-line Recovery Key FAQ). Sessions that left during the signup wait
     * show up as dropped on signup.submit, because signup.employee_record is
     * only recorded once the player exists.
     *
     * @throws Exception
     */
    public function getFunnel(
        string $content_version,
        string $phase,
        ?string $interface_name,
        ?string $guild_id,
        ?string $idle_hours,
        ?string $run = null,
        ?string $player_type = null
    ): Response {
        $query = self::SESSION_RUNS . ',
            sessions AS (
              SELECT r.session_id
              FROM runs r
              WHERE r.content_version = :content_version
              ' . self::REPORT_FILTERS . self::RUN_FILTER . '
            ),
            idle AS (
              SELECT p.session_id
              FROM onboarding_progress p
              INNER JOIN sessions USING (session_id)
              GROUP BY p.session_id
              HAVING max(p.recorded_at) < now() - make_interval(hours => CAST(:idle_hours AS INTEGER))
            ),
            steps AS (
              SELECT
                os.step_order,
                os.step_key,
                os.previous_step_key,
                nxt.step_key AS next_step_key
              FROM onboarding_step os
              LEFT JOIN onboarding_step nxt
                ON nxt.content_version = os.content_version
                AND nxt.previous_step_key = os.step_key
              WHERE os.content_version = :content_version
                AND os.phase = :phase
            ),
            counts AS (
              SELECT
                st.step_order,
                st.step_key,
                st.previous_step_key,
                st.next_step_key,
                count(r.session_id) AS reached,
                count(sk.session_id) AS skipped,
                CASE WHEN st.next_step_key IS NULL THEN NULL ELSE
                  count(r.session_id) FILTER (WHERE nx.session_id IS NULL AND i.session_id IS NOT NULL)
                END AS dropped
              FROM steps st
              LEFT JOIN (
                onboarding_progress r
                INNER JOIN sessions rs ON rs.session_id = r.session_id
              ) ON r.step_key = st.step_key AND r.kind = :reached
              LEFT JOIN onboarding_progress sk
                ON sk.session_id = r.session_id AND sk.step_key = st.step_key AND sk.kind = :skipped
              LEFT JOIN onboarding_progress nx
                ON nx.session_id = r.session_id AND nx.step_key = st.next_step_key AND nx.kind = :reached
              LEFT JOIN idle i ON i.session_id = r.session_id
              GROUP BY st.step_order, st.step_key, st.previous_step_key, st.next_step_key
            )
            SELECT
              c.step_order,
              c.step_key,
              c.previous_step_key,
              c.next_step_key,
              c.reached,
              c.skipped,
              c.dropped,
              round(c.reached::NUMERIC / NULLIF(first.reached, 0), 4) AS retained_rate
            FROM counts c
            CROSS JOIN (
              -- The phase starts at the step nothing precedes that has a successor;
              -- that excludes off-line steps such as the Recovery Key FAQ.
              SELECT coalesce(max(f.reached), 0) AS reached
              FROM counts f
              WHERE f.previous_step_key IS NULL AND f.next_step_key IS NOT NULL
            ) first
            ORDER BY c.step_order
        ';

        return $this->queryFiltered($query, [
            ApiParameters::CONTENT_VERSION => $content_version,
            ApiParameters::PHASE => $phase,
            ApiParameters::INTERFACE_NAME => $interface_name,
            ApiParameters::GUILD_ID => $guild_id,
            ApiParameters::IDLE_HOURS => $idle_hours,
            ApiParameters::RUN => $run,
            ApiParameters::PLAYER_TYPE => $player_type,
        ], [ApiParameters::CONTENT_VERSION, ApiParameters::PHASE], true);
    }

    /**
     * Tutorial outcome per session, among sessions that reached the offer or
     * started the tutorial: completed (landed in the game after the FTL jump, or
     * finished a replay), declined (Skip Tutorial), left at the offer or during
     * the tutorial (idle without either), and in progress (the rest).
     *
     * @throws Exception
     */
    public function getTutorialOutcomes(
        string $content_version,
        ?string $interface_name,
        ?string $guild_id,
        ?string $idle_hours,
        ?string $run = null,
        ?string $player_type = null
    ): Response {
        $query = self::SESSION_RUNS . ',
            offered AS (
              SELECT r.started, ' . self::OUTCOME . ' AS outcome
              FROM runs r
              WHERE (r.offered OR r.started)
                AND r.content_version = :content_version
              ' . self::REPORT_FILTERS . self::RUN_FILTER . '
            )
            SELECT
              count(*) AS offered,
              count(*) FILTER (WHERE started) AS started,
              count(*) FILTER (WHERE outcome = \'completed\') AS completed,
              count(*) FILTER (WHERE outcome = \'declined\') AS declined,
              count(*) FILTER (WHERE outcome = \'left_at_offer\') AS left_at_offer,
              count(*) FILTER (WHERE outcome = \'left_during_tutorial\') AS left_during_tutorial,
              count(*) FILTER (WHERE outcome = \'in_progress\') AS in_progress
            FROM offered
        ';

        return $this->queryFiltered($query, [
            ApiParameters::CONTENT_VERSION => $content_version,
            ApiParameters::INTERFACE_NAME => $interface_name,
            ApiParameters::GUILD_ID => $guild_id,
            ApiParameters::IDLE_HOURS => $idle_hours,
            ApiParameters::RUN => $run,
            ApiParameters::PLAYER_TYPE => $player_type,
        ], [ApiParameters::CONTENT_VERSION], false);
    }

    /**
     * The tutorial by unique player, however many sessions each took and whether
     * they came through the offer or the Account menu. A player's outcome is the
     * best of their sessions, so one who left and came back to finish is completed.
     *
     * @throws Exception
     */
    public function getTutorialPlayers(
        string $content_version,
        ?string $interface_name,
        ?string $guild_id,
        ?string $idle_hours,
        ?string $run = null,
        ?string $player_type = null
    ): Response {
        $query = self::SESSION_RUNS . ',
            players AS (
              SELECT
                r.person,
                bool_or(r.new_player) AS new_player,
                bool_or(r.completed) AS completed,
                bool_or(r.started) AS started,
                bool_or(r.declined) AS declined,
                bool_and(r.idle) AS idle,
                count(*) FILTER (WHERE r.started) AS runs
              FROM runs r
              WHERE (r.offered OR r.started)
                AND ' . self::TUTORIAL_VERSIONS . self::REPORT_FILTERS . self::RUN_FILTER . '
              GROUP BY r.person
            ),
            outcomes AS (
              SELECT p.new_player, p.started, p.runs, ' . self::OUTCOME . ' AS outcome
              FROM players p
            )
            SELECT
              count(*) AS players,
              count(*) FILTER (WHERE new_player) AS new_players,
              count(*) FILTER (WHERE NOT new_player) AS existing_players,
              count(*) FILTER (WHERE started) AS started,
              count(*) FILTER (WHERE outcome = \'completed\') AS completed,
              count(*) FILTER (WHERE outcome = \'declined\') AS declined,
              count(*) FILTER (WHERE outcome = \'left_at_offer\') AS left_at_offer,
              count(*) FILTER (WHERE outcome = \'left_during_tutorial\') AS left_during_tutorial,
              count(*) FILTER (WHERE outcome = \'in_progress\') AS in_progress,
              count(*) FILTER (WHERE runs > 1) AS revisited
            FROM outcomes
        ';

        return $this->queryFiltered($query, [
            ApiParameters::CONTENT_VERSION => $content_version,
            ApiParameters::INTERFACE_NAME => $interface_name,
            ApiParameters::GUILD_ID => $guild_id,
            ApiParameters::IDLE_HOURS => $idle_hours,
            ApiParameters::RUN => $run,
            ApiParameters::PLAYER_TYPE => $player_type,
        ], [ApiParameters::CONTENT_VERSION], false);
    }

    /**
     * How far unique players got: per tutorial step, how many got at least that
     * far in any session, how many got no further, and that share of everyone
     * counted. Finishing a replay counts as reaching the last step.
     *
     * @throws Exception
     */
    public function getTutorialPlayerSteps(
        string $content_version,
        ?string $interface_name,
        ?string $guild_id,
        ?string $run = null,
        ?string $player_type = null
    ): Response {
        $query = self::SESSION_RUNS . ',
            steps AS (
              SELECT os.step_order, os.step_key
              FROM onboarding_step os
              WHERE os.content_version = :content_version
                AND os.phase = \'tutorial\'
            ),
            furthest AS (
              SELECT
                r.person,
                CASE WHEN bool_or(r.completed) THEN (SELECT max(st.step_order) FROM steps st)
                  ELSE max(st.step_order)
                END AS step_order
              FROM runs r
              INNER JOIN onboarding_progress p ON p.session_id = r.session_id AND p.kind = :reached
              INNER JOIN steps st ON st.step_key = p.step_key
              WHERE ' . self::TUTORIAL_VERSIONS . self::REPORT_FILTERS . self::RUN_FILTER . '
              GROUP BY r.person
            )
            SELECT
              st.step_order,
              st.step_key,
              count(f.person) FILTER (WHERE f.step_order >= st.step_order) AS reached,
              count(f.person) FILTER (WHERE f.step_order = st.step_order) AS furthest,
              round(
                count(f.person) FILTER (WHERE f.step_order >= st.step_order)::NUMERIC / NULLIF(count(f.person), 0),
                4
              ) AS retained_rate
            FROM steps st
            LEFT JOIN furthest f ON TRUE
            GROUP BY st.step_order, st.step_key
            ORDER BY st.step_order
        ';

        return $this->queryFiltered($query, [
            ApiParameters::CONTENT_VERSION => $content_version,
            ApiParameters::INTERFACE_NAME => $interface_name,
            ApiParameters::GUILD_ID => $guild_id,
            ApiParameters::RUN => $run,
            ApiParameters::PLAYER_TYPE => $player_type,
        ], [ApiParameters::CONTENT_VERSION], true);
    }

    /**
     * Players' runs side by side: one row per run number, so first runs can be
     * compared with second ones and so on. Times are medians.
     *
     * @throws Exception
     */
    public function getTutorialRunComparison(
        string $content_version,
        ?string $interface_name,
        ?string $guild_id,
        ?string $idle_hours,
        ?string $player_type = null
    ): Response {
        $query = self::SESSION_RUNS . ',
            compared AS (
              SELECT
                r.run_number,
                r.completed,
                r.steps_reached,
                EXTRACT(EPOCH FROM r.last_event_at - r.started_at) / 60 AS minutes,
                EXTRACT(EPOCH FROM r.started_at - r.previous_run_at) / 3600 AS hours_since_previous_run,
                ' . self::OUTCOME . ' AS outcome
              FROM runs r
              WHERE r.started
                AND ' . self::TUTORIAL_VERSIONS . self::REPORT_FILTERS . '
            )
            SELECT
              run_number,
              count(*) AS runs,
              count(*) FILTER (WHERE outcome = \'completed\') AS completed,
              count(*) FILTER (WHERE outcome = \'left_during_tutorial\') AS left_during_tutorial,
              count(*) FILTER (WHERE outcome = \'in_progress\') AS in_progress,
              round(count(*) FILTER (WHERE outcome = \'completed\')::NUMERIC / count(*), 4) AS completion_rate,
              percentile_cont(0.5) WITHIN GROUP (ORDER BY steps_reached) AS median_steps_reached,
              round((percentile_cont(0.5) WITHIN GROUP (ORDER BY minutes) FILTER (WHERE completed))::NUMERIC, 1)
                AS median_minutes_to_complete,
              round((percentile_cont(0.5) WITHIN GROUP (ORDER BY hours_since_previous_run))::NUMERIC, 1)
                AS median_hours_since_previous_run
            FROM compared
            GROUP BY run_number
            ORDER BY run_number
        ';

        return $this->queryFiltered($query, [
            ApiParameters::CONTENT_VERSION => $content_version,
            ApiParameters::INTERFACE_NAME => $interface_name,
            ApiParameters::GUILD_ID => $guild_id,
            ApiParameters::IDLE_HOURS => $idle_hours,
            ApiParameters::PLAYER_TYPE => $player_type,
        ], [ApiParameters::CONTENT_VERSION], true);
    }

    /**
     * Every tutorial run, newest first: when each player came back and how far
     * that run got. With player_id it is one player's history; with run=repeat,
     * the revisits.
     *
     * @throws Exception
     */
    public function getTutorialRuns(
        string $content_version,
        ?string $interface_name,
        ?string $guild_id,
        ?string $idle_hours,
        ?string $run,
        ?string $player_type,
        ?string $player_id,
        int $page
    ): Response {
        $limit = PaginationLimits::DEFAULT;
        $offset = (max(1, $page) - 1) * $limit;

        $query = self::SESSION_RUNS . '
            SELECT
              r.session_id,
              r.content_version,
              r.interface_name,
              r.player_id,
              r.new_player,
              r.run_number,
              r.started_at,
              r.last_event_at,
              r.previous_run_at,
              round((EXTRACT(EPOCH FROM r.started_at - r.previous_run_at) / 3600)::NUMERIC, 1) AS hours_since_previous_run,
              round((EXTRACT(EPOCH FROM r.last_event_at - r.started_at) / 60)::NUMERIC, 1) AS minutes,
              r.steps_reached,
              last_step.step_key AS furthest_step_key,
              ' . self::OUTCOME . ' AS outcome
            FROM runs r
            LEFT JOIN LATERAL (
              SELECT os.step_key
              FROM onboarding_progress p
              INNER JOIN onboarding_step os
                ON os.content_version = r.content_version
                AND os.step_key = p.step_key
              WHERE p.session_id = r.session_id
                AND p.kind = :reached
                AND os.phase = \'tutorial\'
              ORDER BY os.step_order DESC
              LIMIT 1
            ) last_step ON TRUE
            WHERE r.started
              AND ' . self::TUTORIAL_VERSIONS . self::REPORT_FILTERS . self::RUN_FILTER . '
              AND (CAST(:player_id AS VARCHAR) IS NULL OR r.player_id = :player_id)
            ORDER BY r.started_at DESC, r.session_id
            LIMIT ' . $limit . '
            OFFSET :offset
        ';

        return $this->queryFiltered($query, [
            ApiParameters::CONTENT_VERSION => $content_version,
            ApiParameters::INTERFACE_NAME => $interface_name,
            ApiParameters::GUILD_ID => $guild_id,
            ApiParameters::IDLE_HOURS => $idle_hours,
            ApiParameters::RUN => $run,
            ApiParameters::PLAYER_TYPE => $player_type,
            ApiParameters::PLAYER_ID => $player_id,
            ApiParameters::OFFSET => $offset,
        ], [ApiParameters::CONTENT_VERSION], true);
    }

    /**
     * One player's onboarding: every event of each session linked to them, in
     * order. That is the session in which their signup finished, and any later
     * tutorial run. Runs repeat steps, so read it by session_id. Players who
     * signed up before this telemetry, or elsewhere, may have none.
     *
     * @throws Exception
     */
    public function getPlayerOnboarding(string $player_id): Response
    {
        $query = '
            SELECT
              s.session_id,
              s.content_version,
              s.interface_name,
              os.phase,
              os.step_order,
              p.step_key,
              p.kind,
              p.recorded_at
            FROM onboarding_session s
            INNER JOIN onboarding_progress p ON p.session_id = s.session_id
            LEFT JOIN onboarding_step os
              ON os.content_version = s.content_version
              AND os.step_key = p.step_key
            WHERE s.session_id IN (
              SELECT pp.session_id FROM onboarding_progress pp WHERE pp.player_id = :player_id
            )
            ORDER BY p.recorded_at, os.phase, os.step_order, p.kind
        ';

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            [ApiParameters::PLAYER_ID => $player_id],
            [ApiParameters::PLAYER_ID]
        );
    }

    /**
     * As queryAll / queryOne, for queries with optional filters: the shared
     * helpers only bind required parameters.
     *
     * @throws Exception
     */
    private function queryFiltered(string $query, array $params, array $required, bool $fetchAll): Response
    {
        $responseContent = new ApiResponseContentDto();

        $parsedRequest = $this->apiRequestParsingManager->parse(
            $params,
            $required,
            array_values(array_diff(array_keys($params), $required))
        );

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $queryParams = $params + [
            'reached' => self::KIND_REACHED,
            'skipped' => self::KIND_SKIPPED,
            'signup_step_key' => self::SIGNUP_STEP_KEY,
            'offer_step_key' => self::OFFER_STEP_KEY,
            'start_step_key' => self::START_STEP_KEY,
            'certified_step_key' => self::CERTIFIED_STEP_KEY,
            'ftl_step_key' => self::FTL_STEP_KEY,
            'replay_version' => $params[ApiParameters::CONTENT_VERSION] . self::REPLAY_SUFFIX,
        ];
        $queryParams[ApiParameters::IDLE_HOURS] = (int) ($params[ApiParameters::IDLE_HOURS] ?? self::DEFAULT_IDLE_HOURS);

        // Bind only what the query names.
        $queryParams = array_filter(
            $queryParams,
            fn (string $name) => str_contains($query, ":$name"),
            ARRAY_FILTER_USE_KEY
        );

        $db = $this->entityManager->getConnection();

        if ($fetchAll) {
            $responseContent->data = $db->fetchAllAssociative($query, $queryParams);
        } else {
            $row = $db->fetchAssociative($query, $queryParams);
            $responseContent->data = $row === false ? null : $row;
        }

        $responseContent->success = true;

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * Records a batch of events for one session. The session row is inserted
     * with the batch (once; later batches leave it alone), so a batch never
     * depends on an earlier one having arrived.
     *
     * @throws Exception
     */
    public function recordEvents(Request $request): Response
    {
        $responseContent = new ApiResponseContentDto();

        // sendBeacon posts text/plain, so read the body regardless of content type.
        $content = json_decode($request->getContent(), true);

        if (!is_array($content)) {
            $responseContent->errors = ['invalid_request_content' => 'Invalid request content structure'];
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $responseContent->errors = $this->validate($content);

        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $db = $this->entityManager->getConnection();
        $inserted = 0;

        $db->beginTransaction();
        try {
            // The guild is the one this webapp runs for, never one named in the body.
            // A content version with no catalog inserts no session, so its events insert nothing.
            $db->executeStatement('
                INSERT INTO onboarding_session (session_id, browser_id, interface_name, guild_id, content_version)
                SELECT
                  :session_id,
                  :browser_id,
                  :interface_name,
                  (SELECT gm.id FROM guild_meta gm WHERE gm.this_infrastructure = TRUE LIMIT 1),
                  :content_version
                WHERE EXISTS (
                  SELECT 1 FROM onboarding_step os WHERE os.content_version = :content_version
                )
                ON CONFLICT (session_id) DO NOTHING
            ', [
                'session_id' => $content[ApiParameters::SESSION_ID],
                'browser_id' => $content[ApiParameters::BROWSER_ID],
                'interface_name' => $content[ApiParameters::INTERFACE_NAME],
                'content_version' => $content[ApiParameters::CONTENT_VERSION],
            ]);

            // A key outside the session's catalog matches no onboarding_step row and inserts nothing.
            foreach ($content[ApiParameters::EVENTS] as $event) {
                $inserted += $db->executeStatement('
                    INSERT INTO onboarding_progress (session_id, step_key, kind, player_id)
                    SELECT s.session_id, os.step_key, :kind, :player_id
                    FROM onboarding_session s
                    INNER JOIN onboarding_step os
                      ON os.content_version = s.content_version
                      AND os.step_key = :step_key
                    WHERE s.session_id = :session_id
                    ON CONFLICT (session_id, step_key, kind) DO NOTHING
                ', [
                    'session_id' => $content[ApiParameters::SESSION_ID],
                    'step_key' => $event[ApiParameters::STEP_KEY],
                    'kind' => $event[ApiParameters::KIND],
                    'player_id' => $event[ApiParameters::PLAYER_ID] ?? null,
                ]);
            }

            $db->commit();
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }

        $responseContent->success = true;
        $responseContent->data = ['inserted' => $inserted];

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @return array<string, string> errors keyed by field
     */
    private function validate(array $content): array
    {
        $errors = [];

        foreach ([ApiParameters::SESSION_ID, ApiParameters::BROWSER_ID] as $field) {
            if (!$this->matches($content[$field] ?? null, RegexPattern::UUID, 36)) {
                $errors[$field] = "$field must be a UUID";
            }
        }

        foreach ([ApiParameters::INTERFACE_NAME, ApiParameters::CONTENT_VERSION] as $field) {
            if (!$this->matches($content[$field] ?? null, RegexPattern::SLUG, self::MAX_NAME_LENGTH)) {
                $errors[$field] = "$field must be 1-" . self::MAX_NAME_LENGTH . ' letters, digits, ., - or _';
            }
        }

        $events = $content[ApiParameters::EVENTS] ?? null;

        if (!is_array($events) || !array_is_list($events) || count($events) === 0 || count($events) > self::MAX_EVENTS) {
            $errors[ApiParameters::EVENTS] = 'events must be a list of 1-' . self::MAX_EVENTS . ' events';
            return $errors;
        }

        $contentVersion = $content[ApiParameters::CONTENT_VERSION] ?? null;
        $playerStepKeys = is_string($contentVersion) && str_ends_with($contentVersion, self::REPLAY_SUFFIX)
            ? self::REPLAY_PLAYER_STEP_KEYS
            : self::PLAYER_STEP_KEYS;

        foreach ($events as $index => $event) {
            $errors += $this->validateEvent($event, $index, $playerStepKeys);
        }

        return $errors;
    }

    /**
     * @param string[] $playerStepKeys the steps of this session that may carry a player id
     * @return array<string, string>
     */
    private function validateEvent(mixed $event, int $index, array $playerStepKeys): array
    {
        $prefix = ApiParameters::EVENTS . ".$index";

        if (!is_array($event)) {
            return [$prefix => "$prefix must be an object"];
        }

        $errors = [];
        $stepKey = $event[ApiParameters::STEP_KEY] ?? null;
        $kind = $event[ApiParameters::KIND] ?? null;
        $playerId = $event[ApiParameters::PLAYER_ID] ?? null;

        if (!$this->matches($stepKey, RegexPattern::STEP_KEY, self::MAX_STEP_KEY_LENGTH)) {
            $errors["$prefix.step_key"] = "$prefix.step_key is not a valid step key";
        }

        if (!in_array($kind, [self::KIND_REACHED, self::KIND_SKIPPED], true)) {
            $errors["$prefix.kind"] = "$prefix.kind must be reached or skipped";
        }

        if ($playerId !== null) {
            if (!in_array($stepKey, $playerStepKeys, true) || $kind !== self::KIND_REACHED) {
                $errors["$prefix.player_id"] = "$prefix.player_id is only accepted on the reached " . implode(' or ', $playerStepKeys) . ' event';
            } elseif (!$this->matches($playerId, RegexPattern::ID, self::MAX_NAME_LENGTH)) {
                $errors["$prefix.player_id"] = "$prefix.player_id is not a valid player id";
            }
        }

        return $errors;
    }

    private function matches(mixed $value, string $pattern, int $maxLength): bool
    {
        return is_string($value)
            && strlen($value) > 0
            && strlen($value) <= $maxLength
            && preg_match($pattern, $value) === 1;
    }
}
