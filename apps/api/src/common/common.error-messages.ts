import type { CommonErrorCode } from '@personal-dashboard/shared/common';
import type { I18nPath } from '@generated/i18n';

/**
 * Catalog key of each common error code. Codes and keys are independent:
 * this map is the only place that links them, and its type makes every code
 * need an existing key.
 */
export const commonErrorMessages: Readonly<Record<CommonErrorCode, I18nPath>> =
  {
    INVALID_INPUT: 'common.errors.invalidInput',
    DOMAIN_RULE_BROKEN: 'common.errors.domainRuleBroken',
    NOT_FOUND: 'common.errors.notFound',
    CONFLICT: 'common.errors.conflict',
    UNAUTHORIZED: 'common.errors.unauthorized',
    FORBIDDEN: 'common.errors.forbidden',
    INTERNAL: 'common.errors.internal',

    FULL_NAME_REQUIRED: 'common.fullName.required',
    FULL_NAME_MISSING_SURNAME: 'common.fullName.missingSurname',
    FULL_NAME_TOO_LONG: 'common.fullName.tooLong',
    FULL_NAME_INVALID_CHARACTERS: 'common.fullName.invalidCharacters',
    EMAIL_INVALID: 'common.email.invalid',
    PHONE_NUMBER_INVALID: 'common.phoneNumber.invalid',
    BIRTH_DATE_REQUIRED: 'common.birthDate.required',
    BIRTH_DATE_INVALID_FORMAT: 'common.birthDate.invalidFormat',
    BIRTH_DATE_INVALID: 'common.birthDate.invalid',
    BIRTH_DATE_IN_FUTURE: 'common.birthDate.inFuture',
    MONEY_INVALID_CENTS: 'common.money.invalidCents',
  };
