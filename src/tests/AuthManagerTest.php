<?php declare(strict_types=1);

namespace App\Tests;

use App\Factory\PlayerPendingFactory;
use App\Manager\AuthManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthManagerTest extends KernelTestCase
{
    /**
     * @dataProvider signupProvider
     */
    public function testSignup(
        mixed $requestContent,
        int $expectedHttpStatusCode,
        int $expectedErrorCount
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $validator = $container->get(ValidatorInterface::class);
        $playerPendingFactory = new PlayerPendingFactory();
        $authManager = new AuthManager($validator, $entityManagerStub, $playerPendingFactory);
        $request = Request::create('/api/auth/signup', 'POST', [], [], [] ,[], json_encode($requestContent));
        $response = $authManager->signup($request);
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
    }

    public function signupProvider(): array
    {
        return [
            'no request content'  => [
                null,
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'invalid request content' => [
                'hello',
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'constraint violations' => [
                [
                    "primary_address" => "!structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "!036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "username" => "TestUser",
                    "pfp" => "!{}"
                ],
                Response::HTTP_BAD_REQUEST,
                3
            ],
            'valid'  => [
                [
                    "primary_address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "username" => "TestUser",
                    "pfp" => "{}"
                ],
                Response::HTTP_ACCEPTED,
                0
            ]
        ];
    }
}