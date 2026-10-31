<?php declare(strict_types=1);

use App\Controller\AuthController;
use App\Manager\SignatureValidationManager;
use App\Security\BearerTokenManager;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorage;

class LogoutTest extends TestCase
{
    public function testPublicLogoutInvalidatesSessionAndOnlyThePresentedBearer(): void
    {
        $session = new Session(new MockArraySessionStorage());
        $session->set('player_id', '1-1');
        $session->set('guild_id', '0-1');
        $session->set('_security_api', 'saved token');
        $id = $session->getId();
        $tokens = new BearerTokenManager('fixture', new ArrayAdapter());
        $current = $tokens->issue('1-1', '0-1')['access_token'];
        $other = $tokens->issue('1-1', '0-1')['access_token'];
        $request = Request::create('/api/auth/logout', 'POST');
        $request->setSession($session);
        $request->headers->set('Authorization', 'Bearer ' . $current);

        $response = (new AuthController())->logout(new TokenStorage(), $request, $tokens);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertTrue(json_decode($response->getContent(), true)['success']);
        $this->assertSame([], $session->all());
        $this->assertNotSame($id, $session->getId());
        $this->assertNull($tokens->verify($current));
        $this->assertNotNull($tokens->verify($other));
        $again = (new AuthController())->logout(new TokenStorage(), $request, $tokens);
        $this->assertSame([], json_decode($again->getContent(), true)['errors']);
    }

    public function testLoginProofTimestampIsBoundedInBothDirections(): void
    {
        $manager = new SignatureValidationManager(new MockHttpClient());
        foreach ([time(), time() - 100, time() + 100] as $timestamp) {
            $this->assertTrue($manager->isMessageTimeValid((string) $timestamp));
        }
        foreach ([(string) (time() - 1200), (string) (time() + 1200), '0', '-1',
            '99999999999999999999', '1e20', '123invalid', ' 123', '0123'] as $timestamp) {
            $this->assertFalse($manager->isMessageTimeValid($timestamp), $timestamp);
        }
    }
}
