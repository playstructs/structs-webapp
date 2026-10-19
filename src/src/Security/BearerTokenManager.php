<?php

namespace App\Security;

use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Bearer tokens for clients that can't keep the guild's session cookie: a site on another domain
 * (Safari and Firefox block third-party cookies) or a native app. A token is stateless and signed
 * with the app secret:
 *
 *   base64url({"p": player id, "g": guild id, "exp": unix time, "jti": random}) . "." . base64url(HMAC-SHA256)
 *
 * Logging out revokes a token by remembering its jti in the app cache until it would have expired.
 */
class BearerTokenManager
{
    public const TTL_SECONDS = 86400;

    public function __construct(
        #[Autowire('%kernel.secret%')] private readonly string $secret,
        #[Autowire(service: 'cache.app')] private readonly CacheItemPoolInterface $cache,
    ) {
    }

    /** @return array{access_token: string, token_type: string, expires_in: int, player_id: string} */
    public function issue(string $playerId, string $guildId, ?int $now = null): array
    {
        $now ??= time();
        $payload = self::b64(json_encode([
            'p' => $playerId,
            'g' => $guildId,
            'exp' => $now + self::TTL_SECONDS,
            'jti' => bin2hex(random_bytes(12)),
        ], JSON_THROW_ON_ERROR));

        return [
            'access_token' => $payload . '.' . $this->sign($payload),
            'token_type' => 'Bearer',
            'expires_in' => self::TTL_SECONDS,
            'player_id' => $playerId,
        ];
    }

    /** The token's claims if it is genuine, unexpired and not revoked; null otherwise. */
    public function verify(string $token, ?int $now = null): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 2 || !hash_equals($this->sign($parts[0]), $parts[1])) {
            return null;
        }
        $claims = json_decode(self::unb64($parts[0]) ?: '', true);
        if (!is_array($claims) || !isset($claims['p'], $claims['g'], $claims['exp'], $claims['jti'])) {
            return null;
        }
        if ((int) $claims['exp'] < ($now ?? time())) {
            return null;
        }
        if ($this->cache->getItem(self::revokedKey($claims['jti']))->isHit()) {
            return null;
        }

        return $claims;
    }

    /** Revoke a genuine token until it would have expired. Unknown or broken tokens are ignored. */
    public function revoke(string $token): void
    {
        $claims = $this->verify($token);
        if ($claims === null) {
            return;
        }
        $item = $this->cache->getItem(self::revokedKey($claims['jti']));
        $item->set(true);
        $item->expiresAt((new \DateTimeImmutable())->setTimestamp((int) $claims['exp']));
        $this->cache->save($item);
    }

    /** The bearer token on a request, if any. */
    public static function fromHeader(?string $authorization): ?string
    {
        if ($authorization === null || !preg_match('/^Bearer\s+(\S+)$/i', trim($authorization), $m)) {
            return null;
        }

        return $m[1];
    }

    private function sign(string $payload): string
    {
        return self::b64(hash_hmac('sha256', 'guild-bearer.' . $payload, $this->secret, true));
    }

    private static function revokedKey(string $jti): string
    {
        return 'bearer_revoked_' . preg_replace('/[^a-f0-9]/', '', $jti);
    }

    private static function b64(string $raw): string
    {
        return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    }

    private static function unb64(string $text): string|false
    {
        return base64_decode(strtr($text, '-_', '+/'), true);
    }
}
