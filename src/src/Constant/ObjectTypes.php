<?php

namespace App\Constant;

class ObjectTypes
{
    /**
     * Object key prefixes, longest-first so 10 / 11 are matched before 1.
     *
     * @var array<string, string>
     */
    public const array PREFIXES = [
        '10' => 'provider',
        '11' => 'agreement',
        '0' => 'guild',
        '1' => 'player',
        '2' => 'planet',
        '3' => 'reactor',
        '4' => 'substation',
        '5' => 'struct',
        '6' => 'allocation',
        '7' => 'infusion',
        '8' => 'address',
        '9' => 'fleet',
    ];

    /**
     * The values of PREFIXES, as a list. Kept as a literal because attributes need
     * a constant expression; ObjectTypesTest asserts the two stay in step.
     */
    public const array ALL = [
        'provider',
        'agreement',
        'guild',
        'player',
        'planet',
        'reactor',
        'substation',
        'struct',
        'allocation',
        'infusion',
        'address',
        'fleet',
    ];
}
