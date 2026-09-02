<?php

namespace App\Controller;

use App\Manager\LeaderboardManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class LeaderboardController extends AbstractController
{
    /**
     * @throws Exception
     */
    #[Route(
        '/api/leaderboard/{kind}',
        name: 'api_leaderboard',
        requirements: ['kind' => 'player|guild|reactor|substation|provider'],
        methods: ['GET']
    )]
    public function getLeaderboard(
        string $kind,
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $manager = new LeaderboardManager($entityManager, $validator);

        return $manager->getLeaderboard(
            $kind,
            $request->query->get('order'),
            $request->query->get('limit')
        );
    }
}
