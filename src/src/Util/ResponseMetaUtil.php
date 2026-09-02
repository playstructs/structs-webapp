<?php

namespace App\Util;

use App\Dto\ApiResponseContentDto;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;

class ResponseMetaUtil
{
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
        }

        $row = $db->fetchAssociative('SELECT height FROM current_block LIMIT 1');
        if (is_array($row) && array_key_exists('height', $row)) {
            $responseContent->meta = ['height' => $row['height']];
        }
    }
}
