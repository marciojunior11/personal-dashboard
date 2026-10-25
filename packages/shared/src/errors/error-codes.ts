/**
 * Generic code of each error category, used when nothing more specific
 * applies. Codes are the contract with clients, which branch on them and
 * never on messages; a code is never reused for another meaning.
 *
 * Specific codes live with the module that raises them (e.g. identity) and
 * exist only when a client needs to tell that case apart.
 */
export const ErrorCode = {
  INVALID_INPUT: "INVALID_INPUT",
  DOMAIN_RULE_BROKEN: "DOMAIN_RULE_BROKEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL: "INTERNAL",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
