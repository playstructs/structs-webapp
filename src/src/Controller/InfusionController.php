<?php

namespace App\Controller;

use App\Manager\InfusionManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class InfusionController extends AbstractController
{
    /**
     * @param string $player_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/infusion/player/{player_id}', name: 'api_get_infusion_by_player_id', methods: ['GET'])]
    public function getInfusionByPlayerId(
        string $player_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $infusionManager = new InfusionManager($entityManager, $validator);
        return $infusionManager->getInfusionByPlayerId($player_id);
    }
}
