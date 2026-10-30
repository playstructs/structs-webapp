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

    public function testSignupRemainsPublicForBothPathSpellings(): void
    {
        self::bootKernel(['environment' => 'test']);
        foreach (['/api/auth/signup', '/%61pi/auth/signup'] as $path) {
            $request = Request::create($path, 'POST', [], [], [], ['CONTENT_TYPE' => 'application/json'], '{}');
            $response = self::$kernel->handle($request);
            $this->assertSame(400, $response->getStatusCode(), 'Public signup reaches request validation');
            $body = json_decode($response->getContent(), true);
            $this->assertArrayNotHasKey('authentication_error', $body['errors']);
            $this->assertArrayHasKey('primary_address_required', $body['errors']);
            $this->assertArrayHasKey('guild_id_required', $body['errors']);
        }
    }

    public function testDeviceWritesStillRequireAuthentication(): void
    {
        self::bootKernel(['environment' => 'test']);
        foreach (['/api/player-address/meta', '/%61pi/player-address/meta'] as $path) {
            $request = Request::create($path, 'POST', [], [], [], ['CONTENT_TYPE' => 'application/json'], '{}');
            $response = self::$kernel->handle($request);
            $this->assertSame(401, $response->getStatusCode(), $path);
            $this->assertSame('Login required', json_decode($response->getContent(), true)['errors']['authentication_error']);
            $this->assertFalse($response->headers->has('Access-Control-Allow-Origin'));
        }
    }

    public function testPublicGuildPolicyDoesNotIncludeWritesOrOtherRoutes(): void
    {
        $matcher = new App\Security\PublicGuildReadMatcher();
        foreach (['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as $method) {
            $this->assertFalse($matcher->matches(Request::create('/api/guild/0-1', $method)));
        }
        foreach (['/api/guild/this/private', '/api/guild/0-1/permissions', '/api/guild/0-1/roster/private',
            '/api/guild/0-1%252Froster', '/api/guild/0-1/roster%0A', '/api/player/count',
            '/api/player-address/meta', '/api/provider/denom/ualpha/page/1'] as $path) {
            $this->assertFalse($matcher->matches(Request::create($path)), $path);
        }
    }

    public function testCrossGuildReadPreflightsAreLimitedToPublicReads(): void
    {
        self::bootKernel(['environment' => 'test']);
        foreach (['/api/guild/0-1/roster', '/%61pi/guild/0-1/roster'] as $path) {
            $response = self::$kernel->handle(Request::create($path, 'OPTIONS', [], [], [], [
                'HTTP_ORIGIN' => 'https://other-guild.example',
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Content-Type, Accept',
            ]));
            $this->assertSame(204, $response->getStatusCode());
            $this->assertSame('', $response->getContent());
            $this->assertSame('*', $response->headers->get('Access-Control-Allow-Origin'));
            $this->assertSame('GET, HEAD', $response->headers->get('Access-Control-Allow-Methods'));
            $this->assertFalse($response->headers->has('Access-Control-Allow-Credentials'));
        }
        foreach ([['/api/guild/0-1', 'POST', 'Content-Type'], ['/api/guild/0-1', 'GET', 'Authorization'],
            ['/api/player-address/meta', 'POST', 'Content-Type']] as [$path, $method, $headers]) {
            $response = self::$kernel->handle(Request::create($path, 'OPTIONS', [], [], [], [
                'HTTP_ORIGIN' => 'https://other-guild.example',
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => $method,
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => $headers,
            ]));
            $this->assertGreaterThanOrEqual(400, $response->getStatusCode());
            $this->assertFalse($response->headers->has('Access-Control-Allow-Origin'));
        }
    }
}
