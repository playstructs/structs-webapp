<?php

namespace App\Controller;

use App\Manager\InfluenceManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/influence', name: 'api_influence_', methods: ['GET'])]
class InfluenceController extends AbstractController
{
    #[Route('/contests', name: 'contests', defaults: ['page' => '1'])]
    #[Route('/contests/page/{page}', name: 'contests_page', requirements: ['page' => '\d+'])]
    public function contests(Request $request, InfluenceManager $manager, string $page): Response
    {
        return $manager->contests($request->query->all(), $page);
    }

    #[Route('/contests/{contest_id}', name: 'contest', requirements: ['contest_id' => '\d+'])]
    public function contest(string $contest_id, Request $request, InfluenceManager $manager): Response
    {
        return $manager->contest($contest_id, $request->query->all());
    }

    #[Route('/contests/{contest_id}/standings', name: 'standings', requirements: ['contest_id' => '\d+'])]
    public function standings(string $contest_id, Request $request, InfluenceManager $manager): Response
    {
        return $manager->standings($contest_id, $request->query->all());
    }

    #[Route('/contests/{contest_id}/guilds/{guild_id}', name: 'guild', requirements: ['contest_id' => '\d+'])]
    public function guild(string $contest_id, string $guild_id, Request $request, InfluenceManager $manager): Response
    {
        return $manager->guild($contest_id, $guild_id, $request->query->all());
    }

    #[Route('/contests/{contest_id}/players', name: 'players', requirements: ['contest_id' => '\d+'], defaults: ['page' => '1'])]
    #[Route('/contests/{contest_id}/players/page/{page}', name: 'players_page', requirements: ['contest_id' => '\d+', 'page' => '\d+'])]
    public function players(string $contest_id, Request $request, InfluenceManager $manager, string $page): Response
    {
        return $manager->players($contest_id, $request->query->all(), $page);
    }

    #[Route('/contests/{contest_id}/players/{player_id}', name: 'player', requirements: ['contest_id' => '\d+'])]
    public function player(string $contest_id, string $player_id, Request $request, InfluenceManager $manager): Response
    {
        return $manager->player($contest_id, $player_id, $request->query->all());
    }

    #[Route('/contests/{contest_id}/history', name: 'history', requirements: ['contest_id' => '\d+'])]
    public function history(string $contest_id, Request $request, InfluenceManager $manager): Response
    {
        return $manager->history($contest_id, 'contest', null, $request->query->all());
    }

    #[Route('/contests/{contest_id}/guilds/{guild_id}/history', name: 'guild_history', requirements: ['contest_id' => '\d+'])]
    public function guildHistory(string $contest_id, string $guild_id, Request $request, InfluenceManager $manager): Response
    {
        return $manager->history($contest_id, 'guild', $guild_id, $request->query->all());
    }

    #[Route('/contests/{contest_id}/players/{player_id}/history', name: 'player_history', requirements: ['contest_id' => '\d+'])]
    public function playerHistory(string $contest_id, string $player_id, Request $request, InfluenceManager $manager): Response
    {
        return $manager->history($contest_id, 'player', $player_id, $request->query->all());
    }
}
