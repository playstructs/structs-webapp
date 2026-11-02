<?php

namespace App\Util;

use App\Dto\ApiResponseContentDto;
use Doctrine\DBAL\Exception;
use Doctrine\DBAL\Connection;
use UnexpectedValueException;
use Doctrine\ORM\EntityManagerInterface;

class ResponseMetaUtil
{
    /** Call only inside the same consistent snapshot as the response data. */
    public static function snapshotMeta(Connection $db, string|array|null $apiModel = null): array
    {
        $models = $apiModel === null ? [] : (is_array($apiModel) ? $apiModel : [$apiModel]);
        $placeholders = [];
        $params = [];
        foreach (array_values($models) as $index => $model) {
            $placeholders[] = ':model' . $index;
            $params['model' . $index] = $model;
        }
        $row = $db->fetchAssociative(
            'SELECT to_jsonb(r)::text AS meta FROM structs.api_readiness(ARRAY['
                . implode(',', $placeholders) . ']::text[]) r',
            $params
        );
        if (!is_array($row) || !isset($row['meta'])) {
            throw new UnexpectedValueException('Indexed API readiness is unavailable');
        }

        return json_decode($row['meta'], true, 512, JSON_THROW_ON_ERROR | JSON_BIGINT_AS_STRING);
    }

    /**
     * @throws Exception
     */
    public static function stampHeight(
        ApiResponseContentDto $responseContent,
        EntityManagerInterface $entityManager,
        ?string $apiModel = null
    ): void {
        $db = $entityManager->getConnection();

        if ($apiModel !== null) {
            $row = $db->fetchAssociative(
                'SELECT source_height FROM structs.api_refresh_state WHERE model = :model LIMIT 1',
                ['model' => $apiModel]
            );
            if (is_array($row) && array_key_exists('source_height', $row)) {
                $responseContent->meta = ['height' => $row['source_height']];

                return;
            }
            $responseContent->meta = ['height' => null, 'data_ready' => false];

            return;
        }

        $row = $db->fetchAssociative('SELECT height FROM current_block LIMIT 1');
        if (is_array($row) && array_key_exists('height', $row)) {
            $responseContent->meta = ['height' => $row['height']];
        }
    }
}
