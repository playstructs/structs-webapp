<?php declare(strict_types=1);

namespace App\Tests\Oidc;

use App\Manager\OidcClaimsManager;
use App\Oidc\OidcConfig;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

/**
 * `name` becomes the chat display name and players cannot change it there, so
 * it must never let one player pass for another.
 */
class OidcDisplayNameTest extends TestCase
{
    private OidcClaimsManager $claimsManager;

    protected function setUp(): void
    {
        $this->claimsManager = new OidcClaimsManager($this->createStub(EntityManagerInterface::class));
    }

    public function testUniqueNameIsShownAsIs(): void
    {
        $claims = $this->claims('Abstrct', false);

        self::assertSame('Abstrct', $claims['name']);
        self::assertSame('Abstrct', $claims['preferred_username']);
    }

    public function testSharedNameCarriesThePlayerId(): void
    {
        $claims = $this->claims('abstrct', true);

        self::assertSame('abstrct (1-406)', $claims['name']);
        self::assertSame('abstrct', $claims['preferred_username'], 'preferred_username stays the on-chain name');
    }

    public function testMixedScriptNameCarriesThePlayerId(): void
    {
        // Cyrillic "а" posing as Latin "a".
        self::assertSame("\u{0430}bstrct (1-406)", $this->claims("\u{0430}bstrct", false)['name']);
    }

    public function testSingleNonLatinScriptIsShownAsIs(): void
    {
        self::assertSame('Пилот', $this->claims('Пилот', false)['name']);
    }

    /**
     * @return array<string, mixed>
     */
    private function claims(string $username, bool $shared): array
    {
        return $this->claimsManager->buildClaims(
            [
                'id'              => '1-406',
                'username'        => $username,
                'username_shared' => $shared,
                'pfp'             => null,
                'guild_id'        => '0-1',
                'primary_address' => 'structs1abcxyz',
            ],
            [OidcConfig::SCOPE_OPENID, OidcConfig::SCOPE_PROFILE]
        );
    }
}
