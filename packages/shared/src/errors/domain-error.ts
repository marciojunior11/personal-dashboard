import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IErrorIssue } from "./error-issue.js";

/** The operation breaks a domain rule. */
export class DomainError extends BaseError {
  readonly code: string = ErrorCode.DOMAIN_RULE_BROKEN;

  constructor(
    message = "A operação viola uma regra de domínio.",
    issues?: readonly IErrorIssue[],
  ) {
    super(message, issues);
  }
}
