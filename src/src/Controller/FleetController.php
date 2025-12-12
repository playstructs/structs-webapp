<?php

namespace App\Controller;

use App\Manager\FleetManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class FleetController extends AbstractController
{
    /**
     * @param string $player_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/fleet/player/{player_id}', name: 'api_get_fleet_by_player_id', methods: ['GET'])]
    public function getFleetByPlayerId(
        string $player_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $fleetManager = new FleetManager($entityManager, $validator);
        return $fleetManager->getFleetByPlayerId($player_id);
    }
}
