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

    public function __construct(private readonly OidcConfig $config)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption(
            'force',
            null,
            InputOption::VALUE_NONE,
            'Overwrite an existing keypair. Tokens signed by the old key stop verifying.'
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

        foreach ([dirname($privatePath), dirname($publicPath)] as $directory) {
            if (!is_dir($directory) && !mkdir($directory, 0o750, true) && !is_dir($directory)) {
                $io->error("Could not create {$directory}");

                return Command::FAILURE;
            }
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
        chmod($privatePath, 0o600);

        file_put_contents($publicPath, $details['key']);
        chmod($publicPath, 0o644);

        $io->success('Generated the OIDC signing keypair.');
        $io->definitionList(
            ['Private key' => $privatePath],
            ['Public key' => $publicPath],
            ['Key ID' => $this->config->getKeyId()]
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
}
