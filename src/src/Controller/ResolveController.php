<?php

namespace App\Controller;

use App\Manager\ResolveManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ResolveController extends AbstractController
{
    /**
     * @throws Exception
     */
    #[Route('/api/denom', name: 'api_denom', methods: ['GET'])]
    public function getDenoms(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return (new ResolveManager($entityManager, $validator))->getDenoms();
    }

    /**
     * @throws Exception
     */
    #[Route('/api/resolve', name: 'api_resolve', methods: ['GET'])]
    public function resolve(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return (new ResolveManager($entityManager, $validator))->resolve($request->query->get('q'));
    }

    /**
     * @throws Exception
     */
    #[Route('/api/objects', name: 'api_objects', methods: ['GET'])]
    public function getObjects(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return (new ResolveManager($entityManager, $validator))->getObjects($request->query->get('ids'));
    }
}
