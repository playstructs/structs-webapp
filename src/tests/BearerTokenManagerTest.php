<?php declare(strict_types=1);

use App\Security\BearerTokenManager;
use App\Security\PlayerAuthenticator;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;

/** Bearer tokens (REQ-AUTH-1): sign-in for clients that can't keep the session cookie. */
class BearerTokenManagerTest extends TestCase
{
    private function tokens(string $secret = 'test-secret'): BearerTokenManager
    {
        return new BearerTokenManager($secret, new ArrayAdapter());
    }

    public function testIssuedTokenVerifiesWithItsClaims(): void
    {
        $tokens = $this->tokens();
        $issued = $tokens->issue('1-404', '0-5');

        $this->assertSame('Bearer', $issued['token_type']);
        $this->assertSame(BearerTokenManager::TTL_SECONDS, $issued['expires_in']);
        $this->assertSame('1-404', $issued['player_id']);

        $claims = $tokens->verify($issued['access_token']);
        $this->assertNotNull($claims);
        $this->assertSame('1-404', $claims['p']);
        $this->assertSame('0-5', $claims['g']);
    }

    public function testTamperedOrForeignTokensAreRefused(): void
    {
        $tokens = $this->tokens();
        [$payload, $sig] = explode('.', $tokens->issue('1-404', '0-5')['access_token']);

        // Someone else's player id in the payload, with the original signature.
        $forged = rtrim(strtr(base64_encode(json_encode(['p' => '1-1', 'g' => '0-5', 'exp' => time() + 999, 'jti' => 'ab'])), '+/', '-_'), '=');
        $this->assertNull($tokens->verify($forged . '.' . $sig));
        // Signed by a different secret.
        $this->assertNull($this->tokens('other-secret')->verify($payload . '.' . $sig));
        // Junk.
        foreach (['', 'abc', 'a.b.c', $payload, $payload . '.'] as $junk) {
            $this->assertNull($tokens->verify($junk), var_export($junk, true));
        }
    }

    public function testExpiredTokensAreRefused(): void
    {
        $tokens = $this->tokens();
        $issued = $tokens->issue('1-404', '0-5', time() - BearerTokenManager::TTL_SECONDS - 10);

        $this->assertNull($tokens->verify($issued['access_token']));
    }

    public function testRevokedTokensAreRefusedButOthersStillWork(): void
    {
        $tokens = $this->tokens();
        $a = $tokens->issue('1-404', '0-5')['access_token'];
        $b = $tokens->issue('1-404', '0-5')['access_token'];

        $tokens->revoke($a);

        $this->assertNull($tokens->verify($a));
        $this->assertNotNull($tokens->verify($b));
        $tokens->revoke('not-a-token'); // ignored, no error
    }

    public function testHeaderParsing(): void
    {
        $this->assertSame('abc.def', BearerTokenManager::fromHeader('Bearer abc.def'));
        $this->assertSame('abc.def', BearerTokenManager::fromHeader('bearer   abc.def '));
        $this->assertNull(BearerTokenManager::fromHeader(null));
        $this->assertNull(BearerTokenManager::fromHeader('Basic dXNlcjpwYXNz'));
        $this->assertNull(BearerTokenManager::fromHeader('Bearer'));
    }

    private function request(?string $authorization, ?string $sessionPlayer): Request
    {
        $request = Request::create('/api/player/1-404');
        if ($authorization !== null) {
            $request->headers->set('Authorization', $authorization);
        }
        $session = new Session(new MockArraySessionStorage());
        if ($sessionPlayer !== null) {
            $session->set('player_id', $sessionPlayer);
        }
        $request->setSession($session);

        return $request;
    }

    public function testAuthenticatorAcceptsABearerTokenWithoutASession(): void
    {
        $tokens = $this->tokens();
        $auth = new PlayerAuthenticator($this->createStub(EntityManagerInterface::class), $tokens);
        $token = $tokens->issue('1-404', '0-5')['access_token'];

        $passport = $auth->authenticate($this->request('Bearer ' . $token, null));

        $this->assertSame('1-404', $passport->getBadge(\Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge::class)->getUserIdentifier());
    }

    public function testABadBearerTokenNeverFallsBackToTheSession(): void
    {
        $auth = new PlayerAuthenticator($this->createStub(EntityManagerInterface::class), $this->tokens());

        $this->expectException(CustomUserMessageAuthenticationException::class);
        $auth->authenticate($this->request('Bearer forged.token', '1-404'));
    }

    public function testTheSessionStillWorksWithoutAToken(): void
    {
        $auth = new PlayerAuthenticator($this->createStub(EntityManagerInterface::class), $this->tokens());

        $passport = $auth->authenticate($this->request(null, '1-7'));

        $this->assertSame('1-7', $passport->getBadge(\Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge::class)->getUserIdentifier());
    }
}
