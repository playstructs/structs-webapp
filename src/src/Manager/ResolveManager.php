<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Constant\PaginationLimits;
use App\Constant\RegexPattern;
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

class ResolveManager
{
    use ApiSqlQueryTrait;
    use ObjectKeyTrait;

    /** @var array<string, string> */
    private const TYPE_TABLES = [
        'guild' => 'structs.guild',
        'player' => 'structs.player',
        'planet' => 'structs.planet',
        'reactor' => 'structs.reactor',
        'substation' => 'structs.substation',
        'struct' => 'structs.struct',
        'allocation' => 'structs.allocation',
        'infusion' => 'structs.infusion',
        'fleet' => 'structs.fleet',
        'provider' => 'structs.provider',
        'agreement' => 'structs.agreement',
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
    public function getDenoms(): Response
    {
        $responseContent = new ApiResponseContentDto();
        $db = $this->entityManager->getConnection();
        // Every guild has a uguild.<id> denom from the moment it exists; guild_meta
        // only adds branding, as a jsonb map of exponent => symbol ({"0": "ugil", "6": "gil"}).
        $guilds = $db->fetchAllAssociative(
            'SELECT g.id, gm.denom AS symbols
            FROM structs.guild g
            LEFT JOIN structs.guild_meta gm ON gm.id = g.id
            ORDER BY g.id'
        );

        // Mirrors structs.unit_legacy_format / structs.unit_display_format so clients
        // format from this response instead of hardcoding the conversion table.
        $units = [
            [
                'denom' => 'ualpha',
                'display' => 'alpha',
                'exponent' => 6,
                'quantity' => 'mass',
                'scale' => [
                    ['exponent' => 0, 'symbol' => 'ug'],
                    ['exponent' => 3, 'symbol' => 'mg'],
                    ['exponent' => 6, 'symbol' => 'g'],
                    ['exponent' => 9, 'symbol' => 'Kg'],
                    ['exponent' => 18, 'symbol' => 'Tg'],
                ],
            ],
            [
                'denom' => 'ore',
                'display' => 'ore',
                'exponent' => 0,
                'quantity' => 'mass',
                'scale' => [
                    ['exponent' => 0, 'symbol' => 'g'],
                ],
            ],
        ];
        foreach ($guilds as $guild) {
            $unit = [
                'denom' => 'uguild.' . $guild['id'],
                'display' => 'guild.' . $guild['id'],
                'exponent' => 6,
                'quantity' => 'token',
            ];
            $symbols = is_string($guild['symbols']) ? json_decode($guild['symbols'], true) : null;
            if (is_array($symbols) && $symbols !== []) {
                ksort($symbols, SORT_NUMERIC);
                $unit['scale'] = [];
                foreach ($symbols as $exponent => $symbol) {
                    $unit['scale'][] = ['exponent' => (int) $exponent, 'symbol' => $symbol];
                }
            }
            $units[] = $unit;
        }

        $responseContent->data = [
            'amounts' => 'string',
            'counts_and_ratios' => 'number',
            'units' => $units,
            // `.infused` / `.defusing` are states of a denom, not denoms of their own.
            // Strip a listed suffix, resolve the base denom, keep the suffix as state.
            'state_suffixes' => ['infused', 'defusing'],
            // Guild denoms appear as soon as a guild registers one, so a client will
            // meet denoms this registry has not caught up with yet.
            'unknown_denom' => [
                'exponent' => 0,
                'display' => 'raw',
            ],
            'bases' => [
                'energy' => [
                    'denom' => 'milliwatt',
                    'display' => 'watt',
                    'exponent' => 3,
                    'connection_capacity_is_player_share' => true,
                ],
            ],
            // Fields suffixed `_p` carry the base denomination at full precision;
            // the unsuffixed field is the truncated display value.
            'precision_suffix' => '_p',
        ];
        $responseContent->success = true;
        ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @throws Exception
     */
    public function resolve(?string $q): Response
    {
        $responseContent = new ApiResponseContentDto();
        $parsedRequest = $this->apiRequestParsingManager->parse(
            [ApiParameters::Q => $q],
            [ApiParameters::Q]
        );
        $responseContent->errors = $parsedRequest->errors;
        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $q = (string) $q;
        $db = $this->entityManager->getConnection();

        if (preg_match(RegexPattern::OBJECT_KEY, $q) === 1) {
            $parsed = $this->parseObjectKey($q);
            if ($parsed !== null) {
                $object = $this->fetchTypedObject($parsed['object_type'], $q);
                $responseContent->data = [[
                    'q' => $q,
                    'type' => $parsed['object_type'],
                    'id' => $q,
                    'object' => $object,
                    'is_player' => $parsed['object_type'] === 'player',
                ]];
                $responseContent->success = true;
                ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);

                return new JsonResponse($responseContent, Response::HTTP_OK);
            }
        }

        if (strlen($q) >= 32 && preg_match(RegexPattern::ADDRESS, $q) === 1) {
            $row = $db->fetchAssociative(
                "SELECT pa.address, pa.player_id, pa.status, p.username
                FROM structs.player_address pa
                LEFT JOIN structs.player p ON p.id = pa.player_id
                WHERE pa.address = :q
                LIMIT 1",
                ['q' => $q]
            );
            $responseContent->data = [[
                'q' => $q,
                'type' => 'address',
                'id' => $q,
                'object' => $row === false ? null : $row,
                'is_player' => is_array($row) && !empty($row['player_id']),
            ]];
            $responseContent->success = true;
            ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);

            return new JsonResponse($responseContent, Response::HTTP_OK);
        }

        // % and _ are LIKE wildcards; a search for them should match them literally.
        $like = '%' . addcslashes($q, '\\%_') . '%';
        $rows = $db->fetchAllAssociative(
            "SELECT type, id, name FROM (
                SELECT 'player'::text AS type, p.id, p.username AS name
                FROM structs.player p
                WHERE p.username ILIKE :q
                UNION ALL
                SELECT 'guild'::text, g.id, COALESCE(NULLIF(g.name, ''), gm.name) AS name
                FROM structs.guild g
                LEFT JOIN structs.guild_meta gm ON gm.id = g.id
                WHERE g.name ILIKE :q OR gm.name ILIKE :q OR gm.tag ILIKE :q
                UNION ALL
                SELECT 'substation'::text, s.id, s.name
                FROM structs.substation s
                WHERE s.name ILIKE :q
            ) hits
            ORDER BY type, name
            LIMIT " . PaginationLimits::BATCH_IDS_MAX,
            ['q' => $like]
        );

