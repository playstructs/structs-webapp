<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class TestController extends AbstractController
{
    #[Route('/test/{anything}', name: 'app_test')]
    public function index(Request $request, string $anything = ''): Response
    {
        $session = $request->getSession();

        $message = "player_id:{$session->get('player_id')}, ";

        if ($anything === '') {
            return new Response($message . 'Session get:' . $session->get('anything'));
        }

        $session->set('anything', $anything);

        return new Response($message . "Session set: $anything");
    }
}
