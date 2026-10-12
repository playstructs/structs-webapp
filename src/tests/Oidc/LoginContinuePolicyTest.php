<?php declare(strict_types=1);

namespace App\Tests\Oidc;

use App\Oidc\LoginContinuePolicy;
use App\Oidc\OidcConfig;
use App\Oidc\Repository\ClientRepository;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception as DbalException;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

/**
 * The `continue` parameter on a form login may only lead to the guild's own
 * auth server. These tests pin down what "own auth server" means: same origin
 * as a redirect URI registered for an enabled OIDC client of that guild.
 */
class LoginContinuePolicyTest extends TestCase
{
    private const string GUILD_ID = '0-1';

    private const string MAS_CALLBACK = 'https://auth.beta.playstructs.com/upstream/callback/01JBX';

    /**
     * @dataProvider allowedProvider
     */
    public function testAllowsUrlsOnTheRegisteredAuthServerOrigin(string $continue): void
    {
        self::assertTrue($this->policy([self::GUILD_ID => [self::MAS_CALLBACK]])->isAllowed($continue, self::GUILD_ID));
    }

    public function allowedProvider(): array
    {
        return [
            'authorize endpoint with query' => ['https://auth.beta.playstructs.com/authorize?client_id=x&state=y'],
            'any other path on MAS'         => ['https://auth.beta.playstructs.com/login'],
            'explicit default port'         => ['https://auth.beta.playstructs.com:443/authorize'],
            'host case differs'             => ['https://AUTH.beta.playstructs.com/authorize'],
            'with fragment'                 => ['https://auth.beta.playstructs.com/authorize#top'],
        ];
    }

    /**
     * @dataProvider refusedProvider
     */
    public function testRefusesEverythingElse(string $continue): void
    {
        self::assertFalse($this->policy([self::GUILD_ID => [self::MAS_CALLBACK]])->isAllowed($continue, self::GUILD_ID));
    }

    public function refusedProvider(): array
    {
        return [
            'another host'                  => ['https://evil.example/authorize'],
            'subdomain of the auth host'    => ['https://auth.beta.playstructs.com.evil.example/'],
            'prefix of the auth host'       => ['https://xauth.beta.playstructs.com/'],
            'scheme downgrade'              => ['http://auth.beta.playstructs.com/authorize'],
            'non-default port'              => ['https://auth.beta.playstructs.com:8443/authorize'],
            'userinfo spoofing the host'    => ['https://auth.beta.playstructs.com@evil.example/authorize'],
            'userinfo on the right host'    => ['https://user:pass@auth.beta.playstructs.com/authorize'],
            'relative path'                 => ['/authorize'],
            'protocol-relative'             => ['//auth.beta.playstructs.com/authorize'],
            'javascript scheme'             => ['javascript:alert(1)'],
            'empty'                         => [''],
        ];
    }

    public function testOnlyTheGuildBeingLoggedInToCounts(): void
    {
        $policy = $this->policy([
            self::GUILD_ID => [self::MAS_CALLBACK],
            '0-2'          => ['https://auth.other-guild.example/upstream/callback/02'],
        ]);

        self::assertTrue($policy->isAllowed('https://auth.beta.playstructs.com/authorize', self::GUILD_ID));
        self::assertFalse(
            $policy->isAllowed('https://auth.other-guild.example/authorize', self::GUILD_ID),
            'A login to one guild must not continue to another guild\'s auth server'
        );
        self::assertTrue($policy->isAllowed('https://auth.other-guild.example/authorize', '0-2'));
    }

    public function testNothingIsAllowedWhenTheProviderIsDisabled(): void
    {
        $policy = $this->policy([self::GUILD_ID => [self::MAS_CALLBACK]], enabled: false);

        self::assertFalse($policy->isAllowed('https://auth.beta.playstructs.com/authorize', self::GUILD_ID));
    }

    public function testNothingIsAllowedWhenNoClientIsRegisteredForTheGuild(): void
    {
        self::assertFalse($this->policy([])->isAllowed('https://auth.beta.playstructs.com/authorize', self::GUILD_ID));
    }

    public function testADatabaseFailureRefusesRatherThanRedirects(): void
    {
        $connection = $this->createStub(Connection::class);
        $connection->method('fetchAllAssociative')
            ->willThrowException(new class('relation "oidc_client" does not exist') extends DbalException {});

        $policy = new LoginContinuePolicy($this->config(true), new ClientRepository($this->entityManager($connection)));

        self::assertFalse($policy->isAllowed('https://auth.beta.playstructs.com/authorize', self::GUILD_ID));
    }

    /**
     * @param array<string, string[]> $redirectUrisByGuild
     */
    private function policy(array $redirectUrisByGuild, bool $enabled = true): LoginContinuePolicy
    {
        $connection = $this->createStub(Connection::class);
        $connection->method('fetchAllAssociative')
            ->willReturnCallback(function (string $sql, array $params) use ($redirectUrisByGuild): array {
                self::assertStringContainsString('oidc_client', $sql);

                // Postgres hands array columns back as a literal.
                return array_map(
                    static fn (string $uri): array => ['redirect_uris' => '{"' . $uri . '"}'],
                    $redirectUrisByGuild[$params['guild_id']] ?? []
                );
            });

        return new LoginContinuePolicy(
            $this->config($enabled),
            new ClientRepository($this->entityManager($connection))
        );
    }

    private function entityManager(Connection $connection): EntityManagerInterface
    {
        $entityManager = $this->createStub(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);

        return $entityManager;
    }

    private function config(bool $enabled): OidcConfig
    {
        return new OidcConfig(
            $enabled,
            'https://guild.test',
            'matrix-auth-service',
            'secret',
            self::MAS_CALLBACK,
            '/nonexistent/private.key',
            '/nonexistent/public.key',
            'test-key',
            'a-thirty-two-byte-test-encryption',
            '/nonexistent'
        );
    }
}
