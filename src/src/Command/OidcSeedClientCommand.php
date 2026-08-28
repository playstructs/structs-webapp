<?php

namespace App\Command;

use App\Manager\OidcClaimsManager;
use App\Oidc\OidcConfig;
use App\Oidc\Repository\ClientRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Throwable;

/**
 * Registers a Matrix Authentication Service deployment as an OAuth client.
 *
 * With no options this reconciles the single client described by the
 * environment, which is what a guild running its own webapp needs. A shared,
 * white-labeled webapp runs it once per guild with explicit options instead.
 *
 * The client registry is configuration rather than data, so this is expected to
 * run on deploy. The secret is stored only as a hash; the plaintext stays in the
 * guild secret store and in MAS config.
 */
#[AsCommand(
    name: 'app:oidc:seed-client',
    description: 'Register or update a Matrix Authentication Service OAuth client'
)]
class OidcSeedClientCommand extends Command
{
    public function __construct(
        private readonly OidcConfig $config,
        private readonly ClientRepository $clientRepository,
        private readonly OidcClaimsManager $claimsManager
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('client-id', null, InputOption::VALUE_REQUIRED, 'Defaults to OIDC_MAS_CLIENT_ID')
            ->addOption(
                'guild-id',
                null,
                InputOption::VALUE_REQUIRED,
                'Guild whose players this client may authenticate. Defaults to this deployment\'s own guild.'
            )
            ->addOption('redirect-uri', null, InputOption::VALUE_REQUIRED, 'Defaults to OIDC_MAS_REDIRECT_URI')
            ->addOption('secret', null, InputOption::VALUE_REQUIRED, 'Defaults to OIDC_MAS_CLIENT_SECRET')
            ->addOption('name', null, InputOption::VALUE_REQUIRED, 'Human readable label for the client');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $clientId = $input->getOption('client-id') ?? $this->config->getMasClientId();
        $redirectUri = $input->getOption('redirect-uri') ?? $this->config->getMasRedirectUri();
        $secret = $input->getOption('secret') ?? $this->config->getMasClientSecret();
        $guildId = $input->getOption('guild-id') ?? $this->resolveLocalGuildId($io);
        $name = $input->getOption('name') ?? 'Matrix Authentication Service';

        $errors = $this->findErrors($clientId, $guildId, $redirectUri, $secret);

        if ($errors !== []) {
            $io->error('The client registration is incomplete.');
            $io->listing($errors);

            return Command::FAILURE;
        }

        try {
            $this->clientRepository->save(
                $clientId,
                $guildId,
                $name,
                $secret,
                [$redirectUri],
                $this->config->getSupportedScopes()
            );
        } catch (Throwable $exception) {
            $io->error('Could not write the client registration: ' . $exception->getMessage());
            $io->text('Confirm the structs.oidc_* tables exist and structs_webapp has been granted access.');

            return Command::FAILURE;
        }

        $io->success("Registered {$clientId} for guild {$guildId}.");
        $io->definitionList(
            ['Issuer' => $this->config->getIssuer()],
            ['Discovery' => $this->config->url('/.well-known/openid-configuration')],
            ['Client ID' => $clientId],
            ['Guild ID' => $guildId],
            ['Redirect URI' => $redirectUri],
            ['Scopes' => implode(' ', $this->config->getSupportedScopes())]
        );

        $io->note([
            'The redirect URI must match what MAS sends byte for byte, including any trailing slash.',
            "This client can only authenticate players of guild {$guildId}.",
        ]);

        return Command::SUCCESS;
    }

    /**
     * A guild running its own webapp should not have to state its own id. A
     * shared webapp has no single answer, so it has to be given one.
     */
    private function resolveLocalGuildId(SymfonyStyle $io): ?string
    {
        $guildId = $this->claimsManager->findLocalGuildId();

        if ($guildId === null) {
            $io->text('No guild is flagged as this infrastructure; pass --guild-id explicitly.');
        }

        return $guildId;
    }

    /**
     * @return string[]
     */
    private function findErrors(?string $clientId, ?string $guildId, ?string $redirectUri, ?string $secret): array
    {
        $errors = $this->config->findConfigurationErrors();

        if ($clientId === null || $clientId === '') {
            $errors[] = 'No client id: pass --client-id or set OIDC_MAS_CLIENT_ID';
        }

        if ($guildId === null || $guildId === '') {
            $errors[] = 'No guild id: pass --guild-id';
        }

        if ($redirectUri === null || $redirectUri === '') {
            $errors[] = 'No redirect URI: pass --redirect-uri or set OIDC_MAS_REDIRECT_URI';
        }

        if ($secret === null || $secret === '') {
            $errors[] = 'No client secret: pass --secret or set OIDC_MAS_CLIENT_SECRET';
        }

        return $errors;
    }
}
