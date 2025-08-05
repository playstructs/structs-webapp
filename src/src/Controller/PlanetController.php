<?php

namespace App\Controller;

use App\Manager\PlanetManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlanetController extends AbstractController
{
    /**
     * @param string $planet_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/planet/{planet_id}', name: 'api_get_planet', methods: ['GET'])]
    public function getPlanet(
        string $planet_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $planetManager = new PlanetManager($entityManager, $validator);
        return $planetManager->getPlanet($planet_id);
    }

    /**
     * @param string $planet_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/planet/{planet_id}/shield/health', name: 'api_get_planetary_shield_health', methods: ['GET'])]
    public function getPlanetaryShieldHealth(
        string $planet_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $planetManager = new PlanetManager($entityManager, $validator);
        return $planetManager->getPlanetaryShieldHealth($planet_id);
    }

    /**
     * @param string $planet_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/planet/{planet_id}/shield', name: 'api_get_planetary_shield_info', methods: ['GET'])]
    public function getPlanetaryShieldInfo(
        string $planet_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $planetManager = new PlanetManager($entityManager, $validator);
        return $planetManager->getPlanetaryShieldInfo($planet_id);
    }

    /**
     * @param string $planet_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/planet/{planet_id}/raid/active', name: 'api_get_active_planet_raid_by_planet_id', methods: ['GET'])]
    public function getActivePlanetRaidByPlanetId(
        string $planet_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $planetManager = new PlanetManager($entityManager, $validator);
        return $planetManager->getActivePlanetRaidByPlanetId($planet_id);
    }

    /**
     * @param string $fleet_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/planet/raid/active/fleet/{fleet_id}', name: 'api_get_active_planet_raid_by_fleet_id', methods: ['GET'])]
    public function getActivePlanetRaidByFleetId(
        string $fleet_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $planetManager = new PlanetManager($entityManager, $validator);
        return $planetManager->getActivePlanetRaidByFleetId($fleet_id);
    }
}
