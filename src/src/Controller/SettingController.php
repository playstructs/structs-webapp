<?php

namespace App\Controller;

use App\Manager\SettingManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class SettingController extends AbstractController
{
    /**
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/setting', name: 'api_get_settings', methods: ['GET'])]
    public function getSettings(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $settingManager = new SettingManager($entityManager, $validator);
        return $settingManager->getSettings();
    }
}
