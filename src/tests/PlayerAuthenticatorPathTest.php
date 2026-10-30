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

    public function testLoginRemainsPublicForBothPathSpellings(): void
    {
        self::bootKernel(['environment' => 'test']);
        foreach (['/api/auth/login', '/%61pi/auth/login'] as $path) {
            $request = Request::create($path, 'POST', [], [], [], ['CONTENT_TYPE' => 'application/json'], '{}');
            $response = self::$kernel->handle($request);
            $this->assertSame(401, $response->getStatusCode(), 'Public login rejects the missing signed proof');
            $body = json_decode($response->getContent(), true);
            $this->assertArrayNotHasKey('authentication_error', $body['errors']);
            $this->assertArrayHasKey('address_required', $body['errors']);
            $this->assertSame('Invalid signature', $body['errors']['signature_validation_failed']);
        }
    }
}
