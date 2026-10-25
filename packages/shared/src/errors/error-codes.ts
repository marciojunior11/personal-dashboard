import { MessageCode } from "@personal-dashboard/i18n";

/**
 * Generic code of each error category, used when nothing more specific
 * applies. Every code is also a message key in `@personal-dashboard/i18n`.
 * Codes are the contract with clients, which branch on them and never on
 * messages; a code is never reused for another meaning.
 */
export const ErrorCode = {
  INVALID_INPUT: MessageCode.INVALID_INPUT,
  DOMAIN_RULE_BROKEN: MessageCode.DOMAIN_RULE_BROKEN,
  NOT_FOUND: MessageCode.NOT_FOUND,
  CONFLICT: MessageCode.CONFLICT,
  UNAUTHORIZED: MessageCode.UNAUTHORIZED,
  FORBIDDEN: MessageCode.FORBIDDEN,
  INTERNAL: MessageCode.INTERNAL,
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
