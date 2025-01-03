<?php

namespace App\Trait;

use DateMalformedStringException;
use DateTime;
use DateTimeZone;

trait PsqlTimestampTrait
{
    /**
     * @param string $datetime
     * @return string
     * @throws DateMalformedStringException
     */
    public function formatTimestamp(string $datetime): string {
        $updatedAtDateTime = new DateTime($datetime, new DateTimeZone('UTC'));
        return $updatedAtDateTime->format('Y-m-d H:i:sP');
    }
}