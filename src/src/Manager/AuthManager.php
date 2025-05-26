<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
use App\Entity\Player;
use App\Entity\PlayerAddress;
use App\Entity\PlayerPending;
use App\Factory\PlayerPendingFactory;
use App\Repository\PlayerAddressRepository;
use App\Security\PlayerAuthenticator;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
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
    use ApiSqlQueryTrait;

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
        $playerPendingRepository = $this->entityManager->getRepository(PlayerPending::class);

        /** @var PlayerAddressRepository $playerAddressRepository */
        $playerAddressRepository = $this->entityManager->getRepository(PlayerAddress::class);

        $parsedRequest = $this->apiRequestParsingManager->parseJsonRequest(
            $request,
            [
                ApiParameters::PRIMARY_ADDRESS,
                ApiParameters::SIGNATURE,
                ApiParameters::PUBKEY,
                ApiParameters::GUILD_ID,
            ],
            [
                ApiParameters::USERNAME,
                ApiParameters::PFP
            ]
        );

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse(
                $responseContent,
                Response::HTTP_BAD_REQUEST
            );
        }

        $playerPending = $playerPendingFactory->makeFromRequestParams($parsedRequest->params);

        if (!$this->signatureValidationManager->validate(
            $playerPending->getPrimaryAddress(),
            $playerPending->getPubkey(),
            $playerPending->getSignature(),
            $this->signatureValidationManager->buildGuildMembershipJoinProxyMessage(
                $playerPending->getGuildId(),
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

        if (
            $playerPendingRepository->find($playerPending->getPrimaryAddress())
            || $playerAddressRepository->findApprovedByAddressAndGuild(
                $playerPending->getPrimaryAddress(),
                $playerPending->getGuildId()
            )
        ) {

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
     * Verifies a player for login based on a message signed using the player's private key.
     *
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

        $parsedRequest = $this->apiRequestParsingManager->parseJsonRequest($request, [
            ApiParameters::ADDRESS,
            ApiParameters::SIGNATURE,
            ApiParameters::PUBKEY,
            ApiParameters::GUILD_ID,
            ApiParameters::UNIX_TIMESTAMP,
        ]);

        $responseContent->errors = $parsedRequest->errors;

        if (
            count($responseContent->errors) > 0
            || !$this->signatureValidationManager->isMessageTimeValid($parsedRequest->params->unix_timestamp)
            || !$this->signatureValidationManager->validate(
                $parsedRequest->params->address,
                $parsedRequest->params->pubkey,
                $parsedRequest->params->signature,
                $this->signatureValidationManager->buildLoginMessage(
                    $parsedRequest->params->guild_id,
                    $parsedRequest->params->address,
                    $parsedRequest->params->unix_timestamp
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
            'status' => 'approved'
        ]);

        if (!$playerAddress) {
            $responseContent->errors = ['player_address_does_not_exists' => 'Player address does not exist'];

            return new JsonResponse(
                $responseContent,
                Response::HTTP_UNAUTHORIZED
            );
        }

        $playerRepository = $this->entityManager->getRepository(Player::class);
        $player = $playerRepository->find($playerAddress->getPlayerId());

        if (!$player) {
            $responseContent->errors = ['player_does_not_exists' => 'Player does not exist'];

            return new JsonResponse(
                $responseContent,
                Response::HTTP_UNAUTHORIZED
            );
        }

        $security->login(
            $player,
            PlayerAuthenticator::class,
            'api',
            [(new RememberMeBadge())->enable()]
        );

        $session = $request->getSession();
        $session->set('player_id', $player->getId());
        $session->set('guild_id', $parsedRequest->params->guild_id);

        $responseContent->success = true;

        return new JsonResponse(
            $responseContent,
            Response::HTTP_OK
        );
    }

    /**
     * @param string $code
     * @return Response
     * @throws Exception
     */
    public function getActivationCodeInfo(string $code): Response {
        $query = '
            SELECT
              pa.player_id,
              gm.tag,
              pm.username,
              pm.pfp
            FROM player_address_activation_code paac
            INNER JOIN player_address pa
              ON pa.address = paac.logged_in_address
            INNER JOIN guild_meta gm
              ON pa.guild_id = gm.id
            INNER JOIN player_meta pm
              ON pa.player_id = pm.id
            WHERE paac.code = :code;
        ';

        $requestParams = [ApiParameters::CODE => $code];
        $requiredFields = [ApiParameters::CODE];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }
}
