<?php

namespace App\Matrix;

use Psr\Cache\CacheItemPoolInterface;
use Throwable;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Where MAS's OAuth endpoints are, read from its discovery document.
 *
 * MAS publishes them at the issuer's well-known URL. They are cached briefly
 * so a sign-in does not cost an extra round trip, and fall back to MAS's
 * conventional paths if the document cannot be read, so a transient failure
 * there does not take sign-in down with it.
 */
class MasEndpoints
{
    public const int CACHE_TTL = 3600;

    /**
     * @var array<string, string>
     */
    private const array CONVENTIONAL_PATHS = [
        'authorization_endpoint' => '/authorize',
        'token_endpoint'         => '/oauth2/token',
        'revocation_endpoint'    => '/oauth2/revoke',
        'registration_endpoint'  => '/oauth2/registration',
    ];

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly CacheItemPoolInterface $cache
    ) {
    }

    /**
     * @return array{authorization_endpoint: string, token_endpoint: string, revocation_endpoint: string, registration_endpoint: string}
     */
    public function forIssuer(string $issuer): array
    {
        $issuer = rtrim($issuer, '/');
        $item = $this->cache->getItem('matrix_signin_mas_endpoints_' . sha1($issuer));

        if ($item->isHit() && is_array($item->get())) {
            return $item->get();
        }

        $document = $this->fetchDiscovery($issuer);
        $endpoints = [];

        foreach (self::CONVENTIONAL_PATHS as $key => $path) {
            $value = $document[$key] ?? null;
            $endpoints[$key] = is_string($value) && $value !== '' ? $value : $issuer . $path;
        }

        if ($document !== []) {
            $item->set($endpoints);
            $item->expiresAfter(self::CACHE_TTL);
            $this->cache->save($item);
        }

        return $endpoints;
    }

    /**
     * @return array<string, mixed>
     */
    private function fetchDiscovery(string $issuer): array
    {
        try {
            $response = $this->httpClient->request('GET', $issuer . '/.well-known/openid-configuration', [
                'timeout' => 5,
            ]);

            if ($response->getStatusCode() !== 200) {
                return [];
            }

            $document = json_decode($response->getContent(false), true);

            return is_array($document) ? $document : [];
        } catch (Throwable) {
            return [];
        }
    }
}
