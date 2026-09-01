<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Constant\ObjectTypes;
use App\Constant\PaginationLimits;
use App\Dto\ApiResponseContentDto;
use App\Trait\ApiSqlQueryTrait;
use App\Trait\ObjectKeyTrait;
use App\Util\ConstraintViolationUtil;
use App\Util\ResponseMetaUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class StatReadManager
{
    use ApiSqlQueryTrait;
    use ObjectKeyTrait;

    private const int MAX_RANGE_SECONDS = 604800;

    /** @var array<string, string> metric slug => qualified table */
    private const FAMILY_ONE_TABLES = [
        'ore' => 'structs.stat_ore',
        'fuel' => 'structs.stat_fuel',
        'capacity' => 'structs.stat_capacity',
        'load' => 'structs.stat_load',
        'power' => 'structs.stat_power',
    ];

    /** @var array<string, string> */
    private const FAMILY_TWO_TABLES = [
        'structs_load' => 'structs.stat_structs_load',
        'connection_count' => 'structs.stat_connection_count',
        'connection_capacity' => 'structs.stat_connection_capacity',
        'struct_health' => 'structs.stat_struct_health',
        'struct_status' => 'structs.stat_struct_status',
    ];

    /**
     * Family-two stat tables omit object_type, so they implicitly key on a single
     * entity. The mapping is enforced at request time so callers receive a clear
     * 400 instead of a silently empty result when they pass the wrong object_key.
     *
     * @var array<string, list<string>>
     */
    private const FAMILY_TWO_OBJECT_TYPES = [
        'structs_load' => ['player'],
        'connection_count' => ['substation'],
        'connection_capacity' => ['substation'],
        'struct_health' => ['struct'],
        'struct_status' => ['struct'],
    ];

    public EntityManagerInterface $entityManager;

    public ValidatorInterface $validator;

    public ConstraintViolationUtil $constraintViolationUtil;

    public ApiRequestParsingManager $apiRequestParsingManager;

    public function __construct(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->validator = $validator;
        $this->constraintViolationUtil = new ConstraintViolationUtil();
        $this->apiRequestParsingManager = new ApiRequestParsingManager(
            $this->validator,
            $this->constraintViolationUtil
        );
    }

    /**
     * @throws Exception
     */
    public function getStatRange(
        string $metric,
        string $object_key,
        int $page,
        string $start_time,
        string $end_time,
        ?string $bucket = null,
        ?string $limitParam = null
    ): Response {
        $responseContent = new ApiResponseContentDto();

        $requestParams = [
            ApiParameters::METRIC => $metric,
            ApiParameters::OBJECT_KEY => $object_key,
            ApiParameters::PAGE => (string) $page,
            ApiParameters::START_TIME => $start_time,
            ApiParameters::END_TIME => $end_time,
            ApiParameters::BUCKET => $bucket,
            ApiParameters::LIMIT => $limitParam,
        ];
        $required = [
            ApiParameters::METRIC,
            ApiParameters::OBJECT_KEY,
            ApiParameters::PAGE,
            ApiParameters::START_TIME,
            ApiParameters::END_TIME,
        ];

        $parsedRequest = $this->apiRequestParsingManager->parse(
            $requestParams,
            $required,
            [ApiParameters::BUCKET, ApiParameters::LIMIT]
        );
        $responseContent->errors = $parsedRequest->errors;
        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $start = (int) $parsedRequest->params->start_time;
        $end = (int) $parsedRequest->params->end_time;
        if ($end <= $start) {
            $responseContent->errors['time_range_invalid'] = 'end_time must be greater than start_time';

            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }
        $maxRange = ($bucket !== null && $bucket !== '')
            ? PaginationLimits::AGGREGATE_MAX_SECONDS
            : self::MAX_RANGE_SECONDS;
        if ($end - $start > $maxRange) {
            $responseContent->errors['time_range_too_large'] = 'Time range exceeds maximum allowed window';

            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $parsed = $this->parseObjectKey($object_key);
        if ($parsed === null) {
            $responseContent->errors['object_key_invalid'] = 'object_key must be like {type}-{index}';

            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $isFamilyTwo = isset(self::FAMILY_TWO_TABLES[$metric]);
        if (!$isFamilyTwo && !isset(self::FAMILY_ONE_TABLES[$metric])) {
            $responseContent->errors['metric_invalid'] = 'Unknown metric';

            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }
        if ($isFamilyTwo) {
            $allowed = self::FAMILY_TWO_OBJECT_TYPES[$metric] ?? [];
            if (!in_array($parsed['object_type'], $allowed, true)) {
                $expected = [];
                foreach ($allowed as $type) {
                    $prefix = array_search($type, ObjectTypes::PREFIXES, true);
                    $expected[] = $prefix === false ? $type : "{$type} ({$prefix}-{index})";
                }
                $hint = $expected === [] ? 'no object types are configured for this metric' : implode(' or ', $expected);
                $responseContent->errors['object_key_invalid'] = "metric '{$metric}' requires object_key for {$hint}";

                return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
            }
        }

        $limit = PaginationLimits::clamp($limitParam);
        $page = max(1, $page);
        $offset = ($page - 1) * $limit;

        $table = $isFamilyTwo ? self::FAMILY_TWO_TABLES[$metric] : self::FAMILY_ONE_TABLES[$metric];
        $select = 'time, value';
        $group = '';
        if ($bucket === '1h' || $bucket === '1d') {
            $trunc = $bucket === '1h' ? 'hour' : 'day';
            $select = "date_trunc('{$trunc}', time) AS time, AVG(value) AS value";
            $group = 'GROUP BY 1';
        }

        if ($isFamilyTwo) {
            $sql = "SELECT {$select}
                FROM {$table}
                WHERE object_index = :object_index
                AND time >= to_timestamp(:start_ts)
                AND time < to_timestamp(:end_ts)
                {$group}
                ORDER BY time
                LIMIT {$limit} OFFSET {$offset}";
            $params = [
                'object_index' => $parsed['object_index'],
                'start_ts' => $start,
                'end_ts' => $end,
            ];
        } else {
            $sql = "SELECT {$select}
                FROM {$table}
                WHERE object_type = CAST(:object_type AS structs.object_type)
                AND object_index = :object_index
                AND time >= to_timestamp(:start_ts)
                AND time < to_timestamp(:end_ts)
                {$group}
                ORDER BY time
                LIMIT {$limit} OFFSET {$offset}";
            $params = [
                'object_type' => $parsed['object_type'],
                'object_index' => $parsed['object_index'],
                'start_ts' => $start,
                'end_ts' => $end,
            ];
        }

        $db = $this->entityManager->getConnection();
        $result = $db->fetchAllAssociative($sql, $params);
        $responseContent->data = $result;
        $responseContent->success = true;

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @throws Exception
     */
    public function getStatAggregate(
        string $metric,
        string $object_type,
        string $start_time,
        string $end_time,
        ?string $bucket
    ): Response {
        $responseContent = new ApiResponseContentDto();
        $requestParams = [
            ApiParameters::METRIC => $metric,
            ApiParameters::OBJECT_TYPE => $object_type,
            ApiParameters::START_TIME => $start_time,
            ApiParameters::END_TIME => $end_time,
            ApiParameters::BUCKET => $bucket,
        ];
        $parsedRequest = $this->apiRequestParsingManager->parse(
            $requestParams,
            [ApiParameters::METRIC, ApiParameters::OBJECT_TYPE, ApiParameters::START_TIME, ApiParameters::END_TIME],
            [ApiParameters::BUCKET]
        );
        $responseContent->errors = $parsedRequest->errors;
        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $start = (int) $start_time;
        $end = (int) $end_time;
        if ($end <= $start) {
            $responseContent->errors['time_range_invalid'] = 'end_time must be greater than start_time';

            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }
        if ($end - $start > PaginationLimits::AGGREGATE_MAX_SECONDS) {
            $responseContent->errors['time_range_too_large'] = 'Time range exceeds maximum allowed window';

            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $isFamilyTwo = isset(self::FAMILY_TWO_TABLES[$metric]);
        if (!$isFamilyTwo && !isset(self::FAMILY_ONE_TABLES[$metric])) {
            $responseContent->errors['metric_invalid'] = 'Unknown metric';

            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }
        if ($isFamilyTwo) {
            $allowed = self::FAMILY_TWO_OBJECT_TYPES[$metric] ?? [];
            if (!in_array($object_type, $allowed, true)) {
                $responseContent->errors['object_type_invalid'] = "metric '{$metric}' does not support object_type '{$object_type}'";

                return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
            }
        }

        $trunc = ($bucket === '1d') ? 'day' : 'hour';
        $interval = ($bucket === '1d') ? '1 day' : '1 hour';
        $table = $isFamilyTwo ? self::FAMILY_TWO_TABLES[$metric] : self::FAMILY_ONE_TABLES[$metric];
        $typeFilter = $isFamilyTwo
            ? ''
            : 'AND s.object_type = CAST(:object_type AS structs.object_type)';

        // Samples are change-triggered: an object reports only when its value moves,
        // so a plain per-bucket aggregate would describe only the objects that
        // happened to move. Each bucket instead reports the last-known value of every
        // object as of the bucket's close (LOCF), carried forward from its most recent
        // sample. Objects with no sample yet contribute nothing rather than zero.
        //
        // Rather than joining every bucket against the table, the running total is
        // rebuilt from per-object deltas: `seed` collapses all history before the
        // first bucket closes into one row per object, and `in_range` reads only the
        // requested window, so the scan is bounded by the range, not the table.
        $sql = "WITH bounds AS (
                SELECT
                    date_trunc('{$trunc}', to_timestamp(:start_ts)) AS b0,
                    date_trunc('{$trunc}', to_timestamp(:end_ts)) AS bn,
                    CAST(:bucket_interval AS interval) AS step
            ),
            buckets AS (
                SELECT generate_series(b0, bn, step) AS bucket FROM bounds
            ),
            seed AS (
                SELECT DISTINCT ON (s.object_index)
                    (SELECT b0 FROM bounds) AS bucket,
                    s.object_index,
                    s.value
                FROM {$table} s
                WHERE s.time < (SELECT b0 + step FROM bounds)
                {$typeFilter}
                ORDER BY s.object_index, s.time DESC
            ),
            in_range AS (
                SELECT DISTINCT ON (date_trunc('{$trunc}', s.time), s.object_index)
                    date_trunc('{$trunc}', s.time) AS bucket,
                    s.object_index,
                    s.value
                FROM {$table} s
                WHERE s.time >= (SELECT b0 + step FROM bounds)
                AND s.time < (SELECT bn + step FROM bounds)
                {$typeFilter}
                ORDER BY date_trunc('{$trunc}', s.time), s.object_index, s.time DESC
            ),
            observations AS (
                SELECT * FROM seed
                UNION ALL
                SELECT * FROM in_range
            ),
            deltas AS (
                SELECT
                    bucket,
                    value - COALESCE(lag(value) OVER w, 0) AS delta,
                    CASE WHEN lag(value) OVER w IS NULL THEN 1 ELSE 0 END AS is_new
                FROM observations
                WINDOW w AS (PARTITION BY object_index ORDER BY bucket)
            ),
            per_bucket AS (
                SELECT bucket, SUM(delta) AS delta_sum, SUM(is_new) AS new_objects
                FROM deltas
                GROUP BY bucket
            ),
            sample_counts AS (
                SELECT date_trunc('{$trunc}', s.time) AS bucket, count(*) AS samples
                FROM {$table} s
                WHERE s.time >= (SELECT b0 FROM bounds)
                AND s.time < (SELECT bn + step FROM bounds)
                {$typeFilter}
                GROUP BY 1
            ),
            rolled AS (
                SELECT
                    b.bucket,
                    SUM(COALESCE(pb.delta_sum, 0)) OVER (ORDER BY b.bucket) AS total,
                    SUM(COALESCE(pb.new_objects, 0)) OVER (ORDER BY b.bucket) AS population,
                    COALESCE(sc.samples, 0) AS samples
                FROM buckets b
                LEFT JOIN per_bucket pb ON pb.bucket = b.bucket
                LEFT JOIN sample_counts sc ON sc.bucket = b.bucket
            )
            SELECT
                bucket,
                CASE WHEN population > 0 THEN total END AS sum,
                CASE WHEN population > 0 THEN total / population END AS avg,
                population,
                samples
            FROM rolled
            ORDER BY bucket";

        $params = [
            'start_ts' => $start,
            'end_ts' => $end,
            'bucket_interval' => $interval,
        ];
        if (!$isFamilyTwo) {
            $params['object_type'] = $object_type;
        }

        $db = $this->entityManager->getConnection();
        $responseContent->data = $db->fetchAllAssociative($sql, $params);
        $responseContent->success = true;
        ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }
}
