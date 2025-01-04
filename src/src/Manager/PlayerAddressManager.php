<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
use App\Entity\PlayerAddress;
use App\Entity\PlayerAddressPending;
use App\Factory\PlayerAddressPendingFactory;
use App\Repository\PlayerAddressRepository;
use App\Util\ConstraintViolationUtil;
use DateMalformedStringException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

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

        /** @var PlayerAddressRepository $playerAddressRepository */
        $playerAddressRepository = $this->entityManager->getRepository(PlayerAddress::class);
        $playerAddress = $playerAddressRepository->findApprovedByAddressAndGuild(
            $parsedRequest->params->address,
            $parsedRequest->params->guild_id
        );

        if ($playerAddress === null) {
            $responseContent->errors = ['player_address_not_found' => 'Player address not found'];
            return new JsonResponse($responseContent, Response::HTTP_NOT_FOUND);
        }

        $responseContent->data = (object)['player_id' => $playerAddress->getPlayerId()];
        $responseContent->success = true;

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @param Request $request
     * @param PlayerAddressPendingFactory $playerAddressPendingFactory
     * @param SignatureValidationManager $signatureValidationManager
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function addPendingAddress(
        Request $request,
        PlayerAddressPendingFactory $playerAddressPendingFactory,
        SignatureValidationManager $signatureValidationManager
    ): Response {
        $responseContent = new ApiResponseContentDto();
        $playerAddressPending = null;
        $playerAddressPendingRepository = $this->entityManager->getRepository(PlayerAddressPending::class);

        /** @var PlayerAddressRepository $playerAddressRepository */
        $playerAddressRepository = $this->entityManager->getRepository(PlayerAddress::class);

        $parsedRequest = $this->apiRequestParsingManager->parseJsonRequest($request, [
            ApiParameters::ADDRESS,
            ApiParameters::SIGNATURE,
            ApiParameters::PUBKEY,
            ApiParameters::GUILD_ID,
            ApiParameters::CODE,
        ],[
            ApiParameters::IP,
            ApiParameters::USER_AGENT
        ]);

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse(
                $responseContent,
                Response::HTTP_BAD_REQUEST
            );
        }

        try {

            $playerAddressPending = $playerAddressPendingFactory->makeFromRequestParams($parsedRequest->params);

        } catch (DateMalformedStringException $e) {

            $responseContent->errors  = ["date_malformed_string" => $e->getMessage()];

        }

        if (count($responseContent->errors) > 0) {
            return new JsonResponse(
                $responseContent,
                Response::HTTP_BAD_REQUEST
            );
        }

        if (!$signatureValidationManager->validate(
            $playerAddressPending->getAddress(),
            $playerAddressPending->getPubkey(),
            $playerAddressPending->getSignature(),
            $signatureValidationManager->buildGuildMembershipJoinProxyMessage(
                $parsedRequest->params->guild_id,
                $playerAddressPending->getAddress(),
                0
            )
        )) {
            $responseContent->errors = ['signature_validation_failed' => 'Invalid signature'];

            return new JsonResponse(
                $responseContent,
                Response::HTTP_BAD_REQUEST
            );
        }

        if (
            $playerAddressPendingRepository->find($playerAddressPending->getAddress())
            || $playerAddressRepository->findApprovedByAddressAndGuild(
                $parsedRequest->params->address,
                $parsedRequest->params->guild_id
            )
        ) {

            $responseContent->errors = ['resource_already_exists' => 'Resource already exists'];

            return new JsonResponse(
                $responseContent,
                Response::HTTP_CONFLICT
            );

        }

        $this->entityManager->persist($playerAddressPending);
        $this->entityManager->flush();

        $responseContent->success = true;

        return new JsonResponse(
            $responseContent,
            Response::HTTP_ACCEPTED
        );
    }
}