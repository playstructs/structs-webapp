<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;

/** The public guild read surface shared by authentication and cross-origin responses. */
class PublicGuildReadMatcher implements RequestMatcherInterface
{
    public const METHODS = ['GET', 'HEAD'];
    public const REQUEST_HEADERS = ['accept', 'content-type'];

    public function matches(Request $request): bool
    {
        return in_array($request->getMethod(), self::METHODS, true) && $this->matchesPath($request);
    }

    public function matchesPreflight(Request $request): bool
    {
        if ($request->getMethod() !== 'OPTIONS' || !$request->headers->get('Origin')
            || !in_array($request->headers->get('Access-Control-Request-Method'), self::METHODS, true)
            || !$this->matchesPath($request)) {
            return false;
        }

        $headers = strtolower(trim($request->headers->get('Access-Control-Request-Headers', '')));
        return $headers === '' || array_diff(array_map('trim', explode(',', $headers)), self::REQUEST_HEADERS) === [];
    }

    private function matchesPath(Request $request): bool
    {
        // Decode once, as Symfony's router and path-based firewall matchers do.
        return preg_match(
            '~\A/api/guild/(?:this|name|count|directory|0-[0-9]+(?:/(?:name|members/count|power/stats|roster|planet/complete/count))?)\z~',
            rawurldecode($request->getPathInfo())
        ) === 1;
    }
}
