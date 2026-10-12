<?php

namespace App\Matrix;

use RuntimeException;
use Throwable;

/**
 * A step of the MAS sign-in chain failed.
 *
 * The step name is safe to show to a client and to log. The message is meant
 * for the log: it may quote a status code or a page title, never a token or an
 * authorization code.
 */
class MatrixSignInException extends RuntimeException
{
    public const string STEP_AUTHORIZE = 'authorize';

    public const string STEP_GUILD_AUTHORIZE = 'guild_authorize';

    public const string STEP_CONSENT = 'consent';

    public const string STEP_CALLBACK = 'callback';

    public const string STEP_TOKEN = 'token';

    public const string STEP_WHOAMI = 'whoami';

    public function __construct(
        private readonly string $step,
        string $message,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);
    }

    public function getStep(): string
    {
        return $this->step;
    }
}
