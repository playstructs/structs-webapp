<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
use App\Entity\Player;
use App\Entity\PlayerAddress;
use App\Entity\PlayerAddressActivationCode;
use App\Entity\PlayerAddressMeta;
use App\Entity\PlayerAddressPending;
use App\Factory\PlayerAddressPendingFactory;
use App\Repository\PlayerAddressActivationCodeRepository;
use App\Repository\PlayerAddressMetaRepository;
use App\Repository\PlayerAddressPendingRepository;
use App\Repository\PlayerAddressRepository;
use App\Trait\ApiSqlQueryTrait;
use App\Trait\ApiFetchEntityTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
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
    use ApiFetchEntityTrait;
    use ApiSqlQueryTrait;

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
        $requestParams = [
            ApiParameters::ADDRESS => $address,
            ApiParameters::GUILD_ID => $guild_id
        ];
        $requiredFields = [
            ApiParameters::ADDRESS,
            ApiParameters::GUILD_ID
        ];
        $optionalFields = [];
        $criteria = [
            ApiParameters::ADDRESS => $address,
            ApiParameters::GUILD_ID => $guild_id,
            'status' => 'approved'
        ];
        $returnFields = ['player_id'];
        return $this->fetchOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            PlayerAddress::class,
            $requestParams,
            $requiredFields,
            $optionalFields,
            $criteria,
            $returnFields
        );
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

        /** @var PlayerAddressPendingRepository $playerAddressPendingRepository */
        $playerAddressPendingRepository = $this->entityManager->getRepository(PlayerAddressPending::class);

        /** @var PlayerAddressRepository $playerAddressRepository */
        $playerAddressRepository = $this->entityManager->getRepository(PlayerAddress::class);

        $parsedRequest = $this->apiRequestParsingManager->parseJsonRequest($request, [
            ApiParameters::PLAYER_ID,
            ApiParameters::GUILD_ID,
            ApiParameters::CODE,
            ApiParameters::ADDRESS,
            ApiParameters::SIGNATURE,
            ApiParameters::PUBKEY
        ], [
            ApiParameters::USER_AGENT
        ]);

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse(
                $responseContent,
                Response::HTTP_BAD_REQUEST
            );
        }

        $playerAddressPending = $playerAddressPendingFactory->makeFromRequestParams($parsedRequest->params);
        $playerAddressPending->setIp($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null);

        if (!$signatureValidationManager->validate(
            $playerAddressPending->getAddress(),
            $playerAddressPending->getPubkey(),
            $playerAddressPending->getSignature(),
            $signatureValidationManager->buildAddressRegisterMessage(
                $parsedRequest->params->player_id,
                $playerAddressPending->getAddress()
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

    public function getPendingAddressByCode(string $code): Response
    {
        $requestParams = [ApiParameters::CODE => $code];
        $requiredFields = [ApiParameters::CODE];
        $optionalFields = [];
        $criteria = $requestParams;
        return $this->fetchOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            PlayerAddressPending::class,
            $requestParams,
            $requiredFields,
            $optionalFields,
            $criteria
        );
    }

    /**
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function countPlayerAddresses(string $player_id): Response
    {
        $countQuery = '
            SELECT COUNT(*) AS "count"
            FROM player_address
            WHERE player_id = :player_id
        ';

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $countQuery,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function getAddressList(string $player_id): Response
    {
        $query = '
            SELECT pa.address, paa.block_time, pam.ip, pam.user_agent
            FROM player_address pa
            LEFT JOIN player_address_activity paa
              ON pa.address = paa.address
            LEFT JOIN player_address_meta pam
              ON pa.address = pam.address
            WHERE pa.player_id = :player_id
            AND pa.status = \'approved\';
        ';
        //TODO: Will need to get the location associated with the IP address when GeoIP DB added

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $address
     * @return Response
     * @throws Exception
     */
    public function getAddressDetails(string $address): Response
    {
        $query = '
            SELECT pa.address, pa.player_id, pam.ip, pam.user_agent, vpa.permission_assets, vpa.permissions
            FROM player_address pa
            LEFT JOIN player_address_meta pam
              ON pa.address = pam.address
            LEFT JOIN view.permission_address vpa
              ON pa.address = vpa.address
            WHERE pa.address = :address
            LIMIT 1;
        ';
        // TODO: Will need to get the location associated with the IP address when GeoIP DB added

        $requestParams = [ApiParameters::ADDRESS => $address];
        $requiredFields = [ApiParameters::ADDRESS];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param Request $request
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     */
    public function addPlayerAddressMeta(
        Request $request
    ): Response {
        $responseContent = new ApiResponseContentDto();

        /** @var PlayerAddressMetaRepository $playerAddressMetaRepository */
        $playerAddressMetaRepository = $this->entityManager->getRepository(PlayerAddressMeta::class);

        /** @var PlayerAddressRepository $playerAddressRepository */
        $playerAddressRepository = $this->entityManager->getRepository(PlayerAddress::class);

        $parsedRequest = $this->apiRequestParsingManager->parseJsonRequest($request, [
            ApiParameters::ADDRESS,
            ApiParameters::GUILD_ID
        ], [
            ApiParameters::USER_AGENT
        ]);

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse(
                $responseContent,
                Response::HTTP_BAD_REQUEST
            );
        }

        if (
            !$playerAddressRepository->findApprovedByAddressAndGuild(
                $parsedRequest->params->address,
                $parsedRequest->params->guild_id
            )
        ) {
            $responseContent->errors = ['address_does_not_exist' => 'Address does not exist'];

            return new JsonResponse(
                $responseContent,
                Response::HTTP_BAD_REQUEST
            );
        }

        $playerAddressMeta = $playerAddressMetaRepository->find($parsedRequest->params->address);
        $isNew = !$playerAddressMeta;

        if ($isNew) {
            $playerAddressMeta = new PlayerAddressMeta();
            $playerAddressMeta->setAddress($parsedRequest->params->address);
        }

        $playerAddressMeta->setIp($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null);
        $playerAddressMeta->setUserAgent($parsedRequest->params->user_agent);

        if ($isNew) {
            $this->entityManager->persist($playerAddressMeta);
        }

        $this->entityManager->flush();

        $responseContent->success = true;

        return new JsonResponse(
            $responseContent,
            Response::HTTP_CREATED
        );
    }

    /**
     * @param Request $request
     * @param Security $security
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws Exception
     */
    public function createPlayerAddressActivationCode(
        Request $request,
        Security $security
    ): Response {
        $responseContent = new ApiResponseContentDto();

        /** @var PlayerAddressActivationCodeRepository $playerAddressActivationCodeRepository */
        $playerAddressActivationCodeRepository = $this->entityManager->getRepository(PlayerAddressActivationCode::class);

        /** @var PlayerAddressRepository $playerAddressRepository */
        $playerAddressRepository = $this->entityManager->getRepository(PlayerAddress::class);

        $parsedRequest = $this->apiRequestParsingManager->parseJsonRequest($request, [
            ApiParameters::LOGGED_IN_ADDRESS,
            ApiParameters::GUILD_ID
        ]);

        $responseContent->errors = $parsedRequest->errors;

        if (
            count($responseContent->errors) > 0
            || !$playerAddressRepository->findApprovedByAddressAndGuild(
                $parsedRequest->params->logged_in_address,
                $parsedRequest->params->guild_id
            )
        ) {
            return new JsonResponse(
                $responseContent,
                Response::HTTP_BAD_REQUEST
            );
        }

        /** @var Player $player */
        $player = $security->getUser();
        $player_id = $player->getId();

        $oldActivationCode = $playerAddressActivationCodeRepository->findOneBy([
            'player_id' => $player_id,
            'logged_in_address' => $parsedRequest->params->logged_in_address
        ]);

        if ($oldActivationCode) {
            $this->entityManager->remove($oldActivationCode);
            $this->entityManager->flush();
        }

        $db = $this->entityManager->getConnection();
        $db->executeStatement(
            'INSERT INTO player_address_activation_code (player_id, logged_in_address)
            VALUES (:player_id, :logged_in_address)',
            [
                'player_id' => $player_id,
                'logged_in_address' => $parsedRequest->params->logged_in_address
            ]
        );

        $result = $db->fetchAssociative(
            'SELECT code, created_at
            FROM player_address_activation_code
            WHERE player_id = :player_id
            AND logged_in_address = :logged_in_address',
            [
                'player_id' => $player_id,
                'logged_in_address' => $parsedRequest->params->logged_in_address
            ]
        );

        if ($result === false) {
            $responseContent->errors = ['failed_to_create_activation_code' => 'Failed to create activation code'];
            return new JsonResponse(
                $responseContent,
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        $responseContent->success = true;
        $responseContent->data = $result;

        return new JsonResponse(
            $responseContent,
            Response::HTTP_CREATED
        );
    }

    /**
     * @param Request $request
     * @return Response
     * @throws Exception
     */
    public function setPendingAddressPermissions(Request $request): Response {
        $responseContent = new ApiResponseContentDto();

        $parsedRequest = $this->apiRequestParsingManager->parseJsonRequest(
            $request,
            [
                ApiParameters::CODE,
                ApiParameters::ADDRESS,
                ApiParameters::PERMISSIONS
            ]
        );

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $query = '
            UPDATE player_address_pending
            SET permissions = :permissions
            WHERE code = :code
            AND address = :address;
        ';

        $db = $this->entityManager->getConnection();
        $rowsAffected = $db->executeStatement($query, [
            'permissions' => intval($parsedRequest->params->permissions),
            'code' => $parsedRequest->params->code,
            'address' => $parsedRequest->params->address
        ]);

        $responseContent->data = ['rows_affected' => $rowsAffected];
        $responseContent->success = $rowsAffected > 0;
        $status = Response::HTTP_OK;

        if (!$responseContent->success) {
            $responseContent->errors = ['not_found' => 'Pending address not found in DB.'];
            $status = Response::HTTP_INTERNAL_SERVER_ERROR;
        }

        return new JsonResponse($responseContent, $status);
    }

    /**
     * @param string $code
     * @param Security $security
     * @return Response
     * @throws Exception
     */
    public function deleteActivationCode(
        string $code,
        Security $security
    ): Response
    {
        /** @var Player $player */
        $player = $security->getUser();
        $player_id = $player->getId();

        $query = '
            DELETE 
            FROM player_address_activation_code
            WHERE player_id = :player_id 
            AND code = :code;
        ';

        $db = $this->entityManager->getConnection();
        $rowsAffected = $db->executeStatement($query, [
            'player_id' => $player_id,
            'code' => $code
        ]);

        $responseContent = new ApiResponseContentDto();
        $responseContent->data = ['rows_affected' => $rowsAffected];
        $responseContent->success = $rowsAffected > 0;
        $status = Response::HTTP_OK;

        if (!$responseContent->success) {
            $responseContent->errors = ['not_found' => 'Activation code not found in DB.'];
            $status = Response::HTTP_INTERNAL_SERVER_ERROR;
        }

        return new JsonResponse($responseContent, $status);
    }
}