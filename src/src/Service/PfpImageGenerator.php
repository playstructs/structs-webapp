<?php

namespace App\Service;

use App\Constant\PfpConstants;
use RuntimeException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Builds a composited PFP PNG from layer indices supplied as query params,
 * backed by an on-disk cache so each unique combination is rendered once.
 */
class PfpImageGenerator
{
    private const array KEY_PREFIXES = [
        'background' => 'bg',
        'arms' => 'a',
        'body' => 'b',
        'neck' => 'n',
        'head' => 'h',
    ];

    public function __construct(private readonly string $projectDir)
    {
    }

    public function generate(Request $request): Response
    {
        $indices = [];
        $keyParts = [];

        foreach (PfpConstants::LAYER_ORDER as $layer) {
            $index = $this->resolveIndex($request, $layer);
            $indices[$layer] = $index;
            $keyParts[] = self::KEY_PREFIXES[$layer] . ($index ?? 'x');
        }

        $cacheKey = implode('-', $keyParts);

        $response = new Response();
        $response->headers->set('Content-Type', 'image/png');
        $response->setPublic();
        $response->setMaxAge(31536000);
        $response->headers->addCacheControlDirective('immutable');
        $response->setEtag($cacheKey);

        if ($response->isNotModified($request)) {
            return $response;
        }

        try {
            $response->setContent($this->getOrRenderPng($cacheKey, $indices));
        } catch (RuntimeException) {
            return $this->placeholderResponse();
        }

        return $response;
    }

    /**
     * Fallback when compositing fails (e.g. a layer asset is missing or
     * corrupt). Served without the immutable/ETag caching used for real
     * renders so a transient failure is not cached indefinitely.
     */
    private function placeholderResponse(): Response
    {
        $placeholder = @file_get_contents($this->projectDir . '/' . PfpConstants::PLACEHOLDER_PATH);

        if ($placeholder === false) {
            return new Response('', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $response = new Response($placeholder);
        $response->headers->set('Content-Type', 'image/png');
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }

    /**
     * Resolve a layer's asset index, defaulting to the first asset when the
     * param is absent and skipping (null) when it is present but invalid.
     */
    private function resolveIndex(Request $request, string $layer): ?int
    {
        if (!$request->query->has($layer)) {
            return PfpConstants::DEFAULT_INDEX;
        }

        $raw = $request->query->get($layer);

        if (!is_string($raw) || !ctype_digit($raw)) {
            return null;
        }

        $index = (int) $raw;

        if ($index < 1 || $index > PfpConstants::PART_COUNTS[$layer]) {
            return null;
        }

        return $index;
    }

    /**
     * @param array<string,int|null> $indices
     */
    private function getOrRenderPng(string $cacheKey, array $indices): string
    {
        $cacheDir = $this->projectDir . '/' . PfpConstants::CACHE_DIR;
        $cacheFile = $cacheDir . '/' . $cacheKey . '.png';

        $cached = @file_get_contents($cacheFile);

        if ($cached !== false) {
            return $cached;
        }

        $assetDir = $this->projectDir . '/' . PfpConstants::ASSET_DIR;
        $paths = [];

        foreach ($indices as $layer => $index) {
            if ($index === null) {
                continue;
            }

            $paths[] = sprintf('%s/%s/pfp_%s_%d.png', $assetDir, $layer, $layer, $index);
        }

        $png = (new PngCompositor())->composite(
            $paths,
            PfpConstants::IMAGE_SIZE,
            PfpConstants::IMAGE_SIZE
        );

        $this->writeCache($cacheDir, $cacheFile, $png);

        return $png;
    }

    private function writeCache(string $cacheDir, string $cacheFile, string $png): void
    {
        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0775, true);
        }

        $tmp = $cacheFile . '.' . bin2hex(random_bytes(4)) . '.tmp';

        if (@file_put_contents($tmp, $png) !== false) {
            @rename($tmp, $cacheFile);
        }
    }
}
