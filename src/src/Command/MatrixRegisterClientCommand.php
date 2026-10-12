<?php

namespace App\Command;

use App\Matrix\MasEndpoints;
use App\Matrix\MatrixSignInConfig;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Throwable;

/**
 * Registers this webapp with MAS as the public client that POST /api/auth/matrix
 * signs players in through.
 *
 * Run once per MAS. The client is public (no secret) and native, with a
 * loopback redirect URI nothing listens on, which is the shape MAS expects
 * from a desktop app and the shape the browser needs so it can refresh and
 * revoke at MAS directly with the same client id. The id MAS returns goes in
 * MATRIX_SIGNIN_CLIENT_ID.
 */
#[AsCommand(
    name: 'app:matrix:register-client',
    description: 'Register the public MAS client used by POST /api/auth/matrix'
)]
class MatrixRegisterClientCommand extends Command
{
    public function __construct(
        private readonly MatrixSignInConfig $config,
        private readonly MasEndpoints $endpoints,
        private readonly HttpClientInterface $httpClient
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('mas-issuer', null, InputOption::VALUE_REQUIRED, 'Defaults to MATRIX_MAS_ISSUER')
            ->addOption('redirect-uri', null, InputOption::VALUE_REQUIRED, 'Defaults to MATRIX_SIGNIN_REDIRECT_URI')
            ->addOption('name', null, InputOption::VALUE_REQUIRED, 'Client name shown by MAS', 'Structs guild web client');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $issuer = rtrim((string) ($input->getOption('mas-issuer') ?? $this->config->getMasIssuer()), '/');
        $redirectUri = (string) ($input->getOption('redirect-uri') ?? $this->config->getRedirectUri());

        if ($issuer === '') {
            $io->error('No MAS issuer: pass --mas-issuer or set MATRIX_MAS_ISSUER (or OIDC_MAS_REDIRECT_URI).');

            return Command::FAILURE;
        }

        $registrationEndpoint = $this->endpoints->forIssuer($issuer)['registration_endpoint'];

        try {
            $response = $this->httpClient->request('POST', $registrationEndpoint, [
                'headers' => ['Accept' => 'application/json'],
                'json'    => [
                    'client_name'                => $input->getOption('name'),
                    'redirect_uris'              => [$redirectUri],
                    'token_endpoint_auth_method' => 'none',
                    'application_type'           => 'native',
                    'response_types'             => ['code'],
                    'grant_types'                => ['authorization_code', 'refresh_token'],
                ],
            ]);
            $status = $response->getStatusCode();
            $body = json_decode($response->getContent(false), true);
        } catch (Throwable $exception) {
            $io->error('Could not reach MAS at ' . $registrationEndpoint . ': ' . $exception->getMessage());

            return Command::FAILURE;
        }

        $clientId = is_array($body) ? ($body['client_id'] ?? null) : null;

        if (($status !== 200 && $status !== 201) || !is_string($clientId) || $clientId === '') {
            $error = is_array($body) ? ($body['error_description'] ?? $body['error'] ?? '') : '';
            $io->error("MAS refused the registration ({$status}). " . (is_string($error) ? $error : ''));
            $io->text('Check that MAS has dynamic client registration enabled for this redirect URI scheme.');

            return Command::FAILURE;
        }

        $io->success('Registered a public client with MAS.');
        $io->definitionList(
            ['MAS issuer' => $issuer],
            ['Client ID' => $clientId],
            ['Redirect URI' => $redirectUri],
            ['Auth method' => 'none (public client)']
        );
        $io->note([
            "Set MATRIX_SIGNIN_CLIENT_ID='{$clientId}' on the webapp.",
            "If you passed --redirect-uri, set MATRIX_SIGNIN_REDIRECT_URI='{$redirectUri}' to match.",
            'Browsers refresh and revoke at MAS with this client id directly; nothing else needs the id.',
        ]);

        return Command::SUCCESS;
    }
}
