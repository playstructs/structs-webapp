<?php

namespace App\Manager;

use App\Factory\PlayerPendingFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthManager
{
    public EntityManagerInterface $entityManager;

    public ValidatorInterface $validator;

    public PlayerPendingFactory $playerPendingFactory;

    public function __construct(
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        PlayerPendingFactory $playerPendingFactory
    ) {
        $this->validator = $validator;
        $this->entityManager = $entityManager;
        $this->playerPendingFactory = $playerPendingFactory;
    }

    public function signup(Request $request): Response {
        $content = json_decode($request->getContent(), true);

        $playerPending = $this->playerPendingFactory->makeFromArray($content);

        $errors = $this->validator->validate($playerPending);

        $response = new Response();

        if (count($errors) > 0) {
            $errorsString = (string)$errors;

            $response->setContent($errorsString);
            $response->setStatusCode(Response::HTTP_BAD_REQUEST);
        } else {
            $this->entityManager->persist($playerPending);
            $this->entityManager->flush();

            $response->setContent(var_export($playerPending, true));
            $response->setStatusCode(Response::HTTP_ACCEPTED);
        }

        return $response;
    }
}
