<?php

namespace App\Controller;

use App\Manager\PlayerManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlayerController extends AbstractController
{
    /**
     * @param string $player_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/player/{player_id}', name: 'api_get_player', methods: ['GET'])]
    public function getPlayer(
        string $player_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerManager = new PlayerManager($entityManager, $validator);
        return $playerManager->getPlayer($player_id);
    }

    /**
     * @param string $player_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/player/{player_id}/action/last/block/height', name: 'api_get_player_last_action_block_height', methods: ['GET'])]
    public function getPlayerLastActionBlockHeight(
        string $player_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerManager = new PlayerManager($entityManager, $validator);
        return $playerManager->getPlayerLastActionBlockHeight($player_id);
    }

    /**
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/player/raid/search', name: 'api_raid_search', methods: ['GET'])]
    public function raidSearch(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerManager = new PlayerManager($entityManager, $validator);
        return $playerManager->raidSearch($request);
    }

    /**
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/player/username', name: 'api_update_player_username', methods: ['PUT'])]
    public function updatePlayerUsername(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerManager = new PlayerManager($entityManager, $validator);
        return $playerManager->updateUsername($request);
    }

    /**
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/player/transfer/search', name: 'api_transfer_search', methods: ['GET'])]
    public function transferSearch(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $playerManager = new PlayerManager($entityManager, $validator);
        return $playerManager->transferSearch($request);
    }
}
