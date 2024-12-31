<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
use App\Entity\Player;
use App\Entity\PlayerAddress;
use App\Entity\PlayerPending;
use App\Factory\PlayerPendingFactory;
use App\Security\PlayerAuthenticator;
use App\Util\ConstraintViolationUtil;
use DateMalformedStringException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\RememberMeBadge;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class AuthManager
{
    public EntityManagerInterface $entityManager;

    public ValidatorInterface $validator;

    public SignatureValidationManager $signatureValidationManager;

    public ConstraintViolationUtil $constraintViolationUtil;

    public ApiRequestParsingManager $apiRequestParsingManager;

    public function __construct(
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        SignatureValidationManager $signatureValidationManager
    ) {
        $this->validator = $validator;
        $this->entityManager = $entityManager;
        $this->signatureValidationManager = $signatureValidationManager;
        $this->constraintViolationUtil = new ConstraintViolationUtil();
        $this->apiRequestParsingManager = new ApiRequestParsingManager(
            $this->validator,
            $this->constraintViolationUtil
        );
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
     * @param PlayerPendingFactory $playerPendingFactory
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function signup(
        Request $request,
        PlayerPendingFactory $playerPendingFactory
    ): Response {

        $responseContent = new ApiResponseContentDto();
        $playerPending = null;
        $playerPendingRepository = $this->entityManager->getRepository(PlayerPending::class);

        $parsedRequest = $this->apiRequestParsingManager->parse($request, [
            ApiParameters::PRIMARY_ADDRESS,
            ApiParameters::SIGNATURE,
            ApiParameters::PUBKEY,
            ApiParameters::GUILD_ID,
        ],
        [
            ApiParameters::USERNAME,
            ApiParameters::PFP
        ]);

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse(
                $responseContent,
                Response::HTTP_BAD_REQUEST
            );
        }


        try {

            $playerPending = $playerPendingFactory->makeFromRequestParams($parsedRequest->params);

        } catch (DateMalformedStringException $e) {

            $responseContent->errors  = ["date_malformed_string" => $e->getMessage()];

        }

        if (count($responseContent->errors) > 0) {
            return new JsonResponse(
                $responseContent,
                Response::HTTP_BAD_REQUEST
            );
        }

        if (!$this->signatureValidationManager->validate(
            $playerPending->getPrimaryAddress(),
            $playerPending->getPubkey(),
            $playerPending->getSignature(),
            $this->signatureValidationManager->buildGuildMembershipJoinProxyMessage(
                $playerPending->getGuildId(), // TODO: Need to add guild_id player_pending
                $playerPending->getPrimaryAddress(),
                0
            )
        )) {
            $responseContent->errors = ['signature_validation_failed' => 'Invalid signature'];

            return new JsonResponse(
                $responseContent,
                Response::HTTP_BAD_REQUEST
            );
        }

        // TODO: Will also need to check the player table when the entity and repository is created
        if ($playerPendingRepository->find($playerPending->getPrimaryAddress())) {

            $responseContent->errors = ['resource_already_exists' => 'Resource already exists'];

            return new JsonResponse(
                $responseContent,
                Response::HTTP_CONFLICT
            );

        }

        $this->entityManager->persist($playerPending);
        $this->entityManager->flush();

        $responseContent->success = true;

        return new JsonResponse(
            $responseContent,
            Response::HTTP_ACCEPTED
        );
    }

    /**
     * @param Request $request
     * @param Security $security
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function login(
        Request $request,
        Security $security
    ): Response {

        $responseContent = new ApiResponseContentDto();

        $parsedRequest = $this->apiRequestParsingManager->parse($request, [
            ApiParameters::ADDRESS,
            ApiParameters::SIGNATURE,
            ApiParameters::PUBKEY,
            ApiParameters::GUILD_ID,
        ]);

        $responseContent->errors = $parsedRequest->errors;

        if (
            count($responseContent->errors) > 0
            || !$this->signatureValidationManager->validate(
                $parsedRequest->params->address,
                $parsedRequest->params->pubkey,
                $parsedRequest->params->signature,
                $this->signatureValidationManager->buildGuildMembershipJoinProxyMessage( // TODO: Change to buildLoginMessage when proper message is determined
                    $parsedRequest->params->guild_id,
                    $parsedRequest->params->address,
                    0
                )
            )
        ) {
            $responseContent->errors['signature_validation_failed'] = 'Invalid signature';

            return new JsonResponse(
                $responseContent,
                Response::HTTP_UNAUTHORIZED
            );
        }

        $playerAddressRepo = $this->entityManager->getRepository(PlayerAddress::class);
        $playerAddress = $playerAddressRepo->findOneBy([
            'address' => $parsedRequest->params->address,
            'guild_id' => $parsedRequest->params->guild_id,
        ]);

        if (!$playerAddress) {
            $responseContent->errors = ['player_does_not_exists' => 'Player does not exist'];

            return new JsonResponse(
                $responseContent,
                Response::HTTP_UNAUTHORIZED
            );
        }

        $playerRepository = $this->entityManager->getRepository(Player::class);
        $player = $playerRepository->find($playerAddress->getPlayerId());

        $securityResponse = $security->login(
            $player,
            PlayerAuthenticator::class,
            'api',
            [(new RememberMeBadge())->enable()]
        );

        if ($securityResponse) {
            return $securityResponse;
        }

        $session = $request->getSession();
        $session->set('player_id', $player->getId());

        $responseContent->success = true;

        return new JsonResponse(
            $responseContent,
            Response::HTTP_OK
        );
    }
}
