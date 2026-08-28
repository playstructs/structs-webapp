<?php

namespace App\Command;

use App\Oidc\OidcConfig;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Generates the RSA keypair that signs access tokens and ID tokens, plus the
 * symmetric key that encrypts authorization code envelopes.
 *
 * Keys live on disk rather than in the database so every webapp replica
 * advertises the same JWKS, and so a database read never yields token-forging
 * material.
 */
#[AsCommand(
    name: 'app:oidc:generate-key',
    description: 'Generate the OIDC signing keypair and authorization code encryption key'
)]
class OidcGenerateKeyCommand extends Command
{
    private const int KEY_BITS = 2048;

    /**
     * The account PHP-FPM and Apache run as in the shipped images. The command
     * is usually run as root, which would otherwise leave the private key
     * unreadable by the process that has to sign with it.
     */
    private const string DEFAULT_OWNER = 'www-data';

    public function __construct(private readonly OidcConfig $config)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption(
                'force',
                null,
                InputOption::VALUE_NONE,
                'Overwrite an existing keypair. Tokens signed by the old key stop verifying.'
            )
            ->addOption(
                'owner',
                null,
                InputOption::VALUE_REQUIRED,
                'System user the web server runs as. Defaults to ' . self::DEFAULT_OWNER . '.'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $privatePath = $this->config->getPrivateKeyPath();
        $publicPath = $this->config->getPublicKeyPath();

        if (!$input->getOption('force') && (file_exists($privatePath) || file_exists($publicPath))) {
            $io->error('A keypair already exists. Re-run with --force to replace it.');
            $io->text('Replacing the key invalidates every token it signed, including live Matrix sessions.');

            return Command::FAILURE;
        }

        $createdDirectories = [];

        foreach (array_unique([dirname($privatePath), dirname($publicPath)]) as $directory) {
            if (is_dir($directory)) {
                continue;
            }

            if (!mkdir($directory, 0o750, true) && !is_dir($directory)) {
                $io->error("Could not create {$directory}");

                return Command::FAILURE;
            }

            $createdDirectories[] = $directory;
        }

        $key = openssl_pkey_new([
            'private_key_bits' => self::KEY_BITS,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);

        if ($key === false) {
            $io->error('OpenSSL could not generate an RSA key: ' . openssl_error_string());

            return Command::FAILURE;
        }

        $privateKey = '';

        if (!openssl_pkey_export($key, $privateKey)) {
            $io->error('OpenSSL could not export the private key: ' . openssl_error_string());

            return Command::FAILURE;
        }

        $details = openssl_pkey_get_details($key);

        if ($details === false || !isset($details['key'])) {
            $io->error('OpenSSL could not read the public key back');

            return Command::FAILURE;
        }

        file_put_contents($privatePath, $privateKey);
        chmod($privatePath, 0o640);

        file_put_contents($publicPath, $details['key']);
        chmod($publicPath, 0o644);

        $owner = $this->grantWebServerAccess(
            [...$createdDirectories, $privatePath, $publicPath],
            dirname($privatePath),
            $input->getOption('owner'),
            $io
        );

        $io->success('Generated the OIDC signing keypair.');
        $io->definitionList(
            ['Private key' => $privatePath],
            ['Public key' => $publicPath],
            ['Key ID' => $this->config->getKeyId()],
            ['Readable by' => $owner ?? 'the current user only — see the warning above']
        );

        $io->section('Set this in the deployment environment');
        $io->writeln('OIDC_ENCRYPTION_KEY=' . base64_encode(random_bytes(32)));
        $io->newLine();
        $io->text([
            'The encryption key is printed once and not written to disk.',
            'Store it with the client secret, not in a committed file.',
            'Changing it invalidates any authorization code currently in flight.',
        ]);

        return Command::SUCCESS;
    }

    /**
     * Hand the keypair to the account that actually signs with it.
     *
     * This command is normally run as root inside the container while PHP-FPM
     * runs as www-data, which leaves a private key nobody can read and an
     * authorize endpoint that answers 500 with `Key path ... is not readable`.
     *
     * Only paths this command created are taken over. A key directory the
     * operator already placed — `/etc/ssl/private` and the like — is inspected
     * and reported on rather than quietly re-owned.
     *
     * @param string[] $paths     files and directories created by this run
     * @param string   $parentDir directory that must be traversable to reach the key
     *
     * @return string|null the account now able to read the key, or null if the
     *                     caller has to finish the job by hand
     */
    private function grantWebServerAccess(
        array $paths,
        string $parentDir,
        ?string $owner,
        SymfonyStyle $io
    ): ?string {
        $owner ??= self::DEFAULT_OWNER;

        if (!function_exists('posix_getpwnam') || !function_exists('posix_geteuid')) {
            $this->explainManualStep($io, $owner, $paths, 'The posix extension is not available.');

            return null;
        }

        $account = posix_getpwnam($owner);

        if ($account === false) {
            $this->explainManualStep($io, $owner, $paths, "There is no {$owner} account on this host.");

            return null;
        }

        $currentUid = posix_geteuid();

        if ($currentUid !== $account['uid']) {
            if ($currentUid !== 0) {
                $this->explainManualStep($io, $owner, $paths, 'Changing ownership requires root.');

                return null;
            }

            foreach ($paths as $path) {
                if (!chown($path, $account['uid']) || !chgrp($path, $account['gid'])) {
                    $this->explainManualStep($io, $owner, $paths, "Could not change ownership of {$path}.");

                    return null;
                }
            }
        }

        if (!$this->isTraversableBy($parentDir, $account)) {
            $io->warning("{$owner} cannot traverse {$parentDir}, so the key is unreachable whoever owns it.");
            $io->writeln(sprintf('  chown %s:%s %s && chmod 750 %s', $owner, $owner, $parentDir, $parentDir));

            return null;
        }

        return $owner;
    }

    /**
     * Whether an account holds the execute bit on a directory, which is what
     * PHP needs to open a file inside it.
     *
     * @param array{uid: int, gid: int, ...} $account
     */
    private function isTraversableBy(string $directory, array $account): bool
    {
        $stat = @stat($directory);

        if ($stat === false) {
            return false;
        }

        $mode = $stat['mode'];

        if ($stat['uid'] === $account['uid']) {
            return ($mode & 0o100) !== 0;
        }

        if ($stat['gid'] === $account['gid']) {
            return ($mode & 0o010) !== 0;
        }

        return ($mode & 0o001) !== 0;
    }

    /**
     * @param string[] $paths
     */
    private function explainManualStep(SymfonyStyle $io, string $owner, array $paths, string $reason): void
    {
        $io->warning($reason . ' The web server may not be able to read the private key.');
        $io->text('Run this as root, substituting the user the web server runs as:');
        $io->newLine();
        $io->writeln(sprintf('  chown %s:%s %s', $owner, $owner, implode(' ', $paths)));
        $io->newLine();
        $io->text('Without it, GET /oauth/authorize answers 500 with "Key path ... is not readable".');
    }
}
