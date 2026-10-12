<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
use App\Entity\PlayerAddress;
use App\Matrix\MatrixSignInConfig;
use App\Matrix\MatrixSignInException;
use App\Matrix\MatrixSignInRelay;
use App\Matrix\SignInRateLimiter;
use App\Matrix\UsedSignatureRegistry;
use App\Oidc\LoginContinuePolicy;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * POST /api/auth/matrix: a wallet-signed login in, a Matrix session out.
 *
 * The browser proves key ownership exactly as it does for /api/auth/login.
 * Instead of a webapp session cookie it gets back the tokens MAS would have
 * handed a native app, obtained by MatrixSignInRelay on the server's side. No
 * cookie, redirect or popup reaches the browser, and the tokens pass through
 * this process once without being written anywhere.
 */
class MatrixAuthManager
{
    private const string DEVICE_ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    private const int DEVICE_ID_LENGTH = 10;

    public function __construct(
        private readonly MatrixSignInConfig $config,
        private readonly ApiRequestParsingManager $requestParsingManager,
        private readonly SignatureValidationManager $signatureValidationManager,
        private readonly EntityManagerInterface $entityManager,
        private readonly OidcClaimsManager $claimsManager,
        private readonly LoginContinuePolicy $guildAuthServerPolicy,
        private readonly SignInRateLimiter $rateLimiter,
        private readonly UsedSignatureRegistry $usedSignatures,
        private readonly MatrixSignInRelay $relay,
        private readonly LoggerInterface $logger
    ) {
    }

    public function signIn(Request $request): JsonResponse
    {
        if (!$this->config->isConfigured()) {
            return $this->error(Response::HTTP_SERVICE_UNAVAILABLE, 'matrix_not_configured', 'Server-side Matrix sign-in is not configured on this guild');
        }

        $parsed = $this->requestParsingManager->parseJsonRequest(
            $request,
            [
                ApiParameters::ADDRESS,
                ApiParameters::SIGNATURE,
                ApiParameters::PUBKEY,
                ApiParameters::GUILD_ID,
                ApiParameters::UNIX_TIMESTAMP,
            ],
            [
                ApiParameters::DEVICE_ID,
            ]
        );

        if ($parsed->errors !== []) {
            $content = new ApiResponseContentDto();
            $content->errors = $parsed->errors;

            return $this->respond($content, Response::HTTP_BAD_REQUEST);
        }

        $params = $parsed->params;

        $retryAfter = $this->rateLimiter->attempt($params->address, (string) $request->getClientIp());

        if ($retryAfter !== null) {
            $response = $this->error(Response::HTTP_TOO_MANY_REQUESTS, 'rate_limited', 'Too many sign-in attempts; try again later');
            $response->headers->set('Retry-After', (string) $retryAfter);

            return $response;
        }

        if (!$this->signatureValidationManager->isMessageTimeValid($params->unix_timestamp)) {
            return $this->error(Response::HTTP_UNAUTHORIZED, 'timestamp_expired', 'unix_timestamp is outside the accepted window');
        }

        try {
            $signatureValid = $this->signatureValidationManager->validate(
                $params->address,
                $params->pubkey,
                $params->signature,
                $this->signatureValidationManager->buildLoginMessage(
                    $params->guild_id,
                    $params->address,
                    (int) $params->unix_timestamp
                )
            );
        } catch (Throwable $exception) {
            $this->logger->error('matrix sign-in: signature service unavailable', ['error' => $exception->getMessage()]);

            return $this->error(Response::HTTP_BAD_GATEWAY, 'signature_validation_unavailable', 'The signature could not be checked');
        }

        if (!$signatureValid) {
            return $this->error(Response::HTTP_UNAUTHORIZED, 'signature_validation_failed', 'Invalid signature');
        }

        $playerId = $this->findEligiblePlayerId($params->address, $params->guild_id);

        if ($playerId === null) {
            return $this->error(Response::HTTP_FORBIDDEN, 'not_guild_member', 'The address is not an eligible player of this guild');
        }

        if (!$this->usedSignatures->claim($params->signature)) {
            return $this->error(Response::HTTP_UNAUTHORIZED, 'signature_reused', 'This signature has already been used to sign in');
        }

        $deviceId = $params->device_id ?? $this->generateDeviceId();

        try {
            $session = $this->relay->signIn($playerId, $params->guild_id, $deviceId);
        } catch (MatrixSignInException $exception) {
            $this->logger->error('matrix sign-in failed', [
                'step'      => $exception->getStep(),
                'player_id' => $playerId,
                'guild_id'  => $params->guild_id,
                'error'     => $exception->getMessage(),
            ]);

            return $this->error(
                Response::HTTP_BAD_GATEWAY,
                'matrix_unavailable',
                'MAS or the homeserver failed at step: ' . $exception->getStep()
            );
        }

        $content = new ApiResponseContentDto();
        $content->success = true;
        $content->data = $session->toArray();

        return $this->respond($content, Response::HTTP_OK);
    }

    /**
     * The same rule /oauth/userinfo applies, reached from an address rather
     * than a player id: the address must be approved for the guild, and the
     * player it belongs to must be an eligible member of that guild. On top
     * of that the guild must be one whose Matrix this deployment fronts, or
     * MAS would be asked to sign a stranger's player in.
     */
    private function findEligiblePlayerId(string $address, string $guildId): ?string
    {
        if (!$this->guildAuthServerPolicy->isAllowed($this->config->getMasIssuer(), $guildId)) {
            return null;
        }

        $playerAddress = $this->entityManager->getRepository(PlayerAddress::class)->findOneBy([
            'address'  => $address,
            'guild_id' => $guildId,
            'status'   => 'approved',
        ]);

        if (!$playerAddress instanceof PlayerAddress || $playerAddress->getPlayerId() === null) {
            return null;
        }

        $player = $this->claimsManager->findEligiblePlayer($playerAddress->getPlayerId(), $guildId);

        return $player === null ? null : (string) $player['id'];
    }

    private function generateDeviceId(): string
    {
        $id = '';
        $max = strlen(self::DEVICE_ID_ALPHABET) - 1;

        for ($i = 0; $i < self::DEVICE_ID_LENGTH; $i++) {
            $id .= self::DEVICE_ID_ALPHABET[random_int(0, $max)];
        }

        return $id;
    }

    private function error(int $status, string $key, string $message): JsonResponse
    {
        $content = new ApiResponseContentDto();
        $content->errors = [$key => $message];

        return $this->respond($content, $status);
    }

    /**
     * Every reply, success or not, is marked uncacheable: the success body is
     * a credential and the failures say something about one.
     */
    private function respond(ApiResponseContentDto $content, int $status): JsonResponse
    {
        $response = new JsonResponse($content, $status);
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }
}
