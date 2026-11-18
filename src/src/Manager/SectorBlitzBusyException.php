<?php

namespace App\Manager;

use RuntimeException;

/** The shared database budget for public leaderboard cache misses is spent and there is no older copy to serve. */
class SectorBlitzBusyException extends RuntimeException
{
}
