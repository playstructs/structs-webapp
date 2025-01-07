<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
use App\Entity\PlayerAddress;
use App\Entity\PlayerAddressPending;
use App\Factory\PlayerAddressPendingFactory;
use App\Repository\PlayerAddressRepository;
use App\Trait\ApiSqlQueryTrait;
use App\Trait\ApiFetchEntityTrait;
use App\Util\ConstraintViolationUtil;
use DateMalformedStringException;
use Doctrine\DBAL\Exception;
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
            $signatureValidationManager->buildGuildMembershipJoinProxyMessage( // TODO: find out what the actual message is
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
            SELECT pam.ip, pam.user_agent, vpa.permission_assets, vpa.permissions
            FROM player_address_meta pam
            LEFT JOIN view.permission_address vpa
              ON pam.address = vpa.address
            WHERE pam.address = :address
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
}