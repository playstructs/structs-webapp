<?php

namespace App\Util;

use Symfony\Component\Validator\ConstraintViolationListInterface;

class ConstraintViolationUtil
{
    const array CUSTOM_VIOLATION_MESSAGES = [
        'username' => 'Username must be at least 3 characters long, no longer than 20 characters, and can only contain unicode letters, 0-9, -, _'
    ];

    public function getErrorMessages(ConstraintViolationListInterface $violationList): array {
        $errorMessages = [];
        foreach($violationList as $violation) {
            $violationMessage = self::CUSTOM_VIOLATION_MESSAGES[$violation->getPropertyPath()] ?? $violation->getMessage();
            $errorMessages[] = "{$violation->getPropertyPath()} - {$violationMessage}";
        }
        return $errorMessages;
    }
}
