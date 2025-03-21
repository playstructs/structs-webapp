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
    #[Route('/api/guild/this', name: 'api_get_this_guild', methods: ['GET'])]
    public function getThisGuild(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $guildManager = new GuildManager($entityManager, $validator);
        return $guildManager->getThisGuild();
    }

    /**
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/guild/name', name: 'api_get_guild_filter_list', methods: ['GET'])]
    public function getGuildFilterList(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $guildManager = new GuildManager($entityManager, $validator);
        return $guildManager->getGuildFilterList();
    }

    /**
     * @param string $guild_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/guild/{guild_id}/name', name: 'api_get_guild_name', methods: ['GET'])]
    public function getGuildName(
        string $guild_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $guildManager = new GuildManager($entityManager, $validator);
        return $guildManager->getGuildName($guild_id);
    }

    /**
     * @param string $guild_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/guild/{guild_id}/members/count', name: 'api_count_guild_members', methods: ['GET'])]
    public function countGuildMembers(
        string $guild_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $guildManager = new GuildManager($entityManager, $validator);
        return $guildManager->countGuildMembers($guild_id);
    }

    /**
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/guild/count', name: 'api_count_guilds', methods: ['GET'])]
    public function countGuilds(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $guildManager = new GuildManager($entityManager, $validator);
        return $guildManager->countGuilds();
    }

    /**
     * @param string $guild_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/guild/{guild_id}', name: 'api_get_guild', methods: ['GET'])]
    public function getGuild(
        string $guild_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $guildManager = new GuildManager($entityManager, $validator);
        return $guildManager->getGuild($guild_id);
    }

    /**
     * @param string $guild_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/guild/{guild_id}/power/stats', name: 'api_get_guild_power_stats', methods: ['GET'])]
    public function getGuildPowerStats(
        string $guild_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $guildManager = new GuildManager($entityManager, $validator);
        return $guildManager->getGuildPowerStats($guild_id);
    }

    /**
     * @param string $guild_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/guild/{guild_id}/roster', name: 'api_get_guild_roster', methods: ['GET'])]
    public function getGuildRoster(
        string $guild_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $guildManager = new GuildManager($entityManager, $validator);
        return $guildManager->getGuildRoster($guild_id);
    }
}
