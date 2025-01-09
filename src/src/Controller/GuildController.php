<?php

namespace App\Controller;

use App\Manager\GuildManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class GuildController extends AbstractController
{
    /**
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/guild-filter-list', name: 'api_guild_filter_list', methods: ['GET'])]
    public function getGuildFilterList(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $planetManager = new GuildManager($entityManager, $validator);
        return $planetManager->getGuildFilterList();
    }
}
