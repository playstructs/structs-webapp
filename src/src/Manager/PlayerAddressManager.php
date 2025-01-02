<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
use App\Entity\PlayerAddress;
use App\Util\ConstraintViolationUtil;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlayerAddressManager
{
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

    public function getPlayerIdByAddressAndGuild(
        string $address,
        string $guild_id
    ): Response {
        $responseContent = new ApiResponseContentDto();

        $parsedRequest = $this->apiRequestParsingManager->parse(
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
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $playerAddressRepository = $this->entityManager->getRepository(PlayerAddress::class);
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