import type { CommonErrorCode } from "./common-error-codes.js";

/**
 * Catalog key (in `@personal-dashboard/i18n`) of each common error code: the
 * one bridge between codes and messages, shared by the API and the web app.
 * Errors and catalogs stay unaware of each other; only this map links them.
 * Every code must have a key; the API checks that each key exists.
 */
export const CommonErrorMessages = {
  INVALID_INPUT: "common.errors.invalidInput",
  DOMAIN_RULE_BROKEN: "common.errors.domainRuleBroken",
  NOT_FOUND: "common.errors.notFound",
  CONFLICT: "common.errors.conflict",
  UNAUTHORIZED: "common.errors.unauthorized",
  FORBIDDEN: "common.errors.forbidden",
  INTERNAL: "common.errors.internal",

  FULL_NAME_REQUIRED: "common.fullName.required",
  FULL_NAME_MISSING_SURNAME: "common.fullName.missingSurname",
  FULL_NAME_TOO_LONG: "common.fullName.tooLong",
  FULL_NAME_INVALID_CHARACTERS: "common.fullName.invalidCharacters",
  EMAIL_INVALID: "common.email.invalid",
  PHONE_NUMBER_INVALID: "common.phoneNumber.invalid",
  BIRTH_DATE_REQUIRED: "common.birthDate.required",
  BIRTH_DATE_INVALID_FORMAT: "common.birthDate.invalidFormat",
  BIRTH_DATE_INVALID: "common.birthDate.invalid",
  BIRTH_DATE_IN_FUTURE: "common.birthDate.inFuture",
  MONEY_INVALID_CENTS: "common.money.invalidCents",
} as const satisfies Record<CommonErrorCode, string>;
