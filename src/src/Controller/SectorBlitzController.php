<?php

namespace App\Controller;

use App\Manager\SectorBlitzPublicManager;
use App\Util\InfluenceParameters as P;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;

/**
 * The public Sector Blitz leaderboard: a page anyone can open, without an account, and the
 * cached read-only API behind it. Only fixed parameters are accepted (sector and page).
 */
class SectorBlitzController extends AbstractController
{
    #[Route('/sector-blitz', name: 'app_sector_blitz', methods: ['GET'])]
    #[Route('/sector-blitz/{sector}', name: 'app_sector_blitz_sector', requirements: ['sector' => '44|127|999'], methods: ['GET'])]
    public function index(?string $sector = null): Response
    {
        SectorBlitzPublicManager::assertEnabled();

        return $this->render('sector_blitz/index.html.twig', ['sector' => $sector]);
    }

    #[Route('/api/public/sector-blitz', name: 'api_public_sector_blitz', methods: ['GET'])]
    public function summary(Request $request, SectorBlitzPublicManager $manager): Response
    {
        $query = $request->query->all();
        P::only($query, ['sector']);

        return $manager->summary($this->sector($query));
    }

    #[Route('/api/public/sector-blitz/guilds', name: 'api_public_sector_blitz_guilds', methods: ['GET'])]
    public function guilds(Request $request, SectorBlitzPublicManager $manager): Response
    {
        $query = $request->query->all();
        P::only($query, ['sector', 'page']);

        return $manager->guilds($this->sector($query), $this->pageNumber($query));
    }

    #[Route('/api/public/sector-blitz/players', name: 'api_public_sector_blitz_players', methods: ['GET'])]
    public function players(Request $request, SectorBlitzPublicManager $manager): Response
    {
        $query = $request->query->all();
        P::only($query, ['sector', 'page']);

        return $manager->players($this->sector($query), $this->pageNumber($query));
    }

    #[Route('/api/public/sector-blitz/battles', name: 'api_public_sector_blitz_battles', methods: ['GET'])]
    public function battles(Request $request, SectorBlitzPublicManager $manager): Response
    {
        $query = $request->query->all();
        P::only($query, ['page']);

        return $manager->battles($this->pageNumber($query));
    }

    private function sector(array $query): ?int
    {
        if (!array_key_exists('sector', $query)) {
            return null;
        }
        $sector = P::integer($query['sector'], 'sector', 1, 999);
        if (!in_array($sector, SectorBlitzPublicManager::SECTORS, true)) {
            throw new BadRequestHttpException('sector must be 44, 127, or 999');
        }

        return $sector;
    }

    private function pageNumber(array $query): int
    {
        return P::integer($query['page'] ?? '1', 'page', 1, SectorBlitzPublicManager::MAX_PAGE);
    }
}
