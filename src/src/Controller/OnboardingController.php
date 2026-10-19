<?php

namespace App\Controller;

use App\Dto\ApiResponseContentDto;
use App\Manager\OnboardingManager;
use App\Util\FixedWindowRateLimiter;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Cache\InvalidArgumentException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Onboarding telemetry. Recording events is unauthenticated (see the
 * api_onboarding_events firewall), because new players have no player id until
 * signup finishes. The read endpoints are ordinary authenticated API reads.
 */
class OnboardingController extends AbstractController
{
    /**
     * Requests per minute from one IP. Generous, because players behind one
     * NAT or proxy share an address.
     */
    private const int IP_LIMIT_PER_MINUTE = 240;

    /** Requests per minute from one browser; the client batches, so a real run sends a few. */
    private const int BROWSER_LIMIT_PER_MINUTE = 30;

    /**
     * @throws Exception
     * @throws InvalidArgumentException
     */
    #[Route('/api/onboarding/events', name: 'api_onboarding_events', methods: ['POST'])]
    public function recordEvents(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        CacheItemPoolInterface $cache
    ): Response {
        $ipLimiter = new FixedWindowRateLimiter($cache, 'onboarding_ip', self::IP_LIMIT_PER_MINUTE, 60);
        $browserLimiter = new FixedWindowRateLimiter($cache, 'onboarding_browser', self::BROWSER_LIMIT_PER_MINUTE, 60);

        $content = json_decode($request->getContent(), true);
        $browserId = is_array($content) ? ($content['browser_id'] ?? null) : null;

        if (
            !$ipLimiter->consume($request->getClientIp() ?? 'unknown')
            || (is_string($browserId) && !$browserLimiter->consume($browserId))
        ) {
            $responseContent = new ApiResponseContentDto();
            $responseContent->errors = ['rate_limited' => 'Too many requests'];
            return new JsonResponse($responseContent, Response::HTTP_TOO_MANY_REQUESTS);
        }

        return (new OnboardingManager($entityManager, $validator))->recordEvents($request);
    }

    /**
     * @throws Exception
     */
    #[Route('/api/onboarding/catalog/{content_version}', name: 'api_onboarding_catalog', methods: ['GET'])]
    public function getCatalog(
        string $content_version,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return (new OnboardingManager($entityManager, $validator))->getCatalog($content_version);
    }

    /**
     * Optional query params: interface_name, guild_id, idle_hours (default 24).
     *
     * @throws Exception
     */
    #[Route('/api/onboarding/funnel/{content_version}/{phase}', name: 'api_onboarding_funnel', methods: ['GET'])]
    public function getFunnel(
        Request $request,
        string $content_version,
        string $phase,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return (new OnboardingManager($entityManager, $validator))->getFunnel(
            $content_version,
            $phase,
            $request->query->get('interface_name'),
            $request->query->get('guild_id'),
            $request->query->get('idle_hours')
        );
    }

    /**
     * Optional query params: interface_name, guild_id, idle_hours (default 24).
     *
     * @throws Exception
     */
    #[Route('/api/onboarding/tutorial/outcome/{content_version}', name: 'api_onboarding_tutorial_outcome', methods: ['GET'])]
    public function getTutorialOutcomes(
        Request $request,
        string $content_version,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return (new OnboardingManager($entityManager, $validator))->getTutorialOutcomes(
            $content_version,
            $request->query->get('interface_name'),
            $request->query->get('guild_id'),
            $request->query->get('idle_hours')
        );
    }

    /**
     * @throws Exception
     */
    #[Route('/api/onboarding/player/{player_id}', name: 'api_onboarding_player', methods: ['GET'])]
    public function getPlayerOnboarding(
        string $player_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return (new OnboardingManager($entityManager, $validator))->getPlayerOnboarding($player_id);
    }
}