        $data = [];
        foreach ($rows as $row) {
            $data[] = [
                'q' => $q,
                'type' => $row['type'],
                'id' => $row['id'],
                'name' => $row['name'],
                'object' => null,
                'is_player' => $row['type'] === 'player',
            ];
        }
        $responseContent->data = $data;
        $responseContent->success = true;
        ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @throws Exception
     */
    public function getObjects(?string $ids): Response
    {
        $responseContent = new ApiResponseContentDto();
        $parsedRequest = $this->apiRequestParsingManager->parse(
            [ApiParameters::IDS => $ids],
            [ApiParameters::IDS]
        );
        $responseContent->errors = $parsedRequest->errors;
        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        // RegexPattern::IDS already caps the list at BATCH_IDS_MAX entries.
        $data = [];
        foreach (explode(',', (string) $ids) as $id) {
            $parsed = $this->parseObjectKey($id);
            $type = $parsed['object_type'] ?? null;
            $data[] = [
                'id' => $id,
                'type' => $type,
                'object' => $type === null ? null : $this->fetchTypedObject($type, $id),
            ];
        }

        $responseContent->data = $data;
        $responseContent->success = true;
        ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @throws Exception
     */
    private function fetchTypedObject(string $type, string $id): ?array
    {
        // 'address' keys (8-N) have no backing table, so they resolve to null here.
        $table = self::TYPE_TABLES[$type] ?? null;
        if ($table === null) {
            return null;
        }
        $row = $this->entityManager->getConnection()->fetchAssociative(
            "SELECT * FROM {$table} WHERE id = :id LIMIT 1",
            ['id' => $id]
        );

        return $row === false ? null : $row;
    }
}
