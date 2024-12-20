<?php

namespace App\Util;

use Symfony\Component\Validator\ConstraintViolationListInterface;

class ConstraintViolationUtil
{
    public function getErrorMessages(ConstraintViolationListInterface $violationList): array {
        $errorMessages = [];
        foreach($violationList as $violation) {
            $errorMessages[] = "{$violation->getPropertyPath()} - {$violation->getMessage()}";
        }
        return $errorMessages;
    }
}
