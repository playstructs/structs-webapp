<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
use App\Entity\Player;
use App\Entity\PlayerAddress;
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
     * @param SignatureValidationManager $signatureValidationManager
     * @param AddressRegistrationProofManager $proofManager
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function addPendingAddress(
        Request $request,
        SignatureValidationManager $signatureValidationManager,
        AddressRegistrationProofManager $proofManager
    ): Response {
        $parsed = $this->apiRequestParsingManager->parseJsonRequest($request, [
            ApiParameters::PLAYER_ID, ApiParameters::GUILD_ID, ApiParameters::CODE, ApiParameters::ACTIVATION_ID,
            ApiParameters::ADDRESS, ApiParameters::SIGNATURE, ApiParameters::PUBKEY
        ], [ApiParameters::USER_AGENT]);
        if ($parsed->errors) {
            return $this->deviceResponse(null, $parsed->errors, Response::HTTP_BAD_REQUEST);
        }
        $params = $parsed->params;
        $db = $this->entityManager->getConnection();
        $identity = ['code' => $params->code, 'activation_id' => $params->activation_id, 'player_id' => $params->player_id, 'guild_id' => $params->guild_id];
        $codeQuery = self::activeActivationCodeSql() . '
            AND c.player_id = :player_id AND a.guild_id = :guild_id AND c.activation_id = :activation_id';
        if (!$db->fetchAssociative($codeQuery, $identity)) {
            return $this->deviceResponse(null, ['activation_code_unavailable' => 'Activation code is unavailable'], Response::HTTP_CONFLICT);
        }

        // Do not hold a SQL lock across network reads. Recheck the code under its
        // row lock below, after independently verifying the current chain proof.
        try {
            $context = $proofManager->readContext($params->player_id, $params->address);
            $message = AddressRegistrationProofManager::message($context);
            $valid = $signatureValidationManager->validate($params->address, $params->pubkey, $params->signature, $message);
        } catch (\UnexpectedValueException|\JsonException|\Symfony\Contracts\HttpClient\Exception\ExceptionInterface $error) {
            return $this->deviceResponse(null, ['proof_unavailable' => 'Current registration proof is unavailable'], Response::HTTP_CONFLICT);
        }
        if (!$valid) {
            return $this->deviceResponse(null, ['signature_validation_failed' => 'Invalid signature'], Response::HTTP_BAD_REQUEST);
        }

        $ip = filter_var($request->getClientIp(), FILTER_VALIDATE_IP) ?: null;
        return $db->transactional(function () use ($db, $codeQuery, $identity, $params, $context, $ip): Response {
            if (!$db->fetchAssociative($codeQuery . ' FOR UPDATE OF c', $identity)) {
                return $this->deviceResponse(null, ['activation_code_unavailable' => 'Activation code is unavailable'], Response::HTTP_CONFLICT);
            }
            $existing = $db->fetchAssociative('SELECT address, signature, pubkey, player_id, guild_id,
                proof_chain_id, proof_protocol, proof_nonce, proof_timeout_height
                FROM player_address_pending WHERE activation_id = :activation_id', ['activation_id' => $params->activation_id]);
            if ($existing) {
                // A lost HTTP response may repeat this exact consent. A code
                // cannot be used to replace it with a second device or proof.
                $expected = ['address' => $params->address, 'signature' => $params->signature,
                    'pubkey' => $params->pubkey, 'player_id' => $params->player_id, 'guild_id' => $params->guild_id,
                    'proof_chain_id' => $context['chain_id'], 'proof_protocol' => $context['protocol'],
                    'proof_nonce' => $context['proof_nonce'], 'proof_timeout_height' => $context['timeout_height']];
                if ($existing !== $expected) {
                    return $this->deviceResponse(null, ['resource_already_exists' => 'Activation code already has a pending device'], Response::HTTP_CONFLICT);
                }
            } else {
                $data = [
                    'code' => $params->code, 'activation_id' => $params->activation_id,
                    'address' => $params->address, 'signature' => $params->signature,
                    'pubkey' => $params->pubkey, 'user_agent' => $params->user_agent, 'ip' => $ip,
                    'player_id' => $params->player_id, 'guild_id' => $params->guild_id,
                    'proof_chain_id' => $context['chain_id'], 'proof_protocol' => $context['protocol'],
                    'proof_nonce' => $context['proof_nonce'], 'proof_height' => $context['source_height'],
                    'proof_timeout_height' => $context['timeout_height'],
                ];
                // A legacy orphan may have the same short code/address. Its NULL
                // instance has no authority; replace it only with verified consent.
                $columns = implode(',', array_keys($data));
                $values = implode(',', array_map(static fn ($key) => ':' . $key, array_keys($data)));
                $updates = implode(',', array_map(static fn ($key) => $key . '=EXCLUDED.' . $key, array_keys($data)));
                $rows = $db->executeStatement('INSERT INTO player_address_pending (' . $columns . ') VALUES (' . $values . ')
                    ON CONFLICT (code,address) DO UPDATE SET ' . $updates . ',permissions=NULL,created_at=NOW(),updated_at=NOW()
                    WHERE player_address_pending.activation_id IS NULL', $data);
                if ($rows !== 1) {
                    return $this->deviceResponse(null, ['resource_already_exists' => 'Device consent already belongs to another activation'], Response::HTTP_CONFLICT);
                }
            }
            return $this->deviceResponse(null, [], Response::HTTP_ACCEPTED);
        });
    }

    public function getRegistrationProofContext(
        string $playerId,
        string $address,
        AddressRegistrationProofManager $proofManager
    ): Response {
        try {
            $context = $proofManager->readContext($playerId, $address);
            AddressRegistrationProofManager::message($context);
            return $this->deviceResponse($context);
        } catch (\UnexpectedValueException|\JsonException|\Symfony\Contracts\HttpClient\Exception\ExceptionInterface $error) {
            return $this->deviceResponse(null, ['proof_unavailable' => 'Current registration proof is unavailable'], Response::HTTP_CONFLICT);
        }
    }

    public function getRegistrationStatus(string $playerId, string $address, AddressRegistrationProofManager $proofManager, bool $withPermissions = false): Response
    {
        $parsed = $this->apiRequestParsingManager->parse(
            [ApiParameters::PLAYER_ID => $playerId, ApiParameters::ADDRESS => $address],
            [ApiParameters::PLAYER_ID, ApiParameters::ADDRESS]);
        if ($parsed->errors) return $this->deviceResponse(null, $parsed->errors, Response::HTTP_BAD_REQUEST);
        try {
            AddressRegistrationProofManager::validateIdentity($playerId, $address);
        } catch (\UnexpectedValueException $error) {
            return $this->deviceResponse(null, ['invalid_identity' => 'Invalid registration identity'], Response::HTTP_BAD_REQUEST);
        }
        $db = $this->entityManager->getConnection();
        $content = new ApiResponseContentDto();
        try {
            [$row, $meta] = \App\Util\ConsistentRead::run($db, fn () => [
                $db->fetchAssociative($withPermissions
                    ? "SELECT a.address,a.player_id,a.guild_id,a.status,COALESCE(p.val,0)::text AS permissions
                        FROM player_address a LEFT JOIN permission p ON p.player_id=a.player_id AND p.object_id=a.player_id
                            AND p.object_type='address' AND p.object_index=a.address WHERE a.address=:address"
                    : 'SELECT address,player_id,guild_id,status FROM player_address WHERE address=:address', ['address' => $address]),
                \App\Util\ResponseMetaUtil::snapshotMeta($db),
            ]);
            $context = $withPermissions ? $proofManager->readState($playerId, $address) : $proofManager->readContext($playerId, $address);
            $content->data = ['indexed' => $row ?: null, 'chain' => $context];
            $content->meta = $meta;
            $content->success = true;
            return new JsonResponse($content, Response::HTTP_OK, ['Cache-Control' => 'no-store']);
        } catch (\UnexpectedValueException|\JsonException|\Symfony\Contracts\HttpClient\Exception\ExceptionInterface $error) {
            return $this->deviceResponse(null, ['registration_unavailable' => 'Current registration status is unavailable'], Response::HTTP_SERVICE_UNAVAILABLE);
        }
    }

    public function getPendingAddressByCode(string $code, ?string $activationId, Security $security): Response
    {
        $parsed = $this->apiRequestParsingManager->parse([ApiParameters::CODE => $code, ApiParameters::ACTIVATION_ID => $activationId],
            [ApiParameters::CODE, ApiParameters::ACTIVATION_ID]);
        if ($parsed->errors) {
            return $this->deviceResponse(null, $parsed->errors, Response::HTTP_BAD_REQUEST);
        }
        $row = $this->entityManager->getConnection()->fetchAssociative('
            SELECT pending.* FROM player_address_pending pending
            JOIN (' . self::activeActivationCodeSql() . ') active
              ON pending.activation_id = active.activation_id AND pending.code = active.code AND pending.player_id = active.player_id
              AND pending.guild_id = active.guild_id
            WHERE active.player_id = :player_id AND active.activation_id = :activation_id',
            ['code' => $code, 'activation_id' => $activationId, 'player_id' => $security->getUser()->getId()]);
        return $this->deviceResponse($row ?: null);
    }

    private static function activeActivationCodeSql(): string
    {
        return "SELECT c.code, c.activation_id, c.player_id, a.guild_id FROM player_address_activation_code c
            JOIN player_address a ON a.address = c.logged_in_address AND a.player_id = c.player_id
                AND a.status = 'approved'
            JOIN player p ON p.id = c.player_id AND p.guild_id = a.guild_id
            WHERE c.code = :code AND c.created_at > statement_timestamp() - interval '1 hour'";
    }

    private function deviceResponse(mixed $data = null, array $errors = [], int $status = Response::HTTP_OK): Response
    {
        $content = new ApiResponseContentDto();
        $content->success = !$errors;
        $content->data = $data;
        $content->errors = $errors;
        return new JsonResponse($content, $status, ['Cache-Control' => 'no-store']);
    }

    /**
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function countPlayerAddresses(string $player_id, Security $security): Response
    {
        if ($player_id !== $security->getUser()->getId()) {
            return $this->deviceResponse(null, ['forbidden' => 'Device data belongs to another player'], Response::HTTP_FORBIDDEN);
        }
        $countQuery = "
            SELECT COUNT(*) AS count
            FROM player_address
            WHERE player_id = :player_id
            AND status = 'approved';
        ";

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        $response = $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $countQuery,
            $requestParams,
            $requiredFields
        );
        $response->headers->set('Cache-Control', 'no-store');
        return $response;
    }

    /**
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function getAddressList(string $player_id, Security $security): Response
    {
        if ($player_id !== $security->getUser()->getId()) {
            return $this->deviceResponse(null, ['forbidden' => 'Device data belongs to another player'], Response::HTTP_FORBIDDEN);
        }
        $query = "
            SELECT 
              pa.address, 
              COALESCE(paa.block_time, pa.updated_at) AS block_time, 
              pam.ip,
              pam.user_agent,
              COALESCE(p.val,0)::text AS permissions
            FROM player_address pa
            LEFT JOIN player_address_activity paa
              ON pa.address = paa.address
            LEFT JOIN player_address_meta pam
              ON pa.address = pam.address
            LEFT JOIN permission p
              ON pa.player_id = p.player_id
              AND pa.address = p.object_index
              AND pa.player_id = p.object_id
              AND p.object_type = 'address'
            WHERE pa.player_id = :player_id
            AND pa.status = 'approved';
        ";
        //TODO: Will need to get the location associated with the IP address when GeoIP DB added

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        $response = $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
        $response->headers->set('Cache-Control', 'no-store');
        return $response;
    }

    /**
     * @param string $address
     * @return Response
     * @throws Exception
     */
    public function getAddressDetails(string $address, Security $security): Response
    {
        $query = "
            SELECT
              pa.address,
              pa.player_id,
              pa.guild_id,
              pa.status,
              pam.ip, 
              pam.user_agent,
              COALESCE(paa.block_time, pa.updated_at) AS block_time,
              COALESCE(p.val,0)::text AS permissions,
              ai.balance AS alpha
            FROM player_address pa
            LEFT JOIN player_address_meta pam
              ON pa.address = pam.address
            LEFT JOIN player_address_activity paa
              ON pa.address = paa.address
            LEFT JOIN permission p
              ON pa.player_id = p.player_id
              AND pa.address = p.object_index
              AND pa.player_id = p.object_id
              AND p.object_type = 'address'
            LEFT JOIN view.address_inventory ai
              ON pa.address = ai.address
                AND ai.denom = 'alpha'
            WHERE pa.address = :address
            AND pa.player_id = :player_id
            AND pa.status = 'approved'
            LIMIT 1;
        ";
        // TODO: Will need to get the location associated with the IP address when GeoIP DB added

        $requestParams = [ApiParameters::ADDRESS => $address, ApiParameters::PLAYER_ID => $security->getUser()->getId()];
        $requiredFields = [ApiParameters::ADDRESS, ApiParameters::PLAYER_ID];

        $response = $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
        $response->headers->set('Cache-Control', 'no-store');
        return $response;
    }

    /**
     * @param Request $request
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     */
    public function addPlayerAddressMeta(Request $request, Security $security): Response
    {
        $parsed = $this->apiRequestParsingManager->parseJsonRequest($request,
            [ApiParameters::ADDRESS, ApiParameters::GUILD_ID], [ApiParameters::USER_AGENT]);
        if ($parsed->errors) return $this->deviceResponse(null, $parsed->errors, Response::HTTP_BAD_REQUEST);

        // Check ownership in the write itself; a caller-supplied address/guild
        // does not authorize changing another player's private device record.
        $address = $this->entityManager->getConnection()->fetchOne('
            INSERT INTO player_address_meta(address,ip,user_agent,updated_at)
            SELECT a.address,CAST(:ip AS inet),:user_agent,statement_timestamp()
            FROM player_address a JOIN player p ON p.id = a.player_id AND p.guild_id = a.guild_id
            WHERE a.address = :address AND a.player_id = :player_id AND a.guild_id = :guild_id
                AND a.status = \'approved\'
            ON CONFLICT (address) DO UPDATE SET ip = EXCLUDED.ip,
                user_agent = EXCLUDED.user_agent,updated_at = EXCLUDED.updated_at
            RETURNING address', [
                'address' => $parsed->params->address, 'guild_id' => $parsed->params->guild_id,
                'player_id' => $security->getUser()->getId(), 'ip' => $request->getClientIp(),
                'user_agent' => $parsed->params->user_agent,
            ]);
        if ($address === false) {
            return $this->deviceResponse(null, ['address_does_not_exist' => 'Approved address does not belong to this player and guild'], Response::HTTP_FORBIDDEN);
        }
        return $this->deviceResponse(null, [], Response::HTTP_CREATED);
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
        $parsed = $this->apiRequestParsingManager->parseJsonRequest($request,
            [ApiParameters::LOGGED_IN_ADDRESS, ApiParameters::GUILD_ID]);
        if ($parsed->errors) {
            return $this->deviceResponse(null, $parsed->errors, Response::HTTP_BAD_REQUEST);
        }
        $db = $this->entityManager->getConnection();
        $params = ['player_id' => $security->getUser()->getId(),
            'logged_in_address' => $parsed->params->logged_in_address, 'guild_id' => $parsed->params->guild_id];
        return $db->transactional(function () use ($db, $params): Response {
            // Serialize code replacement for one player/device without requiring
            // write permission on the chain-owned address projection.
            $db->executeQuery("SELECT pg_advisory_xact_lock(hashtextextended(:identity, 0))",
                ['identity' => 'device-code:' . $params['player_id'] . ':' . $params['logged_in_address']]);
            if (!$db->fetchOne("SELECT 1 FROM player_address a JOIN player p ON p.id = a.player_id
                WHERE a.address = :logged_in_address AND a.player_id = :player_id
                    AND a.guild_id = :guild_id AND p.guild_id = a.guild_id AND a.status = 'approved'", $params)) {
                return $this->deviceResponse(null, ['address_unavailable' => 'Address is unavailable'], Response::HTTP_BAD_REQUEST);
            }
            $identity = ['player_id' => $params['player_id'], 'logged_in_address' => $params['logged_in_address']];
            $db->executeStatement('DELETE FROM player_address_activation_code
                WHERE player_id = :player_id AND logged_in_address = :logged_in_address', $identity);
            $result = $db->fetchAssociative('INSERT INTO player_address_activation_code (player_id, logged_in_address)
                VALUES (:player_id, :logged_in_address) RETURNING code, created_at, activation_id', $identity);
            return $this->deviceResponse($result, [], Response::HTTP_CREATED);
        });
    }

    /**
     * @param Request $request
     * @return Response
     * @throws Exception
     */
    public function setPendingAddressPermissions(Request $request, Security $security): Response {
        $parsed = $this->apiRequestParsingManager->parseJsonRequest($request,
            [ApiParameters::CODE, ApiParameters::ACTIVATION_ID, ApiParameters::ADDRESS, ApiParameters::PERMISSIONS]);
        if ($parsed->errors) {
            return $this->deviceResponse(null, $parsed->errors, Response::HTTP_BAD_REQUEST);
        }
        try {
            // This pending-device column and the unchanged permission controls
            // support the existing positive int32 mask, never a coerced float.
            $permissions = \App\Util\ExactAmount::unsigned($parsed->params->permissions, '2147483647');
        } catch (\UnexpectedValueException $error) {
            return $this->deviceResponse(null, ['invalid_permissions' => 'Invalid permissions'], Response::HTTP_BAD_REQUEST);
        }
        $db = $this->entityManager->getConnection();
        return $db->transactional(function () use ($db, $parsed, $permissions, $security): Response {
            $identity = ['code' => $parsed->params->code, 'activation_id' => $parsed->params->activation_id, 'player_id' => $security->getUser()->getId()];
            $code = $db->fetchAssociative(self::activeActivationCodeSql() . ' AND c.player_id = :player_id AND c.activation_id = :activation_id FOR UPDATE OF c', $identity);
            $rows = $code ? $db->executeStatement('UPDATE player_address_pending SET permissions = :permissions
                WHERE code = :code AND activation_id = :activation_id AND address = :address AND player_id = :player_id AND guild_id = :guild_id',
                $identity + ['address' => $parsed->params->address, 'guild_id' => $code['guild_id'], 'permissions' => $permissions]) : 0;
            return $this->deviceResponse(['rows_affected' => $rows],
                $rows ? [] : ['not_found' => 'Pending address is unavailable'],
                $rows ? Response::HTTP_OK : Response::HTTP_NOT_FOUND);
        });
    }

    /**
     * @param Request $request
     * @param Security $security
     * @return Response
     * @throws Exception
     */
    public function setAddressPermissions(
        Request $request,
        Security $security
    ): Response {
        // Permissions are chain state. A successful SQL write cannot grant or
        // revoke the signing authority represented by this projection.
        return $this->deviceResponse(null, ['chain_transaction_required' => 'Submit MsgPermissionSetOnAddress and wait for confirmed indexing'],
            Response::HTTP_GONE);
    }

    /**
     * @param string $code
     * @param Security $security
     * @return Response
     * @throws Exception
     */
    public function deleteActivationCode(
        string $code,
        ?string $activationId,
        Security $security
    ): Response
    {
        /** @var Player $player */
        $player = $security->getUser();
        $player_id = $player->getId();

        $parsed = $this->apiRequestParsingManager->parse([ApiParameters::CODE => $code, ApiParameters::ACTIVATION_ID => $activationId],
            [ApiParameters::CODE, ApiParameters::ACTIVATION_ID]);
        if ($parsed->errors) return $this->deviceResponse(null, $parsed->errors, Response::HTTP_BAD_REQUEST);

        $query = '
            DELETE 
            FROM player_address_activation_code
            WHERE player_id = :player_id 
            AND code = :code AND activation_id = :activation_id;
        ';

        $db = $this->entityManager->getConnection();
        $rowsAffected = $db->executeStatement($query, [
            'player_id' => $player_id,
            'code' => $code, 'activation_id' => $activationId
        ]);

        return $this->deviceResponse(['rows_affected' => $rowsAffected]);
    }
}
