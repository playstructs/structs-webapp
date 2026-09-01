<?php

namespace App\Trait;

use App\Constant\ObjectTypes;
use App\Constant\RegexPattern;

trait ObjectKeyTrait
{
    /**
     * Splits a composite game object id (e.g. 5-123) into its type and index.
     *
     * @return array{object_type: string, object_index: int}|null
     */
    private function parseObjectKey(string $object_key): ?array
    {
        if (preg_match(RegexPattern::OBJECT_KEY, $object_key) !== 1) {
            return null;
        }

        // The regex guarantees "<digits>-<digits>", so only the prefix needs matching.
        foreach (ObjectTypes::PREFIXES as $prefix => $objectType) {
            if (str_starts_with($object_key, $prefix . '-')) {
                return [
                    'object_type' => $objectType,
                    'object_index' => (int) substr($object_key, strlen($prefix) + 1),
                ];
            }
        }

        return null;
    }
}
