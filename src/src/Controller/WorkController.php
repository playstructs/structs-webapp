<?php

namespace App\Controller;

use App\Manager\WorkManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class WorkController extends AbstractController
{
    /**
     * @throws Exception
     */
    #[Route('/api/work/all/page/{page}', name: 'api_work_list_all', methods: ['GET'])]
    public function workListAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $workManager = new WorkManager($entityManager, $validator);

        return $workManager->getAllWorkPaged($page);
    }

    /**
     * @throws Exception
     */
    #[Route('/api/work/guild/{guild_id}/page/{page}', name: 'api_work_list_by_guild', methods: ['GET'])]
    public function workListByGuild(
        string $guild_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $workManager = new WorkManager($entityManager, $validator);

        return $workManager->getWorkByGuildId($guild_id, $page);
    }

    /**
     * @param string $player_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/work/player/{player_id}', name: 'api_get_work_by_player_id', methods: ['GET'])]
    public function getStructsByPlayerId(
        string $player_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $workManager = new WorkManager($entityManager, $validator);
        return $workManager->getAllWorkByPlayerId($player_id);
    }
}
