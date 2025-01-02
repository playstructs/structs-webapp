<?php

namespace App\Controller;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
use App\Entity\PlayerAddress;
use App\Manager\ApiRequestParsingManager;
use App\Util\ConstraintViolationUtil;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlayerController extends AbstractController
{
    #[Route('/api/player_address/id/address/{address}/guild/{guild_id}', name: 'api_player_id', methods: ['GET'])]
    public function getPlayerIdByAddressAndGuild(
        string $address,
        string $guild_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response
    {
        $responseContent = new ApiResponseContentDto();
        $apiRequestParsingManager = new ApiRequestParsingManager($validator, new ConstraintViolationUtil());
        $parsedRequest = $apiRequestParsingManager->parse(
            [
                ApiParameters::ADDRESS => $address,
                ApiParameters::GUILD_ID => $guild_id,
            ],
            [
                ApiParameters::ADDRESS,
                ApiParameters::GUILD_ID,
            ]
        );

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_NOT_FOUND);
        }

        $playerAddressRepository = $entityManager->getRepository(PlayerAddress::class);
        $playerAddress = $playerAddressRepository->findOneBy([
            'address' => $parsedRequest->params->address,
            'guild_id' => $parsedRequest->params->guild_id
        ]);

        if ($playerAddress === null) {
            $responseContent->errors = ['player_address_not_found' => 'Player address not found'];
            return new JsonResponse($responseContent, Response::HTTP_NOT_FOUND);
        }

        $responseContent->data = (object)['player_id' => $playerAddress->getPlayerId()];
        $responseContent->success = true;

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }
}
