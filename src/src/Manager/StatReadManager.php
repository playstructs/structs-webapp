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

        // Precomputed LOCF rollups: hourly snapshots of Σ last-known value across
        // all objects. Empty buckets are absent; the unfinished current hour is not
        // present until the :02 cron writes it.
        if ($bucket === '1d') {
            $sql = "SELECT DISTINCT ON (date_trunc('day', bucket))
                    date_trunc('day', bucket) AS bucket,
                    sum,
                    CASE WHEN population > 0 THEN sum / population END AS avg,
                    population,
                    sum(samples) OVER (PARTITION BY date_trunc('day', bucket)) AS samples
                FROM structs.stat_rollup
                WHERE metric = :metric
                AND object_type = CAST(:object_type AS structs.object_type)
                AND bucket >= date_trunc('day', to_timestamp(:start_ts))
                AND bucket < date_trunc('day', to_timestamp(:end_ts)) + INTERVAL '1 day'
                ORDER BY date_trunc('day', bucket), bucket DESC";
        } else {
            $sql = "SELECT bucket,
                    sum,
                    CASE WHEN population > 0 THEN sum / population END AS avg,
                    population,
                    samples
                FROM structs.stat_rollup
                WHERE metric = :metric
                AND object_type = CAST(:object_type AS structs.object_type)
                AND bucket >= date_trunc('hour', to_timestamp(:start_ts))
                AND bucket <= date_trunc('hour', to_timestamp(:end_ts))
                ORDER BY bucket";
        }

        $params = [
            'metric' => $metric,
            'object_type' => $object_type,
            'start_ts' => $start,
            'end_ts' => $end,
        ];

        $db = $this->entityManager->getConnection();
        $responseContent->data = $db->fetchAllAssociative($sql, $params);
        $responseContent->success = true;
        ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }
}
