<?php

namespace App\Manager;

use App\Constant\ApiParameters;
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

    /** The only step whose reached row may carry a player id. */
    public const string PLAYER_STEP_KEY = 'signup.employee_record';

    /** First tutorial step; a skipped row here is Skip Tutorial. */
    public const string OFFER_STEP_KEY = 'orientation.tutorial_offer';

    /** Last tutorial step, recorded once the player lands in the real game. */
    public const string FTL_STEP_KEY = 'tutorial.end.ftl_jump';

    public const string KIND_REACHED = 'reached';

    public const string KIND_SKIPPED = 'skipped';

    /** Most events accepted in one request; a full tutorial run is about 66. */
    public const int MAX_EVENTS = 64;

    private const int MAX_NAME_LENGTH = 64;

    private const int MAX_STEP_KEY_LENGTH = 96;

    /** Hours without a new event before a session counts as stopped, when idle_hours is omitted. */
    public const int DEFAULT_IDLE_HOURS = 24;

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
        ?string $idle_hours
    ): Response {
        $query = '
            WITH sessions AS (
              SELECT s.session_id
              FROM onboarding_session s
              WHERE s.content_version = :content_version
                AND (CAST(:interface_name AS VARCHAR) IS NULL OR s.interface_name = :interface_name)
                AND (CAST(:guild_id AS VARCHAR) IS NULL OR s.guild_id = :guild_id)
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
        ], [ApiParameters::CONTENT_VERSION, ApiParameters::PHASE], true);
    }

    /**
     * Tutorial outcome among sessions that reached the tutorial offer:
     * completed (landed in the game after the FTL jump), declined (Skip
     * Tutorial), left (idle without either), and in progress (the rest).
     *
     * @throws Exception
     */
    public function getTutorialOutcomes(
        string $content_version,
        ?string $interface_name,
        ?string $guild_id,
        ?string $idle_hours
    ): Response {
        $query = '
            WITH offered AS (
              SELECT
                s.session_id,
                EXISTS (
                  SELECT 1 FROM onboarding_progress p
                  WHERE p.session_id = s.session_id
                    AND p.step_key = :ftl_step_key AND p.kind = :reached
                ) AS completed,
                EXISTS (
                  SELECT 1 FROM onboarding_progress p
                  WHERE p.session_id = s.session_id
                    AND p.step_key = :offer_step_key AND p.kind = :skipped
                ) AS declined,
                (
                  SELECT max(p.recorded_at) FROM onboarding_progress p WHERE p.session_id = s.session_id
                ) < now() - make_interval(hours => CAST(:idle_hours AS INTEGER)) AS idle
              FROM onboarding_session s
              INNER JOIN onboarding_progress o
                ON o.session_id = s.session_id
                AND o.step_key = :offer_step_key
                AND o.kind = :reached
              WHERE s.content_version = :content_version
                AND (CAST(:interface_name AS VARCHAR) IS NULL OR s.interface_name = :interface_name)
                AND (CAST(:guild_id AS VARCHAR) IS NULL OR s.guild_id = :guild_id)
            )
            SELECT
              count(*) AS offered,
              count(*) FILTER (WHERE completed) AS completed,
              count(*) FILTER (WHERE declined AND NOT completed) AS declined,
              count(*) FILTER (WHERE NOT completed AND NOT declined AND idle) AS left_during_tutorial,
              count(*) FILTER (WHERE NOT completed AND NOT declined AND NOT idle) AS in_progress
            FROM offered
        ';

        return $this->queryFiltered($query, [
            ApiParameters::CONTENT_VERSION => $content_version,
            ApiParameters::INTERFACE_NAME => $interface_name,
            ApiParameters::GUILD_ID => $guild_id,
            ApiParameters::IDLE_HOURS => $idle_hours,
        ], [ApiParameters::CONTENT_VERSION], false);
    }

    /**
     * One player's onboarding: every event of the session in which their
     * signup finished, in order. Players who signed up before this telemetry,
     * or elsewhere, have none.
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
            FROM onboarding_progress pp
            INNER JOIN onboarding_session s ON s.session_id = pp.session_id
            INNER JOIN onboarding_progress p ON p.session_id = s.session_id
            LEFT JOIN onboarding_step os
              ON os.content_version = s.content_version
              AND os.step_key = p.step_key
            WHERE pp.player_id = :player_id
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
            'offer_step_key' => self::OFFER_STEP_KEY,
            'ftl_step_key' => self::FTL_STEP_KEY,
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

        foreach ($events as $index => $event) {
            $errors += $this->validateEvent($event, $index);
        }

        return $errors;
    }

    /**
     * @return array<string, string>
     */
    private function validateEvent(mixed $event, int $index): array
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
            if ($stepKey !== self::PLAYER_STEP_KEY || $kind !== self::KIND_REACHED) {
                $errors["$prefix.player_id"] = "$prefix.player_id is only accepted on the reached " . self::PLAYER_STEP_KEY . ' event';
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
