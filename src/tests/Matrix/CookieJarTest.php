<?php declare(strict_types=1);

namespace App\Tests\Matrix;

use App\Matrix\CookieJar;
use PHPUnit\Framework\TestCase;

class CookieJarTest extends TestCase
{
    public function testCookiesComeBackOnTheSameHostOnly(): void
    {
        $jar = new CookieJar();
        $jar->storeFromResponse('https://auth.test/authorize', [
            'mas_session=abc; Path=/; HttpOnly; Secure; SameSite=Lax',
            'csrf=def; Path=/',
        ]);

        self::assertSame('mas_session=abc; csrf=def', $jar->headerFor('https://auth.test/consent'));
        self::assertSame('mas_session=abc; csrf=def', $jar->headerFor('https://AUTH.test:443/other'));
        self::assertNull($jar->headerFor('https://synapse.test/whoami'));
    }

    public function testALaterValueReplacesAnEarlierOne(): void
    {
        $jar = new CookieJar();
        $jar->storeFromResponse('https://auth.test/a', ['mas_session=one']);
        $jar->storeFromResponse('https://auth.test/b', ['mas_session=two']);

        self::assertSame('mas_session=two', $jar->headerFor('https://auth.test/c'));
    }

    public function testAClearedCookieStaysCleared(): void
    {
        $jar = new CookieJar();
        $jar->storeFromResponse('https://auth.test/a', ['mas_session=one', 'keep=yes']);
        $jar->storeFromResponse('https://auth.test/b', ['mas_session=; Max-Age=0']);

        self::assertSame('keep=yes', $jar->headerFor('https://auth.test/c'));

        $jar->storeFromResponse('https://auth.test/d', ['keep=; Expires=Thu, 01 Jan 1970 00:00:00 GMT']);

        self::assertNull($jar->headerFor('https://auth.test/e'));
    }

    public function testMalformedHeadersAreIgnored(): void
    {
        $jar = new CookieJar();
        $jar->storeFromResponse('https://auth.test/a', ['', 'novalue', '=x']);

        self::assertNull($jar->headerFor('https://auth.test/b'));
    }
}
