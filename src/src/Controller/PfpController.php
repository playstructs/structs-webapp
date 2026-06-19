<?php

namespace App\Controller;

use App\Service\PfpImageGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PfpController extends AbstractController
{
    /**
     * @param Request $request
     * @return Response
     */
    #[Route('/api/pfp', name: 'api_get_pfp', methods: ['GET'])]
    public function getPfp(Request $request): Response
    {
        $generator = new PfpImageGenerator($this->getParameter('kernel.project_dir'));
        return $generator->generate($request);
    }
}
