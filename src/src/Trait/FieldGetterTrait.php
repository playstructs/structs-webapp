<?php

namespace App\Trait;

trait FieldGetterTrait
{
    function fieldToGetter(string $name): string
    {
        return 'get' . str_replace('_', '', ucwords($name, '_'));
    }

    function get(string $field): mixed
    {
        return $this->{$this->fieldToGetter($field)}();
    }
}