<?php

namespace App\Controller;

use App\Factory\PlayerAddressPendingFactory;
use App\Manager\PlayerAddressManager;
use App\Manager\SignatureValidationManager;
use Doctrine\ORM\EntityManagerInterface;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
        '/api/player-address/{address}/guild/{guild_id}/player-id',
        name: 'api_player_address_read_player_id',
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
        '/api/player-address',
        name: 'api_player_address_pending_create',
        methods: ['POST']
    )]
    public function addPlayerPendingAddress(
        Request $request,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        HttpClientInterface $client
    ): Response {
        $playerManager = new PlayerAddressManager($entityManager, $validator);
        $signatureValidationManager = new SignatureValidationManager($client);
        return $playerManager->addPendingAddress(
            $request,
            new PlayerAddressPendingFactory(),
            $signatureValidationManager
        );
    }

    #[Route(
        '/api/player-address/code/{code}',
        name: 'api_player_address_by_code',
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
}
