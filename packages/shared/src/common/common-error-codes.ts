/**
 * Error codes shared by every module: the generic code of each error
 * category, used when a throw names nothing more specific, and the codes of
 * the format rules of common fields (name, e-mail, phone, birth date, money).
 *
 * A code reports what kind of error happened; clients branch on it, never on
 * the message. A code is never reused for another meaning.
 */
export const CommonErrorCodes = {
  INVALID_INPUT: "INVALID_INPUT",
  DOMAIN_RULE_BROKEN: "DOMAIN_RULE_BROKEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL: "INTERNAL",

  FULL_NAME_REQUIRED: "FULL_NAME_REQUIRED",
  FULL_NAME_MISSING_SURNAME: "FULL_NAME_MISSING_SURNAME",
  FULL_NAME_TOO_LONG: "FULL_NAME_TOO_LONG",
  FULL_NAME_INVALID_CHARACTERS: "FULL_NAME_INVALID_CHARACTERS",
  EMAIL_INVALID: "EMAIL_INVALID",
  PHONE_NUMBER_INVALID: "PHONE_NUMBER_INVALID",
  BIRTH_DATE_REQUIRED: "BIRTH_DATE_REQUIRED",
  BIRTH_DATE_INVALID_FORMAT: "BIRTH_DATE_INVALID_FORMAT",
  BIRTH_DATE_INVALID: "BIRTH_DATE_INVALID",
  BIRTH_DATE_IN_FUTURE: "BIRTH_DATE_IN_FUTURE",
  MONEY_INVALID_CENTS: "MONEY_INVALID_CENTS",
} as const;

export type CommonErrorCode =
  (typeof CommonErrorCodes)[keyof typeof CommonErrorCodes];
