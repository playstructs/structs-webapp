<?php

namespace App\Controller;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
use App\Util\ResponseMetaUtil;
use App\Util\ConsistentRead;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class TimestampController extends AbstractController
{
    #[Route('/api/timestamp', name: 'api_get_unix_timestamp', methods: ['GET'])]
    public function getUnixTimestamp(): Response
    {
        $responseContent = new ApiResponseContentDto();
        $responseContent->data = [ApiParameters::UNIX_TIMESTAMP => time()];
        $responseContent->success = true;
        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @throws Exception
     */
    #[Route('/api/block', name: 'api_get_current_block', methods: ['GET'])]
    public function getCurrentBlock(EntityManagerInterface $entityManager): Response
    {
        $responseContent = new ApiResponseContentDto();
        $db = $entityManager->getConnection();
        ConsistentRead::run($db, function () use ($db, $responseContent): void {
            $row = $db->fetchAssociative(
                'SELECT chain AS chain_id, height, tip_height, lag_blocks, status, updated_at FROM structs.current_block LIMIT 1'
            );
            $responseContent->data = $row === false ? null : $row;
            $responseContent->meta = ResponseMetaUtil::snapshotMeta($db);
            $responseContent->success = true;
        });

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }
}
