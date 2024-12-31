<?php

namespace App\Controller;

use App\Dto\ApiResponseContentDto;
use App\Entity\PlayerAddress;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PlayerController extends AbstractController
{
    #[Route('/api/player_address/id/address/{address}/guild/{guild_id}', name: 'api_player_id', methods: ['GET'])]
    public function getPlayerIdByAddressAndGuild(
        string $address,
        string $guild_id,
        EntityManagerInterface $entityManager
    ): Response
    {
        $playerAddressRepository = $entityManager->getRepository(PlayerAddress::class);
        $playerAddress = $playerAddressRepository->findOneBy(['address' => $address, 'guild_id' => $guild_id]);
        $responseContent = new ApiResponseContentDto();

        if (null === $playerAddress) {
            $responseContent->errors = ['player_address_not_found' => 'Player address not found'];
            return new JsonResponse($responseContent, Response::HTTP_NOT_FOUND);
        }

        $responseContent->data = (object)['player_id' => $playerAddress->getPlayerId()];
        $responseContent->success = true;
        return new JsonResponse($responseContent, Response::HTTP_OK);
    }
}
