<?php

namespace App\Entity;

use App\Trait\FieldGetterTrait;
use App\Trait\PsqlTimestampTrait;

class AbstractEntity
{
    use FieldGetterTrait;

    use PsqlTimestampTrait;
}