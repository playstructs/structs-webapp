<?php

namespace App\Matrix;

/**
 * The cookies one sign-in chain accumulates, kept per host.
 *
 * Deliberately smaller than a browser's jar. The chain only ever talks to one
 * MAS host, so Domain and Path scoping are not needed; what matters is that a
 * cookie MAS sets on one hop is sent back on the next and that a cookie MAS
 * clears stays cleared. Nothing here outlives the request.
 */
class CookieJar
{
    /**
     * @var array<string, array<string, string>> host => name => value
     */
    private array $cookies = [];

    /**
     * @param string[] $setCookieHeaders every Set-Cookie header on one response
     */
    public function storeFromResponse(string $url, array $setCookieHeaders): void
    {
        $host = $this->hostOf($url);

        if ($host === null) {
            return;
        }

        foreach ($setCookieHeaders as $header) {
            $this->store($host, $header);
        }
    }

    public function headerFor(string $url): ?string
    {
        $host = $this->hostOf($url);
        $cookies = $host === null ? [] : ($this->cookies[$host] ?? []);

        if ($cookies === []) {
            return null;
        }

        $pairs = [];

        foreach ($cookies as $name => $value) {
            $pairs[] = "{$name}={$value}";
        }

        return implode('; ', $pairs);
    }

    private function store(string $host, string $header): void
    {
        $parts = array_map('trim', explode(';', $header));
        $pair = array_shift($parts);

        if ($pair === null || !str_contains($pair, '=')) {
            return;
        }

        [$name, $value] = explode('=', $pair, 2);
        $name = trim($name);

        if ($name === '') {
            return;
        }

        if ($this->isExpired($parts)) {
            unset($this->cookies[$host][$name]);

            return;
        }

        $this->cookies[$host][$name] = $value;
    }

    /**
     * @param string[] $attributes
     */
    private function isExpired(array $attributes): bool
    {
        foreach ($attributes as $attribute) {
            $lower = strtolower($attribute);

            if (str_starts_with($lower, 'max-age=')) {
                return (int) substr($attribute, 8) <= 0;
            }

            if (str_starts_with($lower, 'expires=')) {
                $expires = strtotime(substr($attribute, 8));

                if ($expires !== false && $expires <= time()) {
                    return true;
                }
            }
        }

        return false;
    }

    private function hostOf(string $url): ?string
    {
        $host = parse_url($url, PHP_URL_HOST);

        return is_string($host) && $host !== '' ? strtolower($host) : null;
    }
}
