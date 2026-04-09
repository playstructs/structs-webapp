<?php

namespace App\Controller;

use App\Dto\ApiResponseContentDto;
use App\Manager\StatReadManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class StatReadController extends AbstractController
{
    /**
     * @throws Exception
     */
    #[Route(
        '/api/stat/{metric}/object/{object_key}/range/page/{page}',
        name: 'api_stat_range_by_object',
        methods: ['GET'],
        requirements: ['page' => '\d+']
    )]
    public function statRangeByObject(
        Request $request,
        string $metric,
        string $object_key,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $start = $request->query->get('start_time');
        $end = $request->query->get('end_time');
        if ($start === null || $end === null) {
            $body = new ApiResponseContentDto();
            $body->errors = ['start_time_end_time_required' => 'start_time and end_time query params are required (unix seconds)'];

            return new JsonResponse($body, Response::HTTP_BAD_REQUEST);
        }

        $manager = new StatReadManager($entityManager, $validator);

        return $manager->getStatRange($metric, $object_key, $page, (string) $start, (string) $end);
    }
}
