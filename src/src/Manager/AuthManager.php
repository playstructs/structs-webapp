<?php

namespace App\Manager;

use App\Dto\ApiResponseContentDto;
use App\Entity\PlayerPending;
use App\Factory\PlayerPendingFactory;
use App\Util\ConstraintViolationUtil;
use DateMalformedStringException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use TypeError;

class AuthManager
{
    public EntityManagerInterface $entityManager;

    public ValidatorInterface $validator;

    public PlayerPendingFactory $playerPendingFactory;

    public SignatureValidationManager $signatureValidationManager;

    public ConstraintViolationUtil $constraintViolationUtil;

    public function __construct(
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        PlayerPendingFactory $playerPendingFactory,
        SignatureValidationManager $signatureValidationManager,
    ) {
        $this->validator = $validator;
        $this->entityManager = $entityManager;
        $this->playerPendingFactory = $playerPendingFactory;
        $this->signatureValidationManager = $signatureValidationManager;
        $this->constraintViolationUtil = new ConstraintViolationUtil();
    }

    /**
     * Registers a new player with the operating guild and chain.
     *
     * When a player pending record is added to the database
     * it triggers a call to structsd that validates the user's signature
     * and sends a GuildMembershipJoinProxy message.
     * Once the GuildMembershipJoinProxy message is processed,
     * an ID for the player will be generated and stored in the DB asynchronously.
     *
     * Since the signup process is asynchronous,
     * login needs to be called separately after the player's ID is generated.
     *
     * @param Request $request
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function signup(Request $request): Response {

        $content = json_decode($request->getContent(), true);
        $responseContent = new ApiResponseContentDto();
        $playerPendingRepository = $this->entityManager->getRepository(PlayerPending::class);
        $playerPending = null;

        try {

            $playerPending = $this->playerPendingFactory->makeFromArray($content);

            $constraintViolationList = $this->validator->validate($playerPending);
            $errors = $this->constraintViolationUtil->getErrorMessages($constraintViolationList);

        } catch (TypeError) {

            $errors = ["invalid_request_content" => "Invalid request content structure"];

        } catch (DateMalformedStringException $e) {

            $errors = ["date_malformed_string" => $e->getMessage()];

        }

        $responseContent->errors = $errors;

        if (count($errors) > 0) {

            return new Response(
                json_encode($responseContent),
                Response::HTTP_BAD_REQUEST
            );

        }

        if (!$this->signatureValidationManager->validate(
            $playerPending->getPrimaryAddress(),
            $playerPending->getPubkey(),
            $playerPending->getSignature(),
            $this->signatureValidationManager->buildGuildMembershipJoinProxyMessage(
                '0-1', // TODO: Need to add guild_id to request and player_pending
                $playerPending->getPrimaryAddress(),
                0
            )
        )) {
            $responseContent->errors = ['signature_validation_failed' => 'Invalid signature'];

            return new Response(
                json_encode($responseContent),
                Response::HTTP_BAD_REQUEST
            );
        }

        // TODO: Will also need to check the player table when the entity and repository is created
        if ($playerPendingRepository->find($playerPending->getPrimaryAddress())) {

            $responseContent->errors = ['resource_already_exists' => 'Resource already exists'];

            return new Response(
                json_encode($responseContent),
                Response::HTTP_CONFLICT
            );

        }

        $this->entityManager->persist($playerPending);
        $this->entityManager->flush();

        $responseContent->success = true;

        return new Response(
            json_encode($responseContent),
            Response::HTTP_ACCEPTED
        );
    }
}
