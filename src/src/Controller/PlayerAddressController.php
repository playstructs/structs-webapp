<?php

namespace App\Controller;

use App\Factory\PlayerAddressPendingFactory;
use App\Manager\PlayerAddressManager;
use App\Manager\SignatureValidationManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class PlayerAddressController extends AbstractController
{
    #[Route(
        '/api/auth/player-address/{address}/guild/{guild_id}/player-id',
        name: 'api_get_player_id_by_address_and_guild',
        methods: ['GET']
    )]
    public function getPlayerIdByAddressAndGuild(
        string $address,
        string $guild_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerAddressManager = new PlayerAddressManager($entityManager, $validator);
        return $playerAddressManager->getPlayerIdByAddressAndGuild($address, $guild_id);
    }

    /**
     * @param Request $request
     * @param ValidatorInterface $validator
     * @param EntityManagerInterface $entityManager
     * @param HttpClientInterface $client
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    #[Route(
        '/api/auth/player-address',
        name: 'api_add_player_pending_address',
        methods: ['POST']
    )]
    public function addPlayerPendingAddress(
        Request $request,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        HttpClientInterface $client
    ): Response {
        $playerAddressManager = new PlayerAddressManager($entityManager, $validator);
        $signatureValidationManager = new SignatureValidationManager($client);
        return $playerAddressManager->addPendingAddress(
            $request,
            new PlayerAddressPendingFactory(),
            $signatureValidationManager
        );
    }

    /**
     * @param Request $request
     * @param ValidatorInterface $validator
     * @param EntityManagerInterface $entityManager
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     */
    #[Route(
        '/api/player-address/meta',
        name: 'api_add_player_address_meta',
        methods: ['POST']
    )]
    public function addPlayerAddressMeta(
        Request $request,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager
    ): Response {
        $playerAddressManager = new PlayerAddressManager($entityManager, $validator);
        return $playerAddressManager->addPlayerAddressMeta($request);
    }

    /**
     * @param Request $request
     * @param ValidatorInterface $validator
     * @param EntityManagerInterface $entityManager
     * @param Security $security
     * @return Response
     * @throws ClientExceptionInterface
     * @throws Exception
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     */
    #[Route(
        '/api/player-address/activation-code',
        name: 'api_create_player_address_activation_code',
        methods: ['POST']
    )]
    public function createPlayerAddressActivationCode(
        Request $request,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        Security $security
    ): Response {
        $playerAddressManager = new PlayerAddressManager($entityManager, $validator);
        return $playerAddressManager->createPlayerAddressActivationCode($request, $security);
    }

    /**
     * @param string $code
     * @param ValidatorInterface $validator
     * @param EntityManagerInterface $entityManager
     * @param Security $security
     * @return Response
     * @throws ClientExceptionInterface
     * @throws Exception
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     */
    #[Route(
        '/api/player-address/activation-code/{code}',
        name: 'api_delete_player_address_activation_code',
        methods: ['DELETE']
    )]
    public function deletePlayerAddressActivationCode(
        string $code,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        Security $security
    ): Response {
        $playerAddressManager = new PlayerAddressManager($entityManager, $validator);
        return $playerAddressManager->deleteActivationCode($code, $security);
    }

    #[Route(
        '/api/player-address/code/{code}',
        name: 'api_get_pending_address_by_code',
        methods: ['GET']
    )]
    public function getPendingAddressByCode(
        string $code,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerAddressManager = new PlayerAddressManager($entityManager, $validator);
        return $playerAddressManager->getPendingAddressByCode($code);
    }

    /**
     * @param string $player_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route(
        '/api/player-address/count/player/{player_id}',
        name: 'api_count_addresses',
        methods: ['GET']
    )]
    public function countAddresses(
        string $player_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerAddressManager = new PlayerAddressManager($entityManager, $validator);
        return $playerAddressManager->countPlayerAddresses($player_id);
    }

    /**
     * @param string $player_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route(
        '/api/player-address/player/{player_id}',
        name: 'api_get_address_list',
        methods: ['GET']
    )]
    public function getAddressList(
        string $player_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerAddressManager = new PlayerAddressManager($entityManager, $validator);
        return $playerAddressManager->getAddressList($player_id);
    }

    /**
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route(
        '/api/player-address/pending/permissions',
        name: 'api_set_pending_address_permissions',
        methods: ['PUT']
    )]
    public function setPendingAddressPermissions(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerAddressManager = new PlayerAddressManager($entityManager, $validator);
        return $playerAddressManager->setPendingAddressPermissions($request);
    }

    /**
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @param Security $security
     * @return Response
     * @throws Exception
     */
    #[Route(
        '/api/player-address/permissions',
        name: 'api_set_address_permissions',
        methods: ['PUT']
    )]
    public function setAddressPermissions(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        Security $security
    ): Response {
        $playerAddressManager = new PlayerAddressManager($entityManager, $validator);
        return $playerAddressManager->setAddressPermissions($request, $security);
    }

    /**
     * @param string $address
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route(
        '/api/player-address/{address}',
        name: 'api_get_address_details',
        methods: ['GET']
    )]
    public function getAddressDetails(
        string $address,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerAddressManager = new PlayerAddressManager($entityManager, $validator);
        return $playerAddressManager->getAddressDetails($address);
    }
}
