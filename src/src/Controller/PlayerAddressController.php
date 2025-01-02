<?php

namespace App\Controller;

use App\Manager\PlayerAddressManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlayerAddressController extends AbstractController
{
    #[Route('/api/player_address/id/address/{address}/guild/{guild_id}', name: 'api_player_id', methods: ['GET'])]
    public function getPlayerIdByAddressAndGuild(
        string $address,
        string $guild_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerManager = new PlayerAddressManager($entityManager, $validator);
        return $playerManager->getPlayerIdByAddressAndGuild($address, $guild_id);
    }
}
