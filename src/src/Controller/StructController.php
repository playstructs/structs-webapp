<?php

namespace App\Controller;

use App\Manager\StructManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class StructController extends AbstractController
{
    /**
     * @param string $planet_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/struct/planet/{planet_id}', name: 'app_struct')]
    public function getAllStructsOnPlanet(
        string $planet_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response
    {
        $structManager = new StructManager($entityManager, $validator);
        return $structManager->getAllStructsOnPlanet($planet_id);
    }
}
