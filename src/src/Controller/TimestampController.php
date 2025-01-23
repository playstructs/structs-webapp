<?php

namespace App\Controller;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
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
}
