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
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class StatReadManager
{
    use ApiSqlQueryTrait;

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
     * Longest-first prefixes so 10 / 11 win over 1.
     *
     * @var array<string, string>
     */
    private const OBJECT_TYPE_PREFIXES = [
        '10' => 'provider',
        '11' => 'agreement',
        '0' => 'guild',
        '1' => 'player',
        '2' => 'planet',
        '3' => 'reactor',
        '4' => 'substation',
        '5' => 'struct',
        '6' => 'allocation',
        '7' => 'infusion',
        '8' => 'address',
        '9' => 'fleet',
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
     * @return array{object_type: string, object_index: int}|null
     */
    private function parseObjectKey(string $object_key): ?array
    {
        if (!preg_match(RegexPattern::OBJECT_KEY, $object_key)) {
            return null;
        }
        foreach (array_keys(self::OBJECT_TYPE_PREFIXES) as $prefix) {
            $sep = $prefix . '-';
            if (str_starts_with($object_key, $sep)) {
                $indexPart = substr($object_key, strlen($sep));
                if ($indexPart === '' || !ctype_digit($indexPart)) {
                    return null;
                }

                return [
                    'object_type' => self::OBJECT_TYPE_PREFIXES[$prefix],
                    'object_index' => (int) $indexPart,
                ];
            }
        }

        return null;
    }

    /**
     * @throws Exception
     */
    public function getStatRange(
        string $metric,
        string $object_key,
        int $page,
        string $start_time,
        string $end_time
    ): Response {
        $responseContent = new ApiResponseContentDto();

        $requestParams = [
            ApiParameters::METRIC => $metric,
            ApiParameters::OBJECT_KEY => $object_key,
            ApiParameters::PAGE => (string) $page,
            ApiParameters::START_TIME => $start_time,
            ApiParameters::END_TIME => $end_time,
        ];
        $required = [
            ApiParameters::METRIC,
            ApiParameters::OBJECT_KEY,
            ApiParameters::PAGE,
            ApiParameters::START_TIME,
            ApiParameters::END_TIME,
        ];

        $parsedRequest = $this->apiRequestParsingManager->parse($requestParams, $required);
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
        if ($end - $start > self::MAX_RANGE_SECONDS) {
            $responseContent->errors['time_range_too_large'] = 'Time range exceeds maximum allowed window';

            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $parsed = $this->parseObjectKey($object_key);
        if ($parsed === null) {
            $responseContent->errors['object_key_invalid'] = 'object_key must be like {type}-{index}';

            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $isFamilyTwo = isset(self::FAMILY_TWO_TABLES[$metric]);
        if ($isFamilyTwo) {
            if ($parsed['object_type'] !== 'struct') {
                $responseContent->errors['object_key_invalid'] = 'This metric requires a struct object_key (5-{index})';

                return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
            }
        }

        $limit = PaginationLimits::DEFAULT;
        $page = max(1, $page);
        $offset = ($page - 1) * $limit;

        $table = $isFamilyTwo ? self::FAMILY_TWO_TABLES[$metric] : self::FAMILY_ONE_TABLES[$metric];

        if ($isFamilyTwo) {
            $sql = "SELECT time, value
                FROM {$table}
                WHERE object_index = :object_index
                AND time >= to_timestamp(:start_ts)
                AND time < to_timestamp(:end_ts)
                ORDER BY time
                LIMIT {$limit} OFFSET {$offset}";
            $params = [
                'object_index' => $parsed['object_index'],
                'start_ts' => $start,
                'end_ts' => $end,
            ];
        } else {
            $sql = "SELECT time, value
                FROM {$table}
                WHERE object_type = CAST(:object_type AS structs.object_type)
                AND object_index = :object_index
                AND time >= to_timestamp(:start_ts)
                AND time < to_timestamp(:end_ts)
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
}
