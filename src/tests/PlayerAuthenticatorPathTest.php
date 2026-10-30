<?php

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;

class PlayerAuthenticatorPathTest extends KernelTestCase
{
    public function testEncodedApiPathsStillRequireAuthentication(): void
    {
        self::bootKernel(['environment' => 'test']);
        foreach (['/api/provider/denom/ualpha/page/1', '/api%2Fprovider/denom/ualpha/page/1',
            '/%61pi/provider/denom/ualpha/page/1', '/api/inventory/denom/ibc%2FABC/page/1'] as $path) {
            $response = self::$kernel->handle(Request::create($path));
            $this->assertSame(401, $response->getStatusCode(), $path);
            $this->assertSame('Login required', json_decode($response->getContent(), true)['errors']['authentication_error']);
        }
    }

}
